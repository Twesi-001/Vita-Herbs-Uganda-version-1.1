import nodemailer from 'nodemailer';

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error('EMAIL_USER and EMAIL_APP_PASSWORD environment variables are required');
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }
  return transporter;
}

export interface BroadcastAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

/**
 * Sends one email to the configured sender's own address with every
 * recipient BCC'd, so subscribers never see each other's addresses.
 * Gmail SMTP caps a single message's recipients around 500 — comfortably
 * above what a small mailing list needs, so no batching is done here.
 */
export async function sendBroadcastEmail(
  recipients: string[],
  subject: string,
  textBody: string,
  attachments: BroadcastAttachment[] = [],
): Promise<void> {
  const user = process.env.EMAIL_USER;
  const transport = getTransporter();

  await transport.sendMail({
    from: `KarOrganics Uganda <${user}>`,
    to: user,
    bcc: recipients,
    subject,
    text: textBody,
    attachments,
  });
}
