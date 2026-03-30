"""
email_service.py  —  Email sending for LegalEase AI via Resend API
──────────────────────────────────────────────────────────────────
Uses Resend (resend.com) instead of raw SMTP — works on Railway/Render/Vercel
since it sends over HTTPS (port 443), not blocked SMTP port 587.

Setup:
  1. Sign up free at resend.com (100 emails/day free)
  2. Create an API key
  3. Add RESEND_API_KEY to your Railway environment variables
  4. Add SMTP_USER (your Gmail) as the "from" address — or use onboarding@resend.dev for testing

Dev mode (no RESEND_API_KEY set): link is printed to console only.
"""
import os, json, urllib.request, urllib.error
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env.local"))

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
FROM_EMAIL     = os.getenv("SMTP_USER", "")
APP_URL        = os.getenv("APP_URL", "http://localhost:3000")

# Resend requires a verified sender domain.
# Until you verify your own domain, use Resend's shared address (works immediately).
# To use your own domain: resend.com → Domains → Add domain → verify DNS records
RESEND_FROM = "LegalEase AI <onboarding@resend.dev>"

# Keep these exports so main.py imports don't break
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = FROM_EMAIL
SMTP_PASS = os.getenv("SMTP_PASSWORD", "").replace(" ", "")

__all__ = ["send_reset_email", "send_email", "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"]


def _resend_send(to: str, subject: str, html: str, plain: str,
                 attachments: list = None) -> bool:
    """
    Send email via Resend REST API (HTTPS — works on Railway free tier).
    attachments: list of {"filename": str, "content": base64_str}
    """
    if not RESEND_API_KEY:
        return False  # caller handles dev mode

    payload = {
        "from":    RESEND_FROM,
        "to":      [to],
        "subject": subject,
        "html":    html,
        "text":    plain,
    }
    if attachments:
        payload["attachments"] = attachments

    data    = json.dumps(payload).encode("utf-8")
    req     = urllib.request.Request(
        "https://api.resend.com/emails",
        data    = data,
        headers = {
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type":  "application/json",
        },
        method  = "POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = json.loads(resp.read())
            print(f"[EMAIL] Resend OK → {to} | id={body.get('id')}")
            return True
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        print(f"[EMAIL ERROR] Resend HTTP {e.code}: {err}")
        raise RuntimeError(f"Resend API error {e.code}: {err}")
    except Exception as e:
        print(f"[EMAIL ERROR] {type(e).__name__}: {e}")
        raise


def send_reset_email(to_email: str, reset_token: str, user_name: str = "") -> bool:
    reset_url = f"{APP_URL}?reset_token={reset_token}"
    greeting  = f"Hi {user_name}," if user_name else "Hi,"

    if not RESEND_API_KEY:
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

    _resend_send(to_email, "Reset your LegalEase AI password", html, plain)
    return True


def send_email(to: str, subject: str, html: str, plain: str,
               attachments: list = None) -> bool:
    """Generic send — used by e-sign endpoint in main.py."""
    if not RESEND_API_KEY:
        print(f"[DEV MODE] Email to {to}: {subject}")
        return False  # signals dev mode to caller
    _resend_send(to, subject, html, plain, attachments)
    return True
