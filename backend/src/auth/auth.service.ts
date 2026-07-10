import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../modules/users/users.service';
import type { UserDocument } from '../modules/users/schemas/user.schema';
import { CreateAuthDto, LoginAuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  validateUser(email: string, password: string): Promise<UserDocument> {
    return this.usersService.handleLogin({ email, password });
  }

  handleLogin(user: UserDocument) {
    const payload = {
      email: user.email,
      name: user.name,
      role: user.role,
      sub: user._id.toString(),
    };

    return {
      user: {
        email: user.email,
        _id: user._id,
        name: user.name,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(loginDto: LoginAuthDto) {
    const user = await this.usersService.handleLogin(loginDto);
    return this.handleLogin(user);
  }

  async register(registerDto: CreateAuthDto) {
    const user = await this.usersService.handleRegister(registerDto);
    return this.handleLogin(user);
  }
}
