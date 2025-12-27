-- Add selected_plan column to store_registration_requests
ALTER TABLE public.store_registration_requests
ADD COLUMN IF NOT EXISTS selected_plan TEXT;

-- Comment
COMMENT ON COLUMN public.store_registration_requests.selected_plan IS 'The subscription plan selected by the merchant (e.g., 1_month, 3_months, 12_months)';
