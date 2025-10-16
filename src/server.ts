import app from "./app";
import logger from "./utils/logger";

const start = async () => {
  try {
    // Wait for the app to be ready so that plugins are registered
    await app.ready();
    
    const PORT = app.config.PORT || 3000;

    await app.listen({ port: Number(PORT) });
    logger.info(`🚀 Server is working on PORT: ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
