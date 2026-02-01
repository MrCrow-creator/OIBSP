const nodemailer = require('nodemailer');

// Create transporter - use environment variables or console logging for development
const createTransporter = () => {
    // Check if email credentials are configured
    if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_email@gmail.com') {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }
    return null;
};

const transporter = createTransporter();

// Send email or log to console in development
const sendEmail = async ({ to, subject, html }) => {
    if (transporter) {
        try {
            await transporter.sendMail({
                from: `"Pizza App" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html,
            });
            console.log(`📧 Email sent to ${to}: ${subject}`);
            return true;
        } catch (error) {
            console.error('Email sending failed:', error);
            return false;
        }
    } else {
        // Development mode - log email to console
        console.log('\n' + '='.repeat(60));
        console.log('📧 EMAIL (Development Mode)');
        console.log('='.repeat(60));
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log('-'.repeat(60));
        console.log('Content:');
        console.log(html.replace(/<[^>]*>/g, '')); // Strip HTML for console
        console.log('='.repeat(60) + '\n');
        return true;
    }
};

// Email templates
const sendVerificationEmail = async (email, name, token) => {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    return sendEmail({
        to: email,
        subject: '🍕 Verify your Pizza App account',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e53935;">Welcome to Pizza App! 🍕</h1>
        <p>Hi ${name},</p>
        <p>Thank you for registering! Please verify your email address to start ordering delicious pizzas.</p>
        <a href="${verificationUrl}" 
           style="display: inline-block; background-color: #e53935; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Verify Email
        </a>
        <p>Or copy this link: ${verificationUrl}</p>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't create this account, please ignore this email.</p>
      </div>
    `,
    });
};

const sendPasswordResetEmail = async (email, name, token) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    return sendEmail({
        to: email,
        subject: '🔐 Reset your Pizza App password',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e53935;">Password Reset Request 🔐</h1>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to create a new password.</p>
        <a href="${resetUrl}" 
           style="display: inline-block; background-color: #e53935; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Reset Password
        </a>
        <p>Or copy this link: ${resetUrl}</p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
    });
};

const sendLowStockAlert = async (adminEmail, ingredients) => {
    const ingredientList = ingredients.map(i =>
        `<li><strong>${i.name}</strong> (${i.type}): ${i.stock} remaining (threshold: ${i.threshold})</li>`
    ).join('');

    return sendEmail({
        to: adminEmail,
        subject: '⚠️ Low Stock Alert - Pizza App Inventory',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ff9800;">⚠️ Low Stock Alert</h1>
        <p>The following ingredients are running low:</p>
        <ul style="list-style-type: none; padding: 0;">
          ${ingredientList}
        </ul>
        <p>Please restock soon to avoid order disruptions.</p>
        <a href="${process.env.CLIENT_URL}/admin/inventory" 
           style="display: inline-block; background-color: #ff9800; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Manage Inventory
        </a>
      </div>
    `,
    });
};

const sendOrderStatusEmail = async (email, name, orderId, status) => {
    const statusMessages = {
        RECEIVED: 'Your order has been received! 📋',
        IN_KITCHEN: 'Your pizza is being prepared! 👨‍🍳',
        SENT_TO_DELIVERY: 'Your pizza is on its way! 🚗',
        DELIVERED: 'Your pizza has been delivered! Enjoy! 🍕',
    };

    return sendEmail({
        to: email,
        subject: `🍕 Order Update: ${statusMessages[status] || status}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e53935;">Order Update 🍕</h1>
        <p>Hi ${name},</p>
        <p><strong>Order #${orderId.slice(-8).toUpperCase()}</strong></p>
        <h2 style="color: #4caf50;">${statusMessages[status] || status}</h2>
        <a href="${process.env.CLIENT_URL}/orders" 
           style="display: inline-block; background-color: #e53935; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 4px; margin: 20px 0;">
          View Order
        </a>
      </div>
    `,
    });
};

module.exports = {
    sendEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendLowStockAlert,
    sendOrderStatusEmail,
};
