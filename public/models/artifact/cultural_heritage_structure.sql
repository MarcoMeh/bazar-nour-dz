-- =======================================================
-- DATABASE SCHEMA FOR CULTURAL HERITAGE MANAGEMENT SYSTEM
-- =======================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

----------------------------------------------------------
-- USERS TABLE (Admins + Normal Users)
----------------------------------------------------------
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL,     -- 'admin' or 'user'
    created_at TIMESTAMP DEFAULT NOW()
);

----------------------------------------------------------
-- ARTIFACT TYPES
----------------------------------------------------------
CREATE TABLE artifact_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

----------------------------------------------------------
-- MATERIALS (Material of the artifact)
----------------------------------------------------------
CREATE TABLE materials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

----------------------------------------------------------
-- HISTORICAL PERIODS
----------------------------------------------------------
CREATE TABLE historical_periods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

----------------------------------------------------------
-- PRESERVATION STATES (Storage condition)
----------------------------------------------------------
CREATE TABLE preservation_states (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

----------------------------------------------------------
-- RESTORATION METHODS
----------------------------------------------------------
CREATE TABLE restoration_methods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

----------------------------------------------------------
-- STORAGE LOCATIONS (Where the artifact is stored)
----------------------------------------------------------
CREATE TABLE storage_locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

----------------------------------------------------------
-- MAIN ARTIFACTS TABLE
----------------------------------------------------------
CREATE TABLE artifacts (
    id SERIAL PRIMARY KEY,
    artifact_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    artifact_type_id INTEGER REFERENCES artifact_types(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    material_id INTEGER REFERENCES materials(id),
    historical_period_id INTEGER REFERENCES historical_periods(id),
    preservation_state_id INTEGER REFERENCES preservation_states(id),
    restoration_date DATE,
    restoration_method_id INTEGER REFERENCES restoration_methods(id),
    storage_location_id INTEGER REFERENCES storage_locations(id),
    description TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

----------------------------------------------------------
-- ARTIFACT IMAGES (Multiple images per artifact)
----------------------------------------------------------
CREATE TABLE artifact_images (
    id SERIAL PRIMARY KEY,
    artifact_id INTEGER REFERENCES artifacts(id) ON DELETE CASCADE,
    image_path TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW()
);
