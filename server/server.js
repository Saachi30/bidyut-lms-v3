const { app, server } = require('./app');
const { logger } = require('./utils/logger');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Use the server with Socket.IO attached, not just the Express app
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});