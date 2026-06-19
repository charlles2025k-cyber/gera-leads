CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  leads_used integer DEFAULT 0,
  period_start timestamp DEFAULT now(),
  created_at timestamp DEFAULT now()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_type text;
