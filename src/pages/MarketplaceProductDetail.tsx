import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Download,
  FileText,
  Package,
  ShieldCheck,
} from "lucide-react";

import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getDigitalProductBySlug, resolveDigitalProducts } from "@/data/digital-products";

const SAVED_PRODUCTS_KEY = "spotai.savedDigitalProducts";

const MarketplaceProductDetail = () => {
  const { slug = "" } = useParams();
  const product = getDigitalProductBySlug(slug);
  const [activeImage, setActiveImage] = useState(product?.galleryImages[0] || product?.coverImage || "");
  const [savedProducts, setSavedProducts] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = window.localStorage.getItem(SAVED_PRODUCTS_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!product) return;
    setActiveImage(product.galleryImages[0] || product.coverImage);
  }, [product]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SAVED_PRODUCTS_KEY, JSON.stringify(savedProducts));
  }, [savedProducts]);

  const isSaved = Boolean(product && savedProducts.includes(product.slug));

  const toggleSaved = () => {
    if (!product) return;
    setSavedProducts((current) =>
      current.includes(product.slug)
        ? current.filter((item) => item !== product.slug)
        : [...current, product.slug],
    );
  };

  const relatedProducts = useMemo(
    () => (product ? resolveDigitalProducts(product.relatedSlugs) : []),
    [product],
  );

  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen bg-background px-4 py-16 text-foreground sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-border bg-card p-10 text-center">
            <h1 className="text-4xl tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
              Product not found
            </h1>
            <p className="mt-3 text-muted-foreground">
              This digital product is missing or no longer available.
            </p>
            <div className="mt-7 flex justify-center">
              <Button asChild className="rounded-full">
                <Link to="/marketplace">Back to marketplace</Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        <section className="overflow-hidden border-b border-border bg-secondary">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition hover:border-blue-300 hover:text-blue-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to library
            </Link>

            <div className="mt-7 grid gap-8 lg:grid-cols-[1fr,22rem]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {product.heroTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-blue-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h1
                  className="mt-5 max-w-3xl text-5xl font-semibold leading-[1.03] tracking-tight text-foreground md:text-6xl"
                  style={{ fontFamily: '"Singo Sans", Georgia, serif' }}
                >
                  {product.title}
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
                  {product.summary}
                </p>

                <div className="mt-8 flex flex-wrap gap-8 text-foreground">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Pages</span>
                    <span className="text-sm text-muted-foreground">{product.pages}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Words</span>
                    <span className="text-sm text-muted-foreground">{product.words.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Size</span>
                    <span className="text-sm text-muted-foreground">{product.fileSizeLabel}</span>
                  </div>
                </div>
              </div>

              <div className="self-end rounded-3xl border border-border bg-white p-5">
                <div className="overflow-hidden rounded-2xl border border-border bg-muted/35">
                  <img src={product.coverImage} alt={product.title} className="h-52 w-full object-contain" />
                </div>
                <div className="mt-4 space-y-3">
                  <button
                    type="button"
                    onClick={toggleSaved}
                    className={cn(
                      "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors",
                      isSaved
                        ? "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
                        : "border-border bg-background text-foreground hover:border-blue-300 hover:bg-blue-50",
                    )}
                  >
                    {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    {isSaved ? "Saved" : "Save Product"}
                  </button>
                  <a
                    href={product.fileUrl || "#"}
                    download={Boolean(product.fileUrl)}
                    className={cn(
                      "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors",
                      product.fileUrl
                        ? "bg-[#ef4a3d] text-white hover:bg-[#dc3f34]"
                        : "cursor-not-allowed bg-[#4b5565] text-white/70",
                    )}
                    onClick={(event) => {
                      if (!product.fileUrl) event.preventDefault();
                    }}
                  >
                    <Download className="h-4 w-4" />
                    {product.fileUrl ? "Download product" : "Download unavailable"}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr,22rem] lg:items-start">
            <div className="space-y-7">
              <div className="overflow-hidden rounded-2xl border border-border bg-muted/35">
                <img src={activeImage} alt={product.title} className="h-[27rem] w-full object-contain" />
              </div>

              <div className="grid grid-cols-5 gap-3">
                {product.galleryImages.map((image) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImage(image)}
                    className={cn(
                      "overflow-hidden rounded-xl border bg-card transition",
                      activeImage === image
                        ? "border-[#ef4a3d] shadow-[0_0_0_2px_rgba(239,74,61,0.15)]"
                        : "border-border hover:border-[#98b6ff]",
                    )}
                  >
                    <img src={image} alt={`${product.title} preview`} className="h-20 w-full object-contain bg-muted/35" />
                  </button>
                ))}
              </div>

              <div className="space-y-5 text-[1.05rem] leading-8 text-slate-700 dark:text-slate-200">
                {product.descriptionParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <div>
                <h2 className="text-4xl tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                  What You Will Learn
                </h2>
                <ul className="mt-5 space-y-3 text-[1.05rem] leading-8 text-slate-700 dark:text-slate-200">
                  {product.learningOutcomes.map((outcome) => (
                    <li key={outcome} className="flex items-start gap-3">
                      <span className="mt-3 h-1.5 w-1.5 rounded-full bg-[#ef4a3d]" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-5 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="text-2xl tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                  This product contains
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {product.contains.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-[#ef4a3d]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="text-2xl tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                  You are free to
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {product.usageRights.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <ShieldCheck className="mt-0.5 h-4 w-4 text-[#ef4a3d]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 border-t border-border pt-4 text-sm text-muted-foreground">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground">Details</h4>
                  <dl className="mt-3 space-y-2">
                    <div className="flex justify-between gap-3">
                      <dt>Pages</dt>
                      <dd className="font-semibold text-foreground">{product.pages}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>File type</dt>
                      <dd className="font-semibold text-foreground">{product.fileType}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>File size</dt>
                      <dd className="font-semibold text-foreground">{product.fileSizeLabel}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Date added</dt>
                      <dd className="font-semibold text-foreground">{product.dateAdded}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 ? (
          <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
            <h2 className="text-3xl tracking-tight" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
              Related products
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {relatedProducts.map((relatedProduct) => (
                <article key={relatedProduct.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="h-36 overflow-hidden">
                    <img src={relatedProduct.coverImage} alt={relatedProduct.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl leading-tight text-foreground" style={{ fontFamily: '"Singo Sans", Georgia, serif' }}>
                      {relatedProduct.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{relatedProduct.subtitle}</p>
                    <div className="mt-4">
                      <Link
                        to={`/marketplace/${relatedProduct.slug}`}
                        className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
                      >
                        Open
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </Layout>
  );
};

export default MarketplaceProductDetail;
