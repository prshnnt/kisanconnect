"""One place for every enum. Stored as VARCHAR (native_enum=False) so adding a value needs no migration."""

from enum import StrEnum


class Role(StrEnum):
    SELLER = "seller"
    BUYER = "buyer"
    SERVICE_PROVIDER = "service_provider"
    ADMIN = "admin"


class SellerType(StrEnum):
    FARMER = "farmer"
    FPO = "fpo"


class Gender(StrEnum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class OwnerType(StrEnum):
    """Polymorphic owner for Address / Attachment / CommodityLink."""

    USER = "user"
    SELLER = "seller"
    BUYER = "buyer"
    LOT = "lot"
    SUPPLY = "supply"
    DEMAND = "demand"
    PROVIDER = "provider"
    CATALOG = "catalog"
    LICENSE = "license"
    BOOKING = "booking"
    AGREEMENT = "agreement"
    BILL = "bill"


class AddressKind(StrEnum):
    PERMANENT = "permanent"
    CURRENT = "current"
    SERVICE_AREA = "service_area"
    PREFERRED = "preferred"
    LOT = "lot"
    DELIVERY = "delivery"
    PICKUP = "pickup"
    DROP = "drop"


class CommodityRole(StrEnum):
    PREFERRED = "preferred"
    EXPERTISE = "expertise"
    HANDLED = "handled"


class ApmcType(StrEnum):
    ENAM = "enam"
    NON_ENAM = "non_enam"


class Venue(StrEnum):
    """Inside/Outside APMC tab that splits most screens."""

    INSIDE_APMC = "inside_apmc"
    OUTSIDE_APMC = "outside_apmc"


class LicenseStatus(StrEnum):
    ACTIVE = "active"
    EXPIRED = "expired"
    SUSPENDED = "suspended"


class SaleType(StrEnum):
    PRIMARY = "primary"
    SECONDARY = "secondary"


class LotType(StrEnum):
    ADVANCE = "advance"
    OUTSIDE_APMC = "outside_apmc"


class LotStatus(StrEnum):
    DRAFT = "draft"
    ACTIVE = "active"
    AUCTIONED = "auctioned"
    SOLD = "sold"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class DeliveryMode(StrEnum):
    DELIVERY = "delivery"
    PICKUP = "pickup"


class AuctionStatus(StrEnum):
    SCHEDULED = "scheduled"
    LIVE = "live"
    CLOSED = "closed"
    DECLARED = "declared"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


class BidStatus(StrEnum):
    ACTIVE = "active"
    OUTBID = "outbid"
    WINNING = "winning"
    REJECTED = "rejected"


class TradeStatus(StrEnum):
    DECLARED = "declared"
    CONFIRMED = "confirmed"
    WEIGHMENT_PENDING = "weighment_pending"
    AGREEMENT_GENERATED = "agreement_generated"
    CANCELLED = "cancelled"


class ApprovalStatus(StrEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class PaymentStatus(StrEnum):
    PENDING = "pending"
    PARTIAL = "partial"
    PAID = "paid"
    OVERDUE = "overdue"
    FAILED = "failed"


class ServiceType(StrEnum):
    WEIGHMENT = "weighment"
    WAREHOUSE = "warehouse"
    LOGISTICS = "logistics"
    ASSAYING = "assaying"
    ASSURANCE = "assurance"
    PACKAGING = "packaging"
    GRADING = "grading"
    LABOUR = "labour"


class BookingStatus(StrEnum):
    REQUESTED = "requested"
    NEGOTIATING = "negotiating"
    ACCEPTED = "accepted"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REJECTED = "rejected"


class NegotiationStatus(StrEnum):
    NA = "na"
    REQUESTED = "requested"
    COUNTERED = "countered"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class GateExitType(StrEnum):
    POST_TRADE = "post_trade"
    GOODS_RETURN = "goods_return"


class OtpPurpose(StrEnum):
    LOGIN = "login"
    REGISTER = "register"
    VERIFY_MOBILE = "verify_mobile"
    VERIFY_EMAIL = "verify_email"
    DELETE_ACCOUNT = "delete_account"
    RESET_PASSWORD = "reset_password"
