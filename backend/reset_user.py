"""Create or reset user password in PostgreSQL"""
import asyncio
import uuid
from sqlalchemy import text
from app.database import engine
from app.utils.security import get_password_hash

EMAIL = "zain@gmail.com"
PASSWORD = "11223344"

async def main():
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT id FROM users WHERE email = :e"), {"e": EMAIL})
        row = result.fetchone()

        if row:
            await conn.execute(
                text("UPDATE users SET password_hash = :h, is_active = true WHERE email = :e"),
                {"h": get_password_hash(PASSWORD), "e": EMAIL}
            )
            print(f"Password reset for {EMAIL}")
        else:
            # Need a team first
            team_result = await conn.execute(text("SELECT id FROM teams LIMIT 1"))
            team_row = team_result.fetchone()
            if team_row:
                team_id = team_row[0]
            else:
                team_id = str(uuid.uuid4())
                await conn.execute(
                    text("INSERT INTO teams (id, name, plan, settings) VALUES (:id, :n, 'free', '{}')"),
                    {"id": team_id, "n": "Dev Team"}
                )

            user_id = str(uuid.uuid4())
            await conn.execute(
                text("""INSERT INTO users (id, email, password_hash, full_name, team_id, role, is_active, is_verified, timezone)
                         VALUES (:id, :e, :h, :n, :t, 'admin', true, true, 'UTC')"""),
                {"id": user_id, "e": EMAIL, "h": get_password_hash(PASSWORD), "n": "Zain", "t": team_id}
            )
            print(f"Created user {EMAIL}")

        print(f"Login with: {EMAIL} / {PASSWORD}")

asyncio.run(main())
