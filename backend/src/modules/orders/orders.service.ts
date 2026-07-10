import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthenticatedUser } from '../../decorator/custimize';
import { ProductsService } from '../products/products.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus } from './schemas/order.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    private readonly productsService: ProductsService,
  ) {}

  async create(dto: CreateOrderDto, user: AuthenticatedUser) {
    const ids = [...new Set(dto.items.map((item) => item.productId))];
    const products = await this.productsService.findByIds(ids);
    const productMap = new Map(
      products.map((product) => [product._id.toString(), product]),
    );
    if (products.length !== ids.length) {
      throw new BadRequestException('Có món không tồn tại hoặc đang tạm hết');
    }

    const items = dto.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new BadRequestException('Món không hợp lệ');
      return {
        productId: product._id,
        name: product.name,
        icon: product.icon,
        price: product.price,
        quantity: item.quantity,
      };
    });
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const deliveryFee = subtotal >= 120000 ? 0 : 15000;

    return this.orderModel.create({
      ...dto,
      items,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      userId: new Types.ObjectId(user._id),
      orderCode: `BM${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`,
    });
  }

  findMine(userId: string) {
    return this.orderModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  async findOne(id: string, user: AuthenticatedUser) {
    const order = await this.orderModel.findById(id).lean();
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    if (user.role !== 'ADMIN' && order.userId.toString() !== user._id) {
      throw new ForbiddenException('Bạn không có quyền xem đơn hàng này');
    }
    return order;
  }

  findAll(status?: OrderStatus, search = '') {
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (search)
      filter.$or = [
        { orderCode: new RegExp(search, 'i') },
        { customerName: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
      ];
    return this.orderModel.find(filter).sort({ createdAt: -1 }).lean();
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    if ([OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(order.status)) {
      throw new BadRequestException(
        'Không thể thay đổi đơn đã hoàn tất hoặc đã hủy',
      );
    }
    const previous = order.status;
    order.status = status;
    await order.save();
    if (
      status === OrderStatus.COMPLETED &&
      previous !== OrderStatus.COMPLETED
    ) {
      await this.productsService.increaseSoldCounts(order.items);
    }
    return order;
  }

  async stats() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const [
      totalOrders,
      pendingOrders,
      todayOrders,
      revenueResult,
      popularItems,
    ] = await Promise.all([
      this.orderModel.countDocuments(),
      this.orderModel.countDocuments({ status: OrderStatus.PENDING }),
      this.orderModel.countDocuments({ createdAt: { $gte: startOfToday } }),
      this.orderModel.aggregate<{ total: number }>([
        { $match: { status: OrderStatus.COMPLETED } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      this.orderModel.aggregate<{
        _id: string;
        quantity: number;
        revenue: number;
      }>([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            quantity: { $sum: '$items.quantity' },
            revenue: {
              $sum: { $multiply: ['$items.price', '$items.quantity'] },
            },
          },
        },
        { $sort: { quantity: -1 } },
        { $limit: 5 },
      ]),
    ]);
    return {
      totalOrders,
      pendingOrders,
      todayOrders,
      revenue: revenueResult[0]?.total ?? 0,
      popularItems,
    };
  }
}
