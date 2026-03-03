import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Footer = () => (
  <footer className="border-t border-border bg-background">
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl">
            The <span className="gradient-text">Kave</span>
          </span>
        </Link>
        <Button asChild>
          <a href="https://ko-fi.com/utopai" target="_blank" rel="noopener noreferrer">
            Support Us
          </a>
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} The Kave. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
