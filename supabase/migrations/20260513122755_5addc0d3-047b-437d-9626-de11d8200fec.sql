CREATE TABLE public.health_summaries (
  user_id UUID NOT NULL PRIMARY KEY,
  summary TEXT NOT NULL,
  model TEXT,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.health_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own summary all"
ON public.health_summaries
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins read summaries"
ON public.health_summaries
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));