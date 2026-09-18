-- ============================================================================
-- ENAM DATABASE SCHEMA - REVISED & ENHANCED (Based on Official eNAM.gov.in)
-- ============================================================================
-- Updated with real-world features:
-- 1. State Unified License (SUL) - Single license valid across state
-- 2. FPO (Farmer Producer Organizations) - Aggregator model
-- 3. Advance Demand/Supply - Pre-booking commodity transactions
-- 4. eNWR Trade - Warehouse Receipt Trading
-- 5. Kisan Rath - Logistics coordination
-- 6. QC Labs - Quality control laboratory infrastructure
-- 7. Gate Entry/Exit - Entry monitoring system
-- 8. Price Dissemination - ReMS & Agmarknet integration
-- 9. Weather Integration - Seasonal forecasting
-- 10. Cooperative Model - For cooperative trading
-- ============================================================================

-- ============================================================================
-- 1. ENHANCED USER & STAKEHOLDER MANAGEMENT
-- ============================================================================

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('farmer', 'fpo', 'trader', 'buyer', 'cooperative', 
                   'quality_assessor', 'mandi_staff', 'logistics_provider', 
                   'govt_official', 'admin') NOT NULL,
    status ENUM('active', 'inactive', 'suspended', 'pending_verification') DEFAULT 'pending_verification',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP NULL,
    profile_completion_percentage INT DEFAULT 0,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phone_number),
    INDEX idx_user_type (user_type),
    INDEX idx_status (status)
);

-- Farmer Details (Individual Farmers)
CREATE TABLE farmers (
    farmer_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    aadhar_number VARCHAR(20) UNIQUE NOT NULL,
    pan_number VARCHAR(20) UNIQUE,
    farmer_name VARCHAR(255) NOT NULL,
    father_name VARCHAR(255),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    farm_size_hectares DECIMAL(10, 2),
    land_ownership_type ENUM('own', 'lease', 'share_crop', 'mixed') DEFAULT 'own',
    primary_crop VARCHAR(100),
    secondary_crops VARCHAR(500),
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    taluka VARCHAR(100),
    village VARCHAR(255),
    pincode VARCHAR(10),
    bank_account_number VARCHAR(30),
    bank_ifsc_code VARCHAR(20),
    bank_name VARCHAR(100),
    account_holder_name VARCHAR(255),
    farm_location_latitude DECIMAL(10, 8),
    farm_location_longitude DECIMAL(11, 8),
    annual_turnover DECIMAL(15, 2),
    operating_status ENUM('active', 'inactive', 'retired') DEFAULT 'active',
    registration_number VARCHAR(50) UNIQUE,
    registration_date DATE,
    preferred_mandi_id INT,
    mobile_app_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (preferred_mandi_id) REFERENCES mandis(mandi_id),
    INDEX idx_farmer_name (farmer_name),
    INDEX idx_state_district (state, district),
    INDEX idx_registration_number (registration_number)
);

-- FPO (Farmer Producer Organizations) - Aggregator Model
CREATE TABLE fpos (
    fpo_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    fpo_name VARCHAR(255) NOT NULL,
    fpo_registration_number VARCHAR(50) UNIQUE NOT NULL,
    fpo_type ENUM('producer_organization', 'producer_company', 'cooperative') NOT NULL,
    authorized_person_name VARCHAR(255),
    authorized_person_designation VARCHAR(100),
    authorized_person_phone VARCHAR(20),
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    office_address VARCHAR(500),
    office_latitude DECIMAL(10, 8),
    office_longitude DECIMAL(11, 8),
    bank_account_number VARCHAR(30),
    bank_ifsc_code VARCHAR(20),
    bank_name VARCHAR(100),
    account_holder_name VARCHAR(255),
    member_farmer_count INT DEFAULT 0,
    total_area_hectares DECIMAL(15, 2),
    primary_commodities VARCHAR(500),
    collection_center_location VARCHAR(500),
    has_sorting_grading_facility BOOLEAN DEFAULT FALSE,
    has_packing_facility BOOLEAN DEFAULT FALSE,
    has_storage_facility BOOLEAN DEFAULT FALSE,
    warehouse_id INT,
    fpo_status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    registration_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_fpo_name (fpo_name),
    INDEX idx_fpo_registration (fpo_registration_number)
);

-- FPO Member Mapping (Individual farmers belonging to FPO)
CREATE TABLE fpo_members (
    member_id INT PRIMARY KEY AUTO_INCREMENT,
    fpo_id INT NOT NULL,
    farmer_id INT NOT NULL,
    member_since_date DATE,
    share_percentage DECIMAL(5, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fpo_id) REFERENCES fpos(fpo_id) ON DELETE CASCADE,
    FOREIGN KEY (farmer_id) REFERENCES farmers(farmer_id) ON DELETE CASCADE,
    UNIQUE KEY unique_fpo_farmer (fpo_id, farmer_id),
    INDEX idx_fpo_id (fpo_id)
);

-- Cooperative Details
CREATE TABLE cooperatives (
    cooperative_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    cooperative_name VARCHAR(255) NOT NULL,
    cooperative_registration_number VARCHAR(50) UNIQUE NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    office_address VARCHAR(500),
    bank_account_number VARCHAR(30),
    bank_ifsc_code VARCHAR(20),
    member_count INT DEFAULT 0,
    cooperative_status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- State Unified License (SUL) - Valid across entire state
CREATE TABLE state_unified_licenses (
    sul_id INT PRIMARY KEY AUTO_INCREMENT,
    sul_number VARCHAR(50) UNIQUE NOT NULL,
    trader_id INT NOT NULL,
    state_issued_in VARCHAR(100) NOT NULL,
    license_type ENUM('trader', 'commission_agent', 'wholesaler', 'exporter', 'processor') NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    issuing_authority VARCHAR(255),
    license_status ENUM('active', 'expired', 'suspended', 'cancelled') DEFAULT 'active',
    valid_for_all_mandis_in_state BOOLEAN DEFAULT TRUE,
    restricted_mandis VARCHAR(500),
    commodities_authorized VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trader_id) REFERENCES traders(trader_id),
    INDEX idx_sul_number (sul_number),
    INDEX idx_trader_id (trader_id),
    INDEX idx_state_issued (state_issued_in)
);

-- Traders with Enhanced Fields
CREATE TABLE traders (
    trader_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    trader_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    gst_number VARCHAR(20) UNIQUE NOT NULL,
    pan_number VARCHAR(20),
    trade_license_number VARCHAR(50) UNIQUE NOT NULL,
    license_expiry_date DATE,
    has_state_unified_license BOOLEAN DEFAULT FALSE,
    sul_id INT,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    warehouse_location VARCHAR(500),
    warehouse_latitude DECIMAL(10, 8),
    warehouse_longitude DECIMAL(11, 8),
    bank_account_number VARCHAR(30),
    bank_ifsc_code VARCHAR(20),
    bank_name VARCHAR(100),
    account_holder_name VARCHAR(255),
    credit_limit DECIMAL(15, 2),
    credit_used DECIMAL(15, 2) DEFAULT 0,
    operating_since DATE,
    specialization VARCHAR(500),
    authorized_mandis VARCHAR(500),
    mobile_app_enabled BOOLEAN DEFAULT FALSE,
    ePayment_enabled BOOLEAN DEFAULT TRUE,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (sul_id) REFERENCES state_unified_licenses(sul_id),
    INDEX idx_gst_number (gst_number),
    INDEX idx_state_district (state, district)
);

-- ============================================================================
-- 2. MANDI & INFRASTRUCTURE MANAGEMENT
-- ============================================================================

CREATE TABLE mandis (
    mandi_id INT PRIMARY KEY AUTO_INCREMENT,
    mandi_name VARCHAR(255) NOT NULL UNIQUE,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    taluka VARCHAR(100),
    mandi_code VARCHAR(50) UNIQUE NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    apmc_registration_number VARCHAR(50),
    apmc_registration_date DATE,
    contact_person_name VARCHAR(255),
    contact_number VARCHAR(20),
    email VARCHAR(255),
    total_area_sq_meters BIGINT,
    total_shops INT,
    auction_hall_capacity INT,
    parking_capacity INT,
    total_weighment_bridges INT,
    qc_lab_available BOOLEAN DEFAULT FALSE,
    e_auction_hall_available BOOLEAN DEFAULT FALSE,
    storage_facility_available BOOLEAN DEFAULT FALSE,
    cold_chain_available BOOLEAN DEFAULT FALSE,
    sorting_grading_facility BOOLEAN DEFAULT FALSE,
    processing_facility_available BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    has_gate_entry_system BOOLEAN DEFAULT FALSE,
    integration_status ENUM('integrated', 'pending', 'not_integrated') DEFAULT 'integrated',
    mandi_operational_hours VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_mandi_name (mandi_name),
    INDEX idx_mandi_code (mandi_code),
    INDEX idx_state_district (state, district)
);

-- QC Lab (Quality Control Laboratory)
CREATE TABLE qc_labs (
    lab_id INT PRIMARY KEY AUTO_INCREMENT,
    mandi_id INT NOT NULL,
    lab_name VARCHAR(255),
    lab_location VARCHAR(500),
    lab_incharge_name VARCHAR(255),
    lab_incharge_phone VARCHAR(20),
    commodities_tested VARCHAR(1000),
    equipment_list VARCHAR(2000),
    accreditation_status VARCHAR(100),
    accreditation_expiry_date DATE,
    testing_capacity_per_day INT,
    average_testing_time_hours DECIMAL(3, 1),
    lab_status ENUM('operational', 'under_maintenance', 'closed') DEFAULT 'operational',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mandi_id) REFERENCES mandis(mandi_id),
    INDEX idx_mandi_id (mandi_id)
);

-- Gate Entry/Exit System (Entry Monitoring)
CREATE TABLE gate_entries (
    entry_id INT PRIMARY KEY AUTO_INCREMENT,
    mandi_id INT NOT NULL,
    entry_datetime DATETIME NOT NULL,
    vehicle_registration_number VARCHAR(30),
    driver_name VARCHAR(255),
    driver_phone VARCHAR(20),
    entry_type ENUM('produce_arrival', 'traders_entry', 'logistics') NOT NULL,
    commodity_type VARCHAR(100),
    estimated_quantity DECIMAL(15, 2),
    quantity_unit VARCHAR(20),
    farmer_id INT,
    fpo_id INT,
    vehicle_owner_name VARCHAR(255),
    entry_remarks VARCHAR(500),
    recorded_by_user_id INT,
    entry_status ENUM('entry_recorded', 'assay_pending', 'ready_for_auction', 'completed') DEFAULT 'entry_recorded',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mandi_id) REFERENCES mandis(mandi_id),
    FOREIGN KEY (farmer_id) REFERENCES farmers(farmer_id),
    FOREIGN KEY (fpo_id) REFERENCES fpos(fpo_id),
    FOREIGN KEY (recorded_by_user_id) REFERENCES users(user_id),
    INDEX idx_mandi_id (mandi_id),
    INDEX idx_entry_datetime (entry_datetime)
);

-- ============================================================================
-- 3. COMMODITIES & LOTS (ENHANCED)
-- ============================================================================

CREATE TABLE commodity_categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(255) NOT NULL UNIQUE,
    category_code VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category_name (category_name)
);

-- Commodities with Quality Parameters
CREATE TABLE commodities (
    commodity_id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    commodity_name VARCHAR(255) NOT NULL UNIQUE,
    commodity_code VARCHAR(50) UNIQUE NOT NULL,
    hsncode VARCHAR(20),
    common_name VARCHAR(255),
    scientific_name VARCHAR(255),
    unit_of_measurement ENUM('kg', 'quintal', 'ton', 'liter', 'piece', 'dozen', 'box', 'bundle') NOT NULL,
    minimum_order_quantity DECIMAL(15, 2),
    is_seasonal BOOLEAN DEFAULT TRUE,
    season_start_month INT,
    season_end_month INT,
    quality_parameters_count INT,
    avg_price_per_unit DECIMAL(15, 2),
    price_update_date DATE,
    gst_rate DECIMAL(5, 2) DEFAULT 5,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES commodity_categories(category_id),
    INDEX idx_commodity_name (commodity_name),
    INDEX idx_commodity_code (commodity_code)
);

-- Lots with Enhanced Fields
CREATE TABLE lots (
    lot_id INT PRIMARY KEY AUTO_INCREMENT,
    lot_number VARCHAR(50) UNIQUE NOT NULL,
    farmer_id INT,
    fpo_id INT,
    cooperative_id INT,
    commodity_id INT NOT NULL,
    mandi_id INT NOT NULL,
    gate_entry_id INT,
    quantity DECIMAL(15, 2) NOT NULL,
    unit_of_measurement ENUM('kg', 'quintal', 'ton', 'liter', 'piece', 'dozen', 'box', 'bundle') NOT NULL,
    harvest_date DATE,
    arrival_date DATETIME,
    arrival_through ENUM('farmer_direct', 'fpo', 'cooperative', 'commission_agent') NOT NULL,
    grade VARCHAR(50),
    origin_place VARCHAR(500),
    storage_location VARCHAR(255),
    farmer_reserve_price DECIMAL(15, 2),
    minimum_bid_price DECIMAL(15, 2),
    lot_status ENUM('registered', 'gate_entry_done', 'assayed', 'ready_for_auction', 
                    'in_auction', 'sold', 'unsold', 'returned', 'rejected') DEFAULT 'registered',
    quality_grade VARCHAR(10),
    moisture_content DECIMAL(5, 2),
    foreign_matter_percentage DECIMAL(5, 2),
    damaged_percentage DECIMAL(5, 2),
    quality_certification_obtained BOOLEAN DEFAULT FALSE,
    remarks VARCHAR(500),
    seller_type ENUM('individual_farmer', 'fpo', 'cooperative') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmers(farmer_id),
    FOREIGN KEY (fpo_id) REFERENCES fpos(fpo_id),
    FOREIGN KEY (cooperative_id) REFERENCES cooperatives(cooperative_id),
    FOREIGN KEY (commodity_id) REFERENCES commodities(commodity_id),
    FOREIGN KEY (mandi_id) REFERENCES mandis(mandi_id),
    FOREIGN KEY (gate_entry_id) REFERENCES gate_entries(entry_id),
    INDEX idx_lot_number (lot_number),
    INDEX idx_farmer_id (farmer_id),
    INDEX idx_fpo_id (fpo_id),
    INDEX idx_lot_status (lot_status),
    INDEX idx_arrival_date (arrival_date),
    INDEX idx_commodity_id (commodity_id)
);

-- ============================================================================
-- 4. ADVANCE DEMAND/SUPPLY MODULE
-- ============================================================================

-- Advance Supply (Farmer pre-commits to sell)
CREATE TABLE advance_supply (
    advance_supply_id INT PRIMARY KEY AUTO_INCREMENT,
    supply_number VARCHAR(50) UNIQUE NOT NULL,
    farmer_id INT,
    fpo_id INT,
    commodity_id INT NOT NULL,
    mandi_id INT NOT NULL,
    committed_quantity DECIMAL(15, 2) NOT NULL,
    unit_of_measurement VARCHAR(20),
    expected_harvest_date DATE,
    committed_delivery_date DATE,
    committed_price DECIMAL(15, 2),
    price_term ENUM('fixed', 'market_based', 'formula_based') DEFAULT 'market_based',
    supply_status ENUM('committed', 'partial_delivery', 'completed', 'cancelled') DEFAULT 'committed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmers(farmer_id),
    FOREIGN KEY (fpo_id) REFERENCES fpos(fpo_id),
    FOREIGN KEY (commodity_id) REFERENCES commodities(commodity_id),
    FOREIGN KEY (mandi_id) REFERENCES mandis(mandi_id),
    INDEX idx_supply_number (supply_number),
    INDEX idx_farmer_id (farmer_id)
);

-- Advance Demand (Buyer pre-commits to buy)
CREATE TABLE advance_demand (
    advance_demand_id INT PRIMARY KEY AUTO_INCREMENT,
    demand_number VARCHAR(50) UNIQUE NOT NULL,
    trader_id INT NOT NULL,
    commodity_id INT NOT NULL,
    mandi_id INT NOT NULL,
    required_quantity DECIMAL(15, 2) NOT NULL,
    unit_of_measurement VARCHAR(20),
    required_delivery_date DATE,
    budget_allocated DECIMAL(15, 2),
    quality_specification VARCHAR(500),
    demand_status ENUM('active', 'partially_matched', 'fully_matched', 'expired', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trader_id) REFERENCES traders(trader_id),
    FOREIGN KEY (commodity_id) REFERENCES commodities(commodity_id),
    FOREIGN KEY (mandi_id) REFERENCES mandis(mandi_id),
    INDEX idx_demand_number (demand_number),
    INDEX idx_trader_id (trader_id)
);

-- Supply-Demand Matching
CREATE TABLE advance_supply_demand_matching (
    matching_id INT PRIMARY KEY AUTO_INCREMENT,
    advance_supply_id INT NOT NULL,
    advance_demand_id INT NOT NULL,
    matched_quantity DECIMAL(15, 2),
    matched_price DECIMAL(15, 2),
    matching_date DATETIME,
    matching_status ENUM('pending', 'confirmed', 'executed', 'partial', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (advance_supply_id) REFERENCES advance_supply(advance_supply_id),
    FOREIGN KEY (advance_demand_id) REFERENCES advance_demand(advance_demand_id),
    UNIQUE KEY unique_matching (advance_supply_id, advance_demand_id),
    INDEX idx_matching_status (matching_status)
);

-- ============================================================================
-- 5. eNWR TRADE (e-National Warehouse Receipt)
-- ============================================================================

CREATE TABLE warehouses (
    warehouse_id INT PRIMARY KEY AUTO_INCREMENT,
    warehouse_name VARCHAR(255) NOT NULL,
    warehouse_code VARCHAR(50) UNIQUE NOT NULL,
    owner_name VARCHAR(255),
    mandi_id INT,
    state VARCHAR(100),
    district VARCHAR(100),
    location_address VARCHAR(500),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    total_capacity_ton DECIMAL(15, 2),
    available_capacity_ton DECIMAL(15, 2),
    commodities_supported VARCHAR(1000),
    cold_storage_available BOOLEAN DEFAULT FALSE,
    temperature_controlled BOOLEAN DEFAULT FALSE,
    warehouse_status ENUM('operational', 'under_maintenance', 'closed') DEFAULT 'operational',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mandi_id) REFERENCES mandis(mandi_id),
    INDEX idx_warehouse_code (warehouse_code)
);

-- Warehouse Receipts (eNWR)
CREATE TABLE warehouse_receipts (
    receipt_id INT PRIMARY KEY AUTO_INCREMENT,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    warehouse_id INT NOT NULL,
    commodity_id INT NOT NULL,
    depositor_farmer_id INT,
    depositor_fpo_id INT,
    quantity_deposited DECIMAL(15, 2),
    unit_of_measurement VARCHAR(20),
    deposit_date DATETIME,
    expected_withdrawal_date DATE,
    quality_grade VARCHAR(10),
    storage_fee_applicable DECIMAL(15, 2),
    receipt_status ENUM('active', 'partial_withdrawal', 'full_withdrawal', 'expired') DEFAULT 'active',
    receipt_issued_date DATETIME,
    receipt_valid_until_date DATE,
    tradeable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id),
    FOREIGN KEY (commodity_id) REFERENCES commodities(commodity_id),
    FOREIGN KEY (depositor_farmer_id) REFERENCES farmers(farmer_id),
    FOREIGN KEY (depositor_fpo_id) REFERENCES fpos(fpo_id),
    INDEX idx_receipt_number (receipt_number),
    INDEX idx_receipt_status (receipt_status)
);

-- eNWR Trading (Buying/Selling warehouse receipts)
CREATE TABLE enwr_trades (
    trade_id INT PRIMARY KEY AUTO_INCREMENT,
    trade_number VARCHAR(50) UNIQUE NOT NULL,
    receipt_id INT NOT NULL,
    seller_trader_id INT,
    buyer_trader_id INT,
    quantity_traded DECIMAL(15, 2),
    price_per_unit DECIMAL(15, 2),
    total_value DECIMAL(15, 2),
    trade_date DATETIME,
    trade_status ENUM('initiated', 'confirmed', 'completed', 'cancelled') DEFAULT 'initiated',
    payment_status ENUM('pending', 'paid', 'partial') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (receipt_id) REFERENCES warehouse_receipts(receipt_id),
    FOREIGN KEY (seller_trader_id) REFERENCES traders(trader_id),
    FOREIGN KEY (buyer_trader_id) REFERENCES traders(trader_id),
    INDEX idx_trade_number (trade_number),
    INDEX idx_trade_status (trade_status)
);

-- ============================================================================
-- 6. QUALITY ASSAYING (ENHANCED WITH DMI PARAMETERS)
-- ============================================================================

CREATE TABLE quality_parameters (
    parameter_id INT PRIMARY KEY AUTO_INCREMENT,
    commodity_id INT NOT NULL,
    parameter_name VARCHAR(100) NOT NULL,
    parameter_code VARCHAR(50),
    unit_of_measurement VARCHAR(50),
    dmi_specified BOOLEAN DEFAULT TRUE,
    minimum_acceptable_value DECIMAL(10, 2),
    maximum_acceptable_value DECIMAL(10, 2),
    grade_a_min DECIMAL(10, 2),
    grade_a_max DECIMAL(10, 2),
    grade_b_min DECIMAL(10, 2),
    grade_b_max DECIMAL(10, 2),
    grade_c_min DECIMAL(10, 2),
    grade_c_max DECIMAL(10, 2),
    rejection_threshold DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (commodity_id) REFERENCES commodities(commodity_id),
    INDEX idx_commodity_id (commodity_id)
);

CREATE TABLE assay_reports (
    assay_id INT PRIMARY KEY AUTO_INCREMENT,
    lot_id INT NOT NULL,
    assessor_id INT NOT NULL,
    qc_lab_id INT NOT NULL,
    assay_date DATETIME NOT NULL,
    assay_time TIME,
    test_location VARCHAR(255),
    sample_size_quantity DECIMAL(10, 2),
    sample_size_unit VARCHAR(20),
    overall_quality_grade VARCHAR(10),
    assay_status ENUM('pending', 'in_progress', 'completed', 'rejected_sample') DEFAULT 'in_progress',
    sample_condition_remarks VARCHAR(500),
    color_code VARCHAR(50),
    odor_remarks VARCHAR(255),
    temperature_celsius DECIMAL(5, 2),
    humidity_percentage DECIMAL(5, 2),
    test_results_json JSON,
    overall_remarks VARCHAR(1000),
    approved_by_user_id INT,
    approval_date DATETIME,
    assay_fee DECIMAL(10, 2),
    fee_status ENUM('paid', 'pending', 'waived') DEFAULT 'pending',
    certificate_issued BOOLEAN DEFAULT TRUE,
    certificate_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lot_id) REFERENCES lots(lot_id),
    FOREIGN KEY (assessor_id) REFERENCES quality_assessors(assessor_id),
    FOREIGN KEY (qc_lab_id) REFERENCES qc_labs(lab_id),
    FOREIGN KEY (approved_by_user_id) REFERENCES users(user_id),
    INDEX idx_lot_id (lot_id),
    INDEX idx_assay_date (assay_date),
    INDEX idx_assay_status (assay_status)
);

CREATE TABLE assay_parameters (
    assay_param_id INT PRIMARY KEY AUTO_INCREMENT,
    assay_id INT NOT NULL,
    parameter_id INT NOT NULL,
    measured_value DECIMAL(10, 2) NOT NULL,
    grade_assigned VARCHAR(10),
    pass_fail ENUM('pass', 'fail', 'warning') DEFAULT 'pass',
    remarks VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assay_id) REFERENCES assay_reports(assay_id) ON DELETE CASCADE,
    FOREIGN KEY (parameter_id) REFERENCES quality_parameters(parameter_id),
    INDEX idx_assay_id (assay_id)
);

-- ============================================================================
-- 7. AUCTION & E-BIDDING (ENHANCED)
-- ============================================================================

CREATE TABLE auction_sessions (
    auction_id INT PRIMARY KEY AUTO_INCREMENT,
    auction_code VARCHAR(50) UNIQUE NOT NULL,
    mandi_id INT NOT NULL,
    auction_date DATE NOT NULL,
    auction_start_time TIME NOT NULL,
    auction_end_time TIME NOT NULL,
    auction_type ENUM('live', 'sealed_bid', 'reverse_auction', 'dutch_auction') NOT NULL,
    auction_status ENUM('scheduled', 'ongoing', 'paused', 'completed', 'cancelled') DEFAULT 'scheduled',
    total_lots_in_auction INT,
    auctioneer_user_id INT NOT NULL,
    e_auction_system_used VARCHAR(100),
    bidding_platform VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mandi_id) REFERENCES mandis(mandi_id),
    FOREIGN KEY (auctioneer_user_id) REFERENCES users(user_id),
    INDEX idx_auction_code (auction_code),
    INDEX idx_auction_date (auction_date),
    INDEX idx_mandi_id (mandi_id)
);

CREATE TABLE auction_lots (
    auction_lot_id INT PRIMARY KEY AUTO_INCREMENT,
    auction_id INT NOT NULL,
    lot_id INT NOT NULL,
    lot_sequence_number INT,
    estimated_value DECIMAL(15, 2),
    reserve_price DECIMAL(15, 2),
    opening_bid DECIMAL(15, 2),
    bid_increment DECIMAL(15, 2),
    auction_lot_status ENUM('pending', 'called', 'in_bidding', 'sold', 'unsold', 'withdrawn', 'passed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auction_sessions(auction_id),
    FOREIGN KEY (lot_id) REFERENCES lots(lot_id),
    INDEX idx_auction_id (auction_id),
    INDEX idx_lot_id (lot_id)
);

CREATE TABLE bids (
    bid_id INT PRIMARY KEY AUTO_INCREMENT,
    auction_lot_id INT NOT NULL,
    bidder_user_id INT NOT NULL,
    bid_amount DECIMAL(15, 2) NOT NULL,
    bid_timestamp DATETIME NOT NULL,
    bid_status ENUM('active', 'outbid', 'rejected', 'accepted') DEFAULT 'active',
    bid_number INT,
    device_type ENUM('web', 'mobile_app', 'proxy_bidding', 'phone_bidding') DEFAULT 'web',
    ip_address VARCHAR(50),
    encryption_used BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_lot_id) REFERENCES auction_lots(auction_lot_id),
    FOREIGN KEY (bidder_user_id) REFERENCES users(user_id),
    INDEX idx_auction_lot_id (auction_lot_id),
    INDEX idx_bidder_user_id (bidder_user_id),
    INDEX idx_bid_timestamp (bid_timestamp)
);

CREATE TABLE auction_results (
    result_id INT PRIMARY KEY AUTO_INCREMENT,
    auction_lot_id INT NOT NULL,
    winning_bid_id INT NOT NULL,
    buyer_user_id INT NOT NULL,
    seller_farmer_id INT,
    seller_fpo_id INT,
    seller_cooperative_id INT,
    final_sale_price DECIMAL(15, 2) NOT NULL,
    price_per_unit DECIMAL(15, 2),
    total_quantity_sold DECIMAL(15, 2),
    auction_completion_time DATETIME,
    result_status ENUM('completed', 'disputed', 'cancelled') DEFAULT 'completed',
    buyer_notes VARCHAR(500),
    buyer_rating INT,
    seller_rating INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_lot_id) REFERENCES auction_lots(auction_lot_id),
    FOREIGN KEY (winning_bid_id) REFERENCES bids(bid_id),
    FOREIGN KEY (buyer_user_id) REFERENCES users(user_id),
    FOREIGN KEY (seller_farmer_id) REFERENCES farmers(farmer_id),
    FOREIGN KEY (seller_fpo_id) REFERENCES fpos(fpo_id),
    FOREIGN KEY (seller_cooperative_id) REFERENCES cooperatives(cooperative_id),
    INDEX idx_auction_lot_id (auction_lot_id),
    INDEX idx_buyer_user_id (buyer_user_id)
);

-- ============================================================================
-- 8. WEIGHMENT (SAME AS BEFORE)
-- ============================================================================

CREATE TABLE weighment_bridges (
    bridge_id INT PRIMARY KEY AUTO_INCREMENT,
    mandi_id INT NOT NULL,
    bridge_name VARCHAR(100),
    bridge_code VARCHAR(50) UNIQUE,
    location VARCHAR(255),
    weighing_capacity_ton DECIMAL(10, 2),
    accuracy_tolerance_kg DECIMAL(5, 2),
    last_calibration_date DATE,
    next_calibration_due DATE,
    is_automatic BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mandi_id) REFERENCES mandis(mandi_id),
    INDEX idx_mandi_id (mandi_id)
);

CREATE TABLE weighment_records (
    weighment_id INT PRIMARY KEY AUTO_INCREMENT,
    lot_id INT NOT NULL,
    auction_result_id INT,
    bridge_id INT NOT NULL,
    weighment_date DATETIME NOT NULL,
    gross_weight_kg DECIMAL(15, 2) NOT NULL,
    tare_weight_kg DECIMAL(15, 2),
    net_weight_kg DECIMAL(15, 2) NOT NULL,
    weighment_operator_user_id INT,
    verification_user_id INT,
    weighment_status ENUM('pending', 'in_progress', 'completed', 'disputed') DEFAULT 'in_progress',
    weighment_remarks VARCHAR(500),
    weight_discrepancy_kg DECIMAL(10, 2),
    discrepancy_notes VARCHAR(500),
    verification_timestamp DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lot_id) REFERENCES lots(lot_id),
    FOREIGN KEY (auction_result_id) REFERENCES auction_results(result_id),
    FOREIGN KEY (bridge_id) REFERENCES weighment_bridges(bridge_id),
    FOREIGN KEY (weighment_operator_user_id) REFERENCES users(user_id),
    FOREIGN KEY (verification_user_id) REFERENCES users(user_id),
    INDEX idx_lot_id (lot_id),
    INDEX idx_weighment_date (weighment_date),
    INDEX idx_weighment_status (weighment_status)
);

-- ============================================================================
-- 9. INVOICING & PAYMENTS (ENHANCED WITH ePayment)
-- ============================================================================

CREATE TABLE invoices (
    invoice_id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    auction_result_id INT,
    advance_supply_demand_matching_id INT,
    enwr_trade_id INT,
    issuer_trader_id INT,
    receiver_farmer_id INT,
    receiver_fpo_id INT,
    receiver_cooperative_id INT,
    issue_date DATE NOT NULL,
    due_date DATE,
    invoice_status ENUM('draft', 'issued', 'sent', 'viewed', 'partially_paid', 'paid', 
                        'overdue', 'cancelled') DEFAULT 'draft',
    gross_amount DECIMAL(15, 2) NOT NULL,
    sgst_percentage DECIMAL(5, 2),
    sgst_amount DECIMAL(15, 2),
    cgst_percentage DECIMAL(5, 2),
    cgst_amount DECIMAL(15, 2),
    igst_percentage DECIMAL(5, 2),
    igst_amount DECIMAL(15, 2),
    other_charges DECIMAL(15, 2),
    discount_amount DECIMAL(15, 2),
    net_amount DECIMAL(15, 2) NOT NULL,
    paid_amount DECIMAL(15, 2) DEFAULT 0,
    remaining_amount DECIMAL(15, 2),
    payment_reference VARCHAR(100),
    description VARCHAR(1000),
    notes VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_result_id) REFERENCES auction_results(result_id),
    FOREIGN KEY (issuer_trader_id) REFERENCES traders(trader_id),
    FOREIGN KEY (receiver_farmer_id) REFERENCES farmers(farmer_id),
    FOREIGN KEY (receiver_fpo_id) REFERENCES fpos(fpo_id),
    FOREIGN KEY (receiver_cooperative_id) REFERENCES cooperatives(cooperative_id),
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_invoice_status (invoice_status),
    INDEX idx_issue_date (issue_date)
);

CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_id INT NOT NULL,
    payment_date DATE NOT NULL,
    payment_amount DECIMAL(15, 2) NOT NULL,
    payment_method ENUM('bank_transfer', 'cash', 'check', 'digital_wallet', 'credit_card', 
                        'bhim', 'upi', 'rtgs', 'neft') NOT NULL,
    reference_number VARCHAR(100),
    transaction_id VARCHAR(100) UNIQUE,
    paying_user_id INT NOT NULL,
    receiving_user_id INT,
    payment_status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
    bank_name VARCHAR(100),
    cheque_number VARCHAR(30),
    upi_id VARCHAR(50),
    payment_remarks VARCHAR(500),
    partial_cash_amount DECIMAL(15, 2),
    bank_transfer_amount DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id),
    FOREIGN KEY (paying_user_id) REFERENCES users(user_id),
    FOREIGN KEY (receiving_user_id) REFERENCES users(user_id),
    INDEX idx_invoice_id (invoice_id),
    INDEX idx_payment_date (payment_date),
    INDEX idx_payment_status (payment_status),
    INDEX idx_transaction_id (transaction_id)
);

-- ============================================================================
-- 10. TRANSIT & LOGISTICS (ENHANCED WITH KISAN RATH)
-- ============================================================================

CREATE TABLE logistics_providers (
    logistics_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    provider_name VARCHAR(255) NOT NULL,
    provider_type ENUM('individual', 'company', 'kisan_rath', 'cooperative') NOT NULL,
    registration_number VARCHAR(50),
    state VARCHAR(100),
    district VARCHAR(100),
    total_vehicles INT,
    service_coverage_area VARCHAR(1000),
    logistics_status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE vehicles (
    vehicle_id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_registration_number VARCHAR(30) UNIQUE NOT NULL,
    vehicle_type ENUM('truck', 'tempu', 'auto', 'tractor_trolley', 'container', 'tanker', 'refrigerated') NOT NULL,
    vehicle_owner_user_id INT NOT NULL,
    logistics_provider_id INT,
    vehicle_owner_name VARCHAR(255),
    driver_name VARCHAR(255),
    driver_license_number VARCHAR(30),
    driver_phone VARCHAR(20),
    carrying_capacity_ton DECIMAL(10, 2),
    vehicle_status ENUM('active', 'inactive', 'under_maintenance', 'suspended') DEFAULT 'active',
    registration_expiry_date DATE,
    fitness_certificate_expiry_date DATE,
    insurance_expiry_date DATE,
    pollution_certificate_expiry_date DATE,
    last_inspection_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_owner_user_id) REFERENCES users(user_id),
    FOREIGN KEY (logistics_provider_id) REFERENCES logistics_providers(logistics_id),
    INDEX idx_vehicle_registration_number (vehicle_registration_number)
);

CREATE TABLE epermits (
    epermit_id INT PRIMARY KEY AUTO_INCREMENT,
    epermit_number VARCHAR(50) UNIQUE NOT NULL,
    lot_id INT NOT NULL,
    auction_result_id INT,
    vehicle_id INT NOT NULL,
    consignor_farmer_id INT,
    consignor_fpo_id INT,
    consignee_trader_id INT,
    origin_mandi_id INT NOT NULL,
    destination_mandi_id INT,
    destination_location VARCHAR(500),
    permit_issued_date DATETIME NOT NULL,
    permit_valid_from DATE,
    permit_valid_until DATE,
    commodity_id INT NOT NULL,
    quantity DECIMAL(15, 2),
    unit_of_measurement VARCHAR(20),
    transport_cost DECIMAL(15, 2),
    permit_status ENUM('issued', 'in_transit', 'delivered', 'cancelled', 'expired') DEFAULT 'issued',
    route_description VARCHAR(1000),
    estimated_transit_time_hours INT,
    actual_departure_datetime DATETIME,
    actual_arrival_datetime DATETIME,
    issued_by_user_id INT NOT NULL,
    gps_tracking_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lot_id) REFERENCES lots(lot_id),
    FOREIGN KEY (auction_result_id) REFERENCES auction_results(result_id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id),
    FOREIGN KEY (consignor_farmer_id) REFERENCES farmers(farmer_id),
    FOREIGN KEY (consignor_fpo_id) REFERENCES fpos(fpo_id),
    FOREIGN KEY (consignee_trader_id) REFERENCES traders(trader_id),
    FOREIGN KEY (origin_mandi_id) REFERENCES mandis(mandi_id),
    FOREIGN KEY (destination_mandi_id) REFERENCES mandis(mandi_id),
    FOREIGN KEY (commodity_id) REFERENCES commodities(commodity_id),
    FOREIGN KEY (issued_by_user_id) REFERENCES users(user_id),
    INDEX idx_epermit_number (epermit_number),
    INDEX idx_lot_id (lot_id),
    INDEX idx_permit_status (permit_status)
);

CREATE TABLE transit_tracking (
    tracking_id INT PRIMARY KEY AUTO_INCREMENT,
    epermit_id INT NOT NULL,
    tracking_timestamp DATETIME NOT NULL,
    location_name VARCHAR(500),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    tracked_by_user_id INT,
    tracking_method ENUM('gps', 'manual', 'checkpoint_scan', 'sms_alert') DEFAULT 'gps',
    vehicle_speed_kmph DECIMAL(5, 1),
    remarks VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (epermit_id) REFERENCES epermits(epermit_id) ON DELETE CASCADE,
    FOREIGN KEY (tracked_by_user_id) REFERENCES users(user_id),
    INDEX idx_epermit_id (epermit_id),
    INDEX idx_tracking_timestamp (tracking_timestamp)
);

-- ============================================================================
-- 11. PRICE DISSEMINATION & MARKET INTELLIGENCE
-- ============================================================================

CREATE TABLE daily_market_prices (
    price_id INT PRIMARY KEY AUTO_INCREMENT,
    mandi_id INT NOT NULL,
    commodity_id INT NOT NULL,
    price_date DATE NOT NULL,
    opening_price DECIMAL(15, 2),
    closing_price DECIMAL(15, 2),
    highest_price DECIMAL(15, 2),
    lowest_price DECIMAL(15, 2),
    average_price DECIMAL(15, 2),
    weighted_average_price DECIMAL(15, 2),
    total_quantity_traded DECIMAL(15, 2),
    total_sales_value DECIMAL(20, 2),
    number_of_transactions INT,
    price_change_percentage DECIMAL(10, 4),
    demand_level ENUM('low', 'medium', 'high', 'very_high') DEFAULT 'medium',
    supply_level ENUM('low', 'medium', 'high', 'very_high') DEFAULT 'medium',
    price_trend ENUM('increasing', 'decreasing', 'stable') DEFAULT 'stable',
    modal_price DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mandi_id) REFERENCES mandis(mandi_id),
    FOREIGN KEY (commodity_id) REFERENCES commodities(commodity_id),
    INDEX idx_price_date (price_date),
    INDEX idx_mandi_commodity (mandi_id, commodity_id),
    UNIQUE KEY unique_price_record (mandi_id, commodity_id, price_date)
);

-- Agmarknet Price Integration
CREATE TABLE agmarknet_price_sync (
    sync_id INT PRIMARY KEY AUTO_INCREMENT,
    mandi_id INT,
    commodity_id INT,
    agmarknet_price DECIMAL(15, 2),
    enam_price DECIMAL(15, 2),
    price_difference DECIMAL(15, 2),
    sync_date DATE,
    sync_status ENUM('synced', 'variance', 'not_available') DEFAULT 'synced',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mandi_id) REFERENCES mandis(mandi_id),
    FOREIGN KEY (commodity_id) REFERENCES commodities(commodity_id),
    INDEX idx_sync_date (sync_date)
);

-- Weather Integration
CREATE TABLE weather_forecasts (
    forecast_id INT PRIMARY KEY AUTO_INCREMENT,
    mandi_id INT NOT NULL,
    forecast_date DATE NOT NULL,
    min_temperature_celsius DECIMAL(5, 2),
    max_temperature_celsius DECIMAL(5, 2),
    humidity_percentage INT,
    rainfall_mm DECIMAL(5, 2),
    wind_speed_kmph DECIMAL(5, 2),
    weather_condition VARCHAR(100),
    agriculture_impact VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mandi_id) REFERENCES mandis(mandi_id),
    INDEX idx_forecast_date (forecast_date),
    INDEX idx_mandi_id (mandi_id)
);

-- ============================================================================
-- 12. ANALYTICS & REPORTING
-- ============================================================================

CREATE TABLE farmer_performance_metrics (
    metric_id INT PRIMARY KEY AUTO_INCREMENT,
    farmer_id INT,
    fpo_id INT,
    month_year DATE,
    total_lots_sold INT,
    average_price_received DECIMAL(15, 2),
    total_revenue DECIMAL(20, 2),
    total_quantity_sold DECIMAL(15, 2),
    average_quality_grade VARCHAR(10),
    on_time_delivery_percentage DECIMAL(5, 2),
    rating_score DECIMAL(3, 2),
    repeat_buyer_count INT,
    dispute_count INT,
    payment_default_count INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmers(farmer_id),
    FOREIGN KEY (fpo_id) REFERENCES fpos(fpo_id),
    INDEX idx_farmer_id (farmer_id),
    INDEX idx_month_year (month_year)
);

CREATE TABLE buyer_performance_metrics (
    metric_id INT PRIMARY KEY AUTO_INCREMENT,
    trader_id INT NOT NULL,
    month_year DATE,
    total_purchases INT,
    total_amount_spent DECIMAL(20, 2),
    average_purchase_value DECIMAL(15, 2),
    payment_on_time_percentage DECIMAL(5, 2),
    rating_score DECIMAL(3, 2),
    supplier_count INT,
    return_rate_percentage DECIMAL(5, 2),
    dispute_count INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trader_id) REFERENCES traders(trader_id),
    INDEX idx_trader_id (trader_id),
    INDEX idx_month_year (month_year)
);

CREATE TABLE market_statistics (
    stat_id INT PRIMARY KEY AUTO_INCREMENT,
    stat_date DATE NOT NULL,
    mandi_id INT,
    total_farmers_active INT,
    total_fpos_active INT,
    total_cooperatives_active INT,
    total_traders_active INT,
    total_lots_registered INT,
    total_lots_sold INT,
    total_unsold_lots INT,
    total_value_traded DECIMAL(20, 2),
    average_lot_value DECIMAL(15, 2),
    total_commodities_traded INT,
    average_price_movement_percentage DECIMAL(10, 4),
    auction_efficiency_percentage DECIMAL(5, 2),
    payment_on_time_percentage DECIMAL(5, 2),
    disputes_raised INT,
    disputes_resolved INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mandi_id) REFERENCES mandis(mandi_id),
    INDEX idx_stat_date (stat_date),
    INDEX idx_mandi_id (mandi_id)
);

CREATE TABLE quality_statistics (
    stat_id INT PRIMARY KEY AUTO_INCREMENT,
    stat_date DATE NOT NULL,
    mandi_id INT,
    commodity_id INT,
    total_assayed INT,
    grade_a_percentage DECIMAL(5, 2),
    grade_b_percentage DECIMAL(5, 2),
    grade_c_percentage DECIMAL(5, 2),
    rejected_percentage DECIMAL(5, 2),
    average_moisture_content DECIMAL(5, 2),
    average_foreign_matter_percentage DECIMAL(5, 2),
    average_damage_percentage DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mandi_id) REFERENCES mandis(mandi_id),
    FOREIGN KEY (commodity_id) REFERENCES commodities(commodity_id),
    INDEX idx_stat_date (stat_date),
    INDEX idx_mandi_commodity (mandi_id, commodity_id)
);

-- ============================================================================
-- 13. NOTIFICATIONS & ALERTS
-- ============================================================================

CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    recipient_user_id INT NOT NULL,
    notification_type ENUM('auction_update', 'payment_due', 'delivery_alert', 'quality_alert', 
                          'price_alert', 'permit_expiry', 'advance_matched', 'warranty_alert', 'system_alert') NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id INT,
    title VARCHAR(255),
    message VARCHAR(1000),
    is_read BOOLEAN DEFAULT FALSE,
    read_timestamp DATETIME,
    delivery_channel ENUM('in_app', 'email', 'sms', 'push_notification', 'whatsapp') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_recipient_user_id (recipient_user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- ============================================================================
-- 14. AUDIT & COMPLIANCE
-- ============================================================================

CREATE TABLE audit_logs (
    audit_id INT PRIMARY KEY AUTO_INCREMENT,
    action_user_id INT,
    action_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    old_values JSON,
    new_values JSON,
    action_timestamp DATETIME NOT NULL,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (action_user_id) REFERENCES users(user_id),
    INDEX idx_action_timestamp (action_timestamp),
    INDEX idx_entity_type (entity_type),
    INDEX idx_action_user_id (action_user_id)
);

CREATE TABLE disputes (
    dispute_id INT PRIMARY KEY AUTO_INCREMENT,
    dispute_number VARCHAR(50) UNIQUE NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id INT,
    complainant_user_id INT NOT NULL,
    respondent_user_id INT NOT NULL,
    dispute_type ENUM('quality_dispute', 'payment_dispute', 'delivery_dispute', 'quantity_dispute', 
                      'delivery_delay', 'other') NOT NULL,
    dispute_amount DECIMAL(15, 2),
    description VARCHAR(1000),
    complaint_date DATETIME,
    dispute_status ENUM('open', 'under_investigation', 'resolved', 'closed', 'escalated') DEFAULT 'open',
    resolution_method ENUM('mutual_agreement', 'arbitration', 'court') DEFAULT 'mutual_agreement',
    resolution_date DATE,
    resolution_amount DECIMAL(15, 2),
    resolution_notes VARCHAR(1000),
    assigned_to_user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (complainant_user_id) REFERENCES users(user_id),
    FOREIGN KEY (respondent_user_id) REFERENCES users(user_id),
    FOREIGN KEY (assigned_to_user_id) REFERENCES users(user_id),
    INDEX idx_dispute_status (dispute_status),
    INDEX idx_complaint_date (complaint_date)
);

-- ============================================================================
-- 15. QUALITY ASSESSOR (SUPPORTING TABLE)
-- ============================================================================

CREATE TABLE quality_assessors (
    assessor_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    assessor_name VARCHAR(255) NOT NULL,
    certification_number VARCHAR(50) UNIQUE NOT NULL,
    certification_authority VARCHAR(255),
    certification_date DATE,
    certification_expiry_date DATE,
    qualifications VARCHAR(500),
    qc_lab_id INT,
    assigned_state VARCHAR(100),
    assigned_district VARCHAR(100),
    commodities_authorized VARCHAR(1000),
    status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (qc_lab_id) REFERENCES qc_labs(lab_id),
    INDEX idx_certification_number (certification_number)
);

-- ============================================================================
-- 16. MANDI STAFF
-- ============================================================================

CREATE TABLE mandi_staff (
    staff_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    mandi_id INT NOT NULL,
    staff_name VARCHAR(255) NOT NULL,
    designation VARCHAR(100),
    department ENUM('administration', 'auction', 'weighment', 'assaying', 'finance', 'it', 'logistics', 'entry_exit') NOT NULL,
    joining_date DATE,
    status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (mandi_id) REFERENCES mandis(mandi_id),
    INDEX idx_mandi_id (mandi_id)
);

-- ============================================================================
-- COMPREHENSIVE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_farmer_state_district ON farmers(state, district);
CREATE INDEX idx_trader_state_district ON traders(state, district);
CREATE INDEX idx_fpo_state_district ON fpos(state, district);
CREATE INDEX idx_lot_status_date ON lots(lot_status, created_at);
CREATE INDEX idx_auction_status_date ON auction_sessions(auction_status, auction_date);
CREATE INDEX idx_payment_status_date ON payments(payment_status, payment_date);
CREATE INDEX idx_epermit_status_date ON epermits(permit_status, permit_issued_date);
CREATE INDEX idx_advance_supply_status ON advance_supply(supply_status);
CREATE INDEX idx_advance_demand_status ON advance_demand(demand_status);
CREATE INDEX idx_warehouse_receipt_status ON warehouse_receipts(receipt_status);
CREATE INDEX idx_enwr_trade_status ON enwr_trades(trade_status);
CREATE INDEX idx_gate_entry_status ON gate_entries(entry_status);

-- ============================================================================
-- END OF ENHANCED SCHEMA
-- ============================================================================