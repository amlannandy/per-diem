const API_URL = import.meta.env.VITE_API_URL ?? '';

export default function App() {
  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Per Diem</h1>
      <p>API: {API_URL || '(proxied in dev)'}</p>
    </main>
  );
}
