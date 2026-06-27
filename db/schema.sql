-- DDL Schema for SmartCrop AI Platform (PostgreSQL Compatible)

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' NOT NULL, -- 'user', 'admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create Predictions table
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    n REAL NOT NULL,
    p REAL NOT NULL,
    k REAL NOT NULL,
    temperature REAL NOT NULL,
    humidity REAL NOT NULL,
    ph REAL NOT NULL,
    rainfall REAL NOT NULL,
    recommended_crop VARCHAR(100) NOT NULL,
    confidence REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create Datasets table
CREATE TABLE IF NOT EXISTS datasets (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(555) NOT NULL,
    record_count INTEGER NOT NULL,
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create TrainingLogs table
CREATE TABLE IF NOT EXISTS training_logs (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(255) NOT NULL,
    accuracy REAL NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'success', 'failed', 'running'
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create Settings table
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Insert default settings
INSERT INTO settings (key, value) VALUES ('model_version', '1.0.0') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('min_confidence_threshold', '0.70') ON CONFLICT (key) DO NOTHING;
