import { SquareClient, SquareEnvironment } from 'square';

export function initializeSquareClient() {
  if (!process.env.SQUARE_ACCESS_TOKEN) {
    throw new Error('Missing required env var: SQUARE_ACCESS_TOKEN');
  }
  try {
    const squareClient = new SquareClient({
      token: process.env.SQUARE_ACCESS_TOKEN,
      environment:
        process.env.SQUARE_ENVIRONMENT === 'production'
          ? SquareEnvironment.Production
          : SquareEnvironment.Sandbox,
    });
    return squareClient;
  } catch (error) {
    throw new Error(`Failed to initialize Square client`);
  }
}
