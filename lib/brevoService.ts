import Brevo from '@getbrevo/brevo';

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
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
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.subject = payload.subject || 'Sin asunto';
    sendSmtpEmail.sender = { email: process.env.BREVO_SENDER_EMAIL, name: payload.name || 'Anónimo' } as any;
    sendSmtpEmail.to = [{ email: process.env.BREVO_CONTACT_TO_EMAIL } as any];
    sendSmtpEmail.replyTo = { email: payload.email, name: payload.name } as any;
    sendSmtpEmail.htmlContent = `
      <h2>Nuevo mensaje desde mi portafolio:</h2>
      <p><strong>Nombre:</strong> ${payload.name}</p>
      <p><strong>Email:</strong> ${payload.email}</p>
      <p><strong>Asunto:</strong> ${payload.subject}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${payload.message.replace(/\n/g, '<br/>')}</p>
    `;
    sendSmtpEmail.textContent = `Nuevo mensaje desde mi portafolio:\nName: ${payload.name}\nEmail: ${payload.email}\Asunto: ${payload.subject}\n\n${payload.message}`;

    return await this.client.sendTransacEmail(sendSmtpEmail);
  }
}
