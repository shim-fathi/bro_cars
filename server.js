/* ============================================================
   BRO CARS — Backend Server
   Stack : Node.js + Express + Nodemailer
   Deploy: Railway / Render / VPS
   ============================================================ */

require('dotenv').config();

const express    = require('express');
const nodemailer = require('nodemailer');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const helmet     = require('helmet');
const validator  = require('validator');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── SECURITY MIDDLEWARE ─────────────────────────────────── */
app.use(helmet());                    // sets secure HTTP headers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// CORS — only allow your frontend domain
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. Postman, mobile) in dev
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  methods: ['POST', 'GET'],
  credentials: true,
}));

// Rate limit — max 5 form submissions per IP per 15 minutes
const limiter = rateLimit({
  windowMs : 15 * 60 * 1000,   // 15 min
  max      : 5,
  message  : { error: 'Too many requests. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders  : false,
});

/* ── NODEMAILER TRANSPORTER ──────────────────────────────── */
// Supports Gmail (App Password), Outlook, SMTP, or SendGrid SMTP
const createTransporter = () => {
  const provider = (process.env.EMAIL_PROVIDER || 'gmail').toLowerCase();

  if (provider === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,   // use a 16-char Gmail App Password
      },
    });
  }

  if (provider === 'outlook') {
    return nodemailer.createTransport({
      host  : 'smtp-mail.outlook.com',
      port  : 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Generic SMTP (e.g. cPanel hosting, Zoho, SendGrid)
  return nodemailer.createTransport({
    host  : process.env.SMTP_HOST,
    port  : parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const transporter = createTransporter();

// Verify transporter on startup
transporter.verify((err) => {
  if (err) {
    console.error('❌ Email transporter error:', err.message);
  } else {
    console.log('✅ Email transporter ready');
  }
});

/* ── HELPERS ─────────────────────────────────────────────── */
const sanitize = (str = '') =>
  String(str).trim().replace(/[<>]/g, '').slice(0, 500);

/* ── EMAIL HTML TEMPLATE ─────────────────────────────────── */
const buildEmailHTML = ({ fname, femail, fphone, fsubject, fmsg }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#0A0A0A;padding:28px 36px;">
              <p style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:22px;font-weight:900;color:#ffffff;letter-spacing:0.08em;">
                BRO<span style="color:#B0B0B0;">CARS</span>
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:#888;letter-spacing:0.2em;text-transform:uppercase;">
                New Website Enquiry
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px;">
              <h2 style="margin:0 0 20px;font-size:20px;color:#0A0A0A;font-weight:700;">
                📩 You have a new enquiry from your website
              </h2>

              <!-- Detail rows -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:12px 16px;background:#f8f8f8;border-left:3px solid #0A0A0A;width:120px;">
                    <span style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#888;">Name</span>
                  </td>
                  <td style="padding:12px 16px;background:#f8f8f8;border-bottom:1px solid #eee;">
                    <span style="font-size:15px;color:#1A1A1A;">${sanitize(fname)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-left:3px solid #ccc;background:#fff;">
                    <span style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#888;">Email</span>
                  </td>
                  <td style="padding:12px 16px;background:#fff;border-bottom:1px solid #eee;">
                    <a href="mailto:${sanitize(femail)}" style="font-size:15px;color:#0A0A0A;">${sanitize(femail)}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;background:#f8f8f8;border-left:3px solid #ccc;">
                    <span style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#888;">Phone</span>
                  </td>
                  <td style="padding:12px 16px;background:#f8f8f8;border-bottom:1px solid #eee;">
                    <span style="font-size:15px;color:#1A1A1A;">${sanitize(fphone) || '—'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-left:3px solid #ccc;background:#fff;">
                    <span style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#888;">Subject</span>
                  </td>
                  <td style="padding:12px 16px;background:#fff;border-bottom:1px solid #eee;">
                    <span style="font-size:15px;color:#1A1A1A;">${sanitize(fsubject) || '—'}</span>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <div style="margin-top:24px;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#888;">Message</p>
                <div style="background:#f8f8f8;border-left:3px solid #0A0A0A;padding:16px 20px;font-size:15px;color:#2C2C2C;line-height:1.7;white-space:pre-wrap;">
${sanitize(fmsg)}
                </div>
              </div>

              <!-- Reply CTA -->
              <div style="margin-top:28px;text-align:center;">
                <a href="mailto:${sanitize(femail)}?subject=Re: ${encodeURIComponent(sanitize(fsubject) || 'Your Bro Cars Enquiry')}"
                   style="display:inline-block;padding:12px 28px;background:#0A0A0A;color:#fff;font-size:13px;font-weight:700;letter-spacing:0.08em;text-decoration:none;border-radius:2px;">
                  Reply to ${sanitize(fname)} →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f8f8;padding:20px 36px;border-top:1px solid #eee;">
              <p style="margin:0;font-size:12px;color:#aaa;text-align:center;">
                This email was sent from the Bro Cars website contact form.<br/>
                No. 45, Duplication Road, Colombo 03, Sri Lanka &nbsp;|&nbsp;
                <a href="mailto:info@brocars.lk" style="color:#888;">info@brocars.lk</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/* ── AUTO-REPLY HTML ─────────────────────────────────────── */
const buildAutoReplyHTML = ({ fname }) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#0A0A0A;padding:28px 36px;">
              <p style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:22px;font-weight:900;color:#fff;letter-spacing:0.08em;">
                BRO<span style="color:#B0B0B0;">CARS</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px;">
              <h2 style="margin:0 0 16px;font-size:22px;color:#0A0A0A;">Hi ${sanitize(fname)}, we received your message! 👋</h2>
              <p style="font-size:15px;color:#555;line-height:1.75;margin:0 0 16px;">
                Thank you for reaching out to Bro Cars. One of our team members will review your enquiry and get back to you <strong>within 2 business hours</strong> during our opening hours.
              </p>
              <p style="font-size:15px;color:#555;line-height:1.75;margin:0 0 24px;">
                In the meantime, feel free to browse our latest inventory or give us a call directly.
              </p>
              <div style="background:#f8f8f8;border-left:3px solid #B0B0B0;padding:16px 20px;margin-bottom:28px;">
                <p style="margin:0;font-size:13px;color:#666;line-height:1.8;">
                  📞 <strong>+94 11 234 5678</strong><br/>
                  📱 <strong>+94 77 890 1234</strong> (WhatsApp)<br/>
                  🕐 Mon–Fri 8:30am–6pm &nbsp;|&nbsp; Sat 9am–4pm
                </p>
              </div>
              <a href="https://brocars.lk/cars.html"
                 style="display:inline-block;padding:12px 28px;background:#0A0A0A;color:#fff;font-size:13px;font-weight:700;letter-spacing:0.08em;text-decoration:none;">
                Browse Our Cars →
              </a>
            </td>
          </tr>
          <tr>
            <td style="background:#f8f8f8;padding:20px 36px;border-top:1px solid #eee;">
              <p style="margin:0;font-size:12px;color:#aaa;text-align:center;">
                © 2025 Bro Cars (Pvt) Ltd &nbsp;|&nbsp; No. 45, Duplication Road, Colombo 03<br/>
                You're receiving this because you submitted an enquiry on our website.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/* ── ROUTES ──────────────────────────────────────────────── */

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Bro Cars API running ✅', time: new Date().toISOString() });
});

// Contact form endpoint
app.post('/send', limiter, async (req, res) => {
  const { fname, femail, fphone, fsubject, fmsg } = req.body;

  /* --- Server-side validation --- */
  const errors = [];

  if (!fname || fname.trim().length < 2)
    errors.push('Name must be at least 2 characters.');

  if (!femail || !validator.isEmail(femail.trim()))
    errors.push('A valid email address is required.');

  if (!fmsg || fmsg.trim().length < 10)
    errors.push('Message must be at least 10 characters.');

  if (fphone && !/^[\d\s\+\-\(\)]{7,16}$/.test(fphone.trim()))
    errors.push('Phone number format is invalid.');

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' ') });
  }

  const data = { fname, femail, fphone, fsubject, fmsg };

  try {
    /* --- 1. Send notification to Bro Cars team --- */
    await transporter.sendMail({
      from   : `"Bro Cars Website" <${process.env.EMAIL_USER}>`,
      to     : process.env.EMAIL_TO,
      replyTo: femail.trim(),
      subject: `[Bro Cars Enquiry] ${sanitize(fsubject) || `Message from ${sanitize(fname)}`}`,
      html   : buildEmailHTML(data),
      text   : [
        `Name: ${sanitize(fname)}`,
        `Email: ${sanitize(femail)}`,
        `Phone: ${sanitize(fphone) || '—'}`,
        `Subject: ${sanitize(fsubject) || '—'}`,
        `Message:\n${sanitize(fmsg)}`,
      ].join('\n'),
    });

    /* --- 2. Send auto-reply to customer --- */
    await transporter.sendMail({
      from   : `"Bro Cars" <${process.env.EMAIL_USER}>`,
      to     : femail.trim(),
      subject: `We received your enquiry — Bro Cars`,
      html   : buildAutoReplyHTML(data),
      text   : `Hi ${sanitize(fname)},\n\nThank you for contacting Bro Cars! We'll get back to you within 2 business hours.\n\nBro Cars Team\n+94 11 234 5678`,
    });

    console.log(`✅ Enquiry sent — from: ${femail} at ${new Date().toISOString()}`);
    res.json({ success: true, message: 'Your message has been sent successfully!' });

  } catch (err) {
    console.error('❌ Email send error:', err.message);
    res.status(500).json({ error: 'Failed to send email. Please try again or call us directly.' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

/* ── START ───────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n🚗 Bro Cars API running on port ${PORT}`);
  console.log(`   ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Provider: ${process.env.EMAIL_PROVIDER || 'gmail'}\n`);
});
