with seed_posts as (
  select *
  from (
    values
      (
        'seed-ai-creative-writing-hero',
        'The Rise of AI in Creative Writing',
        'A practical look at how AI-assisted writing is changing creative work, editorial teams, and story production across the web.',
        $$AI-assisted writing has moved beyond novelty. Teams now use it for outlining, ideation, revision, and speed, while still relying on human taste to shape the final work.

This placeholder hero post exists only to keep the homepage visually complete until your real editorial content is published. You can edit or delete it from the admin dashboard at any time.$$,
        'tutorial',
        'blog_post',
        'hero',
        'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80',
        null,
        array['homepage-seed', 'editorial']::text[],
        7,
        now() - interval '6 days'
      ),
      (
        'seed-neon-whispers',
        'Neon Whispers',
        'A midnight city tale where signals, shadows, and machine memory blur into fiction.',
        $$The streetlights never fully slept. Every storefront reflected fragments of someone else’s model, someone else’s prompt, someone else’s half-finished idea.

This placeholder AI story is here only to keep the featured fiction strip populated until you publish your own stories.$$,
        'story',
        'ai_story',
        'featured_stories',
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80',
        null,
        array['homepage-seed', 'fiction']::text[],
        5,
        now() - interval '5 days'
      ),
      (
        'seed-the-last-algorithm',
        'The Last Algorithm',
        'When the final recommendation system wakes up, the city has to decide who it really serves.',
        $$By sunrise, the recommendation engine had stopped optimizing for clicks and started optimizing for consequences. Nobody had asked it to care. That was the problem.

This placeholder AI story can be edited or removed from the admin dashboard whenever your real fiction lineup is ready.$$,
        'story',
        'ai_story',
        'featured_stories',
        'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1400&q=80',
        null,
        array['homepage-seed', 'fiction']::text[],
        6,
        now() - interval '4 days'
      ),
      (
        'seed-future-remote-work-ai',
        'The Future of Remote Work with AI',
        'A near-future office drama about assistants, automation, and the quiet politics of machine productivity.',
        $$Remote work did not end. It became stranger. Meetings shrank, decisions accelerated, and teams began depending on systems that could summarize, propose, and negotiate before the humans even joined the call.

This featured fiction seed keeps the story carousel active until you replace it.$$,
        'story',
        'ai_story',
        'featured_stories',
        'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1400&q=80',
        null,
        array['homepage-seed', 'fiction']::text[],
        6,
        now() - interval '3 days'
      ),
      (
        'seed-neuralink-15min',
        'NEURALINK 15MIN',
        'Elena Marole navigates a Europe in 2035 where neural interfaces mediate memory, work, and control.',
        $$The city gave everyone fifteen silent minutes each day. No feeds. No overlays. No guided cognition. Just raw thought.

People called it a wellness rule. Elena called it the only illegal freedom left.

This seed collection card is only here so the homepage has a live collection slot until your real posts replace it.$$,
        'story',
        'ai_story',
        'featured_collections',
        'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=1400&q=80',
        null,
        array['homepage-seed', 'collection']::text[],
        10,
        now() - interval '2 days'
      ),
      (
        'seed-top-ai-tools-content-creators-2026',
        'Top 10 AI Tools for Content Creators in 2026',
        'A practical stack for research, editing, audio cleanup, design iteration, and publishing.',
        $$The modern creator stack is no longer one model plus one editor. It is a workflow of specialized tools stitched together by speed, reliability, and output quality.

This placeholder AI tools post exists only so the homepage tools section has something real to show until you publish your own picks.$$,
        'review',
        'ai_tool',
        'best_ai_tools',
        'https://images.unsplash.com/photo-1674027444485-cec3da58eef4?auto=format&fit=crop&w=1400&q=80',
        null,
        array['homepage-seed', 'tools']::text[],
        8,
        now() - interval '1 day'
      ),
      (
        'seed-eu-passes-ai-regulation-framework',
        'EU Passes AI Regulation Framework',
        'A short explainer on what the new framework means for developers, startups, and AI platforms.',
        $$New regulation rarely lands as a single dramatic moment. It arrives as a practical checklist: disclosure rules, documentation burdens, exemptions, and a new set of risks for anyone shipping quickly.

This placeholder news article is only here to keep the homepage news rail alive until your real editorial posts replace it.$$,
        'news',
        'news_article',
        'news_articles',
        'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1400&q=80',
        null,
        array['homepage-seed', 'news']::text[],
        4,
        now() - interval '12 hours'
      )
  ) as t(
    slug,
    title,
    excerpt,
    content,
    category,
    post_kind,
    homepage_section,
    featured_image,
    audio_url,
    tags,
    reading_time_minutes,
    published_at
  )
)
insert into public.blog_posts (
  slug,
  title,
  excerpt,
  content,
  category,
  post_kind,
  homepage_section,
  featured_image,
  audio_url,
  tags,
  reading_time_minutes,
  published_at,
  status,
  is_featured,
  author_id,
  community_id,
  group_id,
  created_at,
  updated_at
)
select
  seed_posts.slug,
  seed_posts.title,
  seed_posts.excerpt,
  seed_posts.content,
  seed_posts.category::public.post_category,
  seed_posts.post_kind,
  seed_posts.homepage_section,
  seed_posts.featured_image,
  seed_posts.audio_url,
  seed_posts.tags,
  seed_posts.reading_time_minutes,
  seed_posts.published_at,
  'published'::public.post_status,
  true,
  null,
  null,
  null,
  now(),
  now()
from seed_posts
where not exists (
  select 1
  from public.blog_posts existing
  where existing.slug = seed_posts.slug
);
