"""Pydantic schemas — define the shape of API request/response bodies."""

from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, Field

RecordType = Literal["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"]


# ---------- Auth ----------

class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    token: str
    username: str


class UserOut(BaseModel):
    username: str

    class Config:
        from_attributes = True


# ---------- Hosted Zones ----------

class HostedZoneCreate(BaseModel):
    domain_name: str = Field(..., min_length=1, examples=["example.com"])
    comment: Optional[str] = None
    zone_type: Literal["Public", "Private"] = "Public"


class HostedZoneUpdate(BaseModel):
    comment: Optional[str] = None
    zone_type: Optional[Literal["Public", "Private"]] = None


class HostedZoneOut(BaseModel):
    id: str
    domain_name: str
    comment: Optional[str] = None
    zone_type: str
    record_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaginatedHostedZones(BaseModel):
    items: List[HostedZoneOut]
    total: int
    page: int
    page_size: int


# ---------- DNS Records ----------

class DNSRecordCreate(BaseModel):
    name: str = Field(..., min_length=1, examples=["www"])
    record_type: RecordType
    value: str
    ttl: int = 300
    routing_policy: str = "Simple"


class DNSRecordUpdate(BaseModel):
    name: Optional[str] = None
    record_type: Optional[RecordType] = None
    value: Optional[str] = None
    ttl: Optional[int] = None
    routing_policy: Optional[str] = None


class DNSRecordOut(BaseModel):
    id: str
    hosted_zone_id: str
    name: str
    record_type: str
    value: str
    ttl: int
    routing_policy: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaginatedDNSRecords(BaseModel):
    items: List[DNSRecordOut]
    total: int
    page: int
    page_size: int
