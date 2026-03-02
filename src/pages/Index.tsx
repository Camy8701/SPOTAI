import { Link } from "react-router-dom";
import { ArrowRight, Brain, Cpu, Sparkles, Zap, BookOpen, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Layout from "@/components/layout/Layout";

const featuredStories = [
  { id: 1, title: "The Rise of Autonomous AI Agents", excerpt: "How self-directed AI systems are reshaping industries and what it means for the future of work.", category: "story", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80" },
  { id: 2, title: "GPT-5 and the Next Frontier", excerpt: "A deep dive into the capabilities expected from the next generation of large language models.", category: "news", image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80" },
  { id: 3, title: "AI in Healthcare: Saving Lives", excerpt: "From diagnosis to drug discovery — how artificial intelligence is transforming medicine.", category: "story", image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80" },
  { id: 4, title: "Ethics of Machine Learning", excerpt: "Exploring the moral dimensions of algorithmic decision-making in our society.", category: "opinion", image: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=600&q=80" },
  { id: 5, title: "Robotics Meets Generative AI", excerpt: "When physical automation meets creative intelligence, the results are staggering.", category: "tutorial", image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80" },
  { id: 6, title: "The Open Source AI Revolution", excerpt: "How community-driven models are democratizing access to cutting-edge AI.", category: "review", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80" },
];

const aiTools = [
  { icon: Brain, title: "Neural Networks", desc: "Deep learning architectures powering modern AI" },
  { icon: Cpu, title: "Edge Computing", desc: "Running AI models on local devices" },
  { icon: Sparkles, title: "Generative AI", desc: "Creating text, images, code, and more" },
  { icon: Zap, title: "Real-time ML", desc: "Instant predictions at massive scale" },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 gradient-bg opacity-[0.06]" />
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <span className="mb-4 inline-block rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
              ✨ Your AI Knowledge Hub
            </span>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Discover the Future of{" "}
              <span className="gradient-text">Artificial Intelligence</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Stories, insights, and interactive content exploring the cutting edge of AI — from autonomous agents to creative machines.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/stories">
                <Button size="lg" className="gradient-bg text-primary-foreground hover:opacity-90">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Read Stories
                </Button>
              </Link>
              <Link to="/news">
                <Button size="lg" variant="outline">
                  <Newspaper className="mr-2 h-4 w-4" />
                  Latest News
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold">Featured Stories</h2>
              <p className="mt-2 text-muted-foreground">Hand-picked articles from our editors</p>
            </div>
            <Link to="/stories" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline md:flex">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredStories.map((story) => (
              <Card key={story.id} className="group overflow-hidden border-border bg-card transition-all hover:shadow-[var(--shadow-elevated)]">
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-5">
                  <span className="mb-2 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium capitalize text-primary">
                    {story.category}
                  </span>
                  <h3 className="mb-2 text-lg font-semibold leading-snug">{story.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{story.excerpt}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 text-center md:hidden">
            <Link to="/stories">
              <Button variant="outline">View all stories</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Tools Showcase */}
      <section className="border-y border-border bg-card py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold">AI Tools & Topics</h2>
            <p className="mt-2 text-muted-foreground">Deep dives into the technologies shaping tomorrow</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {aiTools.map((tool) => (
              <div
                key={tool.title}
                className="group rounded-xl border border-border bg-background p-6 text-center transition-all hover:border-primary/30 hover:shadow-[var(--shadow-card)]"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <tool.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-1 font-semibold">{tool.title}</h3>
                <p className="text-sm text-muted-foreground">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center shadow-[var(--shadow-card)]">
            <h2 className="mb-2 text-2xl font-bold">Stay in the Loop</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Get the latest AI stories and news delivered to your inbox weekly.
            </p>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <Input
                type="email"
                placeholder="your@email.com"
                className="flex-1"
              />
              <Button type="submit" className="gradient-bg text-primary-foreground hover:opacity-90">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
