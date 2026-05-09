import cors from 'cors';
import express from 'express';
import type { ApiResponse, User } from '@per-diem/types';

const app = express();
const PORT = process.env.PORT ?? 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:3000';

app.use(express.json());
app.use(cors({ origin: CORS_ORIGIN }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/users', (_req, res) => {
  const users: User[] = [
    { id: '1', name: 'Alice', email: 'alice@example.com', createdAt: new Date().toISOString() },
  ];

  const response: ApiResponse<User[]> = {
    data: users,
    message: 'Users fetched successfully',
    success: true,
  };

  res.json(response);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
