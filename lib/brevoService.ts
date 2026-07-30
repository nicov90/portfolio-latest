import Brevo from '@getbrevo/brevo';

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Contact-form fields land here as raw user input and get interpolated into an HTML email —
// without escaping, a message like `<img src=x onerror=...>` would render/execute in whatever
// email client opens it (HTML injection / phishing vector), so every field must be escaped first.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export class BrevoService {
  private static get client() {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) throw new Error('BREVO_API_KEY is not set');
    const client = new Brevo.TransactionalEmailsApi();
    client.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);
    return client;
  }

  static async sendContactEmail(payload: ContactPayload) {
    const name = escapeHtml(payload.name);
    const email = escapeHtml(payload.email);
    const subject = escapeHtml(payload.subject);
    const message = escapeHtml(payload.message).replace(/\n/g, '<br/>');

    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.subject = payload.subject || 'Sin asunto';
    sendSmtpEmail.sender = { email: process.env.BREVO_SENDER_EMAIL, name: payload.name || 'Anónimo' } as any;
    sendSmtpEmail.to = [{ email: process.env.BREVO_CONTACT_TO_EMAIL } as any];
    sendSmtpEmail.replyTo = { email: payload.email, name: payload.name } as any;
    sendSmtpEmail.htmlContent = `
      <h2>Nuevo mensaje desde mi portafolio:</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Asunto:</strong> ${subject}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${message}</p>
    `;
    sendSmtpEmail.textContent = `Nuevo mensaje desde mi portafolio:\nName: ${payload.name}\nEmail: ${payload.email}\nAsunto: ${payload.subject}\n\n${payload.message}`;

    return await this.client.sendTransacEmail(sendSmtpEmail);
  }
}
