import * as Brevo from '@getbrevo/brevo';

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  name: string;
  content: string; // Base64 encoded
  url?: string;
}

export interface SendEmailParams {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  from?: EmailRecipient;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  replyTo?: EmailRecipient;
  attachments?: EmailAttachment[];
  params?: Record<string, any>; // Variables de template
  tags?: string[];
  headers?: Record<string, string>;
}

export interface InvitationEmailParams {
  to: string;
  invitationUrl: string;
  companyName: string;
  expiresAt: Date;
  inviterName?: string;
}

export default class BrevoService {
  private api: Brevo.TransactionalEmailsApi;
  private defaultSender: EmailRecipient;

  constructor() {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      throw new Error('BREVO_API_KEY no está configurada en las variables de entorno');
    }
    this.api = new Brevo.TransactionalEmailsApi();
    // Configurar la API key correctamente
    (this.api as any).authentications.apiKey.apiKey = apiKey;
    // Configurar remitente por defecto
    if(!process.env.BREVO_SENDER_EMAIL) throw new Error('BREVO_SENDER_EMAIL no está configurada en las variables de entorno');
    if(!process.env.BREVO_SENDER_NAME) throw new Error('BREVO_SENDER_NAME no está configurada en las variables de entorno');
    this.defaultSender = {
      email: process.env.BREVO_SENDER_EMAIL,
      name: process.env.BREVO_SENDER_NAME
    };
  }

  // ============================================
  // MÉTODO PRINCIPAL: ENVIAR EMAIL
  // ============================================
  async sendEmail(params: SendEmailParams): Promise<Brevo.CreateSmtpEmail> {
    try {
      const recipients = Array.isArray(params.to) ? params.to : [params.to];
      const sendSmtpEmail = new Brevo.SendSmtpEmail();
      sendSmtpEmail.sender = params.from || this.defaultSender;
      sendSmtpEmail.to = recipients.map(r => ({ email: r.email, name: r.name }));
      sendSmtpEmail.subject = params.subject;
      sendSmtpEmail.htmlContent = params.htmlContent;
      if (params.textContent) sendSmtpEmail.textContent = params.textContent;
      if (params.cc) sendSmtpEmail.cc = params.cc.map(r => ({ email: r.email, name: r.name }));
      if (params.bcc) sendSmtpEmail.bcc = params.bcc.map(r => ({ email: r.email, name: r.name }));
      if (params.replyTo) sendSmtpEmail.replyTo = { email: params.replyTo.email, name: params.replyTo.name };
      if (params.attachments) sendSmtpEmail.attachment = params.attachments.map(att => ({ name: att.name, content: att.content, url: att.url }));
      if (params.params) sendSmtpEmail.params = params.params;
      if (params.tags) sendSmtpEmail.tags = params.tags;
      if (params.headers) sendSmtpEmail.headers = params.headers;

      const response = await this.api.sendTransacEmail(sendSmtpEmail);
      console.log(response)
      console.log(`✉️ Email enviado exitosamente a ${recipients.map(r => r.email).join(', ')}`);
      return response.body;
    } catch (error: any) {
      console.error('❌ Error al enviar email con Brevo:', error);
      throw new Error(`Error al enviar email: ${error.message || 'Error desconocido'}`);
    }
  }

  // ============================================
  // MÉTODO: ENVIAR A MÚLTIPLES DESTINATARIOS CON PERSONALIZACIÓN
  // ============================================
  async sendBulkEmail(
    baseParams: Omit<SendEmailParams, 'to'>,
    recipients: Array<EmailRecipient & { params?: Record<string, any> }>
  ): Promise<Brevo.CreateSmtpEmail> {
    try {
      const messageVersions = recipients.map(recipient => ({
        to: [{ email: recipient.email, name: recipient.name }],
        params: { ...baseParams.params, ...recipient.params }
      }));

      const sendSmtpEmail = new Brevo.SendSmtpEmail();
      sendSmtpEmail.sender = baseParams.from || this.defaultSender;
      sendSmtpEmail.subject = baseParams.subject;
      sendSmtpEmail.htmlContent = baseParams.htmlContent;
      if (baseParams.textContent) sendSmtpEmail.textContent = baseParams.textContent;
      if (baseParams.params) sendSmtpEmail.params = baseParams.params;
      (sendSmtpEmail as any).messageVersions = messageVersions;
      if (baseParams.tags) sendSmtpEmail.tags = baseParams.tags;

      const response = await this.api.sendTransacEmail(sendSmtpEmail);
      console.log(`✉️ Emails masivos enviados a ${recipients.length} destinatarios`);
      return response.body;
    } catch (error: any) {
      console.error('❌ Error al enviar emails masivos:', error);
      throw new Error(`Error al enviar emails masivos: ${error.message}`);
    }
  }

  // ============================================
  // MÉTODO: VERIFICAR CONFIGURACIÓN
  // ============================================
  async testConnection(): Promise<boolean> {
    try {
      // Intenta obtener información de la cuenta
      const apiKey = process.env.BREVO_API_KEY;
      if (!apiKey) throw new Error('BREVO_API_KEY no está configurada en las variables de entorno');
      const accountApi = new Brevo.AccountApi();
      (accountApi as any).authentications.apiKey.apiKey = apiKey;
      await accountApi.getAccount();
      console.log('✅ Conexión con Brevo exitosa');
      return true;
    } catch (error: any) {
      console.error('❌ Error al conectar con Brevo:', error?.response?.data?.message || error.message);
      return false;
    }
  }

  // ============================================
  // MÉTODO: OBTENER ESTADÍSTICAS DE EMAIL
  // ============================================
  async getEmailStats(messageId: string): Promise<any> {
    try {
      const response = await this.api.getTransacEmailContent(messageId);
      return response;
    } catch (error: any) {
      console.error('❌ Error al obtener estadísticas:', error);
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }
}

// ============================================
// EXPORTAR INSTANCIA SINGLETON
// ============================================
export const brevoService = new BrevoService();