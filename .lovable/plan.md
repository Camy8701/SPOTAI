

## Design Overhaul: Remove AI-Generated Look, Align with Original Theme

The current UI has drifted into a generic AI-generated aesthetic: rainbow gradient icon circles on every page header, pastel HSL-colored dashed-border stat cards, and repetitive layout patterns. The original project uses a clean, editorial style with `bg-card`, `bg-secondary`, solid borders, and the Inter/Singo Sans font stack. Here's the plan to fix it.

### Issues Identified

1. **Footer** still says "UTOPAI" instead of "The Kave"
2. **Sidebar** uses colorful gradient circle icons for every item -- screams AI-generated
3. **Every page** opens with the same gradient-icon + title + subtitle header block
4. **Marketplace** is just static colored rectangles with no real depth
5. **Admin Dashboard analytics** uses inline HSL pastel backgrounds with dashed borders -- looks like a demo template
6. **Communities, Groups, Popular, Messages** all follow identical structural patterns
7. **Ebooks/Podcast Library** cards have floating icon badges that serve no function

### Design Direction

Follow the original Index.tsx patterns: clean white/secondary backgrounds, `card-hover` class for lift effects, solid `bg-card` containers, `border border-border` (not dashed), and the existing color palette (blue-600, purple-600, green-600, red-500). No gradient circles. No inline HSL colors. No dashed borders.

### Changes

**1. Footer (`Footer.tsx`)**
- Update branding from "UTOPAI" to "The Kave" with the gradient text style matching the header

**2. Sidebar (`AppSidebar.tsx`)**
- Remove gradient circle icon wrappers entirely
- Use plain icons with subtle color tinting (like `text-blue-500`) directly, no background circles
- Cleaner, minimal sidebar matching professional platforms

**3. Marketplace (`Marketplace.tsx`)**
- Remove the gradient icon header block
- Use a simple text heading consistent with Index.tsx section headers
- Replace flat gradient category cards with `bg-card` cards that have subtle left-border color accents and proper hover states using `card-hover`

**4. Popular (`Popular.tsx`)**
- Remove gradient icon header
- Use clean section header like Index.tsx
- Keep the ranked list but refine card styling to match `bg-card` pattern from Index

**5. Communities (`Communities.tsx`)**
- Remove gradient icon header
- Clean up card design to use `bg-card` with `card-hover`, remove emoji-heavy headers

**6. Groups (`Groups.tsx`)**
- Same treatment as Communities -- remove gradient header, clean cards

**7. Messages (`Messages.tsx`)**
- Remove gradient icon header
- Keep the messenger layout but with cleaner styling

**8. EbooksLibrary & PodcastLibrary**
- Remove the floating icon badges on cards (BookOpen, Tag, Bookmark overlays) -- they add visual noise
- Simplify cards to match the Featured Collections card pattern from Index.tsx

**9. Admin Dashboard Analytics (`AdminDashboard.tsx`)**
- Replace pastel HSL dashed-border stat cards with clean `bg-card border border-border` cards with solid styling
- Remove inline `style={{ backgroundColor: ... }}` -- use Tailwind classes only
- Remove "Content Command Center" / military-style headings
- Use clean section titles consistent with the rest of the platform
- Replace dashed-border activity feed boxes with clean bordered cards

### Technical Approach
- All changes are CSS/markup only -- no database or logic changes
- Consistently use existing Tailwind theme tokens: `bg-card`, `bg-secondary`, `border-border`, `text-foreground`, `text-muted-foreground`
- Use the `card-hover` utility class already defined in `index.css`
- Keep `framer-motion` interactions but remove the generic `whileHover={{ scale }}` on every element

