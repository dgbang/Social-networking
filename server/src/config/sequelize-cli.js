require("dotenv").config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });

const base = {
  username: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "admin_password",
  database: process.env.DB_NAME || "social_media",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  dialect: process.env.DB_DIALECT || "postgres"
};

module.exports = {
  development: base,
  test: base,
  production: {
    ...base,
    logging: false
  }
};
