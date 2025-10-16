import app from "./app";
import logger from "./utils/logger";

const start = async () => {
  try {
    const PORT = process.env["PORT"] || 3000;

    await app.listen({ port: Number(PORT) });
    logger.info(`🚀 Server is working on PORT: ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
