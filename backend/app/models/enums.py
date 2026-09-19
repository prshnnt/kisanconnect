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
