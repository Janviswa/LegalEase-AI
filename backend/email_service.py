"""
email_service.py — Email via Brevo HTTP API (not SMTP)
────────────────────────────────────────────────────────
Uses Brevo's REST API over HTTPS port 443 — guaranteed to work on Railway.
No SMTP ports needed at all.

Setup:
  1. brevo.com → Sign up free (300 emails/day)
  2. Top-right menu → Profile → SMTP & API → API Keys tab → Generate API key
     (This is DIFFERENT from the SMTP password — it's under "API Keys" tab)
  3. Add to Railway Variables:
       BREVO_API_KEY = xkeysib-xxxxxxxxxxxxxxxx...
  4. Your sender jananiviswa05@gmail.com is already verified in Brevo ✅
"""
import os, json, urllib.request, urllib.error, smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import base64
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env.local"))

BREVO_API_KEY = os.getenv("BREVO_API_KEY", "")
FROM_EMAIL    = os.getenv("SMTP_USER", "jananiviswa05@gmail.com")
FROM_NAME     = "LegalEase AI"
APP_URL       = os.getenv("APP_URL", "http://localhost:3000")

# Legacy exports — keep so main.py imports don't break
SMTP_HOST = "smtp-relay.brevo.com"
SMTP_PORT = 587
SMTP_USER = os.getenv("BREVO_SMTP_USER", "")
SMTP_PASS = os.getenv("BREVO_SMTP_PASS", "")

__all__ = ["send_reset_email", "send_email", "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"]


def _brevo_api_send(to_email: str, to_name: str, subject: str,
                    html: str, plain: str, attachments: list = None) -> bool:
    """
    Send via Brevo Transactional Email API (HTTPS/443).
    attachments: list of (filename, bytes) tuples
    """
    if not BREVO_API_KEY:
        return False

    payload = {
        "sender":      {"name": FROM_NAME, "email": FROM_EMAIL},
        "to":          [{"email": to_email, "name": to_name or to_email}],
        "subject":     subject,
        "htmlContent": html,
        "textContent": plain,
    }

    if attachments:
        payload["attachment"] = [
            {
                "name":    filename,
                "content": base64.b64encode(data).decode("utf-8"),
            }
            for filename, data in attachments
        ]

    data = json.dumps(payload).encode("utf-8")
    req  = urllib.request.Request(
        "https://api.brevo.com/v3/smtp/email",
        data    = data,
        headers = {
            "api-key":      BREVO_API_KEY,
            "Content-Type": "application/json",
            "Accept":       "application/json",
        },
        method = "POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = json.loads(resp.read())
            print(f"[EMAIL] Brevo API OK → {to_email} | messageId={body.get('messageId')}")
            return True
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        print(f"[EMAIL ERROR] Brevo API HTTP {e.code}: {err}")
        raise RuntimeError(f"Brevo API {e.code}: {err}")
    except Exception as e:
        print(f"[EMAIL ERROR] {type(e).__name__}: {e}")
        raise


def send_reset_email(to_email: str, reset_token: str, user_name: str = "") -> bool:
    reset_url = f"{APP_URL}?reset_token={reset_token}"
    greeting  = f"Hi {user_name}," if user_name else "Hi,"

    if not BREVO_API_KEY:
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
    _brevo_api_send(to_email, user_name, "Reset your LegalEase AI password", html, plain)
    return True


def send_email(to: str, subject: str, html: str, plain: str,
               attachments: list = None) -> bool:
    """Generic send — used by e-sign endpoint in main.py."""
    if not BREVO_API_KEY:
        print(f"[DEV MODE] Would send '{subject}' to {to} — set BREVO_API_KEY on Railway")
        return False
    _brevo_api_send(to, to, subject, html, plain, attachments)
    return True
