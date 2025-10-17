declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    // SignatureRx OAuth2 Configuration
    SIGNATURERX_CLIENT_ID: string;
    SIGNATURERX_CLIENT_SECRET: string;
    SIGNATURERX_SCOPE: string;
    SIGNATURERX_BASE_URL: string;
    SIGNATURERX_TOKEN_URL: string;
    SIGNATURERX_PRESCRIPTIONS_URL: string;
  }
}
