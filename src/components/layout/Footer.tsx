import { Link } from "react-router-dom";

const Footer = () => {
  const handleNavigate = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="overflow-hidden border-t border-neutral-200 bg-white pt-24 text-slate-950">
      <div className="mb-20 w-full px-4 text-center">
        <div
          style={{
            maskImage: "linear-gradient(180deg, transparent, black 0%, black 55%, transparent)",
            WebkitMaskImage: "linear-gradient(180deg, transparent, black 0%, black 55%, transparent)",
          }}
        >
          <h1 className="reveal-on-scroll select-none text-[22vw] font-bold leading-[0.7] tracking-tighter text-[#e7e7e7] mix-blend-multiply scale-y-110">
            SPOTAI
          </h1>
        </div>
      </div>

      <div className="reveal-on-scroll reveal-delay-100 grid grid-cols-1 border-t border-neutral-200 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-12 border-r border-neutral-200 p-8 md:p-16">
          <div className="flex flex-col gap-6">
            <Link
              to="/home"
              onClick={handleNavigate}
              className="text-xs font-medium uppercase tracking-widest text-neutral-500 transition-colors hover:text-black"
            >
              About Us
            </Link>
            <Link
              to="/marketplace"
              onClick={handleNavigate}
              className="text-xs font-medium uppercase tracking-widest text-neutral-500 transition-colors hover:text-black"
            >
              Shop
            </Link>
            <Link
              to="/tools"
              onClick={handleNavigate}
              className="text-xs font-medium uppercase tracking-widest text-neutral-500 transition-colors hover:text-black"
            >
              Technology
            </Link>
          </div>
          <div className="flex flex-col gap-6">
            <Link
              to="/messages"
              onClick={handleNavigate}
              className="text-xs font-medium uppercase tracking-widest text-neutral-500 transition-colors hover:text-black"
            >
              Contact Us
            </Link>
            <Link
              to="/image-library"
              onClick={handleNavigate}
              className="text-xs font-medium uppercase tracking-widest text-neutral-500 transition-colors hover:text-black"
            >
              Instagram
            </Link>
            <Link
              to="/popular"
              onClick={handleNavigate}
              className="text-xs font-medium uppercase tracking-widest text-neutral-500 transition-colors hover:text-black"
            >
              Twitter/X
            </Link>
            <Link
              to="/communities"
              onClick={handleNavigate}
              className="text-xs font-medium uppercase tracking-widest text-neutral-500 transition-colors hover:text-black"
            >
              Facebook
            </Link>
          </div>
        </div>

        <div className="aether-bottles relative flex h-48 w-full items-center justify-center overflow-hidden border-t border-neutral-200 lg:h-auto lg:border-t-0">
          <svg
            viewBox="0 0 400 120"
            className="h-[160px] max-h-[160px] w-[756px] opacity-20"
            preserveAspectRatio="xMidYMid meet"
            strokeWidth="2"
            style={{ width: "756px", height: "160px", color: "rgb(15, 23, 42)" }}
          >
            <path d="M40 100 L50 30 L90 30 L100 100" stroke="currentColor" strokeWidth="1" fill="none" />
            <rect x="50" y="20" width="40" height="10" stroke="currentColor" strokeWidth="1" fill="none" />

            <path d="M120 100 L130 10 L170 10 L180 100" stroke="currentColor" strokeWidth="1" fill="none" />
            <rect x="130" y="5" width="40" height="5" stroke="currentColor" strokeWidth="1" fill="none" />

            <g transform="translate(200, 10)" className="dropper-bottle">
              <defs>
                <clipPath id="dropper-clip">
                  <path
                    d="M15 25
                   Q15 20 20 20
                   L40 20
                   Q45 20 45 25
                   L45 80
                   Q45 90 30 90
                   Q15 90 15 80
                   Z"
                  />
                </clipPath>
              </defs>

              <path
                d="M25 0 L25 10 L20 10 L20 20 L40 20 L40 10 L35 10 L35 0 Z"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />

              <path
                d="M15 25 Q15 20 20 20 L40 20 Q45 20 45 25 L45 80 Q45 90 30 90 Q15 90 15 80 Z"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />

              <g clipPath="url(#dropper-clip)">
                <rect className="liquid-fill" x="15" y="60" width="30" height="30" fill="#7c4a30" opacity="0.6" />
                <path
                  className="liquid-wave"
                  d="M15 60
                 Q22 55 30 57
                 Q38 59 45 56
                 L45 90
                 L15 90 Z"
                  fill="#7c4a30"
                  opacity="0.9"
                />
              </g>
            </g>

            <path d="M270 100 L280 20 L320 20 L330 100" stroke="currentColor" strokeWidth="1" fill="none" />
            <rect x="280" y="10" width="40" height="10" stroke="currentColor" strokeWidth="1" fill="none" />

            <g transform="translate(350, 20)">
              <rect x="25" y="0" width="10" height="20" stroke="currentColor" strokeWidth="1" fill="none" />
              <path
                d="M15 25 Q15 20 20 20 L40 20 Q45 20 45 25 L45 70 Q45 80 30 80 Q15 80 15 70 Z"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
            </g>
          </svg>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-6 border-t border-neutral-200 px-8 py-8 text-[10px] font-medium tracking-wide text-neutral-600 md:flex-row md:px-16">
        <div>2024 All rights reserved</div>
        <div className="flex gap-8">
          <Link to="/home" onClick={handleNavigate} className="transition-colors hover:text-black">
            Privacy Policy
          </Link>
          <Link to="/home" onClick={handleNavigate} className="transition-colors hover:text-black">
            Terms of use
          </Link>
          <Link to="/home" onClick={handleNavigate} className="transition-colors hover:text-black">
            Cookies
          </Link>
        </div>
      </div>

      <style>{`
        .aether-bottles .liquid-fill,
        .aether-bottles .liquid-wave {
          transform-box: fill-box;
          transform-origin: center bottom;
        }

        .aether-bottles svg:hover .liquid-wave {
          animation: aether-wave 1.8s ease-in-out infinite;
        }

        .aether-bottles svg:hover .liquid-fill {
          animation: aether-fill 1.8s ease-in-out infinite;
        }

        @keyframes aether-wave {
          0% { transform: translateX(0) translateY(0); }
          25% { transform: translateX(-3px) translateY(-2px); }
          50% { transform: translateX(3px) translateY(-1px); }
          75% { transform: translateX(-2px) translateY(-3px); }
          100% { transform: translateX(0) translateY(0); }
        }

        @keyframes aether-fill {
          0% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
          100% { transform: translateY(-2px); }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
