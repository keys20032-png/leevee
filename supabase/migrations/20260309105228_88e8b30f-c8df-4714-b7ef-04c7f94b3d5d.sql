
-- Recreate the feature_requests_public view with SECURITY INVOKER instead of SECURITY DEFINER
DROP VIEW IF EXISTS public.feature_requests_public;

CREATE VIEW public.feature_requests_public
WITH (security_invoker = true)
AS
SELECT
  id,
  title,
  description,
  category,
  status,
  vote_count,
  created_at,
  updated_at
FROM public.feature_requests;
