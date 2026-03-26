
CREATE OR REPLACE FUNCTION public.get_popular_posts()
RETURNS TABLE (
  id uuid,
  title text,
  slug text,
  excerpt text,
  category text,
  status text,
  published_at timestamptz,
  created_at timestamptz,
  featured_image text,
  like_count bigint,
  comment_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    bp.id,
    bp.title,
    bp.slug,
    bp.excerpt,
    bp.category::text,
    bp.status::text,
    bp.published_at,
    bp.created_at,
    bp.featured_image,
    COALESCE(l.cnt, 0) AS like_count,
    COALESCE(c.cnt, 0) AS comment_count
  FROM blog_posts bp
  LEFT JOIN (
    SELECT post_id, COUNT(*) AS cnt FROM likes WHERE post_id IS NOT NULL GROUP BY post_id
  ) l ON l.post_id = bp.id
  LEFT JOIN (
    SELECT post_id, COUNT(*) AS cnt FROM comments GROUP BY post_id
  ) c ON c.post_id = bp.id
  WHERE bp.status = 'published'
  ORDER BY bp.created_at DESC;
$$;
