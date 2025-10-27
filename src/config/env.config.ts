import fastifyEnv from "@fastify/env";
import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { Static, Type } from "@sinclair/typebox";

const ConfigSchema = Type.Strict(
  Type.Object({
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

const buildFastifyEnv = async (
  server: FastifyInstance,
  _options: Record<string, any>,
) => {
  const schema = {
    type: "object",
    required: [
      "PORT",
      "MONGODB_URI",
      "SIGNATURERX_CLIENT_ID",
      "SIGNATURERX_CLIENT_SECRET",
      "SIGNATURERX_SCOPE",
      "SIGNATURERX_TOKEN_URL",
      "SIGNATURERX_BASE_URL",
      "SIGNATURERX_PRESCRIPTIONS_URL",
    ],
    properties: {
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

  await server.register(fastifyEnv, configOptions);
};

export const buildFastifyEnvPlugin = fastifyPlugin(buildFastifyEnv);
