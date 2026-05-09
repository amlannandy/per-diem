import { useEffect, useState } from 'react';
import type { ApiResponse, User } from '@per-diem/types';

const API_URL = import.meta.env.VITE_API_URL ?? '';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/users`)
      .then((res) => res.json() as Promise<ApiResponse<User[]>>)
      .then((res) => setUsers(res.data))
      .catch(() => setError('Failed to fetch users'));
  }, []);

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Per Diem</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.name} — {u.email}
          </li>
        ))}
      </ul>
    </main>
  );
}
