"""Integration endpoints - Gmail, Slack OAuth flows and sync"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import User, Integration, IntegrationPlatform
from app.dependencies import get_current_user
from app.config import settings

router = APIRouter(prefix="/api/integrations", tags=["Integrations"])


@router.get("", response_model=List[dict])
async def get_integrations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all integrations for the current user."""
    result = await db.execute(
        select(Integration).where(Integration.user_id == current_user.id)
    )
    integrations = result.scalars().all()

    return [
        {
            "id": i.id,
            "platform": i.platform.value,
            "is_active": i.is_active,
            "last_synced_at": i.last_synced_at.isoformat() if i.last_synced_at else None,
            "created_at": i.created_at.isoformat(),
            "metadata": i.metadata or {},
        }
        for i in integrations
    ]


@router.get("/oauth/gmail/authorize")
async def gmail_authorize(current_user: User = Depends(get_current_user)):
    """
    Generate Google OAuth authorization URL.
    Redirect user to Google to grant access.
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Gmail integration not configured"
        )

    scopes = "openid email profile https://www.googleapis.com/auth/gmail.readonly"
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={settings.GOOGLE_REDIRECT_URI}"
        f"&response_type=code"
        f"&scope={scopes}"
        f"&access_type=offline"
        f"&prompt=consent"
        f"&state={current_user.id}"
    )
    return {"authorization_url": auth_url}


@router.get("/oauth/gmail/callback")
async def gmail_callback(
    code: str,
    state: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Handle Google OAuth callback.
    Exchange code for tokens and store them.
    """
    import httpx

    # Exchange code for tokens
    try:
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                },
            )
            token_data = token_response.json()

        if "error" in token_data:
            raise HTTPException(status_code=400, detail=token_data["error_description"])

        # Get user profile
        async with httpx.AsyncClient() as client:
            profile_response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {token_data['access_token']}"},
            )
            profile_data = profile_response.json()

        # Store integration
        integration = Integration(
            user_id=state,  # state contains user_id
            platform=IntegrationPlatform.GMAIL,
            access_token=token_data["access_token"],
            refresh_token=token_data.get("refresh_token"),
            expires_at=datetime.utcnow(),
            scope=token_data.get("scope"),
            is_active=True,
            metadata={"email": profile_data.get("email"), "name": profile_data.get("name")},
        )
        db.add(integration)
        await db.commit()

        # Redirect back to frontend
        return RedirectResponse(url="http://localhost:3000/dashboard/settings?integration=gmail&status=success")

    except HTTPException:
        raise
    except Exception as e:
        return RedirectResponse(url=f"http://localhost:3000/dashboard/settings?integration=gmail&status=error&message={str(e)}")


@router.post("/{integration_id}/sync")
async def sync_integration(
    integration_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Trigger a sync for a specific integration."""
    result = await db.execute(
        select(Integration).where(
            and_(
                Integration.id == integration_id,
                Integration.user_id == current_user.id,
            )
        )
    )
    integration = result.scalar_one_or_none()

    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")

    if not integration.is_active:
        raise HTTPException(status_code=400, detail="Integration is not active")

    # Update last synced timestamp
    integration.last_synced_at = datetime.utcnow()
    await db.commit()

    return {"message": "Sync triggered", "integration_id": integration_id}


@router.delete("/{integration_id}", status_code=status.HTTP_204_NO_CONTENT)
async def disconnect_integration(
    integration_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Disconnect an integration."""
    result = await db.execute(
        select(Integration).where(
            and_(
                Integration.id == integration_id,
                Integration.user_id == current_user.id,
            )
        )
    )
    integration = result.scalar_one_or_none()

    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")

    await db.delete(integration)
    await db.commit()
    return None
