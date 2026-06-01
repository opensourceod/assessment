import asyncio
import os
from dotenv import load_dotenv
import httpx

load_dotenv()

CIRCLE_API_BASE = "https://app.circle.so/api/v2"
CIRCLE_TOKEN = os.getenv("CIRCLE_TOKEN")
CIRCLE_COMMUNITY_ID = os.getenv("CIRCLE_COMMUNITY_ID")

print(f"Token configurado: {'Si' if CIRCLE_TOKEN else 'NO'}")
print(f"Community ID: {CIRCLE_COMMUNITY_ID}")


async def test():
    headers = {
        "Authorization": f"Token {CIRCLE_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "community_id": int(CIRCLE_COMMUNITY_ID),
        "email": "test.360assessment@example.com",
        "name": "Test Usuario 360",
        "skip_invitation": True,
        "bio": "360 MOST Assessment - Starter plan",
    }

    print(f"\nPOST {CIRCLE_API_BASE}/community_members")
    print(f"Payload: {payload}\n")

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            f"{CIRCLE_API_BASE}/community_members",
            headers=headers,
            json=payload,
        )

    print(f"Status HTTP: {response.status_code}")
    print(f"Respuesta: {response.text[:800]}")

    if response.status_code in (200, 201):
        print("\n✅ Miembro registrado exitosamente en Circle.so")
    elif response.status_code == 422:
        data = response.json()
        print(f"\nℹ️  Respuesta 422: {data}")
    else:
        print(f"\n❌ Error: {response.status_code}")


asyncio.run(test())
