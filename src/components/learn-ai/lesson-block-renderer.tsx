import type { LearnAIContentBlock } from "@/data/learn-ai-courses";

const LessonBlockRenderer = ({ block }: { block: LearnAIContentBlock }) => {
  if (block.type === "paragraph") {
    return <p className="text-[15px] leading-8 text-slate-600">{block.text}</p>;
  }

  if (block.type === "heading") {
    return <h2 className="pt-2 text-[1.85rem] font-semibold leading-tight text-slate-950">{block.text}</h2>;
  }

  if (block.type === "list") {
    const ListTag = block.ordered ? "ol" : "ul";

    return (
      <ListTag className={`space-y-3 pl-6 text-[15px] leading-8 text-slate-600 ${block.ordered ? "list-decimal" : "list-disc"}`}>
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ListTag>
    );
  }

  if (block.type === "callout") {
    return (
      <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50/70 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-600">{block.title}</p>
        <p className="mt-3 text-[15px] leading-8 text-slate-700">{block.body}</p>
      </div>
    );
  }

  if (block.type === "prompt") {
    return (
      <div className="rounded-[1.75rem] bg-[#121212] p-6 text-white shadow-[0_20px_50px_rgba(15,23,42,0.1)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/55">{block.title}</p>
        <pre className="mt-4 whitespace-pre-wrap font-mono text-[13px] leading-7 text-white/88">{block.body}</pre>
      </div>
    );
  }

  if (block.type === "table") {
    return (
      <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white">
        <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          <span>{block.headers[0]}</span>
          <span>{block.headers[1]}</span>
        </div>
        {block.rows.map((row) => (
          <div key={row.label} className="grid grid-cols-2 gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0">
            <p className="font-semibold text-slate-950">{row.label}</p>
            <p className="text-[15px] leading-7 text-slate-600">{row.value}</p>
          </div>
        ))}
      </div>
    );
  }

  if (block.type === "grid") {
    return (
      <div className="space-y-5">
        {block.title ? <h3 className="text-[1.35rem] font-semibold text-slate-950">{block.title}</h3> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          {block.items.map((item) => (
            <div key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-950">{item.title}</h4>
              <p className="mt-2 text-[15px] leading-7 text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-amber-50/60 p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">{block.title}</p>
      <p className="mt-3 text-[15px] leading-8 text-slate-700">{block.body}</p>
    </div>
  );
};

export default LessonBlockRenderer;
