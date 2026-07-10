"""
SQLAlchemy ORM models.

Schema overview
----------------
users
    Mocked auth. A tiny table with a username + password (plaintext is fine
    here since real auth is explicitly out of scope for this assignment) and
    a session token used to persist login state.

hosted_zones
    Mirrors Route53's "Hosted Zone" concept - basically a container for a
    domain name and its records.

dns_records
    A single DNS record row that always belongs to exactly one hosted zone.
    `record_type` covers the common Route53 types (A, AAAA, CNAME, TXT, MX,
    NS, PTR, SRV, CAA).
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from .database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    username = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)  # mocked auth, stored as-is
    session_token = Column(String, unique=True, nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class HostedZone(Base):
    __tablename__ = "hosted_zones"

    id = Column(String, primary_key=True, default=gen_uuid)
    domain_name = Column(String, nullable=False, index=True)
    comment = Column(Text, nullable=True)
    zone_type = Column(String, default="Public")  # "Public" | "Private"
    record_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    records = relationship(
        "DNSRecord", back_populates="zone", cascade="all, delete-orphan"
    )


class DNSRecord(Base):
    __tablename__ = "dns_records"

    id = Column(String, primary_key=True, default=gen_uuid)
    hosted_zone_id = Column(String, ForeignKey("hosted_zones.id"), nullable=False, index=True)
    name = Column(String, nullable=False, index=True)
    record_type = Column(String, nullable=False, index=True)  # A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, CAA
    value = Column(Text, nullable=False)  # newline separated for multi-value records
    ttl = Column(Integer, default=300)
    routing_policy = Column(String, default="Simple")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    zone = relationship("HostedZone", back_populates="records")
