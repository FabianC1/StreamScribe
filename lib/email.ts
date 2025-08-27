import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendPasswordResetEmailParams {
  email: string
  resetUrl: string
  firstName: string
}

export async function sendPasswordResetEmail({
  email,
  resetUrl,
  firstName
}: SendPasswordResetEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'StreamScribe <noreply@resend.dev>',
      to: [email],
      subject: 'Reset Your StreamScribe Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8fafc;
            }
            .container {
              background-color: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #3b82f6;
              margin-bottom: 10px;
            }
            .title {
              font-size: 24px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 20px;
            }
            .message {
              font-size: 16px;
              color: #6b7280;
              margin-bottom: 30px;
              line-height: 1.7;
            }
            .button {
              display: inline-block;
              background-color: #3b82f6;
              color: white;
              text-decoration: none;
              padding: 14px 28px;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              margin: 20px 0;
              text-align: center;
            }
            .button:hover {
              background-color: #2563eb;
            }
            .warning {
              background-color: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 8px;
              padding: 16px;
              margin: 20px 0;
              color: #92400e;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #9ca3af;
              font-size: 14px;
            }
            .link {
              color: #3b82f6;
              text-decoration: none;
            }
            .link:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">StreamScribe</div>
              <div class="title">Reset Your Password</div>
            </div>
            
            <div class="message">
              Hi ${firstName},<br><br>
              We received a request to reset your password for your StreamScribe account. 
              Click the button below to create a new password:
            </div>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> This link will expire in 24 hours. 
              If you didn't request this password reset, please ignore this email.
            </div>
            
            <div class="message">
              If the button above doesn't work, you can copy and paste this link into your browser:<br>
              <a href="${resetUrl}" class="link">${resetUrl}</a>
            </div>
            
            <div class="footer">
              <p>This email was sent from StreamScribe</p>
              <p>If you have any questions, please contact our support team</p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('❌ Resend email error:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    console.log('✅ Password reset email sent successfully:', data?.id)
    return data
  } catch (error) {
    console.error('❌ Email sending failed:', error)
    throw error
  }
}
