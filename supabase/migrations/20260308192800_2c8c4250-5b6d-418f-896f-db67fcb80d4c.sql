
-- Feature requests table
CREATE TABLE public.feature_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'open',
  vote_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Votes table (one vote per session per request)
CREATE TABLE public.feature_request_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_request_id uuid NOT NULL REFERENCES public.feature_requests(id) ON DELETE CASCADE,
  session_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (feature_request_id, session_id)
);

-- Indexes
CREATE INDEX idx_feature_requests_session ON public.feature_requests(session_id);
CREATE INDEX idx_feature_requests_votes ON public.feature_requests(vote_count DESC);
CREATE INDEX idx_feature_requests_category ON public.feature_requests(category);
CREATE INDEX idx_feature_request_votes_session ON public.feature_request_votes(session_id);
CREATE INDEX idx_feature_request_votes_request ON public.feature_request_votes(feature_request_id);

-- Enable RLS
ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_request_votes ENABLE ROW LEVEL SECURITY;

-- RLS policies for feature_requests (public read, session-based write)
CREATE POLICY "Anyone can read feature requests" ON public.feature_requests FOR SELECT USING (true);
CREATE POLICY "Users can insert feature requests" ON public.feature_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own feature requests" ON public.feature_requests FOR UPDATE USING (true);

-- RLS policies for votes
CREATE POLICY "Anyone can read votes" ON public.feature_request_votes FOR SELECT USING (true);
CREATE POLICY "Users can insert votes" ON public.feature_request_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete own votes" ON public.feature_request_votes FOR DELETE USING (true);

-- Function to update vote count
CREATE OR REPLACE FUNCTION public.update_vote_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feature_requests SET vote_count = vote_count + 1, updated_at = now() WHERE id = NEW.feature_request_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feature_requests SET vote_count = vote_count - 1, updated_at = now() WHERE id = OLD.feature_request_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_vote_count
AFTER INSERT OR DELETE ON public.feature_request_votes
FOR EACH ROW EXECUTE FUNCTION public.update_vote_count();
