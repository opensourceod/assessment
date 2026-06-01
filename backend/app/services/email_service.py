import os
import base64
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
<html>
<body style="font-family:Arial;background:#f5f5f5;padding:30px;">
  <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:10px;">
    <h1 style="color:#29b8dc;">360 MOST Assessment</h1>
    <p>Hello <b>{nombre}</b>,</p>
    <p>Your self-assessment is ready. Please complete it using the link below:</p>
    <p><a href="{survey_url}" style="color:#29b8dc;">{survey_url}</a></p>
    <p>Please find your attached PDF for full details.</p>
  </div>
</body>
</html>
    """

async def enviar_invitacion(nombre_evaluador: str, email: str, nombre_sujeto: str, token: str):
    subject = f"You've been invited to evaluate {nombre_sujeto} — 360 MOST Assessment"
    html_content = _html_invitacion(nombre_evaluador, nombre_sujeto, token)
    return await _enviar_email_brevo(email, nombre_evaluador, subject, html_content)


async def enviar_self_assessment(nombre: str, email: str, token: str):
    subject = "Your 360 MOST Assessment is ready"
    html_content = _html_self_assessment(nombre, token)
    return await _enviar_email_brevo(email, nombre, subject, html_content)


async def _enviar_email_brevo(to_email: str, to_name: str, subject: str, html_content: str, attachment=None):

    # 🔥 VALIDACIÓN OBLIGATORIA
    if not html_content:
        raise ValueError("html_content vacío o None")

    url = "https://api.brevo.com/v3/smtp/email"

    headers = {
        "accept": "application/json",
        "api-key": os.getenv("BREVO_API_KEY"),
        "content-type": "application/json"
    }

    payload = {
        "sender": {
            "name": "MOST 2.0",
            "email": os.getenv("BREVO_SENDER_EMAIL")
        },
        "to": [
            {
                "email": to_email,
                "name": to_name
            }
        ],
        "subject": subject,
        "htmlContent": html_content
    }

    # 🔥 SOLO SI HAY ADJUNTO
    if attachment:
        payload["attachment"] = attachment

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(url, headers=headers, json=payload)

    print("BREVO STATUS:", response.status_code)
    print("BREVO RESPONSE:", response.text)

    if response.status_code != 201:
        raise HTTPException(
            status_code=500,
            detail=response.text
        )

    return {"success": True, "message": "Correo enviado correctamente"}




async def enviar_reporte_360(nombre: str, email: str, pdf_bytes: bytes):
    html = f"""
    <html>
    <body style="font-family:Arial;background:#f5f5f5;padding:30px;">
      <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <h1 style="color:#29b8dc;margin-bottom:4px;">360 MOST Assessment Report</h1>
        <p style="color:#9ca3af;font-size:12px;margin-top:0;">Confidential · {nombre}</p>
        <p>Hello <b>{nombre}</b>,</p>
        <p>Your <b>360 MOST Assessment Report</b> is now ready. Please find your full PDF report attached.</p>
        <p>The report includes your competency scores across the three OD domains:</p>
        <ul>
          <li><b style="color:#ef4444;">Social</b> — Behavioral science, culture, and human-centered competencies</li>
          <li><b style="color:#3b82f6;">Technical</b> — Systems, strategy, and organizational design</li>
          <li><b style="color:#f59e0b;">Influence</b> — OD competencies, facilitation, and coaching</li>
        </ul>
        <p style="color:#666;font-size:12px;border-top:1px solid #e5e7eb;padding-top:12px;margin-top:20px;">
          Powered by <b>Open Source OD</b> · 360 MOST Assessment
        </p>
      </div>
    </body>
    </html>
    """
    encoded_pdf = base64.b64encode(pdf_bytes).decode("utf-8")
    attachment = [{"name": f"360_MOST_Report_{nombre}.pdf", "content": encoded_pdf}]
    return await _enviar_email_brevo(
        to_email=email,
        to_name=nombre,
        subject=f"Your 360 MOST Assessment Report — {nombre}",
        html_content=html,
        attachment=attachment,
    )


async def enviar_most_pdf(nombre, email, average, social_interest,
                          social_strength, technical_interest,
                          technical_strength, influence_interest,
                          influence_strength, pdf_bytes):

    email = email.strip().lower()

    if not pdf_bytes:
        return {"success": False, "error": "PDF vacío"}

    encoded_pdf = base64.b64encode(pdf_bytes).decode("utf-8")
    print("📦 PDF SIZE:", len(encoded_pdf))
    print("📦 PDF START:", encoded_pdf[:50])

    html = f"""
    <html>
    <body style="font-family:Arial;background:#f5f5f5;padding:30px;">

      <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:10px;">

        <h1 style="color:#29b8dc;">MOST 2.0 Assessment Report</h1>

        <p>Hello <b>{nombre}</b>,</p>

        <p>Your assessment has been completed successfully.</p>

        <h3>Summary</h3>

        <ul>
          <li>Average: {average}%</li>
          <li>Social Interest: {social_interest}%</li>
          <li>Social Strength: {social_strength}%</li>
          <li>Technical Interest: {technical_interest}%</li>
          <li>Technical Strength: {technical_strength}%</li>
          <li>Influence Interest: {influence_interest}%</li>
          <li>Influence Strength: {influence_strength}%</li>
        </ul>

        <p>Attached you will find your full PDF report.</p>

      </div>

    </body>
    </html>
    """

    attachment = [
        {
            "name": f"MOST20_{nombre}.pdf",
            "content": encoded_pdf,
          
        }
    ]
    
    
    
    try:
        return await _enviar_email_brevo(
        to_email=email,
        to_name=nombre,
        subject="Your MOST 2.0 Assessment Report",
        html_content=html,
        attachment=attachment
        )
    except Exception as e:
        print("❌ ERROR EN ENVÍO:", e)
    return {
        "success": False,
        "error": str(e)
    }