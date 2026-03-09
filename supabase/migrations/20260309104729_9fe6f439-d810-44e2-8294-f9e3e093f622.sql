
-- Drop the old permissive INSERT policy on push_subscriptions
DROP POLICY IF EXISTS "Anyone can insert push subscriptions" ON public.push_subscriptions;

-- Create a new INSERT policy that validates user_id matches auth.uid() or is NULL
CREATE POLICY "Users can insert own push subscriptions"
ON public.push_subscriptions
FOR INSERT
TO public
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
