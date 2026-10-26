import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpEmail = async ({ to, code }) => {
  await resend.emails.send({
    from: "NYSC Connect <onboarding@resend.dev>",
    to,
    subject: "Your NYSC Connect verification code",
    html: `<p>Your verification code is:</p><h2>${code}</h2><p>This code expires shortly. If you didn't request this, you can ignore this email.</p>`,
  });
};

export const sendAccountVerifiedEmail = async ({ to, fullName }) => {
  await resend.emails.send({
    from: "NYSC Connect <onboarding@resend.dev>",
    to,
    subject: "Your account is verified!",
    html: `<p>Hi ${fullName},</p><p>Your NYSC Connect account has been successfully verified. You can now log in and start using the app.</p>`,
  });
};