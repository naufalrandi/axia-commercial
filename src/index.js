const app = require("./applications/app");
const logger = require("./applications/logging");
require("dotenv").config();

const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || "http://127.0.0.1";

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server is running on ${BASE_URL}:${PORT}`);
});
