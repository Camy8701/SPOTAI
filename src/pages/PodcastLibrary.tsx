import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Headphones, Download } from "lucide-react";

export default function PodcastLibrary() {
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("freebies").select("*").eq("type", "podcast").order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) { setPodcasts(data); setCategories([...new Set(data.map((e) => e.category))]); }
        setLoading(false);
      });
  }, []);

  const filtered = podcasts.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || (p.description || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">Free Podcast Library</h1>
          <p className="text-muted-foreground text-lg">Browse {podcasts.length} free podcasts. Listen or download anytime.</p>
        </div>

        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <Input placeholder="Search for podcasts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-4 pr-12 h-12 rounded-full border border-border text-base" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground rounded-full p-2">
              <Search className="h-4 w-4" />
            </div>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
            <span className="text-sm text-muted-foreground">Popular:</span>
            {categories.slice(0, 5).map((c) => (
              <Button key={c} variant={category === c ? "default" : "outline"} size="sm" className="rounded-full capitalize" onClick={() => setCategory(category === c ? "all" : c)}>
                {c}
              </Button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 mb-8">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-48 rounded-full"><SelectValue placeholder="Filter by Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground ml-auto">{filtered.length} podcast{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading podcasts...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Headphones className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-bold">No podcasts found</p>
            <p className="text-muted-foreground">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((podcast) => (
              <div key={podcast.id} className="rounded-xl border border-border bg-card overflow-hidden card-hover">
                {podcast.cover_image ? (
                  <img src={podcast.cover_image} alt={podcast.title} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-muted flex items-center justify-center">
                    <Headphones className="h-16 w-16 text-muted-foreground/40" />
                  </div>
                )}
                <div className="p-4">
                  <Badge variant="secondary" className="mb-2 capitalize">{podcast.category}</Badge>
                  <h3 className="font-bold text-lg mb-1 line-clamp-1">{podcast.title}</h3>
                  {podcast.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{podcast.description}</p>}
                  <div className="flex gap-2">
                    <a href={podcast.file_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button variant="outline" className="w-full rounded-full">Open</Button>
                    </a>
                    <a href={podcast.file_url} download>
                      <Button variant="ghost" size="icon" className="rounded-full border border-border"><Download className="h-4 w-4" /></Button>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
