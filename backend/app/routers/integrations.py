"""Integration endpoints - Gmail IMAP connection and sync"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List
from datetime import datetime
import logging
from pydantic import BaseModel

from app.database import get_db
from app.models import User, Integration, IntegrationPlatform
from app.dependencies import get_current_user
from app.config import settings


class GmailConnectRequest(BaseModel):
    email: str
    app_password: str

logger = logging.getLogger(__name__)

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
            "last_synced_at": i.last_synced_at.isoformat() + "Z" if i.last_synced_at else None,
            "created_at": i.created_at.isoformat() + "Z",
            "metadata": i.platform_metadata or {},
        }
        for i in integrations
    ]


@router.post("/gmail/connect")
async def connect_gmail(
    request: GmailConnectRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Connect Gmail using IMAP with the user's own App Password credentials.
    Each user provides their own Gmail address and App Password.
    """
    from app.services.gmail_service import test_connection

    email_addr = request.email.strip()
    app_password = request.app_password.strip()

    if not email_addr or not app_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and app password are required"
        )

    # Test the connection with the user's own credentials
    result = test_connection(email_addr, app_password)

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )

    # Check if integration already exists for this user
    existing = await db.execute(
        select(Integration).where(
            and_(
                Integration.user_id == current_user.id,
                Integration.platform == IntegrationPlatform.GMAIL,
            )
        )
    )
    integration = existing.scalar_one_or_none()

    if integration:
        # Update existing with the new credentials
        integration.access_token = app_password
        integration.is_active = True
        integration.platform_metadata = {"email": email_addr}
    else:
        # Create new integration for this user
        integration = Integration(
            user_id=current_user.id,
            platform=IntegrationPlatform.GMAIL,
            access_token=app_password,
            is_active=True,
            platform_metadata={"email": email_addr},
        )
        db.add(integration)

    await db.commit()

    logger.info(f"Gmail connected for user {current_user.id} ({email_addr})")

    return {
        "message": "Gmail connected successfully!",
        "email": email_addr,
    }


@router.get("/gmail/emails")
async def get_gmail_emails(
    limit: int = 20,
    days: int = 7,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetch recent emails from connected Gmail account."""
    from app.services.gmail_service import fetch_emails

    # Verify integration exists
    result = await db.execute(
        select(Integration).where(
            and_(
                Integration.user_id == current_user.id,
                Integration.platform == IntegrationPlatform.GMAIL,
                Integration.is_active == True,
            )
        )
    )
    integration = result.scalar_one_or_none()

    if not integration:
        raise HTTPException(status_code=404, detail="Gmail not connected. Go to Settings to connect.")

    email_addr = integration.platform_metadata.get("email") or settings.GMAIL_EMAIL
    app_password = integration.access_token

    try:
        emails = fetch_emails(
            email_addr=email_addr,
            app_password=app_password,
            limit=min(limit, 50),
            since_days=min(days, 30),
        )

        # Update last synced
        integration.last_synced_at = datetime.utcnow()
        await db.commit()

        return {"emails": emails, "count": len(emails)}

    except Exception as e:
        logger.error(f"Failed to fetch emails: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch emails: {str(e)}")


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
