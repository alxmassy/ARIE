"""
SQLAlchemy ORM models for ARIE.

4 tables matching Database.md spec:
  - teens
  - observations
  - weekly_snapshots
  - job_profiles

All vectors/deltas stored as JSONB for hackathon flexibility.
"""

import uuid

from sqlalchemy import Column, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.types import DateTime

from database import Base


class Teen(Base):
    __tablename__ = "teens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Text, nullable=False)
    age = Column(Integer, nullable=False)
    baseline_vector = Column(JSONB, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    observations = relationship("Observation", back_populates="teen", cascade="all, delete-orphan")
    weekly_snapshots = relationship("WeeklySnapshot", back_populates="teen", cascade="all, delete-orphan")


class Observation(Base):
    __tablename__ = "observations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teen_id = Column(UUID(as_uuid=True), ForeignKey("teens.id"), nullable=False)
    raw_text = Column(Text, nullable=False)
    structured_delta = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    teen = relationship("Teen", back_populates="observations")


class WeeklySnapshot(Base):
    __tablename__ = "weekly_snapshots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teen_id = Column(UUID(as_uuid=True), ForeignKey("teens.id"), nullable=False)
    week_number = Column(Integer, nullable=False)
    readiness_vector = Column(JSONB, nullable=False)
    readiness_score = Column(Float, nullable=False)
    regression_risk = Column(String(20), nullable=False, default="Low")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    teen = relationship("Teen", back_populates="weekly_snapshots")


class JobProfile(Base):
    __tablename__ = "job_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_name = Column(Text, nullable=False, unique=True)
    job_vector = Column(JSONB, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
