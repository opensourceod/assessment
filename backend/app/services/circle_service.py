import os
import httpx
from dotenv import load_dotenv

load_dotenv()

CIRCLE_API_BASE = "https://app.circle.so/api/v2"
CIRCLE_TOKEN = os.getenv("CIRCLE_TOKEN")
CIRCLE_COMMUNITY_ID = os.getenv("CIRCLE_COMMUNITY_ID")

PLAN_SPACE_TAGS = {
    "starter":      "starter",
    "team":         "team",
    "organization": "organization",
    "enterprise":   "enterprise",
}


async def registrar_miembro_circle(nombre: str, email: str, plan: str) -> None:
    if not CIRCLE_TOKEN or not CIRCLE_COMMUNITY_ID:
        print("⚠️  Circle.so credentials not configured — skipping registration")
        return

    headers = {
        "Authorization": f"Token {CIRCLE_TOKEN}",
        "Content-Type": "application/json",
    }

    payload = {
        "community_id": int(CIRCLE_COMMUNITY_ID),
        "email": email,
        "name": nombre,
        "skip_invitation": True,
        "bio": f"360 MOST Assessment — {plan.capitalize()} plan",
    }

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                f"{CIRCLE_API_BASE}/community_members",
                headers=headers,
                json=payload,
            )

        if response.status_code in (200, 201):
            print(f"✅ Circle.so: member registered — {email} ({plan})")
        elif response.status_code == 422:
            # Member already exists in Circle — not an error
            print(f"ℹ️  Circle.so: member already exists — {email}")
        else:
            print(f"⚠️  Circle.so: unexpected status {response.status_code} — {response.text}")

    except Exception as exc:
        # Non-critical: log and continue; do not surface to user
        print(f"❌ Circle.so registration failed for {email}: {exc}")
