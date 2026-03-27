import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, Shield, X } from "lucide-react";

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "all");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie_consent", "essential");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[998] bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl md:p-8">
          <button
            onClick={decline}
            className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>

          <h3 className="text-lg font-bold text-foreground md:text-xl">
            Allow the use of cookies from SpotAI on this browser?
          </h3>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We use cookies and similar technologies to help provide and improve content on SpotAI.
            We also use them to provide a safer experience by using information that we receive from
            cookies on and off SpotAI.
          </p>

          <ul className="mt-3 list-disc pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>
              <strong className="text-foreground">Essential cookies:</strong> These cookies are
              required to use SpotAI and are necessary for our site to work as intended.
            </li>
            <li className="mt-1">
              <strong className="text-foreground">Analytics cookies:</strong> We use these cookies
              to understand how people use SpotAI so we can improve our platform.
            </li>
          </ul>

          {showDetails && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-muted/50 p-4">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Cookie className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">What are cookies?</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Small files stored on your device to remember preferences.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/50 p-4">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">Why do we use cookies?</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  To keep you logged in, remember preferences, and improve your experience.
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-3 text-sm font-medium text-primary transition-colors hover:underline"
          >
            {showDetails ? "Hide details" : "Learn more about cookies"}
          </button>

          <div className="mt-5 flex gap-3">
            <Button
              variant="outline"
              onClick={decline}
              className="h-11 flex-1 rounded-full text-sm font-semibold"
            >
              Decline optional cookies
            </Button>
            <Button
              onClick={accept}
              className="h-11 flex-1 rounded-full text-sm font-semibold"
            >
              Allow all cookies
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookieBanner;
