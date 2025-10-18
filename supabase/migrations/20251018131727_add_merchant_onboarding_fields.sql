/*
  # Add merchant onboarding fields

  1. New Columns
    - `whatsapp` (text): WhatsApp contact number
    - `opening_hours` (jsonb): Store opening hours as JSON
    - `onboarding_completed` (boolean): Track merchant onboarding status
    
  2. Updates
    - Add default values
    - No data loss
*/

-- Add WhatsApp contact
ALTER TABLE merchants
ADD COLUMN IF NOT EXISTS whatsapp text;

-- Add opening hours as JSONB
ALTER TABLE merchants
ADD COLUMN IF NOT EXISTS opening_hours jsonb DEFAULT '{}'::jsonb;

-- Add onboarding tracking
ALTER TABLE merchants
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Create index
CREATE INDEX IF NOT EXISTS idx_merchants_onboarding_completed 
ON merchants(onboarding_completed);
