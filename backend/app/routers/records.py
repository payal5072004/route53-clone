from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/hosted-zones/{zone_id}/records", tags=["dns-records"])


def _get_zone_or_404(db: Session, zone_id: str) -> models.HostedZone:
    zone = db.query(models.HostedZone).filter(models.HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    return zone


def _sync_record_count(db: Session, zone: models.HostedZone):
    zone.record_count = (
        db.query(models.DNSRecord).filter(models.DNSRecord.hosted_zone_id == zone.id).count()
    )
    db.commit()


@router.get("", response_model=schemas.PaginatedDNSRecords)
def list_records(
    zone_id: str,
    search: str | None = Query(default=None, description="Search by record name or value"),
    record_type: str | None = Query(default=None, description="Filter by record type"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    _user: models.User = Depends(get_current_user),
):
    _get_zone_or_404(db, zone_id)

    query = db.query(models.DNSRecord).filter(models.DNSRecord.hosted_zone_id == zone_id)
    if search:
        like = f"%{search}%"
        query = query.filter(
            (models.DNSRecord.name.ilike(like)) | (models.DNSRecord.value.ilike(like))
        )
    if record_type:
        query = query.filter(models.DNSRecord.record_type == record_type)

    total = query.count()
    items = (
        query.order_by(models.DNSRecord.name.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return schemas.PaginatedDNSRecords(items=items, total=total, page=page, page_size=page_size)


@router.post("", response_model=schemas.DNSRecordOut, status_code=201)
def create_record(
    zone_id: str,
    payload: schemas.DNSRecordCreate,
    db: Session = Depends(get_db),
    _user: models.User = Depends(get_current_user),
):
    zone = _get_zone_or_404(db, zone_id)

    record = models.DNSRecord(
        hosted_zone_id=zone.id,
        name=payload.name,
        record_type=payload.record_type,
        value=payload.value,
        ttl=payload.ttl,
        routing_policy=payload.routing_policy,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    _sync_record_count(db, zone)
    return record


@router.get("/{record_id}", response_model=schemas.DNSRecordOut)
def get_record(
    zone_id: str,
    record_id: str,
    db: Session = Depends(get_db),
    _user: models.User = Depends(get_current_user),
):
    _get_zone_or_404(db, zone_id)
    record = (
        db.query(models.DNSRecord)
        .filter(models.DNSRecord.id == record_id, models.DNSRecord.hosted_zone_id == zone_id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record


@router.put("/{record_id}", response_model=schemas.DNSRecordOut)
def update_record(
    zone_id: str,
    record_id: str,
    payload: schemas.DNSRecordUpdate,
    db: Session = Depends(get_db),
    _user: models.User = Depends(get_current_user),
):
    _get_zone_or_404(db, zone_id)
    record = (
        db.query(models.DNSRecord)
        .filter(models.DNSRecord.id == record_id, models.DNSRecord.hosted_zone_id == zone_id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, field, value)

    db.commit()
    db.refresh(record)
    return record


@router.delete("/{record_id}", status_code=204)
def delete_record(
    zone_id: str,
    record_id: str,
    db: Session = Depends(get_db),
    _user: models.User = Depends(get_current_user),
):
    zone = _get_zone_or_404(db, zone_id)
    record = (
        db.query(models.DNSRecord)
        .filter(models.DNSRecord.id == record_id, models.DNSRecord.hosted_zone_id == zone_id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    db.delete(record)
    db.commit()
    _sync_record_count(db, zone)
    return None
