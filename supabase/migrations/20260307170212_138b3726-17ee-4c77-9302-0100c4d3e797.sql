
-- Create image_library_items table
CREATE TABLE public.image_library_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  collection TEXT NOT NULL DEFAULT 'default',
  orientation TEXT NOT NULL DEFAULT 'landscape',
  tags TEXT[] DEFAULT '{}'::TEXT[],
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.image_library_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Image library items viewable by everyone" ON public.image_library_items FOR SELECT USING (true);
CREATE POLICY "Admins can insert image library items" ON public.image_library_items FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update image library items" ON public.image_library_items FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete image library items" ON public.image_library_items FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Create prompt_library_items table
CREATE TABLE public.prompt_library_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  prompt_text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  model TEXT NOT NULL DEFAULT 'any',
  difficulty TEXT NOT NULL DEFAULT 'medium',
  tags TEXT[] DEFAULT '{}'::TEXT[],
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.prompt_library_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prompt library items viewable by everyone" ON public.prompt_library_items FOR SELECT USING (true);
CREATE POLICY "Admins can insert prompt library items" ON public.prompt_library_items FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update prompt library items" ON public.prompt_library_items FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete prompt library items" ON public.prompt_library_items FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
