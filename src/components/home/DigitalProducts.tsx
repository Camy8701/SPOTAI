import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Download, ShoppingBag } from "lucide-react";

import AnimateInView from "@/components/AnimateInView";
import { digitalProducts } from "@/data/digital-products";
import { supabase } from "@/integrations/supabase/client";
import { getFreebieVisibility, getFreebieVisibilityMap } from "@/lib/freebie-visibility";

const DigitalProducts = () => {
  const [freebies, setFreebies] = useState<any[]>([]);
  const [visibilityMap, setVisibilityMap] = useState<Record<string, { marketplace: boolean; ebooks: boolean; homepage: boolean }>>({});

  useEffect(() => {
    setVisibilityMap(getFreebieVisibilityMap());
    supabase
      .from("freebies")
      .select("*")
      .eq("type", "ebook")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setFreebies(data);
      });
  }, []);

  const featuredProducts = useMemo(() => {
    const visibleFreebies = freebies
      .filter((item) => getFreebieVisibility(item, visibilityMap).homepage)
      .map((item) => ({
        id: `freebie-${item.id}`,
        title: item.title,
        subtitle: item.description || "Digital product from your freebie library.",
        coverImage: item.cover_image || "/placeholder.svg",
        tag: item.category || "Ebook",
        fileUrl: item.file_url as string,
      }));

    const staticProducts = digitalProducts.map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      coverImage: item.coverImage,
      tag: item.tag,
      fileUrl: item.fileUrl,
      slug: item.slug,
    }));

    return [...visibleFreebies, ...staticProducts].slice(0, 3);
  }, [freebies, visibilityMap]);

  return (
    <section className="bg-white py-12 sm:py-16" id="digital-products">
      <AnimateInView>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center sm:mb-10">
            <h2 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">Digital Products</h2>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
              Curated playbooks and templates to help builders ship faster.
            </p>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <article key={product.id} className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-white">
                <div className="relative flex h-44 items-center justify-center overflow-hidden bg-[#eef3ff]">
                  <img src={product.coverImage} alt={product.title} className="h-full w-full object-contain p-2" loading="lazy" />
                  <span className="absolute left-3 top-3 rounded-full border border-white/35 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                    {product.tag}
                  </span>
                </div>

                <div className="flex flex-1 flex-col justify-between space-y-4 p-5">
                  <div>
                    <h3 className="text-3xl leading-tight tracking-tight text-slate-900" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                      {product.title}
                    </h3>
                    <p className="mt-2 text-base leading-7 text-slate-600">{product.subtitle}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {"slug" in product && product.slug ? (
                      <Link
                        to={`/marketplace/${product.slug}`}
                        className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-indigo-500 bg-indigo-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
                      >
                        Open
                      </Link>
                    ) : (
                      <a
                        href={product.fileUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => {
                          if (!product.fileUrl) event.preventDefault();
                        }}
                        className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-indigo-500 bg-indigo-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
                      >
                        Open
                      </a>
                    )}
                    <a
                      href={product.fileUrl || "#"}
                      download={Boolean(product.fileUrl)}
                      onClick={(event) => {
                        if (!product.fileUrl) event.preventDefault();
                      }}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                        product.fileUrl
                          ? "border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                          : "cursor-not-allowed border-border text-muted-foreground"
                      }`}
                      aria-label={`Download ${product.title}`}
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-accent"
            >
              <ShoppingBag className="h-4 w-4" />
              Explore all products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </AnimateInView>
    </section>
  );
};

export default DigitalProducts;
