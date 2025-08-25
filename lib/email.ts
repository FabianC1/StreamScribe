import nodemailer from 'nodemailer'

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use Gmail, SendGrid, or any other service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail(options: EmailOptions) {
  try {
    const mailOptions = {
      from: options.from || process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

// Email templates for different notification types
export function getEmailTemplate(type: string, data: any): string {
  switch (type) {
    case 'billingReminder':
      return getBillingReminderTemplate(data)
    case 'usageAlert':
      return getUsageAlertTemplate(data)
    case 'securityAlert':
      return getSecurityAlertTemplate(data)
    case 'emailUpdates':
      return getEmailUpdatesTemplate(data)
    default:
      return getDefaultTemplate(data)
  }
}

function getBillingReminderTemplate(data: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">💰 Billing Reminder</h2>
      <p>Hello ${data.name},</p>
      <p>This is a friendly reminder that your StreamScribe subscription will be renewed on <strong>${data.renewalDate}</strong>.</p>
      <p><strong>Current Plan:</strong> ${data.plan}</p>
      <p><strong>Amount:</strong> ${data.amount}</p>
      <p>If you have any questions about your subscription, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br>The StreamScribe Team</p>
    </div>
  `
}

function getUsageAlertTemplate(data: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">⚠️ Usage Alert</h2>
      <p>Hello ${data.name},</p>
      <p>You're approaching your transcription limit for this month.</p>
      <p><strong>Current Usage:</strong> ${data.usedHours} hours</p>
      <p><strong>Monthly Limit:</strong> ${data.totalHours} hours</p>
      <p><strong>Remaining:</strong> ${data.remainingHours} hours</p>
      <p>Consider upgrading your plan to get more transcription hours, or wait until next month for your limit to reset.</p>
      <p>Best regards,<br>The StreamScribe Team</p>
    </div>
  `
}

function getSecurityAlertTemplate(data: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">🔒 Security Alert</h2>
      <p>Hello ${data.name},</p>
      <p>We detected a new login to your StreamScribe account.</p>
      <p><strong>Login Time:</strong> ${data.loginTime}</p>
      <p><strong>Location:</strong> ${data.location}</p>
      <p><strong>Device:</strong> ${data.device}</p>
      <p>If this was you, no action is needed. If you don't recognize this login, please change your password immediately.</p>
      <p>Best regards,<br>The StreamScribe Team</p>
    </div>
  `
}

function getEmailUpdatesTemplate(data: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">📧 Account Update</h2>
      <p>Hello ${data.name},</p>
      <p>Here's an update about your StreamScribe account:</p>
      <p>${data.message}</p>
      <p>Best regards,<br>The StreamScribe Team</p>
    </div>
  `
}

function getDefaultTemplate(data: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">StreamScribe Notification</h2>
      <p>Hello ${data.name},</p>
      <p>${data.message}</p>
      <p>Best regards,<br>The StreamScribe Team</p>
    </div>
  `
}

// Email automation functions
export async function sendBillingReminder(user: any) {
  if (!user.notifications?.billingReminders) return

  const data = {
    name: user.name || 'User',
    renewalDate: new Date(user.subscriptionEndDate).toLocaleDateString(),
    plan: user.subscriptionTier,
    amount: getPlanPrice(user.subscriptionTier),
  }

  await sendEmail({
    to: user.email,
    subject: '💰 StreamScribe Billing Reminder',
    html: getEmailTemplate('billingReminder', data),
  })
}

export async function sendUsageAlert(user: any) {
  if (!user.notifications?.usageAlerts) return

  const usedHours = user.hoursUsed || 0
  const totalHours = user.hoursLimit || 30
  const remainingHours = totalHours - usedHours

  if (remainingHours <= 5) { // Send alert when 5 hours or less remaining
    const data = {
      name: user.name || 'User',
      usedHours,
      totalHours,
      remainingHours,
    }

    await sendEmail({
      to: user.email,
      subject: '⚠️ StreamScribe Usage Alert',
      html: getEmailTemplate('usageAlert', data),
    })
  }
}

export async function sendSecurityAlert(user: any, loginData: any) {
  if (!user.notifications?.securityAlerts) return

  const data = {
    name: user.name || 'User',
    loginTime: new Date().toLocaleString(),
    location: loginData.location || 'Unknown',
    device: loginData.device || 'Unknown',
  }

  await sendEmail({
    to: user.email,
    subject: '🔒 StreamScribe Security Alert',
    html: getEmailTemplate('securityAlert', data),
  })
}

export async function sendEmailUpdate(user: any, message: string) {
  if (!user.notifications?.emailUpdates) return

  const data = {
    name: user.name || 'User',
    message,
  }

  await sendEmail({
    to: user.email,
    subject: '📧 StreamScribe Account Update',
    html: getEmailTemplate('emailUpdates', data),
  })
}

// Helper function to get plan price
function getPlanPrice(tier: string): string {
  const prices = {
    basic: '$6.99',
    standard: '$12.99',
    premium: '$19.99',
  }
  return prices[tier as keyof typeof prices] || '$0.00'
}

// Batch email sending for multiple users
export async function sendBatchEmails(users: any[], template: string, data: any) {
  const promises = users.map(user => {
    if (user.notifications?.[template]) {
      return sendEmail({
        to: user.email,
        subject: `StreamScribe ${template.charAt(0).toUpperCase() + template.slice(1)}`,
        html: getEmailTemplate(template, { name: user.name, ...data }),
      })
    }
    return Promise.resolve()
  })

  await Promise.all(promises)
}
