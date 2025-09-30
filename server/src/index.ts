import { createApp } from './app';
import { initializeDatabase } from './database/connection';

const PORT = process.env.PORT || 3001;

// Initialize database
initializeDatabase();

// Create and start server
const app = createApp();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});