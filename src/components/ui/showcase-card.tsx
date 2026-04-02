import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ShowcaseCardProps {
  title: string;
  subtitle: string;
  tag: string;
  image?: string;
  to?: string;
  href?: string;
  imageAlt?: string;
  className?: string;
  imageClassName?: string;
  imageObjectClassName?: string;
}

const cardBody = ({
  title,
  subtitle,
  tag,
  image,
  imageAlt,
  className,
  imageClassName,
  imageObjectClassName,
}: Omit<ShowcaseCardProps, "to" | "href">) => (
  <article
    className={cn(
      "group rounded-[2rem] border border-black/8 bg-white p-4 shadow-[0_6px_24px_rgba(20,20,20,0.06)] transition-transform duration-300 hover:-translate-y-1 dark:border-white/10 dark:bg-[#0f1728] dark:shadow-[0_18px_40px_rgba(2,6,23,0.35)]",
      className,
    )}
  >
    <div
      className={cn(
        "relative mb-5 h-72 overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-[#eef0eb] via-[#e3e5df] to-[#cfd4c8] dark:from-[#172132] dark:via-[#1e2a3f] dark:to-[#263246]",
        imageClassName,
      )}
    >
      {image ? (
        <img
          src={image}
          alt={imageAlt || title}
          className={cn(
            "h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]",
            imageObjectClassName,
          )}
          loading="lazy"
        />
      ) : null}

      <span className="absolute bottom-4 left-4 rounded-full bg-[#151515] px-4 py-1 text-xs font-semibold tracking-wide text-white">
        {tag}
      </span>
    </div>

    <div className="flex items-end justify-between gap-4 px-2 pb-2">
      <div>
        <h3 className="text-[2rem] leading-tight font-semibold tracking-tight text-[#21252d] dark:text-white">{title}</h3>
        <p className="mt-1 text-[1.05rem] text-[#6a6f77] dark:text-slate-300">{subtitle}</p>
      </div>
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d3d8d3] text-[#1f2421] dark:bg-[#1f2b3f] dark:text-white">
        <ArrowUpRight className="h-5 w-5" />
      </span>
    </div>
  </article>
);

const ShowcaseCard = (props: ShowcaseCardProps) => {
  if (props.to) {
    return (
      <Link to={props.to} className="block">
        {cardBody(props)}
      </Link>
    );
  }

  if (props.href) {
    return (
      <a href={props.href} className="block" target="_blank" rel="noopener noreferrer">
        {cardBody(props)}
      </a>
    );
  }

  return cardBody(props);
};

export default ShowcaseCard;
