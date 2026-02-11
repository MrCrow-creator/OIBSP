const nodemailer = require('nodemailer');

// Configure email transport
const createTransporter = () => {
  if (process.env.NODE_ENV === 'development' || !process.env.EMAIL_USER) {
    // In development, log emails to console
    return null;
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const transporter = createTransporter();

const sendEmail = async (to, subject, html) => {
  if (!transporter) {
    console.log('\n📧 ═══ SliceCraft Mail ═══');
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log('   ───────────────────────');
    console.log(`   ${html.replace(/<[^>]*>/g, '').substring(0, 200)}...`);
    console.log('═══════════════════════════\n');
    return;
  }

  await transporter.sendMail({
    from: `"SliceCraft" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

// ── Verification Email ──
const sendVerificationEmail = async (email, name, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const html = `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
            <h1 style="color: #e53935; font-size: 28px; margin-bottom: 8px;">Welcome to SliceCraft! 🍕</h1>
            <p style="font-size: 16px; color: #555;">Hey ${name},</p>
            <p style="font-size: 15px; color: #666;">
                Thanks for joining us! Verify your email to start crafting your perfect pizza.
            </p>
            <a href="${verifyUrl}" 
               style="display: inline-block; margin: 24px 0; padding: 14px 32px; 
                      background: linear-gradient(135deg, #e53935, #ff9800); color: #fff; 
                      text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                Verify My Email
            </a>
            <p style="font-size: 13px; color: #999; margin-top: 24px;">
                If the button doesn't work, paste this link in your browser:<br/>
                <a href="${verifyUrl}" style="color: #e53935;">${verifyUrl}</a>
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="font-size: 12px; color: #bbb; text-align: center;">
                SliceCraft — Craft your perfect slice.
            </p>
        </div>
    `;

  await sendEmail(email, 'Verify your SliceCraft account', html);
};

// ── Password Reset Email ──
const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  const html = `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
            <h1 style="color: #e53935; font-size: 24px; margin-bottom: 8px;">Password Reset 🔑</h1>
            <p style="font-size: 16px; color: #555;">Hey ${name},</p>
            <p style="font-size: 15px; color: #666;">
                We received a request to reset your password. Click the button below to choose a new one.
            </p>
            <a href="${resetUrl}" 
               style="display: inline-block; margin: 24px 0; padding: 14px 32px; 
                      background: linear-gradient(135deg, #e53935, #ff9800); color: #fff; 
                      text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                Reset Password
            </a>
            <p style="font-size: 13px; color: #999;">
                This link expires in 1 hour. If you didn't request this, just ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="font-size: 12px; color: #bbb; text-align: center;">
                SliceCraft — Craft your perfect slice.
            </p>
        </div>
    `;

  await sendEmail(email, 'Reset your SliceCraft password', html);
};

// ── Order Status Update Email ──
const sendOrderStatusEmail = async (email, name, orderId, status) => {
  const statusMessages = {
    RECEIVED: { emoji: '📥', heading: 'Order Confirmed!', body: 'Your order has been received and is being prepared.' },
    IN_KITCHEN: { emoji: '👨‍🍳', heading: 'Being Prepared!', body: 'Our chefs are crafting your pizza right now.' },
    SENT_TO_DELIVERY: { emoji: '🚚', heading: 'On Its Way!', body: 'Your order is out for delivery. Get ready!' },
    DELIVERED: { emoji: '✅', heading: 'Delivered!', body: 'Your order has been delivered. Enjoy your meal!' },
    CANCELLED: { emoji: '❌', heading: 'Order Cancelled', body: 'Your order has been cancelled.' },
  };

  const info = statusMessages[status] || { emoji: '📦', heading: 'Status Update', body: `Your order status is now: ${status}` };

  const html = `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
            <h1 style="color: #e53935; font-size: 24px;">${info.emoji} ${info.heading}</h1>
            <p style="font-size: 16px; color: #555;">Hey ${name},</p>
            <p style="font-size: 15px; color: #666;">${info.body}</p>
            <div style="margin: 20px 0; padding: 16px; background: #f8f8f8; border-radius: 8px;">
                <p style="margin: 0; font-size: 14px; color: #888;">Order ID</p>
                <p style="margin: 4px 0 0; font-size: 16px; font-weight: 600; color: #333;">
                    #${orderId.slice(-8).toUpperCase()}
                </p>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="font-size: 12px; color: #bbb; text-align: center;">
                SliceCraft — Craft your perfect slice.
            </p>
        </div>
    `;

  await sendEmail(email, `${info.emoji} ${info.heading} — Order #${orderId.slice(-8).toUpperCase()}`, html);
};

// ── Low Stock Alert Email ──
const sendLowStockAlert = async (items) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const itemRows = items.map((item) =>
    `<tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 500;">${item.name}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-transform: capitalize;">${item.type}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #f44336; font-weight: 600;">${item.stock}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${item.threshold}</td>
        </tr>`
  ).join('');

  const html = `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
            <h1 style="color: #f44336; font-size: 22px;">⚠️ Low Inventory Alert</h1>
            <p style="font-size: 15px; color: #666;">
                The following items are running low. Consider restocking soon.
            </p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
                <thead>
                    <tr style="background: #fafafa;">
                        <th style="padding: 10px 12px; text-align: left; font-weight: 600;">Item</th>
                        <th style="padding: 10px 12px; text-align: left; font-weight: 600;">Category</th>
                        <th style="padding: 10px 12px; text-align: left; font-weight: 600;">Stock</th>
                        <th style="padding: 10px 12px; text-align: left; font-weight: 600;">Threshold</th>
                    </tr>
                </thead>
                <tbody>${itemRows}</tbody>
            </table>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="font-size: 12px; color: #bbb; text-align: center;">
                SliceCraft Admin Notification
            </p>
        </div>
    `;

  await sendEmail(adminEmail, `⚠️ Low Inventory Alert — ${items.length} item(s)`, html);
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderStatusEmail,
  sendLowStockAlert,
};
