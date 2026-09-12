import { api } from "./api";

/**
 * ⚠️ READ THIS — sends a request, but nothing is listening yet.
 *
 * Browsers can't send email directly (no SMTP from client-side JS, and
 * putting Resend/Postmark/SMTP credentials in frontend code would leak them
 * to every visitor). So this file does the one thing a frontend safely can:
 * POST to a backend endpoint and let a server hold the real credentials.
 *
 * Right now POST /api/notifications/email doesn't exist on your backend, so
 * every call here 404s, gets caught, logged to the console, and quietly
 * does nothing else — the in-app notification bell (notificationStore.ts)
 * still fires regardless, so nothing in the UI breaks.
 *
 * To make it real (same shape as the Nodemailer setup on Bloomwell):
 *   1. Add POST /api/notifications/email to your Express backend, body:
 *        { to, subject, template, data }
 *   2. In that route, call Nodemailer (or Resend/Postmark) with real SMTP
 *      credentials from env vars — never from frontend code.
 *   3. Nothing here needs to change; this function already posts the right shape.
 *
 * See EMAIL_SETUP.md at the project root for a ready-to-paste backend route.
 */

export type EmailTemplate =
  | "booking_request"
  | "booking_accepted"
  | "booking_declined"
  | "payment_received";

export type SendEmailInput = {
  to: string;
  subject: string;
  template: EmailTemplate;
  data: Record<string, string | number>;
};

export async function sendTransactionalEmail(input: SendEmailInput): Promise<boolean> {
  if (!input.to) {
    console.info(
      `[emailService] Skipped "${input.template}" — no email address on file for this recipient.`
    );
    return false;
  }
  try {
    await api.post("/api/notifications/email", input);
    return true;
  } catch {
    console.info(
      `[emailService] Would send "${input.template}" to ${input.to}. ` +
        `No backend route yet — see EMAIL_SETUP.md.`,
      input.data
    );
    return false;
  }
}
