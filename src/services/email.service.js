const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const config = require('../config/env');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  /**
   * Initialize nodemailer transport using environment variables
   */
  initTransporter() {
    const smtp = config.smtp || {};
    const host = smtp.host || process.env.SMTP_HOST;
    const user = smtp.user || process.env.SMTP_USER;
    const pass = smtp.pass || process.env.SMTP_PASS;

    if (!user || !pass) {
      // Non-blocking notice: SMTP not yet configured
      return;
    }

    const port = smtp.port || parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = smtp.secure !== undefined ? smtp.secure : (process.env.SMTP_SECURE === 'true' || port === 465);

    try {
      this.transporter = nodemailer.createTransport({
        host: host || 'smtp.gmail.com',
        port: port,
        secure: secure,
        auth: {
          user: user,
          pass: pass
        },
        tls: {
          // Do not fail on invalid certs in local dev
          rejectUnauthorized: process.env.NODE_ENV === 'production'
        }
      });
      console.log(`[EmailService] SMTP transporter initialized (${host}:${port}, secure: ${secure})`);
    } catch (err) {
      console.warn('[EmailService] Failed to initialize nodemailer transporter:', err.message);
      this.transporter = null;
    }
  }

  /**
   * Check if email service is active and ready
   */
  isConfigured() {
    if (!this.transporter && (config?.smtp?.user || process.env.SMTP_USER) && (config?.smtp?.pass || process.env.SMTP_PASS)) {
      this.initTransporter();
    }
    return Boolean(this.transporter);
  }

  /**
   * Resolve and return inline CID logo attachment for email templates
   */
  getLogoAttachment() {
    const possiblePaths = [
      path.join(__dirname, '../../public/images/logo.png'),
      path.join(__dirname, '../../public/logo.png'),
      path.join(__dirname, '../../../efocus-client/public/logo.png'),
      path.join(__dirname, '../../../efocus-client/public/images/logo.png')
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return {
          filename: 'logo.png',
          path: p,
          cid: 'efocus-logo'
        };
      }
    }
    return null;
  }

  /**
   * Send new lead alert to the eFocus Sales / Engineering team
   * @param {Object} submission 
   * @param {Object|null} file 
   */
  async sendAdminAlert(submission, file = null) {
    if (!this.isConfigured()) {
      console.log(`[EmailService] Skipping admin notification: SMTP_USER / SMTP_PASS not set in .env (Submission: ${submission.reference_no})`);
      return { skipped: true, reason: 'SMTP credentials not configured' };
    }

    try {
      const recipient = process.env.ADMIN_NOTIFICATION_EMAIL || 'sales@efocus.in';
      const sender = process.env.SMTP_FROM || `"eFocus Industrial" <${process.env.SMTP_USER}>`;
      const appUrl = process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 5001}`;

      const clientName = submission.name || 'Not provided';
      const company = submission.company_name || 'Individual / Not provided';
      const email = submission.email || 'Not provided';
      const phone = submission.phone || 'Not provided';
      const refNo = submission.reference_no;
      const formName = submission.form_name;

      // Extract custom extra fields from form_data if available
      const extraFields = [];
      if (submission.form_data && typeof submission.form_data === 'object') {
        const standardKeys = [
          'name', 'full_name', 'company_name', 'company', 'email', 'work_email', 'contact_email',
          'phone', 'phone_number', 'subject', 'requirement_type', 'delivery_timeline', 'timeline',
          'target_brands', 'preferred_brands', 'part_numbers', 'part_number', 'mpns',
          'skus', 'sku_count', 'quantity', 'estimated_value', 'budget', 'message', 'additional_notes',
          'uploaded_file', 'form_name', 'form_type'
        ];

        for (const [key, value] of Object.entries(submission.form_data)) {
          if (!standardKeys.includes(key) && value !== null && value !== undefined && value !== '') {
            const formattedLabel = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            extraFields.push(`<tr><td style="padding: 8px 12px; font-weight: 600; color: #475569; width: 35%; border-bottom: 1px solid #e2e8f0;">${formattedLabel}</td><td style="padding: 8px 12px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${String(value)}</td></tr>`);
          }
        }
      }

      const fileDownloadHtml = submission.attachment_url
        ? `<div style="margin-top: 16px; padding: 12px 16px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px;">
            <strong>Attached Document:</strong> <a href="${appUrl}${submission.attachment_url}" target="_blank" style="color: #0284c7; text-decoration: underline;">${submission.attachment_name || 'Download Attachment'}</a> (${Math.round((submission.attachment_size || 0) / 1024)} KB)
           </div>`
        : '';

      const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <!-- Official Brand Header with Logo -->
        <div style="background-color: #ffffff; padding: 20px 28px; border-bottom: 2px solid #dc2626;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
            <tr>
              <td style="vertical-align: middle; text-align: left;">
                <img src="cid:efocus-logo" alt="eFocus Industrial" width="155" height="42" style="display: block; width: 155px; max-width: 100%; height: auto; border: 0; outline: none; text-decoration: none;" />
              </td>
              <td style="vertical-align: middle; text-align: right;">
                <span style="display: inline-block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; color: #475569; background-color: #f1f5f9; padding: 6px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                  Admin Lead Desk
                </span>
              </td>
            </tr>
          </table>
        </div>

        <!-- Hero Status Banner -->
        <div style="background: #0f172a; padding: 22px 28px; color: #ffffff;">
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #38bdf8; font-weight: 700; margin-bottom: 4px;">New Lead Notification</div>
          <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff;">${formName}</h2>
          <div style="margin-top: 8px; font-size: 13px; color: #94a3b8;">
            Reference: <strong style="color: #f8fafc; font-family: monospace; background: rgba(255,255,255,0.12); padding: 2px 8px; border-radius: 4px;">${refNo}</strong>
            &nbsp;|&nbsp; Priority: <span style="text-transform: uppercase; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">${submission.priority || 'medium'}</span>
          </div>
        </div>

        <div style="padding: 24px 28px;">
          <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-top: 0; margin-bottom: 12px; font-weight: 700;">Client Contact Information</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px; background: #f8fafc; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
            <tr>
              <td style="padding: 10px 14px; font-weight: 600; color: #475569; width: 35%; border-bottom: 1px solid #e2e8f0;">Full Name</td>
              <td style="padding: 10px 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${clientName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">Company / Org</td>
              <td style="padding: 10px 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${company}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">Email Address</td>
              <td style="padding: 10px 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;"><a href="mailto:${email}" style="color: #0284c7; text-decoration: none; font-weight: 500;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; font-weight: 600; color: #475569;">Phone Number</td>
              <td style="padding: 10px 14px; color: #0f172a;"><a href="tel:${phone}" style="color: #0284c7; text-decoration: none; font-weight: 500;">${phone}</a></td>
            </tr>
          </table>

          <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-top: 0; margin-bottom: 12px; font-weight: 700;">Requirement Details</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <tr>
              <td style="padding: 10px 14px; font-weight: 600; color: #475569; width: 35%; border-bottom: 1px solid #e2e8f0;">Subject / Scope</td>
              <td style="padding: 10px 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${submission.subject || 'Standard Procurement Enquiry'}</td>
            </tr>
            ${submission.requirement_type ? `<tr><td style="padding: 10px 14px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">Service / Requirement Type</td><td style="padding: 10px 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${submission.requirement_type}</td></tr>` : ''}
            ${submission.part_numbers ? `<tr><td style="padding: 10px 14px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">Part Numbers / MPNs</td><td style="padding: 10px 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${submission.part_numbers}</td></tr>` : ''}
            ${submission.skus ? `<tr><td style="padding: 10px 14px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">SKUs Count</td><td style="padding: 10px 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${submission.skus}</td></tr>` : ''}
            ${submission.quantity ? `<tr><td style="padding: 10px 14px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">Estimated Quantity</td><td style="padding: 10px 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${submission.quantity}</td></tr>` : ''}
            ${submission.target_brands ? `<tr><td style="padding: 10px 14px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">Target Brands / Makes</td><td style="padding: 10px 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${submission.target_brands}</td></tr>` : ''}
            ${submission.delivery_timeline ? `<tr><td style="padding: 10px 14px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">Required Timeline</td><td style="padding: 10px 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${submission.delivery_timeline}</td></tr>` : ''}
            ${submission.estimated_value ? `<tr><td style="padding: 10px 14px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">Budget / Target</td><td style="padding: 10px 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${submission.estimated_value}</td></tr>` : ''}
            ${extraFields.join('')}
            ${submission.message ? `<tr><td style="padding: 10px 14px; font-weight: 600; color: #475569; vertical-align: top;">Message / Specifications</td><td style="padding: 10px 14px; color: #0f172a; white-space: pre-wrap;">${submission.message}</td></tr>` : ''}
          </table>

          ${fileDownloadHtml}

          <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
            This notification was generated automatically by the <strong style="color: #475569;">eFocus Industrial Portal</strong>.<br>
            Direct Reply-To: <a href="mailto:${email}" style="color: #64748b; text-decoration: underline;">${email}</a>
          </div>
        </div>
      </div>
      `;

      // Attach inline logo
      const attachments = [];
      const logoAttachment = this.getLogoAttachment();
      if (logoAttachment) {
        attachments.push(logoAttachment);
      }

      // If user uploaded a physical file, also attach directly to admin alert email
      if (file && file.path && fs.existsSync(file.path)) {
        attachments.push({
          filename: file.originalname || submission.attachment_name || 'BOM_Attachment',
          path: file.path
        });
      }

      const mailOptions = {
        from: sender,
        to: recipient,
        replyTo: email !== 'not_provided@website.local' ? email : undefined,
        subject: `[New Lead - ${formName}] Ref: ${refNo} - ${company !== 'Individual / Not provided' ? company : clientName}`,
        html: htmlContent,
        attachments: attachments
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`[EmailService] Admin alert sent for ${refNo} (Message ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.warn(`[EmailService] Failed to send admin alert for ${submission.reference_no}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Send acknowledgment receipt to customer
   * @param {Object} submission 
   */
  async sendCustomerConfirmation(submission) {
    if (!this.isConfigured()) {
      return { skipped: true, reason: 'SMTP credentials not configured' };
    }

    const email = submission.email;
    if (!email || email.includes('@website.local') || !email.includes('@')) {
      return { skipped: true, reason: 'Customer email not provided or invalid' };
    }

    try {
      const sender = process.env.SMTP_FROM || `"eFocus Industrial" <${process.env.SMTP_USER}>`;
      const clientName = submission.name || 'Valued Customer';
      const refNo = submission.reference_no;
      const formName = submission.form_name;

      const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <!-- Official Brand Header with Logo -->
        <div style="background-color: #ffffff; padding: 22px 28px; border-bottom: 2px solid #dc2626;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
            <tr>
              <td style="vertical-align: middle; text-align: left;">
                <img src="cid:efocus-logo" alt="eFocus Industrial" width="155" height="42" style="display: block; width: 155px; max-width: 100%; height: auto; border: 0; outline: none; text-decoration: none;" />
              </td>
              <td style="vertical-align: middle; text-align: right;">
                <span style="display: inline-block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; color: #475569; background-color: #f1f5f9; padding: 6px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                  Customer Care
                </span>
              </td>
            </tr>
          </table>
        </div>

        <!-- Hero Status Banner -->
        <div style="background: #0f172a; padding: 24px 28px; color: #ffffff;">
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #38bdf8; font-weight: 700; margin-bottom: 6px;">Enquiry Acknowledgment</div>
          <h2 style="margin: 0; font-size: 21px; font-weight: 700; color: #ffffff;">We Have Received Your Sourcing Request</h2>
        </div>

        <div style="padding: 28px 28px; line-height: 1.6; color: #334155;">
          <p style="margin-top: 0; font-size: 15px; color: #1e293b;">Dear <strong>${clientName}</strong>,</p>
          <p style="font-size: 14px; color: #475569;">Thank you for contacting <strong>eFocus Industrial</strong>. Your requirement for <strong>${formName}</strong> has been logged in our system under your unique reference number:</p>
          
          <div style="margin: 22px 0; padding: 18px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; text-align: center;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; color: #166534; font-weight: 700;">Your Tracking Reference</div>
            <div style="font-size: 24px; font-weight: 700; font-family: monospace; color: #15803d; margin-top: 4px;">${refNo}</div>
          </div>

          <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; margin-top: 26px; margin-bottom: 10px; font-weight: 700;">What Happens Next?</h3>
          <ul style="padding-left: 20px; font-size: 14px; color: #475569; margin: 0 0 24px 0;">
            <li style="margin-bottom: 8px;">Our technical sales & engineering team is reviewing your bill of materials and application specifications.</li>
            <li style="margin-bottom: 8px;">You will receive an official response or formal quotation within <strong>24 to 48 business hours</strong>.</li>
            <li>For urgent or custom requirements, please quote your reference number (<strong style="color: #0f172a; font-family: monospace;">${refNo}</strong>) when contacting our desk.</li>
          </ul>

          <div style="padding: 16px 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">
            <strong style="color: #334155;">Need Immediate Technical Assistance?</strong><br>
            Email: <a href="mailto:sales@efocus.in" style="color: #dc2626; text-decoration: none; font-weight: 600;">sales@efocus.in</a><br>
            Website: <a href="https://efocus.in" style="color: #0284c7; text-decoration: none;">www.efocus.in</a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
            &copy; ${new Date().getFullYear()} <strong style="color: #64748b;">eFocus Industrial Automation & Test Solutions</strong>. All rights reserved.
          </div>
        </div>
      </div>
      `;

      // Attach inline logo
      const attachments = [];
      const logoAttachment = this.getLogoAttachment();
      if (logoAttachment) {
        attachments.push(logoAttachment);
      }

      const mailOptions = {
        from: sender,
        to: email,
        subject: `[Received] Your Enquiry with eFocus Industrial (Ref: ${refNo})`,
        html: htmlContent,
        attachments: attachments
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`[EmailService] Customer confirmation sent to ${email} (Message ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.warn(`[EmailService] Failed to send customer confirmation to ${email}:`, err.message);
      return { success: false, error: err.message };
    }
  }
}

module.exports = new EmailService();
