
DROP POLICY "Allow anonymous inserts" ON public.contact_submissions;

CREATE POLICY "Allow anonymous inserts with validation"
ON public.contact_submissions
FOR INSERT
TO anon
WITH CHECK (
  length(name) > 0 AND length(name) <= 100
  AND length(email) > 0 AND length(email) <= 255
  AND length(message) > 0 AND length(message) <= 1000
);
