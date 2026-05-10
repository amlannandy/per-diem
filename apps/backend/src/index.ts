import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { initializeSquareClient } from './services/square';
import { createLocationsRouter } from './routes/locations';
import { createCatalogRouter } from './routes/catalog';

const app = express();
const PORT = process.env.PORT ?? 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:3000';

const squareClient = initializeSquareClient();

app.use(express.json());
app.use(cors({ origin: CORS_ORIGIN }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/locations', createLocationsRouter(squareClient));
app.use('/api/catalog', createCatalogRouter(squareClient));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
