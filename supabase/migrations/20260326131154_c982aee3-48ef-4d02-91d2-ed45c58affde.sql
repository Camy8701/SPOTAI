
DROP POLICY "System can insert notifications" ON public.notifications;

CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to create notifications for all users when a post is published
CREATE OR REPLACE FUNCTION public.notify_on_new_post()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD IS NULL OR OLD.status != 'published') THEN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    SELECT ur.user_id, 'new_post', 'New Post: ' || NEW.title,
           COALESCE(NEW.excerpt, LEFT(NEW.content, 100)),
           '/post/' || NEW.slug
    FROM public.user_roles ur
    WHERE ur.user_id != COALESCE(NEW.author_id, '00000000-0000-0000-0000-000000000000'::uuid);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_on_new_post
  AFTER INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_new_post();
