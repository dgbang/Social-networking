require("dotenv").config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 8080),
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    name: process.env.DB_NAME || "social_media",
    user: process.env.DB_USER || "admin",
    password: process.env.DB_PASSWORD || "admin_password",
    dialect: process.env.DB_DIALECT || "postgres"
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "dev_access_secret",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "dev_refresh_secret",
    accessExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d"
  },
  cookies: {
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAME_SITE || "lax"
  },
  mail: {
    resendApiKey: process.env.RESEND_API_KEY || "",
    from: process.env.MAIL_FROM || "Social Promax <onboarding@resend.dev>"
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || `http://localhost:${Number(process.env.PORT || 8080)}/api/auth/google/callback`
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
    folder: process.env.CLOUDINARY_FOLDER || "social-promax",
    uploadTimeoutMs: Number(process.env.CLOUDINARY_UPLOAD_TIMEOUT_MS || 120000)
  }
};

module.exports = env;
