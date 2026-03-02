import { useState, useMemo } from "react";
import Layout from "@/components/layout/Layout";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

const CharacterCounter = () => {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.trim() ? (text.match(/[.!?]+/g) || []).length || (text.trim() ? 1 : 0) : 0;
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    const speakingTime = Math.max(1, Math.ceil(words / 130));
    return { characters, charactersNoSpaces, words, sentences, paragraphs, readingTime, speakingTime };
  }, [text]);

  const statCards = [
    { label: "Characters", value: stats.characters, color: "from-purple-500 to-purple-600" },
    { label: "No Spaces", value: stats.charactersNoSpaces, color: "from-indigo-500 to-indigo-600" },
    { label: "Words", value: stats.words, color: "from-blue-500 to-blue-600" },
    { label: "Sentences", value: stats.sentences, color: "from-cyan-500 to-cyan-600" },
    { label: "Paragraphs", value: stats.paragraphs, color: "from-teal-500 to-teal-600" },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-foreground mb-2 text-center">Character Counter</h1>
          <p className="text-muted-foreground text-center mb-10">Count characters, words, sentences, and more instantly</p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
            {statCards.map((s) => (
              <div key={s.label} className={`bg-gradient-to-br ${s.color} text-white rounded-xl p-4 text-center`}>
                <div className="text-3xl font-bold">{s.value}</div>
                <div className="text-xs opacity-90 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-2xl shadow-lg border border-border p-6 space-y-4">
            <Textarea
              placeholder="Start typing or paste your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[300px] text-base resize-y"
            />
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>📖 ~{stats.readingTime} min read</span>
              <span>🎤 ~{stats.speakingTime} min speaking</span>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default CharacterCounter;
