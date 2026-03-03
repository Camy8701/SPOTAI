import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PenSquare, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const CreatePost = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const initialType = searchParams.get("type") || "post";

  const [type, setType] = useState<"post" | "question">(initialType as "post" | "question");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({ title: "Error", description: "Title and content are required.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now();

    const { error } = await supabase.from("blog_posts").insert({
      title: type === "question" ? `[Question] ${title}` : title,
      content,
      slug,
      author_id: user.id,
      status: "draft",
      category: type === "question" ? "opinion" : "story",
      tags: type === "question" ? ["question"] : [],
    });

    setSubmitting(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Your ${type} has been submitted for review.` });
      navigate("/dashboard");
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Create a {type === "question" ? "Question" : "Post"}</h1>

        {/* Type toggle */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setType("post")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
              type === "post"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            <PenSquare size={16} />
            Post
          </button>
          <button
            onClick={() => setType("question")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
              type === "question"
                ? "bg-destructive text-destructive-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-destructive" />
            <HelpCircle size={16} />
            Question
          </button>
        </div>

        {type === "question" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3 mb-6 flex items-center gap-2"
          >
            <span className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
            <span className="text-sm text-foreground font-medium">This will be posted as a Question — visible with a red indicator</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === "question" ? "What's your question?" : "Give your post a title"}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={type === "question" ? "Explain your question in detail..." : "Write your post content..."}
              rows={10}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent resize-y"
              required
            />
          </div>
          <motion.button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {submitting ? "Submitting..." : `Submit ${type === "question" ? "Question" : "Post"}`}
          </motion.button>
        </form>
      </div>
    </Layout>
  );
};

export default CreatePost;
