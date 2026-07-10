from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/hosted-zones", tags=["hosted-zones"])


@router.get("", response_model=schemas.PaginatedHostedZones)
def list_hosted_zones(
    search: str | None = Query(default=None, description="Search by domain name"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    _user: models.User = Depends(get_current_user),
):
    query = db.query(models.HostedZone)
    if search:
        query = query.filter(models.HostedZone.domain_name.ilike(f"%{search}%"))

    total = query.count()
    items = (
        query.order_by(models.HostedZone.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return schemas.PaginatedHostedZones(items=items, total=total, page=page, page_size=page_size)


@router.post("", response_model=schemas.HostedZoneOut, status_code=201)
def create_hosted_zone(
    payload: schemas.HostedZoneCreate,
    db: Session = Depends(get_db),
    _user: models.User = Depends(get_current_user),
):
    existing = (
        db.query(models.HostedZone)
        .filter(models.HostedZone.domain_name == payload.domain_name)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="A hosted zone for this domain already exists")

    zone = models.HostedZone(
        domain_name=payload.domain_name,
        comment=payload.comment,
        zone_type=payload.zone_type,
    )
    db.add(zone)
    db.commit()
    db.refresh(zone)

    # Route53 auto-creates NS + SOA records for every new hosted zone.
    ns_record = models.DNSRecord(
        hosted_zone_id=zone.id,
        name=payload.domain_name,
        record_type="NS",
        value="ns-1.awsdns-00.com.\nns-2.awsdns-00.net.\nns-3.awsdns-00.org.\nns-4.awsdns-00.co.uk.",
        ttl=172800,
    )
    db.add(ns_record)
    zone.record_count = 1
    db.commit()
    db.refresh(zone)
    return zone


@router.get("/{zone_id}", response_model=schemas.HostedZoneOut)
def get_hosted_zone(
    zone_id: str,
    db: Session = Depends(get_db),
    _user: models.User = Depends(get_current_user),
):
    zone = db.query(models.HostedZone).filter(models.HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    return zone


@router.put("/{zone_id}", response_model=schemas.HostedZoneOut)
def update_hosted_zone(
    zone_id: str,
    payload: schemas.HostedZoneUpdate,
    db: Session = Depends(get_db),
    _user: models.User = Depends(get_current_user),
):
    zone = db.query(models.HostedZone).filter(models.HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")

    if payload.comment is not None:
        zone.comment = payload.comment
    if payload.zone_type is not None:
        zone.zone_type = payload.zone_type

    db.commit()
    db.refresh(zone)
    return zone


@router.delete("/{zone_id}", status_code=204)
def delete_hosted_zone(
    zone_id: str,
    db: Session = Depends(get_db),
    _user: models.User = Depends(get_current_user),
):
    zone = db.query(models.HostedZone).filter(models.HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    db.delete(zone)
    db.commit()
    return None
