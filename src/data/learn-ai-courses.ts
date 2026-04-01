export type LearnAIContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "callout"; title: string; body: string }
  | { type: "prompt"; title: string; body: string }
  | {
      type: "table";
      headers: [string, string];
      rows: { label: string; value: string }[];
    }
  | {
      type: "grid";
      title?: string;
      items: { title: string; description: string }[];
    }
  | { type: "exercise"; title: string; body: string };

export type LearnAILesson = {
  id: string;
  title: string;
  summary: string;
  duration: string;
  objective: string;
  blocks: LearnAIContentBlock[];
};

export type LearnAIAssessmentQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export type LearnAICourse = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  summary: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  access: "Free" | "Pro";
  duration: string;
  image: string;
  heroLabel: string;
  cardLabel: string;
  featured?: boolean;
  outcomes: string[];
  audience: string;
  differentiator: string;
  certificateTitle: string;
  assessmentLabel: string;
  lessons: LearnAILesson[];
  assessment: LearnAIAssessmentQuestion[];
};

const onlineBusinessMasterPlan: LearnAICourse = {
  slug: "online-business-master-plan",
  title: "Online Business Master Plan",
  subtitle:
    "Build a real digital product business in 30 days. Find your niche, build an offer stack, launch your first funnel, and get buyers.",
  description:
    "A practical operator-style course for founders, creators, and solo builders who want to go from vague product ideas to a small but real revenue engine.",
  summary:
    "This track is built around the same core flow you referenced: market shift, positioning, offer design, systems, acquisition, and launch. It is adapted to SpotAI and structured as a real course platform, not just a static article.",
  category: "Business",
  level: "Beginner",
  access: "Free",
  duration: "6 lessons",
  image:
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80",
  heroLabel: "Start here",
  cardLabel: "Masterclass",
  featured: true,
  outcomes: [
    "A validated niche and sharper market angle backed by real demand signals",
    "A 4-tier offer stack that turns one product into a more durable business",
    "A storefront, delivery flow, and email capture system you can run without a team",
    "A repeatable acquisition plan based on distribution and conversion instead of luck",
    "A 30-day launch roadmap with concrete milestones and measurable output",
  ],
  audience:
    "Early-stage digital product builders, creators leaving client work, and operators packaging knowledge into templates, guides, systems, or lightweight software.",
  differentiator:
    "Most beginner courses stop at making a product. This one is built around the real business system: positioning, offer stack, buyer research, launch mechanics, and follow-through.",
  certificateTitle: "SpotAI Certificate of Completion",
  assessmentLabel: "Launch Readiness Assessment",
  lessons: [
    {
      id: "the-2026-opportunity",
      title: "The 2026 Opportunity",
      summary: "Understand why digital products got easier to create and harder to sell, and why that shift is actually good news.",
      duration: "18 min",
      objective:
        "By the end of this lesson, you should understand what changed in the digital product market and where the new advantage comes from.",
      blocks: [
        {
          type: "paragraph",
          text:
            "Five years ago, simply finishing a decent template pack or ebook was enough to stand out. Creation itself was the moat. AI reduced that barrier. Production got faster, cheaper, and widely available.",
        },
        {
          type: "paragraph",
          text:
            "That sounds bad until you notice what happened next: strategy became the scarce skill. The winners are no longer the people who can make a thing. They are the people who can position a thing, package a thing, distribute a thing, and keep the buyer moving.",
        },
        {
          type: "heading",
          text: "Why most sellers are stuck",
        },
        {
          type: "list",
          items: [
            "They have one product on one platform and no audience asset they own",
            "They post inconsistently and hope discovery alone will carry the business",
            "They do not collect buyer language, so their messaging stays generic",
            "They chase novelty instead of building a repeatable offer and conversion system",
          ],
        },
        {
          type: "heading",
          text: "Niche validation",
        },
        {
          type: "grid",
          items: [
            {
              title: "Sweet Spot",
              description: "High demand, low competition. This is where you can move fast with a clear angle.",
            },
            {
              title: "Crowded",
              description: "Demand exists, but you need sharper positioning and a better buyer promise.",
            },
            {
              title: "Risky",
              description: "Low demand means you may be solving a problem people do not urgently pay to fix.",
            },
            {
              title: "Avoid",
              description: "Saturated and shrinking markets usually punish generic products and weak distribution.",
            },
          ],
        },
        {
          type: "callout",
          title: "Key shift",
          body:
            "Creation is no longer the bottleneck. The new edge is buyer understanding plus a system that makes your offer easier to discover, trust, and buy.",
        },
        {
          type: "exercise",
          title: "Mini exercise",
          body:
            "Write down three categories you are considering. For each one, note demand signals, obvious competition, and one reason your version could feel more useful or more specific.",
        },
      ],
    },
    {
      id: "find-your-edge",
      title: "Find Your Edge",
      summary: "Choose a direction based on real demand, not vague passion, and turn that into a sharper market angle.",
      duration: "22 min",
      objective:
        "By the end of this lesson, you should have a more specific audience, clearer problem, and a one-sentence angle statement.",
      blocks: [
        {
          type: "paragraph",
          text:
            "You do not need an original market. You need a more specific promise inside an existing market. That is usually enough to make your offer feel relevant instead of interchangeable.",
        },
        {
          type: "heading",
          text: "Pick a direction, not a passion project",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Something you know enough about to create useful assets quickly",
            "Something people already pay for, proven by listings, offers, or services in the market",
            "Something that still has room for a cleaner angle, better UX, better bundle, or faster result",
          ],
        },
        {
          type: "heading",
          text: "Angles that work",
        },
        {
          type: "table",
          headers: ["Angle", "Example"],
          rows: [
            {
              label: "More specific audience",
              value: "Not “social media templates,” but “Instagram templates for yoga instructors.”",
            },
            {
              label: "Better design or UX",
              value: "Same kind of product, but cleaner, easier to implement, and less bloated.",
            },
            {
              label: "Bundled with guidance",
              value: "A template pack plus a walkthrough showing how to use it in practice.",
            },
            {
              label: "Paired with a service",
              value: "A downloadable asset plus a short setup or strategy session.",
            },
            {
              label: "Faster result",
              value: "A weekend launch system instead of a vague general productivity course.",
            },
          ],
        },
        {
          type: "prompt",
          title: "Research prompt",
          body:
            "I am researching a niche for a digital product business. My niche is [niche] and my target audience is [describe them].\n\nBased on common patterns in this market, generate a buyer profile that includes their biggest frustration, what they have already tried, where they spend time online, what would make them trust a new product, and their typical budget.",
        },
        {
          type: "exercise",
          title: "Angle statement",
          body:
            "Fill in this sentence: “My product is for __________ who need __________ and cannot find it because __________.” Keep refining until it sounds specific and believable.",
        },
      ],
    },
    {
      id: "build-your-offer-stack",
      title: "Build Your Offer Stack",
      summary: "Move beyond a single PDF or template and design a business around multiple value layers.",
      duration: "19 min",
      objective:
        "By the end of this lesson, you should understand how to package one idea into a stack that grows revenue and buyer trust.",
      blocks: [
        {
          type: "paragraph",
          text:
            "A fragile business depends on one product. A stronger business has a stack: an entry product, a core offer, a guided upgrade, and an optional high-touch layer. This lets you serve different levels of intent without rebuilding the entire business.",
        },
        {
          type: "heading",
          text: "A simple 4-tier stack",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Lead magnet or starter asset that earns trust and captures email",
            "Core product that solves one urgent problem cleanly",
            "Expanded bundle or mini-course that deepens the result",
            "Service, audit, or community access for buyers who want implementation help",
          ],
        },
        {
          type: "callout",
          title: "Pricing principle",
          body:
            "Do not price from your effort. Price from the value of the problem being solved and the clarity of the transformation.",
        },
        {
          type: "heading",
          text: "What each layer should do",
        },
        {
          type: "grid",
          items: [
            {
              title: "Starter asset",
              description: "Shows your taste, clarity, and thinking. It is a trust-builder, not a complete system.",
            },
            {
              title: "Core offer",
              description: "Delivers the main transformation with the least friction and the clearest promise.",
            },
            {
              title: "Upgrade",
              description: "Adds context, walkthroughs, examples, templates, or implementation support.",
            },
            {
              title: "Premium layer",
              description: "Creates a higher-value path for the buyers who want speed, accountability, or customization.",
            },
          ],
        },
        {
          type: "exercise",
          title: "Offer map",
          body:
            "Sketch one problem, one audience, one core promise. Then map one asset for trust, one core offer, one upgrade, and one premium extension. Avoid adding anything that does not move the buyer toward the promised outcome.",
        },
      ],
    },
    {
      id: "set-up-your-machine",
      title: "Set Up Your Machine",
      summary: "Install the basic storefront, delivery, and audience infrastructure that makes sales repeatable.",
      duration: "17 min",
      objective:
        "By the end of this lesson, you should know what systems must exist before you launch, even if they are simple.",
      blocks: [
        {
          type: "paragraph",
          text:
            "You do not need a complex stack. You need a machine that can capture attention, convert buyers, deliver the product, and follow up. Simple beats fragmented.",
        },
        {
          type: "heading",
          text: "Your minimum viable machine",
        },
        {
          type: "list",
          items: [
            "One landing page or storefront with a clear promise and obvious CTA",
            "One email capture flow so traffic becomes an owned audience",
            "One clean checkout and delivery path with no confusion after purchase",
            "One place to collect buyer questions, testimonials, and objections",
          ],
        },
        {
          type: "prompt",
          title: "Landing page prompt",
          body:
            "Write a landing page for a digital product that helps [audience] achieve [outcome]. Include: hero headline, subheadline, problem section, offer breakdown, proof ideas, FAQ, and CTA. Keep the language sharp, direct, and buyer-focused.",
        },
        {
          type: "callout",
          title: "Machine rule",
          body:
            "A beautiful system that breaks trust is worse than a simple system that works. Every step should reduce confusion, not add design noise.",
        },
        {
          type: "exercise",
          title: "Stack audit",
          body:
            "List the exact tools or pages you will use for landing page, email capture, payment, delivery, and support. If any step is vague, fix that before launch week.",
        },
      ],
    },
    {
      id: "get-buyers-not-followers",
      title: "Get Buyers, Not Followers",
      summary: "Build an acquisition loop around trust, relevance, and conversion instead of vanity metrics.",
      duration: "20 min",
      objective:
        "By the end of this lesson, you should know which channels to prioritize and how to turn content into buyer intent.",
      blocks: [
        {
          type: "paragraph",
          text:
            "Followers are not the goal. Buyer attention is. Your content should make the problem clearer, the solution more believable, and the next step easier to take.",
        },
        {
          type: "heading",
          text: "Three useful content jobs",
        },
        {
          type: "list",
          items: [
            "Educate: explain the problem, market shift, and wrong assumptions",
            "Relate: mirror the buyer’s frustration in their own language",
            "Convert: show your framework, your offer, and why your version is different",
          ],
        },
        {
          type: "heading",
          text: "Channel priority",
        },
        {
          type: "table",
          headers: ["Channel", "Best use"],
          rows: [
            {
              label: "Short-form content",
              value: "Fast discovery, testing hooks, and gathering language from comments.",
            },
            {
              label: "Email",
              value: "Owning attention, deepening trust, and converting warm buyers over time.",
            },
            {
              label: "Communities",
              value: "Finding live objections, understanding demand, and validating offer framing.",
            },
            {
              label: "Marketplace listings",
              value: "Capturing high-intent buyers already looking for a solution.",
            },
          ],
        },
        {
          type: "callout",
          title: "Distribution principle",
          body:
            "Do not create content just to post. Create content to move a buyer from awareness to a specific action: join, reply, click, download, or buy.",
        },
        {
          type: "exercise",
          title: "Weekly content loop",
          body:
            "Plan one educational post, one buyer-language post, one offer post, and one CTA-driven email each week. The goal is signal and conversion, not volume.",
        },
      ],
    },
    {
      id: "your-30-day-launch-plan",
      title: "Your 30-Day Launch Plan",
      summary: "Turn the previous lessons into a week-by-week execution plan you can actually follow.",
      duration: "16 min",
      objective:
        "By the end of this lesson, you should have a launch sequence with clear milestones, not just a vague intention to ship soon.",
      blocks: [
        {
          type: "heading",
          text: "Week-by-week launch rhythm",
        },
        {
          type: "table",
          headers: ["Week", "Focus"],
          rows: [
            {
              label: "Week 1",
              value: "Choose market, validate demand, and write the angle statement.",
            },
            {
              label: "Week 2",
              value: "Build the core product, outline the stack, and prepare the delivery flow.",
            },
            {
              label: "Week 3",
              value: "Write the landing page, create the content loop, and collect early feedback.",
            },
            {
              label: "Week 4",
              value: "Launch publicly, watch buyer behavior, and iterate the weak points quickly.",
            },
          ],
        },
        {
          type: "paragraph",
          text:
            "Your first launch does not need perfect design, a huge audience, or dozens of products. It needs clarity, speed, and the discipline to learn from real behavior instead of hiding in preparation.",
        },
        {
          type: "prompt",
          title: "Launch prompt",
          body:
            "Create a 30-day launch plan for a digital product aimed at [audience] that solves [problem]. Break it into four weekly sprints. For each sprint, list the top three priorities, the deliverables, and the success metric.",
        },
        {
          type: "exercise",
          title: "Commitment step",
          body:
            "Pick a public launch date. Then write the one metric that will define success for version one: sales, waitlist signups, replies, demos booked, or qualified leads.",
        },
      ],
    },
  ],
  assessment: [
    {
      id: "q1",
      question: "What became the real bottleneck after AI reduced the cost of creation?",
      options: ["Design polish", "Strategy and buyer understanding", "Video editing", "Logo quality"],
      correctAnswer: "Strategy and buyer understanding",
      explanation:
        "The market shift is not about making things slower again. It is about strategy, positioning, and building a stronger path from product to buyer.",
    },
    {
      id: "q2",
      question: "Which angle is usually stronger than trying to create a completely new market?",
      options: [
        "Competing on cheaper pricing alone",
        "Being vague so more people relate",
        "Choosing a more specific audience or faster result",
        "Adding as many bonuses as possible",
      ],
      correctAnswer: "Choosing a more specific audience or faster result",
      explanation:
        "Specificity makes an offer feel more relevant. A narrower audience, clearer promise, or faster result often creates the edge.",
    },
    {
      id: "q3",
      question: "What is the purpose of an offer stack?",
      options: [
        "To make the business look bigger than it is",
        "To serve different levels of buyer intent with multiple value layers",
        "To avoid selling a core product",
        "To replace email marketing",
      ],
      correctAnswer: "To serve different levels of buyer intent with multiple value layers",
      explanation:
        "The stack creates a path from trust to purchase to upgrade, rather than forcing every buyer into one generic offer.",
    },
    {
      id: "q4",
      question: "What should your content primarily do?",
      options: [
        "Maximize views at any cost",
        "Show personality without a CTA",
        "Move buyers toward a useful next action",
        "Copy whatever is trending",
      ],
      correctAnswer: "Move buyers toward a useful next action",
      explanation:
        "Content is part of the conversion system. It should educate, relate, and convert with a clear next step.",
    },
    {
      id: "q5",
      question: "What is the goal of the first 30-day launch?",
      options: [
        "Perfect branding across every touchpoint",
        "Getting everything right before anyone sees it",
        "Shipping a clear version, learning from real behavior, and iterating quickly",
        "Building multiple products at once",
      ],
      correctAnswer: "Shipping a clear version, learning from real behavior, and iterating quickly",
      explanation:
        "Version one should prioritize clarity and feedback over perfection. Real market behavior is what sharpens the next iteration.",
    },
  ],
};

const promptSystemsStudio: LearnAICourse = {
  slug: "prompt-systems-studio",
  title: "Prompt Systems Studio",
  subtitle:
    "Turn isolated prompts into reusable systems with structure, evaluation loops, and production-ready templates.",
  description:
    "A practical prompt engineering course for builders who want reliability, not random wins.",
  summary:
    "This course teaches how to package prompts into systems you can maintain inside products, operations, and content pipelines.",
  category: "Prompting",
  level: "Intermediate",
  access: "Pro",
  duration: "5 lessons",
  image:
    "https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1600&q=80",
  heroLabel: "Prompting track",
  cardLabel: "Systems",
  outcomes: [
    "A repeatable prompt architecture with clearer inputs and stronger outputs",
    "A testing loop for quality, edge cases, and consistency",
    "Reusable prompt modules for content, workflows, and automation",
    "A clean documentation system for shipping prompt assets to teams or customers",
  ],
  audience:
    "Builders, AI operators, and teams shipping prompt-heavy products, workflows, or services.",
  differentiator:
    "Instead of teaching one-off prompt tricks, this course shows how to create systems that stay useful after launch.",
  certificateTitle: "SpotAI Prompt Systems Certificate",
  assessmentLabel: "Prompt Systems Assessment",
  lessons: [
    {
      id: "architecture",
      title: "Architect Reusable Prompts",
      summary: "Break prompts into reusable parts: role, context, constraints, examples, and output schema.",
      duration: "14 min",
      objective: "Learn a prompt architecture that can be reused across products and workflows.",
      blocks: [
        { type: "paragraph", text: "A reusable prompt is modular. It separates role, context, task, constraints, and output shape so each part can evolve without breaking the whole system." },
        { type: "list", items: ["Role: who the model is acting as", "Context: what the model needs to know", "Task: what it must do", "Constraints: what it must avoid", "Output shape: exactly how the answer should be returned"] },
        { type: "prompt", title: "Starter scaffold", body: "You are [role]. Use the context below to complete the task.\n\nContext: [context]\nTask: [task]\nConstraints: [constraints]\nReturn format: [schema]" },
      ],
    },
    {
      id: "inputs",
      title: "Design Better Inputs",
      summary: "Most bad outputs come from vague inputs. Tighten the user side before over-optimizing the model side.",
      duration: "13 min",
      objective: "Learn how better inputs reduce ambiguity and improve reliability.",
      blocks: [
        { type: "paragraph", text: "If your users can ask anything in any format, your system will spend energy cleaning up ambiguity. Good prompt systems design the inputs as carefully as the outputs." },
        { type: "list", items: ["Use structured forms for critical workflows", "Pre-fill context when the product already knows it", "Limit open-ended questions when a dropdown would be better", "Ask for examples when style matters"] },
        { type: "exercise", title: "Input audit", body: "Choose one prompt-driven workflow in your app and rewrite the user input step so the model receives clearer structure and less ambiguity." },
      ],
    },
    {
      id: "evaluation",
      title: "Evaluate With Rubrics",
      summary: "Create a fast scoring loop so you can improve prompt performance with evidence.",
      duration: "15 min",
      objective: "Set up a rubric-based review loop for prompt quality and failure modes.",
      blocks: [
        { type: "paragraph", text: "Prompt quality is not taste-based once you define the job. Evaluate against clarity, completeness, factual grounding, formatting, and user usefulness." },
        { type: "table", headers: ["Rubric", "What to check"], rows: [{ label: "Accuracy", value: "Does the output stay grounded in the provided context?" }, { label: "Coverage", value: "Did it address the full task, not just part of it?" }, { label: "Format", value: "Did it obey the requested structure and style?" }, { label: "Practicality", value: "Would a real user find this directly useful?" }] },
        { type: "callout", title: "System rule", body: "If you cannot evaluate a prompt reliably, you cannot improve it reliably." },
      ],
    },
    {
      id: "library",
      title: "Package a Prompt Library",
      summary: "Document prompts so they can be reused by you, your team, or your customers without becoming a mess.",
      duration: "12 min",
      objective: "Turn scattered prompts into a maintainable library.",
      blocks: [
        { type: "paragraph", text: "A prompt library is not a dump. It needs naming conventions, categories, version notes, and examples of when each prompt should be used." },
        { type: "grid", items: [{ title: "Intent", description: "What job the prompt exists to do" }, { title: "Inputs", description: "What information it needs to work well" }, { title: "Output schema", description: "The exact structure it should return" }, { title: "Edge cases", description: "Where the prompt often fails or needs guardrails" }] },
        { type: "exercise", title: "Library pass", body: "Select five prompts you use repeatedly and document them with intent, inputs, output shape, and examples." },
      ],
    },
    {
      id: "production",
      title: "Ship to Production",
      summary: "Add guardrails, fallbacks, and iteration loops so prompt systems survive real users.",
      duration: "16 min",
      objective: "Understand what changes when prompts leave a playground and face real traffic.",
      blocks: [
        { type: "paragraph", text: "Production prompt systems need more than good wording. They need retries, guardrails, logging, feedback capture, and a realistic fallback path when the model underperforms." },
        { type: "list", items: ["Log inputs, outputs, and failure patterns", "Add a deterministic fallback for high-risk tasks", "Capture user corrections and use them as evaluation data", "Version prompts deliberately instead of editing blind"] },
        { type: "callout", title: "Shipping principle", body: "A prompt is only production-ready when its failure mode is acceptable." },
      ],
    },
  ],
  assessment: [
    {
      id: "q1",
      question: "Which prompt system element defines how the answer should be returned?",
      options: ["Role", "Output schema", "Fallback path", "Examples"],
      correctAnswer: "Output schema",
      explanation: "The output schema defines the structure, making responses easier to validate and use downstream.",
    },
    {
      id: "q2",
      question: "What is the biggest reason to improve inputs before endlessly tuning prompts?",
      options: ["It makes prompts look cleaner", "It reduces ambiguity at the source", "It avoids using AI", "It replaces evaluation"],
      correctAnswer: "It reduces ambiguity at the source",
      explanation: "Cleaner inputs reduce model guesswork and make prompt behavior more predictable.",
    },
    {
      id: "q3",
      question: "Why do evaluation rubrics matter?",
      options: ["They make prompts longer", "They turn quality into something you can measure and improve", "They remove the need for examples", "They replace documentation"],
      correctAnswer: "They turn quality into something you can measure and improve",
      explanation: "Without a rubric, prompt refinement becomes opinion-based and inconsistent.",
    },
    {
      id: "q4",
      question: "What separates a prompt library from a prompt dump?",
      options: ["More colors", "Naming, categories, examples, and documentation", "Only using one model", "Hiding prompts from the team"],
      correctAnswer: "Naming, categories, examples, and documentation",
      explanation: "A usable library gives context and reuse instructions, not just raw prompt text.",
    },
  ],
};

const agentOpsFoundations: LearnAICourse = {
  slug: "agent-ops-foundations",
  title: "Agent Ops Foundations",
  subtitle:
    "Design agent workflows with clearer boundaries, better tool use, and safer operational control.",
  description:
    "A systems course for builders moving from simple AI outputs toward multi-step agents and copilots.",
  summary:
    "This track focuses on the product and operational layer of agents: what they should do, what tools they need, what humans still own, and how to keep the system legible.",
  category: "Agents",
  level: "Advanced",
  access: "Pro",
  duration: "5 lessons",
  image:
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80",
  heroLabel: "Advanced track",
  cardLabel: "Agents",
  outcomes: [
    "A practical agent boundary that avoids unnecessary autonomy",
    "A tool and routing layer that matches agent capabilities to the right jobs",
    "A memory model that improves outcomes instead of bloating context",
    "A human-review and observability plan for safer live deployment",
  ],
  audience:
    "Teams and solo builders creating assistants, copilots, or internal AI agents with multi-step behavior.",
  differentiator:
    "This course treats agents as operational systems, not magic demos. You learn architecture, control, and reliability together.",
  certificateTitle: "SpotAI Agent Operations Certificate",
  assessmentLabel: "Agent Systems Assessment",
  lessons: [
    {
      id: "boundaries",
      title: "Define Agent Boundaries",
      summary: "Decide what the agent owns, what stays deterministic, and what needs approval.",
      duration: "15 min",
      objective: "Avoid giving the agent ambiguous ownership over critical product logic.",
      blocks: [
        { type: "paragraph", text: "The fastest way to build a fragile agent is to let it handle decisions that should have been deterministic. Boundaries create reliability." },
        { type: "list", items: ["Use the agent for judgment-heavy language tasks", "Use code for deterministic validation and routing", "Use explicit approvals for high-risk irreversible actions"] },
      ],
    },
    {
      id: "tools-routing",
      title: "Tools and Routing",
      summary: "Choose the right tools and route requests to the right agent or workflow path.",
      duration: "14 min",
      objective: "Understand how routing decisions shape reliability and speed.",
      blocks: [
        { type: "paragraph", text: "One general agent is easy to demo. A routed system is easier to trust. Specialized tools and clear routing reduce failure spread." },
        { type: "grid", items: [{ title: "General intake", description: "Interpret the request and classify intent" }, { title: "Task specialist", description: "Handle a bounded job with narrow context" }, { title: "Tool wrapper", description: "Execute deterministic actions safely" }, { title: "Escalation path", description: "Send unclear or high-risk tasks to review" }] },
      ],
    },
    {
      id: "memory",
      title: "Memory That Matters",
      summary: "Store only the context that improves the next decision or response.",
      duration: "12 min",
      objective: "Use memory intentionally instead of saving everything by default.",
      blocks: [
        { type: "paragraph", text: "Memory should help the agent make better decisions, not simply increase token load. Keep only what influences future behavior." },
        { type: "list", items: ["Stable user preferences", "Open tasks and unresolved context", "Useful summaries of previous actions", "Approved outputs or constraints that should carry forward"] },
      ],
    },
    {
      id: "human-review",
      title: "Human Review Loops",
      summary: "Add approval moments that preserve speed without losing control.",
      duration: "13 min",
      objective: "Know when an agent should ask for review and how to keep that friction low.",
      blocks: [
        { type: "paragraph", text: "Human-in-the-loop is not failure. It is part of a sane operating system. The goal is selective intervention at the moments that materially affect risk or trust." },
        { type: "callout", title: "Review checkpoints", body: "Require approval when the action is external, financial, destructive, sensitive, or hard to reverse." },
      ],
    },
    {
      id: "live-ops",
      title: "Live Ops and Failure Handling",
      summary: "Instrument, debug, and improve agent systems after launch.",
      duration: "17 min",
      objective: "Build an agent operating model that remains observable and improvable in production.",
      blocks: [
        { type: "paragraph", text: "Real users reveal edge cases your sandbox never will. You need logs, traces, review data, and a process for learning from failures quickly." },
        { type: "list", items: ["Track route decisions and tool calls", "Save failure summaries, not just raw logs", "Tag repeated failure classes for prioritization", "Version prompts, tool contracts, and routing rules deliberately"] },
        { type: "exercise", title: "Live ops checklist", body: "Define what you will log, who reviews failures, how often routes are audited, and what triggers a rollback or review-only mode." },
      ],
    },
  ],
  assessment: [
    {
      id: "q1",
      question: "What is the main purpose of agent boundaries?",
      options: ["To make the agent feel more autonomous", "To separate agent judgment from deterministic logic", "To store more memory", "To reduce UI design work"],
      correctAnswer: "To separate agent judgment from deterministic logic",
      explanation: "Boundaries prevent the agent from owning logic that code or approvals should control.",
    },
    {
      id: "q2",
      question: "Why is routing useful in agent systems?",
      options: ["It makes prompts longer", "It sends every task to the same model", "It matches tasks to better-suited specialists or paths", "It removes the need for tools"],
      correctAnswer: "It matches tasks to better-suited specialists or paths",
      explanation: "Routing improves quality and control by sending work to the right tool or specialist flow.",
    },
    {
      id: "q3",
      question: "What kind of memory is most valuable?",
      options: ["Everything the user ever said", "Only data that changes future decisions or responses", "Only the last message", "Random examples from other users"],
      correctAnswer: "Only data that changes future decisions or responses",
      explanation: "Useful memory is selective. It exists to improve future actions, not to maximize storage.",
    },
    {
      id: "q4",
      question: "When should an agent ask for human review?",
      options: ["Never", "Only after launch", "When the action is risky, irreversible, or sensitive", "Only for long tasks"],
      correctAnswer: "When the action is risky, irreversible, or sensitive",
      explanation: "Human review is appropriate when risk, trust, or reversibility matters.",
    },
  ],
};

export const learnAiCourses: LearnAICourse[] = [
  onlineBusinessMasterPlan,
  promptSystemsStudio,
  agentOpsFoundations,
];

export const getLearnAiCourseBySlug = (slug: string) =>
  learnAiCourses.find((course) => course.slug === slug) || null;

export const getLearnAiLessonById = (course: LearnAICourse, lessonId: string) =>
  course.lessons.find((lesson) => lesson.id === lessonId) || null;

export const getLearnAiNextLesson = (course: LearnAICourse, lessonId: string) => {
  const index = course.lessons.findIndex((lesson) => lesson.id === lessonId);
  if (index === -1 || index === course.lessons.length - 1) return null;
  return course.lessons[index + 1];
};

export const getLearnAiPreviousLesson = (course: LearnAICourse, lessonId: string) => {
  const index = course.lessons.findIndex((lesson) => lesson.id === lessonId);
  if (index <= 0) return null;
  return course.lessons[index - 1];
};

export const getLearnAiFirstIncompleteLessonId = (
  course: LearnAICourse,
  completedLessonIds: string[],
) => {
  return course.lessons.find((lesson) => !completedLessonIds.includes(lesson.id))?.id || course.lessons[0]?.id || null;
};

export const learnAiCategories = [
  "All",
  ...Array.from(new Set(learnAiCourses.map((course) => course.category))),
];
