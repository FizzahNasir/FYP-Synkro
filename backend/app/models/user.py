"""User model - represents a team member"""
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.database import Base


class UserRole(str, enum.Enum):
    """User role within a team"""
    ADMIN = "admin"
    MEMBER = "member"


class User(Base):
    """User model"""
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    timezone = Column(String(50), default="UTC")
    role = Column(SQLEnum(UserRole), default=UserRole.MEMBER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Foreign Keys
    team_id = Column(String(36), ForeignKey("teams.id", ondelete="CASCADE"), nullable=True)

    # Relationships
    team = relationship("Team", back_populates="members")
    created_tasks = relationship(
        "Task",
        foreign_keys="Task.created_by_id",
        back_populates="creator"
    )
    assigned_tasks = relationship(
        "Task",
        foreign_keys="Task.assignee_id",
        back_populates="assignee"
    )
    integrations = relationship("Integration", back_populates="user", cascade="all, delete-orphan")
    meetings_created = relationship("Meeting", back_populates="creator")

    def __repr__(self):
        return f"<User {self.email}>"
