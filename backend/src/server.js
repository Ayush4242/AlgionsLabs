require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`[Server] API available at http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error(`[Server Error]: ${error.message}`);
    process.exit(1);
  }
};

startServer();
