-- Image library items
CREATE TABLE public.image_library_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  collection TEXT NOT NULL DEFAULT 'default',
  orientation TEXT NOT NULL DEFAULT 'landscape' CHECK (orientation IN ('landscape', 'portrait', 'square')),
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.image_library_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Image library items are viewable by everyone"
ON public.image_library_items FOR SELECT
USING (true);

CREATE POLICY "Admins can insert image library items"
ON public.image_library_items FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update image library items"
ON public.image_library_items FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete image library items"
ON public.image_library_items FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_image_library_items_category ON public.image_library_items (category);
CREATE INDEX idx_image_library_items_collection ON public.image_library_items (collection);
CREATE INDEX idx_image_library_items_featured ON public.image_library_items (is_featured);

CREATE TRIGGER update_image_library_items_updated_at
BEFORE UPDATE ON public.image_library_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Prompt library items
CREATE TABLE public.prompt_library_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  prompt_text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  model TEXT NOT NULL DEFAULT 'any',
  difficulty TEXT NOT NULL DEFAULT 'medium',
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.prompt_library_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prompt library items are viewable by everyone"
ON public.prompt_library_items FOR SELECT
USING (true);

CREATE POLICY "Admins can insert prompt library items"
ON public.prompt_library_items FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update prompt library items"
ON public.prompt_library_items FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete prompt library items"
ON public.prompt_library_items FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_prompt_library_items_category ON public.prompt_library_items (category);
CREATE INDEX idx_prompt_library_items_model ON public.prompt_library_items (model);
CREATE INDEX idx_prompt_library_items_featured ON public.prompt_library_items (is_featured);

CREATE TRIGGER update_prompt_library_items_updated_at
BEFORE UPDATE ON public.prompt_library_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
