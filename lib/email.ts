import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })
}

// Send email
export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const transporter = createTransporter()

    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'AGS'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML if text not provided
    })

    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

// Email Templates with Minimal Professional Design
const baseStyles = `
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #1f2937;
    background-color: #f9fafb;
  }
  .email-wrapper {
    width: 100%;
    background-color: #f9fafb;
    padding: 40px 20px;
  }
  .email-container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }
  .email-header {
    background-color: #111827;
    padding: 32px 40px;
    text-align: center;
  }
  .email-header h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #ffffff;
    letter-spacing: -0.5px;
  }
  .email-body {
    padding: 40px;
  }
  .email-body p {
    margin: 0 0 16px 0;
    font-size: 15px;
    color: #4b5563;
  }
  .email-body p.greeting {
    color: #111827;
    font-weight: 500;
  }
  .info-box {
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 24px;
    margin: 24px 0;
  }
  .info-box h2 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: #111827;
  }
  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid #e5e7eb;
  }
  .info-row:last-child {
    border-bottom: none;
  }
  .info-label {
    font-size: 14px;
    color: #6b7280;
  }
  .info-value {
    font-size: 14px;
    font-weight: 500;
    color: #111827;
  }
  .total-row {
    display: flex;
    justify-content: space-between;
    padding: 16px 0;
    margin-top: 16px;
    border-top: 2px solid #e5e7eb;
  }
  .total-label {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
  }
  .total-value {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
  }
  .button {
    display: inline-block;
    padding: 12px 32px;
    margin: 24px 0;
    background-color: #111827;
    color: #ffffff;
    text-decoration: none;
    border-radius: 6px;
    font-size: 15px;
    font-weight: 500;
    text-align: center;
  }
  .button:hover {
    background-color: #1f2937;
  }
  .status-badge {
    display: inline-block;
    padding: 6px 16px;
    background-color: #111827;
    color: #ffffff;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .alert-box {
    background-color: #fef3c7;
    border-left: 3px solid #f59e0b;
    padding: 16px;
    margin: 24px 0;
    border-radius: 4px;
  }
  .alert-box p {
    margin: 0;
    font-size: 14px;
    color: #92400e;
  }
  .email-footer {
    padding: 32px 40px;
    text-align: center;
    background-color: #f9fafb;
    border-top: 1px solid #e5e7eb;
  }
  .email-footer p {
    margin: 0;
    font-size: 13px;
    color: #6b7280;
  }
`

export const emailTemplates = {
  // Customer Templates
  orderConfirmation: (orderData: {
    orderNumber: string
    customerName: string
    items: any[]
    total: number
    deliveryAddress: string
  }) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <h1>Order Confirmed</h1>
            </div>
            <div class="email-body">
              <p class="greeting">Hello ${orderData.customerName},</p>
              <p>Thank you for your order. We're preparing your items and will notify you once they're on their way.</p>
              
              <div class="info-box">
                <h2>Order #${orderData.orderNumber}</h2>
                ${orderData.items.map(item => `
                  <div class="info-row">
                    <span class="info-label">${item.product?.name || item.name} × ${item.quantity}</span>
                    <span class="info-value">₹${item.price * item.quantity}</span>
                  </div>
                `).join('')}
                <div class="total-row">
                  <span class="total-label">Total</span>
                  <span class="total-value">₹${orderData.total}</span>
                </div>
              </div>

              <div class="info-box">
                <h2>Delivery Address</h2>
                <p style="margin: 0; color: #4b5563;">${orderData.deliveryAddress}</p>
              </div>

              <a href="${process.env.NEXTAUTH_URL}/orders/${orderData.orderNumber}" class="button">Track Order</a>

              <p>If you have any questions, feel free to contact our support team.</p>
            </div>
            <div class="email-footer">
              <p>&copy; ${new Date().getFullYear()} AGS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `,

  orderStatusUpdate: (data: {
    orderNumber: string
    customerName: string
    status: string
    statusMessage: string
  }) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <h1>Order Update</h1>
            </div>
            <div class="email-body">
              <p class="greeting">Hello ${data.customerName},</p>
              <p>Your order status has been updated.</p>
              
              <div class="info-box">
                <h2>Order #${data.orderNumber}</h2>
                <div style="margin: 16px 0;">
                  <span class="status-badge">${data.status}</span>
                </div>
                <p style="margin: 16px 0 0 0; color: #111827; font-weight: 500;">${data.statusMessage}</p>
              </div>

              <a href="${process.env.NEXTAUTH_URL}/orders" class="button">View Order Details</a>
            </div>
            <div class="email-footer">
              <p>&copy; ${new Date().getFullYear()} AGS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `,

  // Seller Templates
  sellerAccountCreated: (data: {
    sellerName: string
    businessName: string
    email: string
    password: string
  }) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <h1>Welcome to AGS</h1>
            </div>
            <div class="email-body">
              <p class="greeting">Hello ${data.sellerName},</p>
              <p>Your seller account for <strong>${data.businessName}</strong> has been successfully created.</p>
              
              <div class="info-box">
                <h2>Login Credentials</h2>
                <div class="info-row">
                  <span class="info-label">Email</span>
                  <span class="info-value">${data.email}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Temporary Password</span>
                  <span class="info-value">${data.password}</span>
                </div>
              </div>

              <div class="alert-box">
                <p><strong>Important:</strong> Please change your password immediately after your first login.</p>
              </div>

              <a href="${process.env.NEXTAUTH_URL}/login" class="button">Login to Dashboard</a>

              <p>You can now start adding products and managing orders through your seller dashboard.</p>
            </div>
            <div class="email-footer">
              <p>&copy; ${new Date().getFullYear()} AGS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `,

  newOrderNotification: (data: {
    sellerName: string
    orderNumber: string
    customerName: string
    items: any[]
    total: number
  }) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <h1>New Order Received</h1>
            </div>
            <div class="email-body">
              <p class="greeting">Hello ${data.sellerName},</p>
              <p>You have received a new order. Please prepare the items and update the order status.</p>
              
              <div class="info-box">
                <h2>Order #${data.orderNumber}</h2>
                <div class="info-row">
                  <span class="info-label">Customer</span>
                  <span class="info-value">${data.customerName}</span>
                </div>
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                  <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #111827;">Items</h3>
                  ${data.items.map(item => `
                    <div class="info-row">
                      <span class="info-label">${item.product?.name || item.name} × ${item.quantity}</span>
                    </div>
                  `).join('')}
                </div>
                <div class="total-row">
                  <span class="total-label">Total</span>
                  <span class="total-value">₹${data.total}</span>
                </div>
              </div>

              <a href="${process.env.NEXTAUTH_URL}/seller/orders" class="button">View Order Details</a>
            </div>
            <div class="email-footer">
              <p>&copy; ${new Date().getFullYear()} AGS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `,

  productApproved: (data: {
    sellerName: string
    productName: string
    productId: string
  }) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <h1>Product Approved</h1>
            </div>
            <div class="email-body">
              <p class="greeting">Hello ${data.sellerName},</p>
              <p>Great news! Your product <strong>${data.productName}</strong> has been approved and is now live on the platform.</p>

              <a href="${process.env.NEXTAUTH_URL}/seller/products" class="button">View Products</a>

              <p>Customers can now discover and purchase this product.</p>
            </div>
            <div class="email-footer">
              <p>&copy; ${new Date().getFullYear()} AGS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `,

  // Admin Templates
  adminNewOrder: (data: {
    orderNumber: string
    customerName: string
    total: number
    itemCount: number
  }) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <h1>New Order Alert</h1>
            </div>
            <div class="email-body">
              <p>A new order has been placed on the platform.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Order Number</span>
                  <span class="info-value">#${data.orderNumber}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Customer</span>
                  <span class="info-value">${data.customerName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Items</span>
                  <span class="info-value">${data.itemCount}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Total</span>
                  <span class="info-value">₹${data.total}</span>
                </div>
              </div>

              <a href="${process.env.NEXTAUTH_URL}/admin/orders" class="button">View in Admin Panel</a>
            </div>
            <div class="email-footer">
              <p>&copy; ${new Date().getFullYear()} AGS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `,

  adminNewSeller: (data: {
    businessName: string
    sellerName: string
    email: string
  }) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <h1>New Seller Account</h1>
            </div>
            <div class="email-body">
              <p>A new seller account has been created on the platform.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Business Name</span>
                  <span class="info-value">${data.businessName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Owner</span>
                  <span class="info-value">${data.sellerName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email</span>
                  <span class="info-value">${data.email}</span>
                </div>
              </div>

              <a href="${process.env.NEXTAUTH_URL}/admin/sellers" class="button">Manage Sellers</a>
            </div>
            <div class="email-footer">
              <p>&copy; ${new Date().getFullYear()} AGS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `,

  // Additional Customer Templates
  welcomeEmail: (data: {
    customerName: string
    email: string
  }) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <h1>Welcome to AGS</h1>
            </div>
            <div class="email-body">
              <p class="greeting">Hello ${data.customerName},</p>
              <p>Thank you for joining AGS! We're excited to have you with us.</p>
              
              <div class="info-box">
                <h2>Get Started</h2>
                <p style="margin: 0 0 12px 0; color: #4b5563;">Explore our wide range of products and enjoy seamless shopping experience.</p>
                <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
                  <li>Browse categories</li>
                  <li>Save favorites to your wishlist</li>
                  <li>Track your orders</li>
                  <li>Manage delivery addresses</li>
                </ul>
              </div>

              <a href="${process.env.NEXTAUTH_URL}/products" class="button">Start Shopping</a>

              <p>If you have any questions, our support team is here to help.</p>
            </div>
            <div class="email-footer">
              <p>&copy; ${new Date().getFullYear()} AGS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `,

  passwordReset: (data: {
    customerName: string
    resetLink: string
  }) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="email-body">
              <p class="greeting">Hello ${data.customerName},</p>
              <p>We received a request to reset your password. Click the button below to create a new password.</p>

              <a href="${data.resetLink}" class="button">Reset Password</a>

              <div class="alert-box">
                <p><strong>Security Note:</strong> This link will expire in 1 hour. If you didn't request this reset, please ignore this email.</p>
              </div>

              <p style="font-size: 13px; color: #6b7280;">If the button doesn't work, copy and paste this link:<br><span style="word-break: break-all;">${data.resetLink}</span></p>
            </div>
            <div class="email-footer">
              <p>&copy; ${new Date().getFullYear()} AGS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `,

  orderDelivered: (data: {
    orderNumber: string
    customerName: string
    deliveredDate: string
  }) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <h1>Order Delivered</h1>
            </div>
            <div class="email-body">
              <p class="greeting">Hello ${data.customerName},</p>
              <p>Great news! Your order has been successfully delivered.</p>
              
              <div class="info-box">
                <h2>Order #${data.orderNumber}</h2>
                <div class="info-row">
                  <span class="info-label">Delivered On</span>
                  <span class="info-value">${data.deliveredDate}</span>
                </div>
                <div style="margin-top: 16px;">
                  <span class="status-badge">Delivered</span>
                </div>
              </div>

              <a href="${process.env.NEXTAUTH_URL}/orders/${data.orderNumber}" class="button">Rate Your Experience</a>

              <p>We hope you love your purchase! If you have any issues, please contact our support team.</p>
            </div>
            <div class="email-footer">
              <p>&copy; ${new Date().getFullYear()} AGS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `,

  orderCancelled: (data: {
    orderNumber: string
    customerName: string
    reason: string
    refundAmount: number
  }) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <h1>Order Cancelled</h1>
            </div>
            <div class="email-body">
              <p class="greeting">Hello ${data.customerName},</p>
              <p>Your order has been cancelled as requested.</p>
              
              <div class="info-box">
                <h2>Order #${data.orderNumber}</h2>
                <div class="info-row">
                  <span class="info-label">Cancellation Reason</span>
                  <span class="info-value">${data.reason}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Refund Amount</span>
                  <span class="info-value">₹${data.refundAmount}</span>
                </div>
              </div>

              <div class="alert-box">
                <p>Your refund will be processed within 5-7 business days to your original payment method.</p>
              </div>

              <a href="${process.env.NEXTAUTH_URL}/products" class="button">Continue Shopping</a>
            </div>
            <div class="email-footer">
              <p>&copy; ${new Date().getFullYear()} AGS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `,

  refundProcessed: (data: {
    orderNumber: string
    customerName: string
    refundAmount: number
    paymentMethod: string
  }) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <h1>Refund Processed</h1>
            </div>
            <div class="email-body">
              <p class="greeting">Hello ${data.customerName},</p>
              <p>Your refund has been successfully processed.</p>
              
              <div class="info-box">
                <h2>Refund Details</h2>
                <div class="info-row">
                  <span class="info-label">Order Number</span>
                  <span class="info-value">#${data.orderNumber}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Refund Amount</span>
                  <span class="info-value">₹${data.refundAmount}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Payment Method</span>
                  <span class="info-value">${data.paymentMethod}</span>
                </div>
              </div>

              <p>The amount should reflect in your account within 5-7 business days depending on your bank.</p>
            </div>
            <div class="email-footer">
              <p>&copy; ${new Date().getFullYear()} AGS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `,

  // Additional Seller Templates
  productRejected: (data: {
    sellerName: string
    productName: string
    rejectionReason: string
  }) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <h1>Product Review Update</h1>
            </div>
            <div class="email-body">
              <p class="greeting">Hello ${data.sellerName},</p>
              <p>Your product <strong>${data.productName}</strong> requires revision before approval.</p>
              
              <div class="info-box">
                <h2>Feedback</h2>
                <p style="margin: 0; color: #4b5563;">${data.rejectionReason}</p>
              </div>

              <div class="alert-box">
                <p>Please update your product listing according to the feedback and resubmit for approval.</p>
              </div>

              <a href="${process.env.NEXTAUTH_URL}/seller/products" class="button">Edit Product</a>
            </div>
            <div class="email-footer">
              <p>&copy; ${new Date().getFullYear()} AGS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `,

  lowStockAlert: (data: {
    sellerName: string
    productName: string
    currentStock: number
    productId: string
  }) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <h1>Low Stock Alert</h1>
            </div>
            <div class="email-body">
              <p class="greeting">Hello ${data.sellerName},</p>
              <p>One of your products is running low on stock.</p>
              
              <div class="info-box">
                <h2>${data.productName}</h2>
                <div class="info-row">
                  <span class="info-label">Current Stock</span>
                  <span class="info-value" style="color: #dc2626; font-weight: 600;">${data.currentStock} units</span>
                </div>
              </div>

              <div class="alert-box">
                <p>Please restock soon to avoid missing sales opportunities.</p>
              </div>

              <a href="${process.env.NEXTAUTH_URL}/seller/products/${data.productId}" class="button">Update Stock</a>
            </div>
            <div class="email-footer">
              <p>&copy; ${new Date().getFullYear()} AGS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `,

  orderCancelledBySeller: (data: {
    sellerName: string
    orderNumber: string
    customerName: string
    reason: string
  }) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <h1>Order Cancellation</h1>
            </div>
            <div class="email-body">
              <p class="greeting">Hello ${data.sellerName},</p>
              <p>Order #${data.orderNumber} from ${data.customerName} has been cancelled.</p>
              
              <div class="info-box">
                <h2>Cancellation Details</h2>
                <div class="info-row">
                  <span class="info-label">Order Number</span>
                  <span class="info-value">#${data.orderNumber}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Reason</span>
                  <span class="info-value">${data.reason}</span>
                </div>
              </div>

              <p>The customer has been notified and the refund process has been initiated.</p>

              <a href="${process.env.NEXTAUTH_URL}/seller/orders" class="button">View Orders</a>
            </div>
            <div class="email-footer">
              <p>&copy; ${new Date().getFullYear()} AGS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `,

  monthlySalesReport: (data: {
    sellerName: string
    month: string
    totalOrders: number
    totalRevenue: number
    topProduct: string
  }) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <h1>Monthly Sales Report</h1>
            </div>
            <div class="email-body">
              <p class="greeting">Hello ${data.sellerName},</p>
              <p>Here's your sales summary for <strong>${data.month}</strong>.</p>
              
              <div class="info-box">
                <h2>Performance Overview</h2>
                <div class="info-row">
                  <span class="info-label">Total Orders</span>
                  <span class="info-value">${data.totalOrders}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Total Revenue</span>
                  <span class="info-value">₹${data.totalRevenue.toLocaleString()}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Top Selling Product</span>
                  <span class="info-value">${data.topProduct}</span>
                </div>
              </div>

              <a href="${process.env.NEXTAUTH_URL}/seller/analytics" class="button">View Detailed Analytics</a>

              <p>Keep up the great work! Continue optimizing your listings for better results.</p>
            </div>
            <div class="email-footer">
              <p>&copy; ${new Date().getFullYear()} AGS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `,

  // Additional Admin Templates
  productPendingApproval: (data: {
    productName: string
    sellerName: string
    businessName: string
    productId: string
  }) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <h1>Product Approval Required</h1>
            </div>
            <div class="email-body">
              <p>A new product has been submitted and requires your approval.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Product</span>
                  <span class="info-value">${data.productName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Seller</span>
                  <span class="info-value">${data.sellerName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Business</span>
                  <span class="info-value">${data.businessName}</span>
                </div>
              </div>

              <a href="${process.env.NEXTAUTH_URL}/admin/products" class="button">Review Product</a>
            </div>
            <div class="email-footer">
              <p>&copy; ${new Date().getFullYear()} AGS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `,

  sellerVerificationPending: (data: {
    sellerName: string
    businessName: string
    email: string
    submissionDate: string
  }) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <h1>Seller Verification Required</h1>
            </div>
            <div class="email-body">
              <p>A seller has submitted verification documents for review.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Business Name</span>
                  <span class="info-value">${data.businessName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Owner</span>
                  <span class="info-value">${data.sellerName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email</span>
                  <span class="info-value">${data.email}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Submitted On</span>
                  <span class="info-value">${data.submissionDate}</span>
                </div>
              </div>

              <a href="${process.env.NEXTAUTH_URL}/admin/sellers" class="button">Review Documents</a>
            </div>
            <div class="email-footer">
              <p>&copy; ${new Date().getFullYear()} AGS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `,

  supportTicketCreated: (data: {
    ticketNumber: string
    customerName: string
    subject: string
    priority: string
  }) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <h1>New Support Ticket</h1>
            </div>
            <div class="email-body">
              <p>A new support ticket has been created and requires attention.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Ticket #</span>
                  <span class="info-value">${data.ticketNumber}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Customer</span>
                  <span class="info-value">${data.customerName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Subject</span>
                  <span class="info-value">${data.subject}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Priority</span>
                  <span class="info-value">
                    <span class="status-badge" style="background-color: ${data.priority === 'HIGH' ? '#dc2626' : data.priority === 'MEDIUM' ? '#f59e0b' : '#6b7280'};">${data.priority}</span>
                  </span>
                </div>
              </div>

              <a href="${process.env.NEXTAUTH_URL}/admin/support" class="button">View Ticket</a>
            </div>
            <div class="email-footer">
              <p>&copy; ${new Date().getFullYear()} AGS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `,
}
