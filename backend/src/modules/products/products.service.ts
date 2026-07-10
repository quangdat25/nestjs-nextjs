import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductCategory } from './schemas/product.schema';

const seedProducts: Array<
  CreateProductDto & { slug: string; soldCount: number }
> = [
  {
    name: 'Cà phê muối',
    slug: 'ca-phe-muoi',
    description: 'Cà phê đậm vị, kem muối béo mịn.',
    category: ProductCategory.COFFEE,
    price: 35000,
    icon: '☕',
    color: '#d9bea1',
    isFeatured: true,
    soldCount: 286,
  },
  {
    name: 'Bạc xỉu kem',
    slug: 'bac-xiu-kem',
    description: 'Sữa tươi, cà phê và lớp kem thơm nhẹ.',
    category: ProductCategory.COFFEE,
    price: 39000,
    icon: '🥛',
    color: '#e8d9c4',
    isFeatured: false,
    soldCount: 154,
  },
  {
    name: 'Trà đào cam sả',
    slug: 'tra-dao-cam-sa',
    description: 'Trà thanh mát cùng đào giòn và cam vàng.',
    category: ProductCategory.TEA,
    price: 42000,
    icon: '🍑',
    color: '#f4c09f',
    isFeatured: true,
    soldCount: 241,
  },
  {
    name: 'Trà sen vàng',
    slug: 'tra-sen-vang',
    description: 'Trà sen dịu nhẹ, hạt sen bùi và kem sữa.',
    category: ProductCategory.TEA,
    price: 45000,
    icon: '🌼',
    color: '#eadca2',
    isFeatured: false,
    soldCount: 132,
  },
  {
    name: 'Cơm gà nướng',
    slug: 'com-ga-nuong',
    description: 'Gà nướng mật ong, cơm dẻo và rau theo mùa.',
    category: ProductCategory.FOOD,
    price: 59000,
    icon: '🍗',
    color: '#efcc91',
    isFeatured: true,
    soldCount: 318,
  },
  {
    name: 'Bún bò Huế',
    slug: 'bun-bo-hue',
    description: 'Nước dùng đậm đà, bò mềm và chả Huế.',
    category: ProductCategory.FOOD,
    price: 65000,
    icon: '🍜',
    color: '#e8b29e',
    isFeatured: true,
    soldCount: 225,
  },
  {
    name: 'Bánh mì chảo',
    slug: 'banh-mi-chao',
    description: 'Trứng ốp la, xúc xích và sốt cà chua nóng.',
    category: ProductCategory.FOOD,
    price: 49000,
    icon: '🍳',
    color: '#f0d19f',
    isFeatured: false,
    soldCount: 178,
  },
  {
    name: 'Croissant bơ',
    slug: 'croissant-bo',
    description: 'Bánh ngàn lớp nướng mới, thơm bơ Pháp.',
    category: ProductCategory.SNACK,
    price: 32000,
    icon: '🥐',
    color: '#ead0a0',
    isFeatured: false,
    soldCount: 98,
  },
];

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  async onModuleInit() {
    if ((await this.productModel.countDocuments()) === 0) {
      await this.productModel.insertMany(seedProducts);
    }
  }

  async create(dto: CreateProductDto) {
    return this.productModel.create({
      ...dto,
      slug: await this.uniqueSlug(dto.name),
    });
  }

  findAll(
    category?: ProductCategory,
    search = '',
    featured?: boolean,
    includeUnavailable = false,
  ) {
    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (search) filter.name = new RegExp(search, 'i');
    if (featured !== undefined) filter.isFeatured = featured;
    if (!includeUnavailable) filter.isAvailable = true;
    return this.productModel
      .find(filter)
      .sort({ isFeatured: -1, soldCount: -1, createdAt: -1 })
      .lean();
  }

  async findOne(idOrSlug: string) {
    const filter = Types.ObjectId.isValid(idOrSlug)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };
    const product = await this.productModel.findOne(filter).lean();
    if (!product) throw new NotFoundException('Không tìm thấy món');
    return product;
  }

  findByIds(ids: string[]) {
    return this.productModel
      .find({ _id: { $in: ids }, isAvailable: true })
      .lean();
  }

  async update(id: string, dto: UpdateProductDto) {
    const update = dto.name
      ? { ...dto, slug: await this.uniqueSlug(dto.name, id) }
      : dto;
    const product = await this.productModel
      .findByIdAndUpdate(id, update, { new: true })
      .lean();
    if (!product) throw new NotFoundException('Không tìm thấy món');
    return product;
  }

  async remove(id: string) {
    const product = await this.productModel.findByIdAndDelete(id);
    if (!product) throw new NotFoundException('Không tìm thấy món');
    return { message: 'Đã xóa món khỏi thực đơn' };
  }

  async increaseSoldCounts(
    items: Array<{ productId: Types.ObjectId; quantity: number }>,
  ) {
    await Promise.all(
      items.map((item) =>
        this.productModel.findByIdAndUpdate(item.productId, {
          $inc: { soldCount: item.quantity },
        }),
      ),
    );
  }

  private async uniqueSlug(name: string, exceptId?: string) {
    const base = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    let slug = base;
    let suffix = 1;
    while (
      await this.productModel.exists({
        slug,
        ...(exceptId ? { _id: { $ne: exceptId } } : {}),
      })
    )
      slug = `${base}-${suffix++}`;
    return slug;
  }
}
