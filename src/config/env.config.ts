import fastifyEnv from "@fastify/env";
import type { FastifyInstance, FastifyPluginCallback } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { Static, Type } from "@sinclair/typebox";

enum NodeEnv {
  development = "development",
  test = "test",
  production = "production",
}

const ConfigSchema = Type.Strict(
  Type.Object({
    NODE_ENV: Type.Enum(NodeEnv),
    LOG_LEVEL: Type.String(),
    HTTP_PORT: Type.String(),
    HTTP_HOST: Type.String(),
    MONGO_URL: Type.String(),
    MONGO_DB_NAME: Type.String(),
    MONGO_COLLECTION_NAME: Type.String(),
    MONGODB_URI: Type.String(),
    SIGNATURERX_CLIENT_ID: Type.String(),
    SIGNATURERX_CLIENT_SECRET: Type.String(),
    SIGNATURERX_SCOPE: Type.String(),
    SIGNATURERX_TOKEN_URL: Type.String(),
    SIGNATURERX_BASE_URL: Type.String(),
    SIGNATURERX_PRESCRIPTIONS_URL: Type.String(),
    PORT: Type.Optional(Type.String()),
  }),
);

type Config = Static<typeof ConfigSchema>;

declare module "fastify" {
  interface FastifyInstance {
    config: Config;
  }
}

const buildFastifyEnv: FastifyPluginCallback = async (
  server: FastifyInstance,
  _options: Record<string, any>,
  done: (err?: Error | undefined) => void,
) => {
  const schema = {
    type: "object",
    required: [
      "HTTP_PORT",
      "HTTP_HOST",
      "MONGO_URL",
      "MONGO_DB_NAME",
      "MONGO_COLLECTION_NAME",
      "MONGODB_URI",
      "SIGNATURERX_CLIENT_ID",
      "SIGNATURERX_CLIENT_SECRET",
      "SIGNATURERX_SCOPE",
      "SIGNATURERX_TOKEN_URL",
      "SIGNATURERX_BASE_URL",
      "SIGNATURERX_PRESCRIPTIONS_URL",
    ],
    properties: {
      HTTP_PORT: {
        type: "number",
        default: 3200,
      },
      HTTP_HOST: {
        type: "string",
        default: "0.0.0.0",
      },
      MONGO_URL: {
        type: "string",
      },
      MONGO_DB_NAME: {
        type: "string",
      },
      MONGO_COLLECTION_NAME: { type: "string" },
      MONGODB_URI: {
        type: "string",
      },
      SIGNATURERX_CLIENT_ID: {
        type: "string",
      },
      SIGNATURERX_CLIENT_SECRET: {
        type: "string",
      },
      SIGNATURERX_SCOPE: {
        type: "string",
      },
      SIGNATURERX_TOKEN_URL: {
        type: "string",
      },
      SIGNATURERX_BASE_URL: {
        type: "string",
      },
      SIGNATURERX_PRESCRIPTIONS_URL: {
        type: "string",
      },
      PORT: {
        type: "string",
        default: "3000",
      },
    },
  };

  const configOptions = {
    confKey: "config",
    schema: schema,
    data: process.env,
    dotenv: true,
    removeAdditional: true,
  };

  return fastifyEnv(server, configOptions, done);
};

export const buildFastifyEnvPlugin = fastifyPlugin(buildFastifyEnv);
