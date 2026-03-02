import { Brain } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <Link to="/" className="mb-3 flex items-center gap-2">
            <div className="gradient-bg flex h-8 w-8 items-center justify-center rounded-lg">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              UTOP<span className="gradient-text">AI</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Exploring the frontier of artificial intelligence through stories, news, and interactive content.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Content</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/stories" className="hover:text-foreground transition-colors">AI Stories</Link>
            <Link to="/news" className="hover:text-foreground transition-colors">Latest News</Link>
            <Link to="/quizzes" className="hover:text-foreground transition-colors">Quizzes</Link>
            <Link to="/collections" className="hover:text-foreground transition-colors">Collections</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Company</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Legal</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
      <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} UTOP AI. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
