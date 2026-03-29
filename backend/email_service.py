"""
email_service.py  —  Password-reset email for LegalEase AI
────────────────────────────────────────────────────────────
Configure SMTP_HOST / SMTP_USER / SMTP_PASSWORD in backend/.env.local
to send real emails.

Without those values the reset link is printed to the server console
(dev mode) — no email account needed for development.
"""
import os, smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env.local"))

SMTP_HOST = os.getenv("SMTP_HOST",     "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER",     "")
SMTP_PASS = os.getenv("SMTP_PASSWORD", "").replace(" ", "")  # Strip spaces from Gmail app passwords
APP_URL   = os.getenv("APP_URL",       "http://localhost:3000")

__all__ = ["send_reset_email", "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"]


def send_reset_email(to_email: str, reset_token: str, user_name: str = "") -> bool:
    reset_url = f"{APP_URL}?reset_token={reset_token}"
    greeting  = f"Hi {user_name}," if user_name else "Hi,"

    # ── Dev fallback (no SMTP configured) ────────────────────────────────────
    if not SMTP_USER or not SMTP_PASS or not SMTP_HOST:
        print(f"\n{'─' * 62}")
        print(f"  [DEV MODE] Password-reset link for {to_email}:")
        print(f"  {reset_url}")
        print(f"{'─' * 62}\n")
        return True

    # ── HTML email ────────────────────────────────────────────────────────────
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
      padding:9px 12px;border-radius:7px;border:1px solid rgba(48,54,70,.9);margin-bottom:16px}}
.foot{{font-size:11px;color:#484f58;border-top:1px solid rgba(48,54,70,.9);
       padding:16px 30px;background:#0d1117}}
</style></head><body>
<div class="card">
  <div class="top"><div class="logo">⚖️ LegalEase AI</div></div>
  <div class="body">
    <h2>Reset your password</h2>
    <p>{greeting}<br>We received a request to reset your LegalEase AI password.
    Click the button — link expires in <strong style="color:#e6edf3">30 minutes</strong>.</p>
    <a class="btn" href="{reset_url}" target="_self">Reset Password →</a>
    <p style="font-size:11px;margin-bottom:6px">Or paste this URL in your browser:</p>
    <div class="url">{reset_url}</div>
    <p style="font-size:11px;margin:0">Ignore this email if you didn't request a reset.</p>
  </div>
  <div class="foot">LegalEase AI · Not a substitute for qualified legal advice.</div>
</div></body></html>"""

    plain = (
        f"{greeting}\n\nReset your LegalEase AI password:\n{reset_url}\n\n"
        "Expires in 30 minutes. Ignore if you didn't request this."
    )

    try:
        msg            = MIMEMultipart("alternative")
        msg["Subject"] = "Reset your LegalEase AI password"
        msg["From"]    = f"LegalEase AI <{SMTP_USER}>"
        msg["To"]      = to_email
        msg.attach(MIMEText(plain, "plain"))
        msg.attach(MIMEText(html,  "html"))
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as srv:
            srv.ehlo()
            srv.starttls()
            srv.login(SMTP_USER, SMTP_PASS)
            srv.sendmail(SMTP_USER, to_email, msg.as_string())
        print(f"[EMAIL] Reset link sent → {to_email}")
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] {type(e).__name__}: {e}")
        print(f"[EMAIL CONFIG] host={SMTP_HOST}:{SMTP_PORT} user={SMTP_USER} pass_len={len(SMTP_PASS)}")
        raise  # Re-raise so caller can surface the real error