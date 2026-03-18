# JPLearning - Frontend

Giao diện web cho ứng dụng học nghe tiếng Nhật (Japanese Listening Learning App).

## Công nghệ sử dụng

- **Vite 5** – Build tool
- **React 18** & **TypeScript**
- **React Router** – Điều hướng
- **TanStack Query** – Quản lý state server
- **React Hook Form** & **Zod** – Form & validation
- **shadcn/ui** & **Radix UI** – Component library
- **Tailwind CSS** – Styling
- **MUI Icons** & **Lucide React** – Icons
- **Recharts** – Biểu đồ
- **date-fns** – Xử lý ngày tháng

## Yêu cầu

- Node.js 18+
- npm hoặc pnpm

## Cài đặt & chạy

### 1. Clone repository

```bash
git clone <repository-url>
cd fe-jplearning/nam-fe
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình môi trường (tùy chọn)

Tạo file `.env` hoặc `.env.local` nếu cần override URL API:

```env
# Mặc định: /api/v1 (proxy tới http://localhost:8080/api/v1)
VITE_API_BASE_URL=/api/v1
```

Trong môi trường dev, Vite proxy `/api` tới `http://localhost:8080`, nên thường không cần cấu hình thêm.

### 4. Chạy development server

```bash
npm run dev
```

Ứng dụng chạy tại: http://localhost:3000

### 5. Build production

```bash
npm run build
```

### 6. Preview build

```bash
npm run preview
```

## Cấu trúc thư mục

```
src/
├── components/      # UI components (shadcn, custom)
├── pages/           # Trang (Admin, Learner)
├── services/        # API client (api.ts)
├── hooks/           # Custom hooks
├── lib/             # Utilities
├── routes/          # Định nghĩa routes
├── App.tsx
└── main.tsx
```

## Scripts

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Chạy dev server (port 3000) |
| `npm run build` | Build production |
| `npm run build:dev` | Build mode development |
| `npm run preview` | Xem trước build |
| `npm run lint` | Chạy ESLint |
| `npm run test` | Chạy Vitest |
| `npm run test:watch` | Chạy Vitest watch mode |

## Kết nối Backend

- **Dev:** Frontend proxy `/api` → `http://localhost:8080`
- **API base:** `/api/v1` (qua proxy hoặc `VITE_API_BASE_URL`)
- Backend phải chạy tại `http://localhost:8080` khi dev

## Phân quyền

- **Learner:** Đăng nhập qua `/auth/login`, token lưu `learner_token`
- **Admin:** Đăng nhập qua `/admin/auth/login`, token lưu `admin_token`

## License

Dự án học tập - SWD392
