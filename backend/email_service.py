"""
email_service.py  —  Email sending via Brevo (formerly Sendinblue) SMTP API
─────────────────────────────────────────────────────────────────────────────
Brevo free tier: 300 emails/day, no domain verification needed,
works on Railway via HTTPS (port 587 to smtp-relay.brevo.com IS allowed
because Brevo's SMTP relay runs on port 587 AND 465 AND 25 — Railway
only blocks outbound connections to gmail.com/yahoo.com etc., not to
dedicated transactional email relay servers like Brevo/SendGrid).

Setup:
  1. Sign up free at brevo.com
  2. Go to SMTP & API → SMTP tab → copy your SMTP login and Master Password
  3. Add to Railway env vars:
       BREVO_SMTP_USER  = your Brevo SMTP login (looks like your email)
       BREVO_SMTP_PASS  = your Brevo Master Password (not your account password)

Dev mode (no BREVO_SMTP_USER): prints to console only.
"""
import os, smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env.local"))

# ── Brevo SMTP credentials ────────────────────────────────────────────────────
BREVO_HOST = "smtp-relay.brevo.com"
BREVO_PORT = 587
BREVO_USER = os.getenv("BREVO_SMTP_USER", "")   # your Brevo SMTP login
BREVO_PASS = os.getenv("BREVO_SMTP_PASS", "")   # Brevo Master Password

# Sender address — must be verified in Brevo (just add your Gmail there, takes 1 click)
FROM_EMAIL  = os.getenv("SMTP_USER", "jananiviswa05@gmail.com")
FROM_PRETTY = f"LegalEase AI <{FROM_EMAIL}>"

APP_URL = os.getenv("APP_URL", "http://localhost:3000")

# Keep legacy exports so existing main.py imports don't break
SMTP_HOST = BREVO_HOST
SMTP_PORT = BREVO_PORT
SMTP_USER = BREVO_USER
SMTP_PASS = BREVO_PASS

__all__ = ["send_reset_email", "send_email", "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"]


def _brevo_send(to: str, subject: str, html: str, plain: str,
                attachments: list = None) -> bool:
    """
    Send via Brevo SMTP relay.
    attachments: list of (filename, bytes) tuples
    """
    if not BREVO_USER or not BREVO_PASS:
        return False  # dev mode — caller prints to console

    msg = MIMEMultipart("mixed")
    msg["Subject"] = subject
    msg["From"]    = FROM_PRETTY
    msg["To"]      = to

    alt = MIMEMultipart("alternative")
    alt.attach(MIMEText(plain, "plain"))
    alt.attach(MIMEText(html,  "html"))
    msg.attach(alt)

    if attachments:
        for filename, data in attachments:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(data)
            encoders.encode_base64(part)
            part.add_header("Content-Disposition", "attachment", filename=filename)
            msg.attach(part)

    with smtplib.SMTP(BREVO_HOST, BREVO_PORT) as srv:
        srv.ehlo()
        srv.starttls()
        srv.login(BREVO_USER, BREVO_PASS)
        srv.sendmail(FROM_EMAIL, to, msg.as_string())

    print(f"[EMAIL] Brevo sent → {to} | subject: {subject}")
    return True


def send_reset_email(to_email: str, reset_token: str, user_name: str = "") -> bool:
    reset_url = f"{APP_URL}?reset_token={reset_token}"
    greeting  = f"Hi {user_name}," if user_name else "Hi,"

    if not BREVO_USER or not BREVO_PASS:
        print(f"\n{'─'*62}")
        print(f"  [DEV MODE] Password-reset link for {to_email}:")
        print(f"  {reset_url}")
        print(f"{'─'*62}\n")
        return True

    html = f"""<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
body{{font-family:'Segoe UI',Arial,sans-serif;background:#0d1117;margin:0;padding:24px}}
.card{{max-width:460px;margin:0 auto;background:#161b22;border-radius:16px;
       border:1px solid rgba(48,54,70,.9);overflow:hidden}}
.top{{background:linear-gradient(135deg,#4f6ef7,#6d28d9);padding:26px 30px}}
.logo{{font-size:17px;font-weight:800;color:#fff}}
.body{{padding:26px 30px}}
h2{{font-size:19px;font-weight:700;color:#e6edf3;margin:0 0 8px}}
p{{font-size:13px;color:#8b949e;line-height:1.7;margin:0 0 14px}}
.btn{{display:inline-block;background:linear-gradient(135deg,#4f6ef7,#6d28d9);
      color:#fff !important;text-decoration:none;padding:12px 24px;
      border-radius:10px;font-weight:700;font-size:13px;margin:6px 0 18px}}
.url{{font-size:11px;color:#484f58;word-break:break-all;background:#0d1117;
      padding:9px 12px;border-radius:7px;border:1px solid rgba(48,54,70,.9)}}
.foot{{font-size:11px;color:#484f58;border-top:1px solid rgba(48,54,70,.9);
       padding:16px 30px;background:#0d1117}}
</style></head><body>
<div class="card">
  <div class="top"><div class="logo">⚖️ LegalEase AI</div></div>
  <div class="body">
    <h2>Reset your password</h2>
    <p>{greeting}<br>Click the button below — link expires in <strong style="color:#e6edf3">30 minutes</strong>.</p>
    <a class="btn" href="{reset_url}">Reset Password →</a>
    <p style="font-size:11px;margin-bottom:6px">Or paste this URL:</p>
    <div class="url">{reset_url}</div>
  </div>
  <div class="foot">LegalEase AI · Not a substitute for legal advice.</div>
</div></body></html>"""

    plain = f"{greeting}\n\nReset your password:\n{reset_url}\n\nExpires in 30 minutes."

    try:
        _brevo_send(to_email, "Reset your LegalEase AI password", html, plain)
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] {type(e).__name__}: {e}")
        raise


def send_email(to: str, subject: str, html: str, plain: str,
               attachments: list = None) -> bool:
    """
    Generic send used by e-sign endpoint.
    attachments: list of (filename, bytes) tuples
    """
    if not BREVO_USER or not BREVO_PASS:
        print(f"[DEV MODE] Would send '{subject}' to {to} — set BREVO_SMTP_USER + BREVO_SMTP_PASS")
        return False
    try:
        _brevo_send(to, subject, html, plain, attachments)
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] {type(e).__name__}: {e}")
        raise
