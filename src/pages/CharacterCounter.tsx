import { useMemo, useState } from "react";
import Layout from "@/components/layout/Layout";
import BackToToolsButton from "@/components/tools/BackToToolsButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Hash, Type, Clock, Copy, Download, RotateCcw, Volume2 } from "lucide-react";

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
    const readingTime = Math.ceil((words / 220) * 0.9) || 0;
    const audioTime = Math.ceil((words / 165) * 0.9) || 0;
    const audioTimeSeconds = Math.ceil((words / 165) * 0.9 * 60) || 0;

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

  const showCopiedState = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const copyText = () => {
    navigator.clipboard.writeText(text);
    showCopiedState();
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
    showCopiedState();
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

  const statRows = [
    { label: "Characters", value: stats.characters, icon: Hash, tone: "text-blue-600" },
    { label: "No Spaces", value: stats.charactersNoSpaces, icon: Type, tone: "text-violet-600" },
    { label: "Words", value: stats.words, icon: FileText, tone: "text-emerald-600" },
    { label: "Sentences", value: stats.sentences, icon: FileText, tone: "text-orange-600" },
    { label: "Paragraphs", value: stats.paragraphs, icon: FileText, tone: "text-rose-600" },
    { label: "Lines", value: stats.lines, icon: FileText, tone: "text-cyan-600" },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        <section className="border-b border-border bg-secondary">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <BackToToolsButton className="mb-8" />
            <div className="text-center">
              <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">
                <Hash className="h-4 w-4" />
                Utility Tool
              </div>
              <h1 className="text-5xl tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                Character Counter
              </h1>
              <p className="mt-2 text-sm uppercase tracking-[0.22em] text-muted-foreground">
                Real-time text analysis for writing and publishing
              </p>
            </div>
          </div>
        </section>

        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="border-border">
              <CardHeader className="border-b border-border pb-4">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-xl">Text Input</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={copyText} disabled={!text} title="Copy text">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={clearText} disabled={!text} title="Clear text">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Start typing or paste your text here..."
                  className="h-[560px] w-full resize-none border-0 bg-transparent p-6 text-base leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-border">
                <CardContent className="p-6">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Live Count
                  </div>
                  <div className="text-4xl font-bold text-blue-600">{stats.characters.toLocaleString()}</div>
                  <p className="mt-1 text-sm text-muted-foreground">Total characters</p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg">Statistics</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={copyStats} disabled={!text} title="Copy statistics">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={downloadReport} disabled={!text} title="Download report">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {statRows.map(({ label, value, icon: Icon, tone }) => (
                    <div key={label} className="flex items-center justify-between rounded-lg border border-border bg-secondary px-3 py-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon className={`h-4 w-4 ${tone}`} />
                        <span>{label}</span>
                      </div>
                      <span className={`text-base font-semibold ${tone}`}>{value.toLocaleString()}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="space-y-4 p-6">
                  <div className="rounded-lg border border-border bg-secondary p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <Clock className="h-4 w-4 text-emerald-600" />
                      Reading Time
                    </div>
                    <p className="text-sm text-muted-foreground">~220 words per minute</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-600">{stats.readingTime} min</p>
                  </div>

                  <div className="rounded-lg border border-border bg-secondary p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <Volume2 className="h-4 w-4 text-violet-600" />
                      Audio Duration
                    </div>
                    <p className="text-sm text-muted-foreground">~165 words per minute</p>
                    <p className="mt-1 text-2xl font-bold text-violet-600">
                      {stats.audioTime} min ({Math.floor(stats.audioTimeSeconds / 60)}:
                      {(stats.audioTimeSeconds % 60).toString().padStart(2, "0")})
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {copied ? (
            <p className="mt-6 text-center text-sm font-medium text-emerald-600">Copied to clipboard</p>
          ) : null}
        </main>
      </div>
    </Layout>
  );
};

export default CharacterCounter;
