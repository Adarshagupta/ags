type SendEmailParams = {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

type SellerAccountTemplateParams = {
  sellerName: string
  businessName: string
  email: string
  password: string
}

type AdminNewSellerTemplateParams = {
  businessName: string
  sellerName: string
  email: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function buildFromAddress(): string {
  const fromName = process.env.SMTP_FROM_NAME || 'Chapter Curus'
  const fromEmail = process.env.SMTP_FROM_EMAIL || 'no-reply@example.com'
  return `"${fromName}" <${fromEmail}>`
}

async function importOptional(moduleName: string): Promise<any | null> {
  try {
    const importer = new Function('moduleName', 'return import(moduleName)') as (
      m: string
    ) => Promise<any>
    return await importer(moduleName)
  } catch {
    return null
  }
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailParams): Promise<boolean> {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASSWORD

  if (!host || !user || !pass) {
    console.warn('[email] SMTP config missing. Skipping email send.', { to, subject })
    return false
  }

  const nodemailerModule = await importOptional('nodemailer')
  const nodemailer = nodemailerModule?.default || nodemailerModule

  if (!nodemailer?.createTransport) {
    console.warn('[email] nodemailer is not installed. Skipping email send.', {
      to,
      subject,
    })
    return false
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })

    await transporter.sendMail({
      from: buildFromAddress(),
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text: text || stripHtml(html),
    })

    return true
  } catch (error) {
    console.error('[email] Failed to send email:', error)
    return false
  }
}

export const emailTemplates = {
  sellerAccountCreated({
    sellerName,
    businessName,
    email,
    password,
  }: SellerAccountTemplateParams): string {
    const safeSellerName = escapeHtml(sellerName)
    const safeBusinessName = escapeHtml(businessName)
    const safeEmail = escapeHtml(email)
    const safePassword = escapeHtml(password)

    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h2>Welcome to Chapter Curus Seller Platform</h2>
        <p>Hello ${safeSellerName},</p>
        <p>Your seller account has been created for <strong>${safeBusinessName}</strong>.</p>
        <p>You can log in with the credentials below:</p>
        <ul>
          <li><strong>Email:</strong> ${safeEmail}</li>
          <li><strong>Password:</strong> ${safePassword}</li>
        </ul>
        <p>Please change your password after first login.</p>
      </div>
    `
  },

  adminNewSeller({
    businessName,
    sellerName,
    email,
  }: AdminNewSellerTemplateParams): string {
    const safeBusinessName = escapeHtml(businessName)
    const safeSellerName = escapeHtml(sellerName)
    const safeEmail = escapeHtml(email)

    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h2>New Seller Account Created</h2>
        <p>A new seller has been added to the platform.</p>
        <ul>
          <li><strong>Business:</strong> ${safeBusinessName}</li>
          <li><strong>Seller:</strong> ${safeSellerName}</li>
          <li><strong>Email:</strong> ${safeEmail}</li>
        </ul>
      </div>
    `
  },
}

