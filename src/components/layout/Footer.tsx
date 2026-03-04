import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="relative bg-foreground text-background overflow-hidden">
    {/* Animated SVG Background */}
    <div className="absolute inset-0 pointer-events-none opacity-20">
      <svg
        className="w-full h-full"
        viewBox="0 0 800 400"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="footer-grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(217, 91%, 60%)" />
            <stop offset="50%" stopColor="hsl(271, 81%, 56%)" />
            <stop offset="100%" stopColor="hsl(330, 81%, 60%)" />
          </linearGradient>
          <linearGradient id="footer-grad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(25, 95%, 53%)" />
            <stop offset="100%" stopColor="hsl(217, 91%, 60%)" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="300" r="180" fill="url(#footer-grad1)" className="animate-footer-wave" />
        <circle cx="700" cy="100" r="150" fill="url(#footer-grad2)" className="animate-footer-wave-reverse" />
        <circle cx="400" cy="350" r="120" fill="url(#footer-grad1)" className="animate-footer-float" />
      </svg>
    </div>

    <div className="relative z-10 container px-6 md:px-12 py-12 md:py-16">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
        {/* Brand */}
        <Link to="/" className="block">
          <span
            className="text-3xl md:text-4xl font-extrabold tracking-tight"
            style={{
              background: "linear-gradient(135deg, hsl(217 91% 60%), hsl(271 81% 56%), hsl(330 81% 60%), hsl(25 95% 53%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            SpotAI
          </span>
        </Link>

        {/* Navigation Columns */}
        <div className="flex gap-16 md:gap-24">
          <div className="flex flex-col gap-3">
            <a href="/library" className="text-sm font-medium opacity-80 hover:opacity-100 transition-opacity">
              About Us
            </a>
            <a href="/marketplace" className="text-sm font-medium opacity-80 hover:opacity-100 transition-opacity">
              Marketplace
            </a>
            <a href="/popular" className="text-sm font-medium opacity-80 hover:opacity-100 transition-opacity">
              Popular
            </a>
          </div>
          <div className="flex flex-col gap-3">
            <a href="/messages" className="text-sm font-medium opacity-80 hover:opacity-100 transition-opacity">
              Contact Us
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium opacity-80 hover:opacity-100 transition-opacity"
            >
              Instagram
            </a>
            <a
              href="https://www.twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium opacity-80 hover:opacity-100 transition-opacity"
            >
              Twitter/X
            </a>
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium opacity-80 hover:opacity-100 transition-opacity"
            >
              Facebook
            </a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-background/20 pt-6">
        <p className="text-xs opacity-60 text-center">
          © {new Date().getFullYear()} SpotAI. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
