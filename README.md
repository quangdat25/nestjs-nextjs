# Bếp Mây — quản lý order đồ ăn & thức uống

Ứng dụng full-stack cho một cửa hàng, gồm trải nghiệm đặt món cho khách hàng và khu vận hành dành cho Admin.

## Chức năng

### User

- Đăng ký, đăng nhập và duy trì phiên bằng JWT trong cookie HttpOnly.
- Xem, tìm kiếm và lọc thực đơn theo danh mục.
- Thêm món, đổi số lượng và lưu giỏ hàng trên thiết bị.
- Checkout với thông tin giao hàng, ghi chú và phương thức thanh toán.
- Xem lịch sử và trạng thái đơn hàng.

### Admin

- Dashboard doanh thu, số đơn, đơn chờ và món bán chạy.
- Thêm, sửa, xóa, bật/tắt và đánh dấu món nổi bật.
- Lọc đơn và cập nhật tiến trình: chờ xác nhận → chuẩn bị → giao → hoàn tất.
- Xem danh sách và thông tin khách hàng.

## Công nghệ

- Frontend: Next.js 16, React 19, TypeScript, App Router.
- Backend: NestJS 11, MongoDB/Mongoose, Passport JWT.
- Validation: class-validator; mật khẩu hash bằng bcrypt.
- Kiểm thử: Jest, Supertest và e2e full flow.

## Chạy local

Yêu cầu Node.js và MongoDB đang chạy tại `mongodb://localhost:27017`.

1. Tạo file `backend/.env` dựa trên `backend/.env.example`.
2. Nếu cần, tạo file `frontend/.env.local` dựa trên `frontend/.env.example`.
3. Mở hai terminal:

```bash
cd backend
npm install
npm run start:dev
```

```bash
cd frontend
npm install
npm run dev
```

- Website: `http://localhost:3000`
- API: `http://localhost:8080/api/v1`
- Health check: `http://localhost:8080`

Trong môi trường development, nếu chưa có Admin, backend tự tạo:

```text
Email: admin@bepmay.vn
Password: Admin@123
```

Hãy đặt `ADMIN_EMAIL` và `ADMIN_PASSWORD` riêng trước khi chạy production.

## Kiểm tra

```bash
cd frontend
npm run lint
npm run build

cd ../backend
npm run lint
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand
```

E2E kiểm tra xuyên suốt đăng ký User, tạo order, Admin cập nhật trạng thái và User xem lịch sử; dữ liệu test được dọn sau khi chạy.

## API chính

- `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`
- `GET /api/v1/products`; Admin: `POST/PATCH/DELETE /api/v1/products`
- `POST /api/v1/orders`, `GET /api/v1/orders/my`
- Admin: `GET /api/v1/orders/admin/all`, `GET /api/v1/orders/admin/stats`, `PATCH /api/v1/orders/:id/status`
- Admin: `GET /api/v1/users`; User: `GET/PATCH /api/v1/users/profile`
