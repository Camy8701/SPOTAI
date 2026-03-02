import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SectionNavigation from "@/components/SectionNavigation";
import AnimateInView from "@/components/AnimateInView";
import AutoScrollCarousel from "@/components/AutoScrollCarousel";

const carouselImages = [
  { src: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80", alt: "AI concept art 1" },
  { src: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80", alt: "AI concept art 2" },
  { src: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80", alt: "AI concept art 3" },
];

const featuredCollections = [
  {
    title: "NEURALINK 15MIN",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80",
    date: "December 20, 2024",
    description: "Elena Marole navigates a dystopian Europe in 2035 where Neuralink technology controls society.",
    category: "AI Fiction",
  },
  {
    title: "She used AI to steal my husband",
    image: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=600&q=80",
    date: "March 1, 2026",
    description: "A thrilling story about AI, relationships, and betrayal.",
    category: "AI Fiction",
  },
];

const staticAiTools = [
  {
    title: "ChatGPT - Your AI Assistant",
    description: "Engage in natural language conversations with an AI that understands and responds contextually.",
    category: "AI Chatbot",
    features: ["Natural Language", "Contextual Understanding", "Versatile Applications"],
    date: "March 2, 2026",
    url: "https://chat.openai.com",
  },
];

const newsArticles = [
  {
    title: "OpenAI Announces GPT-5 with Revolutionary Capabilities",
    excerpt: "The latest model promises unprecedented reasoning abilities and multimodal understanding.",
    category: "AI News",
    date: "March 1, 2026",
    author: "UTOPAI Team",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
  },
  {
    title: "EU Passes Comprehensive AI Regulation Framework",
    excerpt: "New regulations aim to balance innovation with safety in artificial intelligence development.",
    category: "Policy",
    date: "February 28, 2026",
    author: "UTOPAI Team",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80",
  },
  {
    title: "AI-Powered Drug Discovery Achieves Major Breakthrough",
    excerpt: "Machine learning models identify promising compounds for treating rare diseases.",
    category: "Healthcare",
    date: "February 27, 2026",
    author: "UTOPAI Team",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80",
  },
];

const Index = () => {
  return (
    <Layout>
      {/* Section Navigation */}
      <SectionNavigation />

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 flex items-center justify-center bg-background">
        <div className="container mx-auto px-4 text-center">
          <AnimateInView>
            <h1 className="font-semibold text-foreground tracking-tighter leading-none uppercase text-5xl md:text-7xl lg:text-8xl xl:text-9xl whitespace-nowrap">
              LATEST AI CHRONICLES
            </h1>
          </AnimateInView>
        </div>
      </section>

      {/* Featured Content - Hero Image */}
      <AnimateInView className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative aspect-video overflow-hidden rounded-lg group">
          <img
            src={featuredCollections[1]?.image || "/placeholder.svg"}
            alt="My Best Friend Used AI to Steal My Husband"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="absolute bottom-32 left-8 right-8 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-2xl">
              My Best Friend Used AI to Steal My Husband
            </h2>
            <p className="text-lg md:text-xl text-gray-200 drop-shadow-lg">
              A thrilling story of betrayal, technology, and the fight for love
            </p>
          </div>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4">
            <motion.button
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Read
            </motion.button>
            <motion.button
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Listen
            </motion.button>
          </div>
        </div>
      </AnimateInView>

      {/* Recent Winners Carousel */}
      <section
        className="py-16 bg-background border-t border-border"
        id="featured-stories"
      >
        <AnimateInView>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Featured AI Fictions</h2>
                <p className="text-muted-foreground">Curated collection of outstanding AI narratives</p>
              </div>
            </div>
            <AutoScrollCarousel images={carouselImages} speed={30} />
          </div>
        </AnimateInView>
      </section>

      {/* Featured Collections */}
      <section className="py-16 bg-secondary" id="featured-collections">
        <AnimateInView>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Featured Collection</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover captivating AI fictions that push the boundaries of creativity and imagination
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCollections.map((post, i) => (
                <div key={i} className="bg-card rounded-lg shadow-md overflow-hidden group cursor-pointer flex flex-col card-hover">
                  <div className="relative overflow-hidden h-64">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {post.category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        ⭐ Featured
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span>📅 {post.date}</span>
                        <span>•</span>
                        <span>⏱️ 15 min read</span>
                      </div>
                      <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors text-foreground mb-3">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground line-clamp-3">{post.description}</p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <motion.button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg flex-1"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Read
                      </motion.button>
                      <motion.button
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-medium shadow-lg"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Listen
                      </motion.button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/collections"
                  className="inline-flex items-center gap-3 text-blue-600 dark:text-blue-400 font-semibold hover:text-green-600 transition-colors"
                >
                  <span>Explore All Stories</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  >
                    <ArrowRight size={20} />
                  </motion.span>
                </Link>
              </motion.div>
            </div>
          </div>
        </AnimateInView>
      </section>

      {/* Digital Products */}
      <section className="py-16 bg-background" id="digital-products">
        <AnimateInView>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Digital Products</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover premium digital products crafted to enhance your AI journey
              </p>
            </div>
            <div className="text-center text-muted-foreground py-12 border border-dashed border-border rounded-lg">
              Coming soon — Digital products will be available here
            </div>
          </div>
        </AnimateInView>
      </section>

      {/* Best AI Tools */}
      <section className="py-16 bg-secondary" id="best-ai-tools">
        <AnimateInView>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-2">Best AI Tools</h2>
              <p className="text-muted-foreground">Discover the most innovative AI tools and solutions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {staticAiTools.map((tool, i) => (
                <div key={i} className="bg-card rounded-lg shadow-md overflow-hidden flex flex-col card-hover">
                  <div className="relative h-48 bg-secondary flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-muted-foreground rounded flex items-center justify-center">
                      <div className="w-4 h-4 border border-muted-foreground" />
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-secondary text-muted-foreground rounded-full px-3 py-1 text-sm font-medium">
                        {tool.category}
                      </span>
                      <span className="text-xs text-muted-foreground">{tool.date}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">{tool.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 flex-1">{tool.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tool.features.map((feature, idx) => (
                        <span key={idx} className="bg-secondary text-muted-foreground rounded-full px-3 py-1 text-sm">
                          {feature}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-auto">
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex-1 text-center"
                      >
                        Try Free
                      </a>
                      <button className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg flex-1">
                        Read
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/best-of-ai"
                  className="inline-flex items-center gap-3 text-green-600 dark:text-green-400 font-semibold hover:text-green-700 transition-colors"
                >
                  <span>Explore all AI tools</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  >
                    <ArrowRight size={20} />
                  </motion.span>
                </Link>
              </motion.div>
            </div>
          </div>
        </AnimateInView>
      </section>

      {/* News & Articles */}
      <section className="py-16 bg-secondary" id="news-articles">
        <AnimateInView>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">News & Articles</h2>
                <p className="text-muted-foreground">Latest insights and updates from the AI world</p>
              </div>
              <Link
                to="/news"
                className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 transition-colors relative group"
              >
                View all news
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 dark:bg-purple-400 transition-all duration-300 group-hover:w-full" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsArticles.map((article, i) => (
                <div key={i} className="bg-card rounded-lg shadow-md overflow-hidden group flex flex-col card-hover">
                  <div className="relative overflow-hidden aspect-[4/3] h-48">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                      <span className="bg-purple-500 text-white rounded-full px-3 py-1 text-xs font-semibold">
                        {article.category}
                      </span>
                      <span className="text-white text-xs bg-black/50 rounded-full px-2 py-1">📅 {article.date}</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold group-hover:text-purple-600 transition-colors text-foreground line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground line-clamp-3 mt-2">{article.excerpt}</p>
                      <div className="text-sm text-muted-foreground mt-2">
                        By {article.author} • {article.readTime}
                      </div>
                    </div>
                    <motion.button
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium mt-4"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Read
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/news"
                  className="inline-flex items-center gap-3 text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 transition-colors"
                >
                  <span>Explore all news & articles</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  >
                    <ArrowRight size={20} />
                  </motion.span>
                </Link>
              </motion.div>
            </div>
          </div>
        </AnimateInView>
      </section>

      {/* AI Quiz Section */}
      <section className="py-16 bg-background" id="ai-quiz">
        <AnimateInView>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">AI Knowledge Quiz</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Test your AI knowledge with our interactive quizzes
              </p>
            </div>
            <div className="text-center">
              <Link to="/quizzes">
                <motion.button
                  className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Quiz
                </motion.button>
              </Link>
            </div>
          </div>
        </AnimateInView>
      </section>

      {/* Connect With Us */}
      <section className="py-16 bg-secondary" id="action-buttons">
        <AnimateInView>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Connect With Us</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get in touch, support our work, or follow our latest content
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <motion.button
                className="bg-blue-600 hover:bg-blue-700 text-white p-8 rounded-2xl shadow-lg text-center group"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-4xl mb-4">📧</div>
                <h3 className="text-xl font-bold mb-2">Contact Us</h3>
                <p className="text-blue-100 group-hover:text-white transition-colors">Get in touch with our team</p>
              </motion.button>

              <motion.button
                className="bg-green-600 hover:bg-green-700 text-white p-8 rounded-2xl shadow-lg text-center group"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open("https://ko-fi.com/utopai", "_blank")}
              >
                <div className="text-4xl mb-4">☕</div>
                <h3 className="text-xl font-bold mb-2">Support Us</h3>
                <p className="text-green-100 group-hover:text-white transition-colors">Help us create more content</p>
              </motion.button>

              <motion.button
                className="bg-red-600 hover:bg-red-700 text-white p-8 rounded-2xl shadow-lg text-center group"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open("https://www.youtube.com/channel/UC6D5mUGNBRB80j_5A-QkazA", "_blank")}
              >
                <div className="text-4xl mb-4">📺</div>
                <h3 className="text-xl font-bold mb-2">YouTube</h3>
                <p className="text-red-100 group-hover:text-white transition-colors">Watch our latest videos</p>
              </motion.button>
            </div>
          </div>
        </AnimateInView>
      </section>
    </Layout>
  );
};

export default Index;
