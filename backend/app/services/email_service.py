import os
from dotenv import load_dotenv
import httpx
from fastapi import HTTPException

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


def _html_invitacion(nombre_evaluador: str, nombre_sujeto: str, token: str) -> str:
    survey_url = f"{FRONTEND_URL}/survey/{token}"
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f9fafb; color: #1a1a1a; }}
        .wrapper {{ max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px; }}
        .container {{ background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }}
        .header {{ background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 48px 32px; text-align: center; }}
        .header h1 {{ color: #29b8dc; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }}
        .header p {{ color: #9ca3af; font-size: 13px; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500; }}
        .body {{ padding: 40px 32px; }}
        .body h2 {{ color: #1a1a1a; font-size: 18px; font-weight: 600; margin-bottom: 20px; }}
        .body p {{ font-size: 14px; line-height: 1.8; color: #4b5563; margin-bottom: 16px; }}
        .highlight {{ color: #1a1a1a; font-weight: 600; }}
        .cta-section {{ margin: 36px 0; text-align: center; }}
        .cta {{ display: inline-block; padding: 14px 40px; background: #29b8dc; color: #1a1a1a; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 15px; transition: all 0.2s; border: 2px solid #29b8dc; }}
        .cta:hover {{ background: #fef3c7; }}
        .fallback-link {{ font-size: 12px; color: #6b7280; margin-top: 16px; word-break: break-all; }}
        .fallback-link a {{ color: #29b8dc; text-decoration: none; }}
        .footer {{ background: #f3f4f6; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb; }}
        .footer p {{ font-size: 12px; color: #9ca3af; margin: 0; }}
        .footer a {{ color: #29b8dc; text-decoration: none; }}
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>360 MOST Assessment</h1>
            <p>Feedback & Development</p>
          </div>

          <div class="body">
            <h2>Hi <span class="highlight">{nombre_evaluador}</span>!</h2>

            <p>
              <span class="highlight">{nombre_sujeto}</span> has invited you to participate in their <span class="highlight">360 MOST Assessment</span>.
            </p>

            <p>
              Your honest and anonymous feedback is invaluable. It will help them understand their impact, identify blind spots, and recognize their strengths to drive personal growth.
            </p>

            <p>
              <strong>⏱️ Time commitment:</strong> The survey takes approximately <strong>5–10 minutes</strong> to complete.
            </p>

            <div class="cta-section">
              <a href="{survey_url}" class="cta">Start Survey →</a>
            </div>

            <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p class="fallback-link">
              <a href="{survey_url}">{survey_url}</a>
            </p>
          </div>

          <div class="footer">
            <p>Powered by <strong>Open Source OD</strong> · <strong>360 MOST Assessment</strong></p>
          </div>
        </div>
      </div>
    </body>
    </html>
    """


def _html_self_assessment(nombre: str, token: str) -> str:
    survey_url = f"{FRONTEND_URL}/self/{token}"
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f9fafb; color: #1a1a1a; }}
        .wrapper {{ max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px; }}
        .container {{ background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }}
        .header {{ background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 48px 32px; text-align: center; }}
        .header h1 {{ color: #29b8dc; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }}
        .header p {{ color: #9ca3af; font-size: 13px; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500; }}
        .body {{ padding: 40px 32px; }}
        .body h2 {{ color: #1a1a1a; font-size: 18px; font-weight: 600; margin-bottom: 20px; }}
        .body p {{ font-size: 14px; line-height: 1.8; color: #4b5563; margin-bottom: 16px; }}
        .highlight {{ color: #1a1a1a; font-weight: 600; }}
        .step-box {{ background: #f0fdf4; border-left: 4px solid #29b8dc; padding: 16px; margin: 20px 0; border-radius: 4px; }}
        .step-box p {{ margin: 0; font-size: 14px; color: #1a1a1a; }}
        .cta-section {{ margin: 36px 0; text-align: center; }}
        .cta {{ display: inline-block; padding: 14px 40px; background: #29b8dc; color: #1a1a1a; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 15px; transition: all 0.2s; border: 2px solid #29b8dc; }}
        .cta:hover {{ background: #fef3c7; }}
        .footer {{ background: #f3f4f6; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb; }}
        .footer p {{ font-size: 12px; color: #9ca3af; margin: 0; }}
        .footer a {{ color: #29b8dc; text-decoration: none; }}
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>360 MOST Assessment</h1>
            <p>Your Assessment Ready</p>
          </div>

          <div class="body">
            <h2>Welcome, <span class="highlight">{nombre}</span>!</h2>

            <p>
              Your <span class="highlight">360 MOST Assessment</span> has been created successfully. 🎉
            </p>

            <p>
              To get accurate insights, we need your perspective first. Before your evaluators complete their surveys, please complete your <span class="highlight">self-assessment</span>. This establishes your baseline and allows us to identify gaps between your self-perception and how others perceive you.
            </p>

            <div class="step-box">
              <p><strong>📋 Next step:</strong> Complete your self-assessment (5–10 minutes)</p>
            </div>

            <div class="cta-section">
              <a href="{survey_url}" class="cta">Start Self-Assessment →</a>
            </div>
          </div>

          <div class="footer">
            <p>Powered by <strong>Open Source OD</strong> · <strong>360 MOST Assessment</strong></p>
          </div>
        </div>
      </div>
    </body>
    </html>
    """


async def _enviar_email_brevo(to_email: str, to_name: str, subject: str, html_content: str):
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": os.getenv("BREVO_API_KEY"), # La clave larga, no la SMTP
        "content-type": "application/json"
    }
    payload = {
        "sender": {"name": "360 MOST Assessment", "email": "hello@wearequant.com"},
        "to": [{"email": to_email, "name": to_name}],
        "subject": subject,
        "htmlContent": html_content,
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload)
        if response.status_code != 201:
            raise HTTPException(status_code=400, detail=f"Error: {response.text}")
        return {"status": "enviado"}


async def enviar_invitacion(nombre_evaluador: str, email: str, nombre_sujeto: str, token: str):
    subject = f"You've been invited to evaluate {nombre_sujeto} — 360 MOST Assessment"
    html_content = _html_invitacion(nombre_evaluador, nombre_sujeto, token)
    return await _enviar_email_brevo(email, nombre_evaluador, subject, html_content)


async def enviar_self_assessment(nombre: str, email: str, token: str):
    subject = "Your 360 MOST Assessment is ready"
    html_content = _html_self_assessment(nombre, token)
    return await _enviar_email_brevo(email, nombre, subject, html_content)
