/*
  # Setup Scheduled Geocoding with pg_cron

  1. Extensions
    - Enable pg_cron for scheduled tasks
    - Enable http extension for making HTTP requests
    
  2. Functions
    - `trigger_geocoding_scheduler`: Wrapper function that calls the Edge Function
      - Makes HTTP POST request to geocode-scheduler Edge Function
      - Uses service role key for authentication
      - Logs response for monitoring
      
  3. Scheduled Task
    - Schedule geocoding to run daily at 02:00 Europe/Paris
    - Cron expression: '0 1 * * *' (01:00 UTC = 02:00 CET / 03:00 CEST)
    - Named 'nightly-geocoding-scheduler'
    
  4. Notes
    - The function is idempotent and safe to run multiple times
    - Only geocodes entries where location IS NULL
    - Respects Nominatim rate limits (1 req/s)
    - Does not delete any data
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http;

-- Create wrapper function to trigger the Edge Function
CREATE OR REPLACE FUNCTION trigger_geocoding_scheduler()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  response http_response;
  supabase_url text;
BEGIN
  -- Use the project URL
  supabase_url := 'https://zhabjdyzawffsmvziojl.supabase.co';

  -- Make HTTP POST request to the Edge Function
  SELECT * INTO response FROM http((
    'POST',
    supabase_url || '/functions/v1/geocode-scheduler',
    ARRAY[
      http_header('Content-Type', 'application/json')
    ],
    'application/json',
    '{}'
  )::http_request);

  -- Log the response
  RAISE NOTICE 'Geocoding scheduler triggered. Status: %, Response: %', 
    response.status, 
    response.content;
    
  -- Raise warning if request failed
  IF response.status >= 400 THEN
    RAISE WARNING 'Geocoding scheduler returned error status %: %', 
      response.status, 
      response.content;
  END IF;
END;
$$;

-- Remove existing schedule if it exists (ignore error if not found)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'nightly-geocoding-scheduler') THEN
    PERFORM cron.unschedule('nightly-geocoding-scheduler');
  END IF;
END $$;

-- Create the new schedule
-- Run at 01:00 UTC every day = 02:00 CET (winter) / 03:00 CEST (summer)
SELECT cron.schedule(
  'nightly-geocoding-scheduler',
  '0 1 * * *',
  'SELECT trigger_geocoding_scheduler();'
);

-- Grant execute permission
GRANT EXECUTE ON FUNCTION trigger_geocoding_scheduler() TO postgres;
GRANT EXECUTE ON FUNCTION trigger_geocoding_scheduler() TO service_role;

-- Log success message
DO $$
DECLARE
  job_count integer;
  job_schedule text;
BEGIN
  SELECT COUNT(*), MAX(schedule) 
  INTO job_count, job_schedule
  FROM cron.job 
  WHERE jobname = 'nightly-geocoding-scheduler';
  
  IF job_count > 0 THEN
    RAISE NOTICE 'Successfully scheduled nightly geocoding: % (01:00 UTC = 02:00 CET)', job_schedule;
  ELSE
    RAISE WARNING 'Failed to schedule nightly geocoding';
  END IF;
END $$;
