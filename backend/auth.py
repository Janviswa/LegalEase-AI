"""
auth.py  —  JWT authentication for LegalEase AI (Supabase-backed)
──────────────────────────────────────────────────────────────────
Replaces the old in-memory / users.json store with Supabase.
Users, reset tokens — all persisted in the cloud.
"""
import os, uuid, hashlib, hmac as _hmac, secrets, time, base64, json
from datetime import datetime, timedelta, timezone
from typing import Optional
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env.local"))

# ── Config ────────────────────────────────────────────────────────────────────
JWT_SECRET       = os.getenv("JWT_SECRET",  "legalease-change-this-secret")
PW_SALT          = os.getenv("PW_SALT",     "legalease-change-this-salt")
TOKEN_EXPIRE_HRS = 24
RESET_EXPIRE_MIN = 30

# ── Supabase client (service_role — server only, never expose to frontend) ────
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError(
        "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env.local\n"
        "Get them from: Supabase Dashboard → Project Settings → API"
    )

_sb: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# ── JWT helpers ───────────────────────────────────────────────────────────────
def _hash_pw(pw: str) -> str:
    return hashlib.sha256(f"{PW_SALT}{pw}".encode()).hexdigest()

def _check_pw(pw: str, hashed: str) -> bool:
    return _hmac.compare_digest(_hash_pw(pw), hashed)

def _b64u(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

def _b64u_dec(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))

def _make_jwt(payload: dict) -> str:
    hdr  = _b64u(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    body = _b64u(json.dumps(payload).encode())
    sig  = _b64u(_hmac.new(JWT_SECRET.encode(), f"{hdr}.{body}".encode(), hashlib.sha256).digest())
    return f"{hdr}.{body}.{sig}"

def verify_jwt(token: str) -> Optional[dict]:
    try:
        h, b, s = token.split(".")
        expected = _b64u(_hmac.new(JWT_SECRET.encode(), f"{h}.{b}".encode(), hashlib.sha256).digest())
        if not _hmac.compare_digest(s, expected):
            return None
        payload = json.loads(_b64u_dec(b))
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None

def _token_for(user: dict) -> str:
    exp = datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRE_HRS)
    return _make_jwt({
        "sub":   user["id"],
        "email": user["email"],
        "name":  user["name"],
        "plan":  user.get("plan", "Pro"),
        "iat":   int(datetime.now(timezone.utc).timestamp()),
        "exp":   int(exp.timestamp()),
    })

def _pub(u: dict) -> dict:
    return {k: v for k, v in u.items() if k != "hashed_pw"}


# ── Supabase DB helpers ───────────────────────────────────────────────────────
def _get_user(email: str) -> Optional[dict]:
    try:
        res = _sb.table("users").select("*").eq("email", email).limit(1).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        print(f"[DB] get_user error: {e}")
        return None

def _create_user(user: dict) -> Optional[dict]:
    try:
        res = _sb.table("users").insert(user).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        print(f"[DB] create_user error: {e}")
        return None

def _update_user(email: str, fields: dict) -> bool:
    try:
        _sb.table("users").update(fields).eq("email", email).execute()
        return True
    except Exception as e:
        print(f"[DB] update_user error: {e}")
        return False


# ── Auth operations ───────────────────────────────────────────────────────────
def register(name: str, email: str, password: str) -> dict:
    email = email.strip().lower()
    if not name.strip():
        return {"error": "Full name is required."}
    if len(password) < 6:
        return {"error": "Password must be at least 6 characters."}
    if _get_user(email):
        return {"error": "An account with this email already exists."}
    user = {
        "id":         str(uuid.uuid4()),
        "name":       name.strip(),
        "email":      email,
        "hashed_pw":  _hash_pw(password),
        "plan":       "Pro",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    created = _create_user(user)
    if not created:
        return {"error": "Failed to create account. Please try again."}
    return {"token": _token_for(user), "user": _pub(user)}


def login(email: str, password: str) -> dict:
    email = email.strip().lower()
    user  = _get_user(email)
    if not user or not _check_pw(password, user["hashed_pw"]):
        return {"error": "Invalid email or password."}
    return {"token": _token_for(user), "user": _pub(user)}


def get_user_from_token(token: str) -> Optional[dict]:
    payload = verify_jwt(token)
    if not payload:
        return None
    email = payload.get("email", "")
    user  = _get_user(email)
    if user:
        return _pub(user)
    # Valid JWT but user missing from DB — reconstruct from payload
    return {
        "id":    payload.get("sub", ""),
        "name":  payload.get("name", ""),
        "email": email,
        "plan":  payload.get("plan", "Pro"),
    }


def change_password(email: str, old_pw: str, new_pw: str) -> dict:
    email = email.strip().lower()
    user  = _get_user(email)
    if not user:
        return {"error": "User not found."}
    if not _check_pw(old_pw, user["hashed_pw"]):
        return {"error": "Current password is incorrect."}
    if len(new_pw) < 6:
        return {"error": "New password must be at least 6 characters."}
    _update_user(email, {"hashed_pw": _hash_pw(new_pw)})
    return {"success": True}


def create_reset_token(email: str) -> dict:
    email = email.strip().lower()
    tok   = None
    if _get_user(email):
        tok     = secrets.token_urlsafe(32)
        expires = (datetime.now(timezone.utc) + timedelta(minutes=RESET_EXPIRE_MIN)).isoformat()
        try:
            _sb.table("reset_tokens").upsert({
                "token": tok, "email": email, "expires_at": expires,
            }).execute()
        except Exception as e:
            print(f"[DB] create_reset_token error: {e}")
            tok = None
    return {"success": True, "dev_token": tok}


def reset_password_with_token(reset_tok: str, new_pw: str) -> dict:
    try:
        res = _sb.table("reset_tokens").select("*").eq("token", reset_tok).limit(1).execute()
        if not res.data:
            return {"error": "Reset link is invalid or already used."}
        entry   = res.data[0]
        expires = datetime.fromisoformat(entry["expires_at"].replace("Z", "+00:00"))
        if expires < datetime.now(timezone.utc):
            _sb.table("reset_tokens").delete().eq("token", reset_tok).execute()
            return {"error": "Reset link expired. Please request a new one."}
        if len(new_pw) < 6:
            return {"error": "Password must be at least 6 characters."}
        _update_user(entry["email"], {"hashed_pw": _hash_pw(new_pw)})
        _sb.table("reset_tokens").delete().eq("token", reset_tok).execute()
        return {"success": True}
    except Exception as e:
        print(f"[DB] reset_password error: {e}")
        return {"error": "An error occurred. Please try again."}


def update_name(email: str, new_name: str) -> dict:
    new_name = new_name.strip()
    if not new_name:
        return {"error": "Name cannot be empty."}
    if len(new_name) > 80:
        return {"error": "Name is too long (max 80 characters)."}
    user = _get_user(email)
    if not user:
        return {"error": "Account not found."}
    _update_user(email, {"name": new_name})
    user["name"] = new_name
    return {"success": True, "token": _token_for(user), "name": new_name}