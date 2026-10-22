export type MailAddresses = {
  from: string;
  to: string;
};

export type MailMessage = {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
};

// Delivery boundary: the app only ever talks to this, so SMTP or a test stub
// can be swapped in without touching the routes.
export type MailTransport = {
  send(message: MailMessage): Promise<void>;
};
