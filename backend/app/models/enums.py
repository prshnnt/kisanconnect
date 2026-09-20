from __future__ import annotations

from enum import StrEnum


class AssayingTestingMethodType(StrEnum):
    PHYSICAL = "physical"
    CHEMICAL = "chemical"


class CommunicationMethod(StrEnum):
    PHONE = "phone"
    EMAIL = "email"


class SellerType(StrEnum):
    FARMER = "farmer"
    FPO = "fpo"


class APMCType(StrEnum):
    ENAM = "enam"
    NON_ENAM = "non_enam"


class TradeLicenseType(StrEnum):
    SINGLE = "single"
    UNIFIED = "unified"


class TradeLicenseStatus(StrEnum):
    ACTIVE = "active"
    EXPIRED = "expired"
    SUSPENDED = "suspended"


class ServiceProviderType(StrEnum):
    WEIGHMENT = "weighment"
    WAREHOUSE = "warehouse"
    LOGISTICS = "logistics"
    ASSAYING = "assaying"
    ASSURANCE = "assurance"
    PACKAGING = "packaging"
    GRADING_AND_SORTING = "grading_and_sorting"
    LABOUR = "labour"


class WeighmentLocationType(StrEnum):
    INSIDE_APMC = "inside_apmc"
    OUTSIDE_APMC = "outside_apmc"


class WeighingMethod(StrEnum):
    WEIGH_BRIDGE = "weigh_bridge"
    WEIGHING_SCALE = "weighing_scale"


class LogisticsServiceModelType(StrEnum):
    DOOR_TO_DOOR = "door_to_door"
    FIRST_MILE_PICKUP = "first_mile_pickup"
    LAST_MILE_PICKUP = "last_mile_pickup"
    INTER_STATE = "inter_state"
    INTRA_STATE = "intra_state"
    HUB_AND_SPOKE = "hub_and_spoke"


class UserRelationshipType(StrEnum):
    SO = "s/o"
    DO = "d/o"
    WO = "w/o"


class Gender(StrEnum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class UserRoleType(StrEnum):
    SELLER = "seller"
    BUYER = "buyer"
    SERVICE_PROVIDER = "service_provider"


class AddressType(StrEnum):
    PERMANENT = "permanent"
    COMMUNICATION = "communication"
    CURRENT = "current"


class AssayingLocationType(StrEnum):
    INSIDE_APMC = "inside_apmc"
    OUTSIDE_APMC = "outside_apmc"


class AssayingServiceModel(StrEnum):
    DIGITAL = "digital"
    MANUAL = "manual"


class AssayingDeliveryType(StrEnum):
    ASSAYER_PICKUP = "assayer_pickup"
    FARMER_DROP = "farmer_drop"
    LAB_VISIT = "lab_visit"
    ON_SITE = "on_site"


class AssayingNegotiationStatus(StrEnum):
    NA = "na"
    REQUESTED = "requested"
    COUNTER_OFFERED = "counter_offered"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class AssayingBookingStatus(StrEnum):
    REQUESTED = "requested"
    ACCEPTED = "accepted"
    SAMPLE_COLLECTED = "sample_collected"
    TESTING = "testing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REJECTED = "rejected"


class AuctionBidType(StrEnum):
    OPEN = "open"
    CLOSED = "closed"


class AuctionDeclarationType(StrEnum):
    MANUAL = "manual"
    AUTO = "auto"


class AuctionStatus(StrEnum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    LIVE = "live"
    CLOSED = "closed"
    DECLARED = "declared"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class BidStatus(StrEnum):
    ACTIVE = "active"
    OUTBID = "outbid"
    WINNING = "winning"
    REJECTED = "rejected"


class WeighmentBookingStatus(StrEnum):
    REQUESTED = "requested"
    CONFIRMED = "confirmed"
    VEHICLE_ARRIVED = "vehicle_arrived"
    WEIGHED = "weighed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REJECTED = "rejected"


class WeighmentEquipmentType(StrEnum):
    WEIGH_BRIDGE = "weigh_bridge"
    DIGITAL_SCALE = "digital_scale"
    PLATFORM_SCALE = "platform_scale"


class TradeLocationType(StrEnum):
    INSIDE_APMC = "inside_apmc"
    OUTSIDE_APMC = "outside_apmc"


class AgreementApprovalStatus(StrEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class SaleAgreementStatus(StrEnum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


class TradeConfirmationStatus(StrEnum):
    DECLARED = "declared"
    CONFIRMED = "confirmed"
    WEIGHMENT_PENDING = "weighment_pending"
    AGREEMENT_GENERATED = "agreement_generated"
    CANCELLED = "cancelled"


class PaymentStatus(StrEnum):
    PENDING = "pending"
    PARTIAL = "partial"
    PAID = "paid"
    OVERDUE = "overdue"
    FAILED = "failed"



