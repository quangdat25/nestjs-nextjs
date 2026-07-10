import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import request from 'supertest';
import { App } from 'supertest/types';
import { Order } from '../src/modules/orders/schemas/order.schema';
import { User } from '../src/modules/users/schemas/user.schema';
import { AppModule } from './../src/app.module';

describe('Bếp Mây API (e2e)', () => {
  let app: INestApplication<App>;
  let userModel: Model<User>;
  let orderModel: Model<Order>;
  let createdUserId: string | undefined;
  let createdOrderId: string | undefined;
  let createdOrderCode: string | undefined;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.setGlobalPrefix('api/v1', { exclude: [''] });
    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
    orderModel = moduleFixture.get<Model<Order>>(getModelToken(Order.name));
    await app.init();
  });

  it('returns the health message', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Bếp Mây API is running');
  });

  it('handles register, order, admin update and order history', async () => {
    const email = `smoke-${Date.now()}@bepmay.test`;
    const productsResponse = await request(app.getHttpServer())
      .get('/api/v1/products')
      .expect(200);
    const product = (
      productsResponse.body as unknown as Array<{ _id: string; price: number }>
    )[0];

    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ name: 'Khách smoke test', email, password: 'Smoke@123' })
      .expect(201);
    const registration = registerResponse.body as unknown as {
      user: { _id: string };
      access_token: string;
    };
    createdUserId = registration.user._id;
    const userToken = registration.access_token;

    const orderResponse = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        customerName: 'Khách smoke test',
        phone: '0900000000',
        address: '12 Nguyễn Huệ, TP.HCM',
        items: [{ productId: product._id, quantity: 2 }],
        paymentMethod: 'COD',
      })
      .expect(201);
    const createdOrder = orderResponse.body as unknown as {
      _id: string;
      orderCode: string;
      subtotal: number;
    };
    createdOrderId = createdOrder._id;
    createdOrderCode = createdOrder.orderCode;
    expect(createdOrder.subtotal).toBe(product.price * 2);
    const persistedOrder = await orderModel.findById(createdOrderId).lean();
    expect(persistedOrder?.userId.toString()).toBe(createdUserId);

    const meResponse = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect((meResponse.body as unknown as { _id: string })._id).toBe(
      createdUserId,
    );

    const adminResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@bepmay.vn', password: 'Admin@123' })
      .expect(200);
    const adminToken = (
      adminResponse.body as unknown as { access_token: string }
    ).access_token;

    const updateResponse = await request(app.getHttpServer())
      .patch(`/api/v1/orders/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'CONFIRMED' })
      .expect(200);
    expect((updateResponse.body as unknown as { status: string }).status).toBe(
      'CONFIRMED',
    );

    const historyResponse = await request(app.getHttpServer())
      .get('/api/v1/orders/my')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    const history = historyResponse.body as unknown as Array<{
      orderCode: string;
    }>;
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThan(0);
    expect(history.some((order) => order.orderCode === createdOrderCode)).toBe(
      true,
    );
  });

  afterAll(async () => {
    if (createdOrderId) await orderModel.findByIdAndDelete(createdOrderId);
    if (createdUserId) await userModel.findByIdAndDelete(createdUserId);
    await app.close();
  });
});
