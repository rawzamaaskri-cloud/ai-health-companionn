-- Table de suivi des prises de médicaments
CREATE TABLE public.medication_intakes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prescription_id UUID NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  intake_date DATE NOT NULL DEFAULT CURRENT_DATE,
  slot TEXT NOT NULL DEFAULT 'morning', -- morning | noon | evening | night
  taken BOOLEAN NOT NULL DEFAULT true,
  taken_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (prescription_id, intake_date, slot)
);

CREATE INDEX idx_med_intakes_user_date ON public.medication_intakes (user_id, intake_date DESC);
CREATE INDEX idx_med_intakes_rx ON public.medication_intakes (prescription_id, intake_date DESC);

ALTER TABLE public.medication_intakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own intakes all"
ON public.medication_intakes
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins read intakes"
ON public.medication_intakes
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));