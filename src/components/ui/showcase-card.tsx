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
}

const cardBody = ({
  title,
  subtitle,
  tag,
  image,
  imageAlt,
  className,
  imageClassName,
}: Omit<ShowcaseCardProps, "to" | "href">) => (
  <article
    className={cn(
      "group rounded-[2rem] border border-black/8 bg-white p-4 shadow-[0_6px_24px_rgba(20,20,20,0.06)] transition-transform duration-300 hover:-translate-y-1",
      className,
    )}
  >
    <div
      className={cn(
        "relative mb-5 h-72 overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-[#eef0eb] via-[#e3e5df] to-[#cfd4c8]",
        imageClassName,
      )}
    >
      {image ? (
        <img
          src={image}
          alt={imageAlt || title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
      ) : null}

      <span className="absolute bottom-4 left-4 rounded-full bg-[#151515] px-4 py-1 text-xs font-semibold tracking-wide text-white">
        {tag}
      </span>
    </div>

    <div className="flex items-end justify-between gap-4 px-2 pb-2">
      <div>
        <h3 className="text-[2rem] leading-tight font-semibold tracking-tight text-[#21252d]">{title}</h3>
        <p className="mt-1 text-[1.05rem] text-[#6a6f77]">{subtitle}</p>
      </div>
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d3d8d3] text-[#1f2421]">
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
