import { useState, useMemo } from "react";
import Layout from "@/components/layout/Layout";
import { FileText, Hash, Type, Clock, Copy, Download, RotateCcw, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

const CharacterCounter = () => {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.trim() ? text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length : 0;
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length : 0;
    const lines = text ? text.split("\n").length : 0;
    const readingTime = Math.ceil((words / 200) * 0.9) || 0;
    const audioTime = Math.ceil((words / 150) * 0.9) || 0;
    const audioTimeSeconds = Math.ceil((words / 150) * 0.9 * 60) || 0;

    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      lines,
      readingTime,
      audioTime,
      audioTimeSeconds,
    };
  }, [text]);

  const copyText = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyStats = () => {
    const statsText = `Character Count Analysis:
Characters: ${stats.characters.toLocaleString()}
Characters (no spaces): ${stats.charactersNoSpaces.toLocaleString()}
Words: ${stats.words.toLocaleString()}
Sentences: ${stats.sentences.toLocaleString()}
Paragraphs: ${stats.paragraphs.toLocaleString()}
Lines: ${stats.lines.toLocaleString()}
Reading time: ${stats.readingTime} min
Audio listening time: ${stats.audioTime} min`;

    navigator.clipboard.writeText(statsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReport = () => {
    const report = `Character Count Report
Generated: ${new Date().toLocaleDateString()}

TEXT STATISTICS
Characters: ${stats.characters.toLocaleString()}
Characters (no spaces): ${stats.charactersNoSpaces.toLocaleString()}
Words: ${stats.words.toLocaleString()}
Sentences: ${stats.sentences.toLocaleString()}
Paragraphs: ${stats.paragraphs.toLocaleString()}
Lines: ${stats.lines.toLocaleString()}
Reading time: ${stats.readingTime} minutes
Audio listening time: ${stats.audioTime} minutes (${Math.floor(stats.audioTimeSeconds / 60)}:${(stats.audioTimeSeconds % 60).toString().padStart(2, "0")})

ORIGINAL TEXT
${text}`;

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "character-count-report.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearText = () => {
    setText("");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
        <div className="max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="text-center mb-12 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full mb-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Hash className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Real-time Character Analysis
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-6"
            >
              Character Counter
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              Analyze your text with precision. Get real-time character counts, word statistics, and audio duration
              estimates.
            </motion.p>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 lg:grid-cols-10 gap-6">
            {/* Text Input Area */}
            <div className="xl:col-span-8 lg:col-span-6 col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden h-full"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Text Input</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Type or paste your content here</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={copyText}
                        disabled={!text}
                        className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        title="Copy text"
                      >
                        <Copy className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={clearText}
                        disabled={!text}
                        className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        title="Clear text"
                      >
                        <RotateCcw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Text Area */}
                <div className="relative">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Start typing or paste your text here to see comprehensive analysis including character count, word statistics, reading time, and audio duration estimates..."
                    className="w-full h-[600px] p-8 border-0 resize-none focus:outline-none focus:ring-0 text-gray-700 dark:text-gray-300 bg-transparent placeholder-gray-400 dark:placeholder-gray-500 text-lg leading-relaxed"
                    style={{ minHeight: "600px" }}
                  />
                  {text.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                        >
                          <Type className="w-12 h-12 text-blue-500 dark:text-blue-400" />
                        </motion.div>
                        <p className="text-gray-400 dark:text-gray-500 font-semibold text-xl">Ready for text analysis</p>
                        <p className="text-gray-300 dark:text-gray-600 text-base mt-2">
                          Paste your content to get started
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Statistics Panel */}
            <div className="xl:col-span-4 lg:col-span-4 col-span-1 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
                {/* Live Character Count */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-2xl border border-blue-400/20"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm font-semibold opacity-90">Live Count</span>
                  </div>
                  <motion.div
                    key={stats.characters}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="text-4xl font-bold mb-2"
                  >
                    {stats.characters.toLocaleString()}
                  </motion.div>
                  <div className="text-sm opacity-90 font-medium">Characters</div>
                </motion.div>

                {/* Statistics */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-3 text-lg">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                      Statistics
                    </h3>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={copyStats}
                        disabled={!text}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Copy statistics"
                      >
                        <Copy className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={downloadReport}
                        disabled={!text}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Download report"
                      >
                        <Download className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </motion.button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: "Characters", value: stats.characters, color: "text-blue-600 dark:text-blue-400", bg: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20", icon: "📝" },
                      { label: "No Spaces", value: stats.charactersNoSpaces, color: "text-purple-600 dark:text-purple-400", bg: "bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20", icon: "🔤" },
                      { label: "Words", value: stats.words, color: "text-green-600 dark:text-green-400", bg: "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20", icon: "📖" },
                      { label: "Sentences", value: stats.sentences, color: "text-orange-600 dark:text-orange-400", bg: "bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20", icon: "📄" },
                      { label: "Paragraphs", value: stats.paragraphs, color: "text-red-600 dark:text-red-400", bg: "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20", icon: "📋" },
                      { label: "Lines", value: stats.lines, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20", icon: "📏" },
                    ].map(({ label, value, color, bg, icon }) => (
                      <motion.div
                        key={label}
                        whileHover={{ scale: 1.02, y: -1 }}
                        className={`flex justify-between items-center p-3 rounded-xl ${bg} transition-all duration-300 hover:shadow-md cursor-default border border-gray-200/30 dark:border-gray-600/30`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{icon}</span>
                          <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">{label}</span>
                        </div>
                        <motion.span
                          key={value}
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className={`font-bold text-lg ${color}`}
                        >
                          {value.toLocaleString()}
                        </motion.span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Reading Time and Audio Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
                {/* Reading Time */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6"
                >
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3 text-lg">
                    <Clock className="w-6 h-6 text-green-500" />
                    Reading Time
                  </h3>
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 rounded-xl border border-green-200/30 dark:border-green-600/30">
                    <div className="text-center">
                      <div className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Estimated Time</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">~220 words/min</div>
                      <motion.span
                        key={stats.readingTime}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="font-bold text-3xl text-green-600 dark:text-green-400"
                      >
                        {stats.readingTime} min
                      </motion.span>
                    </div>
                  </div>
                </motion.div>

                {/* Audio Duration */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6"
                >
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3 text-lg">
                    <Volume2 className="w-6 h-6 text-purple-500" />
                    Audio Duration
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-800/20 rounded-xl border border-purple-200/30 dark:border-purple-600/30">
                      <div className="text-center">
                        <div className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Estimated Duration</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">~165 words/min</div>
                        <motion.span
                          key={stats.audioTime}
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className="font-bold text-3xl text-purple-600 dark:text-purple-400"
                        >
                          {stats.audioTime > 0 ? `${stats.audioTime} min` : "0 min"}
                        </motion.span>
                      </div>
                    </div>

                    {stats.audioTimeSeconds > 60 && (
                      <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200/20 dark:border-purple-600/20">
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Precise Duration</span>
                        <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                          {Math.floor(stats.audioTimeSeconds / 60)}:
                          {(stats.audioTimeSeconds % 60).toString().padStart(2, "0")}
                        </span>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 dark:text-gray-400 bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-700/50 dark:to-purple-900/20 p-3 rounded-xl border border-gray-200/30 dark:border-gray-600/30">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="font-semibold">Speech Rate Reference</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Slow:</span>
                          <span className="font-medium">120 wpm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average:</span>
                          <span className="font-medium">150 wpm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fast:</span>
                          <span className="font-medium">180 wpm</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {copied && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.8 }}
              className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 border border-green-400/30"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="font-semibold">Copied to clipboard!</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CharacterCounter;
