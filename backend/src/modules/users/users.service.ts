import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAuthDto, LoginAuthDto } from '../../auth/dto/create-auth.dto';
import { comparePasswordHelper, hashPasswordHelper } from '../../helpers/util';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument, UserRole } from './schemas/user.schema';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const email =
      this.configService.get<string>('ADMIN_EMAIL') ??
      (isProduction ? undefined : 'admin@bepmay.vn');
    const password =
      this.configService.get<string>('ADMIN_PASSWORD') ??
      (isProduction ? undefined : 'Admin@123');

    if (!email || !password || (await this.isEmailExist(email))) return;
    await this.userModel.create({
      name: 'Quản trị Bếp Mây',
      email: email.toLowerCase(),
      password: await hashPasswordHelper(password),
      role: UserRole.ADMIN,
      isActive: true,
    });
  }

  async isEmailExist(email: string) {
    return Boolean(await this.userModel.exists({ email: email.toLowerCase() }));
  }

  async create(dto: CreateUserDto) {
    const email = dto.email.toLowerCase();
    if (await this.isEmailExist(email)) {
      throw new BadRequestException(`Email đã tồn tại: ${email}`);
    }
    const user = await this.userModel.create({
      ...dto,
      email,
      password: await hashPasswordHelper(dto.password),
      isActive: true,
    });
    return this.toSafeUser(user);
  }

  async findAll(current = 1, pageSize = 20, search = '') {
    const filter = search
      ? {
          $or: [
            { name: new RegExp(search, 'i') },
            { email: new RegExp(search, 'i') },
          ],
        }
      : {};
    const [results, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((current - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.userModel.countDocuments(filter),
    ]);
    return { results, meta: { current, pageSize, total } };
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).lean();
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }

  findByEmail(email: string) {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password');
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.userModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }

  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return { message: 'Đã xóa người dùng' };
  }

  async handleLogin(dto: LoginAuthDto): Promise<UserDocument> {
    const user = await this.findByEmail(dto.email);
    if (!user || !(await comparePasswordHelper(dto.password, user.password))) {
      throw new UnauthorizedException('Email hoặc mật khẩu không hợp lệ.');
    }
    if (!user.isActive) throw new BadRequestException('Tài khoản đã bị khóa.');
    return user;
  }

  async handleRegister(dto: CreateAuthDto): Promise<UserDocument> {
    const email = dto.email.toLowerCase();
    if (await this.isEmailExist(email)) {
      throw new BadRequestException(`Email đã tồn tại: ${email}`);
    }
    return this.userModel.create({
      name: dto.name ?? email.split('@')[0],
      email,
      password: await hashPasswordHelper(dto.password),
      role: UserRole.USER,
      isActive: true,
    });
  }

  private toSafeUser(user: UserDocument) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      isActive: user.isActive,
    };
  }
}
