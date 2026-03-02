
-- Add audio_url for optional audio files on posts
ALTER TABLE public.blog_posts ADD COLUMN audio_url text;

-- Add homepage_section to control where posts appear on the homepage
-- Values: 'hero', 'featured_stories', 'featured_collections', 'best_ai_tools', 'news_articles', 'none'
ALTER TABLE public.blog_posts ADD COLUMN homepage_section text DEFAULT 'none';
