const env = require("../config/env");

let resendClient = null;

function getResendClient() {
  if (!env.mail.resendApiKey) return null;
  if (!resendClient) {
    const { Resend } = require("resend");
    resendClient = new Resend(env.mail.resendApiKey);
  }
  return resendClient;
}

async function sendMail({ to, subject, html, text }) {
  const resend = getResendClient();
  if (!resend) {
    console.log("[mail:dev]", { to, subject, text });
    return { provider: "console" };
  }

  try {
    const result = await resend.emails.send({
      from: env.mail.from,
      to,
      subject,
      html,
      text
    });

    if (result?.error) {
      const error = new Error(result.error.message || "Resend email failed");
      error.name = result.error.name || "ResendError";
      error.status = result.error.statusCode || result.error.status || 502;
      error.statusCode = error.status;
      error.code = "EMAIL_DELIVERY_FAILED";
      error.details = result.error;
      throw error;
    }

    console.log("[mail:resend]", {
      to,
      subject,
      from: env.mail.from,
      id: result?.data?.id || result?.id || null
    });

    return { provider: "resend", result };
  } catch (error) {
    error.status = error.status || error.statusCode || 502;
    error.statusCode = error.statusCode || error.status;
    error.code = error.code || "EMAIL_DELIVERY_FAILED";

    console.error("[mail:resend:error]", {
      to,
      subject,
      from: env.mail.from,
      message: error.message,
      name: error.name,
      statusCode: error.statusCode,
      details: error.details || null
    });
    throw error;
  }
}

function buildLink(path) {
  return `${env.clientUrl}${path}`;
}

function sendResetPasswordEmail(user) {
  const link = buildLink(`/reset-password/${user.resetPasswordToken}`);
  return sendMail({
    to: user.email,
    subject: "Reset your password",
    text: `Reset your password: ${link}`,
    html: `<p>Reset your password:</p><p><a href="${link}">${link}</a></p>`
  });
}

module.exports = {
  sendResetPasswordEmail
};
