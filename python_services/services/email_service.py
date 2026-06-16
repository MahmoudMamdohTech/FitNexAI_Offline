"""
Email Service — sends OTP codes and password reset links via Gmail SMTP.
"""

import logging
import random
import secrets
import string
import json
import urllib.request
import urllib.error
from datetime import datetime, timedelta, timezone

from config import settings

logger = logging.getLogger("fitnex.email")

OTP_EXPIRE_MINUTES = 10
TOKEN_EXPIRE_MINUTES = 15

def generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))

def otp_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRE_MINUTES)

def generate_secure_token() -> str:
    return secrets.token_urlsafe(32)

def token_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXPIRE_MINUTES)


def _build_email_html(title: str, subtitle: str, button_text: str, link_url: str) -> str:
    return f"""
<!DOCTYPE html>
<html>
<head>
  <style>
    body {{ font-family: 'Inter', Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 0; }}
    .container {{ max-width: 480px; margin: 0 auto; background-color: #111111; border: 1px solid rgba(57,255,20,0.2); border-radius: 16px; overflow: hidden; }}
    .header {{ background: linear-gradient(135deg, #0d2b0d, #1a4a1a); padding: 32px 40px; text-align: center; }}
    .logo {{ font-size: 24px; font-weight: 800; color: #39ff14; letter-spacing: 2px; }}
    .body {{ padding: 40px; text-align: center; }}
    .title {{ font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 8px; }}
    .subtitle {{ font-size: 14px; color: rgba(255,255,255,0.6); margin-bottom: 32px; }}
    .btn {{ display: inline-block; background: #39ff14; color: #000000; text-decoration: none; font-weight: 700; border-radius: 8px; padding: 14px 32px; margin-bottom: 24px; }}
    .expire {{ font-size: 13px; color: rgba(255,255,255,0.45); margin-bottom: 32px; }}
    .footer {{ padding: 24px 40px; background-color: #0d0d0d; border-top: 1px solid rgba(255,255,255,0.06); text-align: center; font-size: 12px; color: rgba(255,255,255,0.3); }}
    
    @media (prefers-color-scheme: dark) {{
      body {{ background-color: #000000; }}
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">FitNex AI</div>
    </div>
    <div class="body">
      <div class="title">{title}</div>
      <div class="subtitle">{subtitle}</div>
      <a href="{link_url}" class="btn" style="text-align: center;">{button_text}</a>
      <div class="expire">This link expires in {TOKEN_EXPIRE_MINUTES} minutes. Do not share it with anyone.</div>
    </div>
    <div class="footer">
      If you didn't request this email, you can safely ignore it.<br>
      <span style="opacity: 0.5;">Message ID: {secrets.token_hex(4)}</span>
    </div>
  </div>
</body>
</html>
"""


def _send_email_proxy(to_email: str, subject: str, html_body: str, text_body: str) -> bool:
    # If running locally, don't try to call the Vercel API, just print it
    if "localhost" in settings.FRONTEND_URL or "127.0.0.1" in settings.FRONTEND_URL:
        print(f"\n{'='*55}\n  DEV MODE — EMAIL NOT SENT\n  To:   {to_email}\n  Subj: {subject}\n  Body: {text_body}\n{'='*55}\n", flush=True)
        logger.warning("DEV MODE EMAIL for %s: %s", to_email, subject)
        return True

    url = f"{settings.FRONTEND_URL}/api/send-email"
    data = {
        "to": to_email,
        "subject": subject,
        "html": html_body,
        "text": text_body
    }
    
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            logger.info("Email sent via Vercel proxy to %s: %s", to_email, res_data)
            return True
            
    except urllib.error.HTTPError as exc:
        error_body = exc.read().decode('utf-8')
        logger.error("Failed to send email via Vercel proxy to %s. Status: %s, Body: %s", to_email, exc.code, error_body)
        return False
    except Exception as exc:
        logger.error("Failed to send email via Vercel proxy to %s: %s", to_email, exc)
        return False


def send_otp_email(to_email: str, otp_code: str) -> bool:
    """Send an OTP verification email."""
    title = "Verify Your Email Address"
    subtitle = "Enter the 6-digit code below to complete your registration."
    html_body = f"""
<!DOCTYPE html>
<html>
<head>
  <style>
    body {{ font-family: 'Inter', Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 0; }}
    .container {{ max-width: 480px; margin: 0 auto; background-color: #111111; border: 1px solid rgba(57,255,20,0.2); border-radius: 16px; overflow: hidden; }}
    .header {{ background: linear-gradient(135deg, #0d2b0d, #1a4a1a); padding: 32px 40px; text-align: center; }}
    .logo {{ font-size: 24px; font-weight: 800; color: #39ff14; letter-spacing: 2px; }}
    .body {{ padding: 40px; text-align: center; }}
    .title {{ font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 8px; }}
    .subtitle {{ font-size: 14px; color: rgba(255,255,255,0.6); margin-bottom: 32px; }}
    .otp-code {{ font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #39ff14; margin: 24px 0; text-align: center; }}
    .expire {{ font-size: 13px; color: rgba(255,255,255,0.45); margin-bottom: 12px; }}
    .footer {{ padding: 24px 40px; background-color: #0d0d0d; border-top: 1px solid rgba(255,255,255,0.06); text-align: center; font-size: 12px; color: rgba(255,255,255,0.3); }}
    
    @media (prefers-color-scheme: dark) {{
      body {{ background-color: #000000; }}
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">FitNex AI</div>
    </div>
    <div class="body">
      <div class="title">{title}</div>
      <div class="subtitle">{subtitle}</div>
      <div class="otp-code">{otp_code}</div>
      <div class="expire">This code expires in {OTP_EXPIRE_MINUTES} minutes.</div>
    </div>
    <div class="footer">
      If you didn't request this email, you can safely ignore it.<br>
      <span style="opacity: 0.5;">Message ID: {secrets.token_hex(4)}</span>
    </div>
  </div>
</body>
</html>
"""
    text_body = f"Your verification code is: {otp_code}\n\nThis code expires in {OTP_EXPIRE_MINUTES} minutes."
    return _send_email_proxy(to_email, "Verify your FitNex AI account", html_body, text_body)


def send_password_reset_email(to_email: str, raw_token: str) -> bool:
    """Send a password reset link."""
    link_url = f"{settings.FRONTEND_URL}/reset-password?token={raw_token}&email={to_email}"
    title = "Reset Your Password"
    subtitle = "Click the button below to securely reset your password."
    html_body = _build_email_html(title, subtitle, "Reset Password", link_url)
    text_body = f"You requested a password reset. Reset your password by visiting: {link_url}\n\nThis link expires in {TOKEN_EXPIRE_MINUTES} minutes."
    return _send_email_proxy(to_email, "Reset your FitNex AI password", html_body, text_body)
