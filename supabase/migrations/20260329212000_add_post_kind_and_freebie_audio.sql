alter table public.blog_posts
  add column if not exists post_kind text not null default 'blog_post';

update public.blog_posts
set post_kind = case
  when homepage_section = 'featured_stories' or category = 'story' then 'ai_story'
  when homepage_section = 'news_articles' or category = 'news' then 'news_article'
  when homepage_section = 'best_ai_tools' then 'ai_tool'
  else 'blog_post'
end
where post_kind is null
   or post_kind = 'blog_post';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'blog_posts_post_kind_check'
  ) then
    alter table public.blog_posts
      add constraint blog_posts_post_kind_check
      check (post_kind in ('blog_post', 'ai_story', 'news_article', 'ai_tool'));
  end if;
end $$;

alter table public.freebies
  add column if not exists audio_url text;
