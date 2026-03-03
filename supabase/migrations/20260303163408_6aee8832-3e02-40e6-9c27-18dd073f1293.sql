
-- Create freebies table for ebooks and podcasts
CREATE TABLE public.freebies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('ebook', 'podcast')),
  category TEXT NOT NULL DEFAULT 'general',
  file_url TEXT NOT NULL,
  cover_image TEXT,
  file_size BIGINT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.freebies ENABLE ROW LEVEL SECURITY;

-- Everyone can view freebies
CREATE POLICY "Freebies are viewable by everyone"
ON public.freebies FOR SELECT
USING (true);

-- Only admins can insert
CREATE POLICY "Admins can insert freebies"
ON public.freebies FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update
CREATE POLICY "Admins can update freebies"
ON public.freebies FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete
CREATE POLICY "Admins can delete freebies"
ON public.freebies FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_freebies_updated_at
BEFORE UPDATE ON public.freebies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
