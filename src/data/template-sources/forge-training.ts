export const FORGE_TRAINING_TEMPLATE_CODE = String.raw`<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Forge — Stronger. Sharper. Unstoppable.</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&amp;display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<meta name="disabled-font-classes" content="font-roboto,font-montserrat,font-poppins,font-playfair,font-instrument-serif,font-merriweather,font-bricolage,font-space-grotesk,font-work-sans,font-pt-serif,font-geist-mono,font-space-mono,font-quicksand,font-manrope,font-nunito,font-jakarta">
<link id="all-fonts-link-font-geist" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&amp;display=swap"><style id="all-fonts-style-font-geist">
.font-geist {
font-family: 'Geist', sans-serif !important;
}
</style></head>

<body class="min-h-screen antialiased overflow-x-hidden text-white bg-neutral-950" style="font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji';"><div class="fixed top-0 w-full -z-10 h-screen bg-cover bg-center" style="background-image: url(&quot;https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/8f934586-4789-4792-826e-1853be92e6aa_3840w.jpg&quot;); animation: scrollBlur linear both; animation-timeline: view(); animation-range: entry 100% entry 200%;"></div>

<style class="">
  /* 
    Sequence animation intro. Usage:
    1) Add to Inline CSS: animation: fadeSlideIn 1s ease-out 0.1s both;
  */
  @keyframes fadeSlideIn {
    0% {
      opacity: 0;
      transform: translateY(30px);
      filter: blur(8px);
    }

    100% {
      opacity: 1;
      transform: translateY(0);
      filter: blur(0px);
    }
  }
</style>
<style class="">
  /* 
    Background parallax. Usage:
    1) Add to Inline CSS: animation: scrollBlur linear both; animation-timeline: view(); animation-range: entry 100% entry 200%;
  */
  @keyframes scrollBlur {
    from {
      filter: blur(0px);
    }

    to {
      filter: blur(100px);
    }
  }
</style>
<script class="">
  /* 
    Sequence animation on scroll when visible. Usage:
    1) Add to Inline CSS: animation: fadeSlideIn 1.0s ease-out 0.1s both;
    2) Add to Tailwind Classes: animate-on-scroll
  */
  (function () {
    // Inject CSS for paused/running states
    const style = document.createElement("style");
    style.textContent = \`
      /* Default: paused */
      .animate-on-scroll { animation-play-state: paused !important; }
      /* Activated by JS */
      .animate-on-scroll.animate { animation-play-state: running !important; }
    \`;
    document.head.appendChild(style);

    const once = true;

    if (!window.__inViewIO) {
      window.__inViewIO = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate");
            if (once) window.__inViewIO.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2, rootMargin: "0px 0px -10% 0px" });
    }

    window.initInViewAnimations = function (selector = ".animate-on-scroll") {
      document.querySelectorAll(selector).forEach((el) => {
        window.__inViewIO.observe(el); // observing twice is a no-op
      });
    };

    document.addEventListener("DOMContentLoaded", () => initInViewAnimations());
  })();
</script>

  
  <!-- Navigation -->
  <header class="z-50 relative" style="background-image: linear-gradient(to bottom, rgba(10, 10, 10, 0.5), transparent);">
  <div class="lg:px-8 max-w-7xl mr-auto ml-auto pr-6 pl-6">
    <div class="flex pt-6 pb-6 items-center justify-between">
      <a href="/" class="inline-flex items-center justify-center bg-center w-[150px] h-[40px] bg-[url(https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/3185425e-0207-434a-9554-cdb5bd455ea5_320w.png)] bg-cover rounded"></a>
      
      <!-- Desktop Navigation -->
      <nav class="hidden lg:flex items-center gap-8">
        <a href="/programs" class="hover:text-white/90 transition text-sm font-normal text-white/80 font-geist">Programs</a>
        <a href="/coaches" class="hover:text-white/90 transition text-sm font-normal text-white/80 font-geist">Coaches</a>
        <a href="/method" class="hover:text-white/90 transition text-sm font-normal text-white/80 font-geist">Method</a>
        <a href="/pricing" class="hover:text-white/90 transition text-sm font-normal text-white/80 font-geist">Pricing</a>
        <a href="/support" class="hover:text-white/90 transition text-sm font-normal text-white/80 font-geist">Support</a>
        <button class="inline-flex gap-2 transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 text-sm font-normal text-white/90 font-geist bg-white/10 border-white/10 border rounded-full pt-2 pr-4 pb-2 pl-4 backdrop-blur items-center">
          Start Training
        </button>
      </nav>

      <!-- Mobile Menu Button -->
      <button id="mobile-menu-button" class="lg:hidden inline-flex transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 text-sm font-normal text-white/90 font-geist bg-white/10 border-white/10 border rounded-full pt-2 pr-4 pb-2 pl-4 backdrop-blur gap-x-2 gap-y-2 items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" id="menu-icon" class="lucide lucide-menu w-[16px] h-[16px]" style="width: 16px; height: 16px; color: rgb(255, 255, 255);"><path d="M4 5h16"></path><path d="M4 12h16"></path><path d="M4 19h16"></path></svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" id="close-icon" class="lucide lucide-x w-[16px] h-[16px] hidden" style="width: 16px; height: 16px; color: rgb(255, 255, 255);"><path d="m18 6-12 12"></path><path d="m6 6 12 12"></path></svg>
        <span id="menu-text">Menu</span>
      </button>
    </div>

    <!-- Mobile Navigation Menu -->
    <div id="mobile-menu" class="lg:hidden fixed inset-0 bg-black/95 backdrop-blur-xl z-50 opacity-0 invisible transition-all duration-300 ease-out">
      <div class="flex flex-col h-full pt-6 pb-8 px-6">
        <!-- Close Button -->
        <div class="flex justify-end mb-8">
          <button id="mobile-close-button" class="inline-flex transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 text-sm font-normal text-white/90 font-geist bg-white/10 border-white/10 border rounded-full pt-3 pr-3 pb-3 pl-3 backdrop-blur">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x" style="color: rgb(255, 255, 255);"><path d="m18 6-12 12"></path><path d="m6 6 12 12"></path></svg>
          </button>
        </div>
        
        <nav class="flex-1">
          <div class="space-y-6">
            <a href="/programs" class="block hover:text-white transition text-2xl font-normal text-white/80 font-geist">Programs</a>
            <a href="/coaches" class="block hover:text-white transition text-2xl font-normal text-white/80 font-geist">Coaches</a>
            <a href="/method" class="block hover:text-white transition text-2xl font-normal text-white/80 font-geist">Method</a>
            <a href="#pricing" class="block hover:text-white transition text-2xl font-normal text-white/80 font-geist">Pricing</a>
            <a href="#support" class="block text-2xl font-normal text-white/80 hover:text-white transition font-geist">Support</a>
          </div>
          
          <div class="mt-12 pt-8 border-t border-white/10">
            <button class="w-full inline-flex gap-2 transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 text-base font-normal text-white/90 font-geist bg-white/10 border-white/10 border rounded-full pt-3 pr-6 pb-3 pl-6 backdrop-blur items-center justify-center">
              Start Training
            </button>
          </div>
        </nav>
      </div>
    </div>

    <script class="">
      (function() {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileCloseButton = document.getElementById('mobile-close-button');
        const mobileMenu = document.getElementById('mobile-menu');
        const menuIcon = document.getElementById('menu-icon');
        const closeIcon = document.getElementById('close-icon');
        const menuText = document.getElementById('menu-text');
        let isMenuOpen = false;

        function toggleMenu() {
          isMenuOpen = !isMenuOpen;
          
          if (isMenuOpen) {
            // Open menu
            mobileMenu.classList.remove('opacity-0', 'invisible');
            mobileMenu.classList.add('opacity-100', 'visible');
            menuIcon.classList.add('hidden');
            closeIcon.classList.remove('hidden');
            menuText.textContent = 'Close';
            document.body.style.overflow = 'hidden';
          } else {
            // Close menu
            mobileMenu.classList.remove('opacity-100', 'visible');
            mobileMenu.classList.add('opacity-0', 'invisible');
            menuIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
            menuText.textContent = 'Menu';
            document.body.style.overflow = '';
          }
        }

        // Toggle menu on button click
        mobileMenuButton.addEventListener('click', toggleMenu);

        // Close menu on close button click
        mobileCloseButton.addEventListener('click', toggleMenu);

        // Close menu when clicking on links
        const mobileMenuLinks = mobileMenu.querySelectorAll('a');
        mobileMenuLinks.forEach(link => {
          link.addEventListener('click', () => {
            if (isMenuOpen) {
              toggleMenu();
            }
          });
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && isMenuOpen) {
            toggleMenu();
          }
        });

        // Close menu when clicking outside (on the overlay)
        mobileMenu.addEventListener('click', (e) => {
          if (e.target === mobileMenu && isMenuOpen) {
            toggleMenu();
          }
        });
      })();
    </script>
  </div>
</header>

  <!-- Hero -->
  <section class="z-20 flex min-h-[90vh] relative items-end" style="font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji';">
    <div class="lg:px-8 max-w-7xl mr-auto ml-auto pt-20 pr-6 pb-20 pl-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center opacity-0 animate-[fadeInUp_1s_ease-out_0.2s_forwards]">
        <!-- Left Column - Heading -->
        <div class="order-1 opacity-0 animate-[slideInBlur_1.2s_ease-out_0.4s_forwards]" style="transform: translateY(30px); filter: blur(10px);">
          <h1 class="sm:text-7xl lg:text-8xl xl:text-9xl leading-[0.9] text-6xl font-semibold tracking-tighter font-geist" style="">Stronger.
            Sharper.
            Focused.<br class=""><br class=""></h1>
        </div>

        <!-- Right Column - Content -->
        <div class="order-2 lg:order-2">
          <div class="flex gap-3 animate-[fadeInSlide_0.8s_ease-out_0.6s_forwards] text-xs text-white/70 opacity-0 mb-6 gap-x-3 gap-y-3 items-center" style="transform: translateX(20px);">
            <div class="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur border border-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-lucide="star" class="lucide lucide-star w-[14px] h-[14px] text-slate-50" data-icon-replaced="true" style="width: 14px; height: 14px;">
                <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z">
                </path>
              </svg>
              <span class="font-normal font-geist">Elite</span>
              <span class="font-medium text-white/90 font-geist">4.9</span>
              <span class="text-white/60 font-geist">rating</span>
            </div>
            <div class="hidden md:block w-px h-4 bg-white/20"></div>
            <span class="hidden md:inline font-normal font-geist">Join 15k+ athletes</span>
          </div>

          <p class="sm:text-xl leading-relaxed animate-[fadeInUp_0.8s_ease-out_0.8s_forwards] text-lg text-white/80 font-geist opacity-0 mb-8" style="transform: translateY(20px); filter: blur(5px);">
            Forge your ultimate physique with precision training and elite coaching.
            Built for athletes who demand excellence in every rep.
          </p>

          <div class="border-t border-white/10 pt-6 mb-6 opacity-0 animate-[fadeInScale_0.8s_ease-out_1s_forwards]" style="transform: scale(0.95); filter: blur(3px);">
            <div class="flex flex-wrap gap-4 gap-x-4 gap-y-4 items-center">
              <div class="relative inline-block group rounded-full">
                <button class="animate-[slideInBlur_0.8s_ease-out_1.2s_forwards] z-10 overflow-hidden transition-[transform] duration-150 ease-out active:scale-[0.98] hover:bg-white/15 text-white bg-white/10 opacity-0 border-white/20 border rounded-full pt-3 pr-6 pb-3 pl-6 relative shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] cursor-pointer" style="--x: 199.6484375px; --y: 12px; --o: 0; transform: translateX(-30px); filter: blur(8px);" onmousemove="btnMove(event)" onmouseenter="this.style.setProperty('--o','1')" onmouseleave="this.style.setProperty('--o','0')" onclick="window.location.href='/signin'" role="button">
            <span class="relative z-10 inline-flex items-center gap-2 font-normal rounded-full font-geist" style="">Start Forging<svg class="h-5 w-5 transition-transform duration-200 ease-out group-hover:translate-x-0.5 rounded-full" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 5l7 7-7 7" class="rounded-full"></path>
              </svg></span>
            <span class="pointer-events-none absolute bottom-0 left-1/2 right-1/2 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80 transition-[left,right] duration-500 ease-out group-hover:left-0 group-hover:right-0 rounded-full"></span>
            <span class="glow pointer-events-none absolute inset-0 -z-10 rounded-full" aria-hidden="true" style="transform: scale(0.95) translate(0px, -24px);"></span>
          </button>
                <span class="pointer-events-none absolute -bottom-3 left-1/2 z-0 h-6 w-44 -translate-x-1/2 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 rounded-full" style="background: radial-gradient(60% 100% at 50% 50%, rgba(255,255,255,.55), rgba(255,255,255,.28) 35%, transparent 70%); filter: blur(10px) saturate(120%);" aria-hidden="true"></span>
              </div>

              <div class="w-px h-6 bg-white/20"></div>

              <button class="inline-flex gap-2 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 animate-[fadeInSlide_0.8s_ease-out_1.4s_forwards] text-base font-normal text-white/90 font-geist opacity-0 border-white/10 border rounded-full pt-2.5 pr-5 pb-2.5 pl-5 backdrop-blur gap-x-2 gap-y-2 items-center cursor-pointer" style="transform: translateX(20px); filter: blur(4px);" onclick="window.location.href='/programs'" role="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-lucide="play" class="lucide lucide-play h-4 w-4"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" class=""></path></svg>
          See the method
        </button>
            </div>
          </div>

          <div class="border-t border-white/10 pt-4 opacity-0 animate-[fadeInUp_0.6s_ease-out_1.6s_forwards]" style="transform: translateY(15px); filter: blur(2px);">
            <p class="text-sm text-white/45 font-geist">
              Elite training protocols. Premium support. All devices supported.
            </p>
          </div>
        </div>

        <style class="">
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
              filter: blur(8px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
              filter: blur(0px);
            }
          }

          @keyframes slideInBlur {
            from {
              opacity: 0;
              transform: translateX(-30px);
              filter: blur(8px);
            }

            to {
              opacity: 1;
              transform: translateX(0);
              filter: blur(0px);
            }
          }

          @keyframes fadeInSlide {
            from {
              opacity: 0;
              transform: translateX(20px);
              filter: blur(4px);
            }

            to {
              opacity: 1;
              transform: translateX(0);
              filter: blur(0px);
            }
          }

          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.95);
              filter: blur(3px);
            }

            to {
              opacity: 1;
              transform: scale(1);
              filter: blur(0px);
            }
          }
        </style>
      </div>
    </div>
  </section>
  <section class="z-20 border-white/10 border-t relative">
    <div class="lg:px-8 max-w-7xl mr-auto ml-auto pt-16 pr-6 pb-16 pl-6">
      <!-- Promise -->
      <div class="text-center max-w-3xl mr-auto ml-auto">
        <span class="inline-flex items-center gap-2 text-[11px] uppercase animate-on-scroll text-white/70 tracking-widest font-geist bg-white/5 border-white/10 border rounded-full pt-1 pr-3 pb-1 pl-3" style="animation: fadeSlideIn 1.0s ease-out 0.1s both;">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="sparkles" class="lucide lucide-sparkles h-3.5 w-3.5"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path><path d="M20 2v4"></path><path d="M22 4h-4" class=""></path><circle cx="4" cy="20" r="2" class=""></circle></svg>
        Our promise
      </span>
        <h2 class="sm:text-5xl animate-on-scroll text-3xl font-semibold tracking-tight font-geist mt-4" style="animation: fadeSlideIn 1.0s ease-out 0.1s both;">Our Performance Promise</h2>
        <p class="leading-relaxed animate-on-scroll text-white/70 font-geist mt-3" style="animation: fadeSlideIn 1.0s ease-out 0.3s both;">
          Every Forge block is built from sport science and refined by real‑world coaching. We combine validated
          methods, measurable progress, and smart recovery so you can train hard—and train for longer.
        </p>
      </div>

      <!-- Slide header -->
      <div class="text-center mt-10">
        <p class="text-[11px] text-white/50 tracking-widest font-geist animate-on-scroll" style="animation: fadeSlideIn 1.0s ease-out 0.4s both;">01 / 04</p>
        <h3 class="sm:text-3xl animate-on-scroll text-2xl font-medium tracking-tight font-geist mt-2" style="animation: fadeSlideIn 1.0s ease-out 0.5s both;">Coach‑developed protocols</h3>
      </div>

      <!-- Large media -->
      <div class="mt-6">
        <div class="overflow-hidden animate-on-scroll bg-white/5 border-white/10 border rounded-2xl relative" style="animation: fadeSlideIn 1.0s ease-out 0.6s both;">
          <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/6993d88e-6d02-49b3-99c7-67c20b9e4d2f_1600w.jpg" alt="Athletes training under coach guidance" class="aspect-[16/9] w-full h-full object-cover">
          <div class="pointer-events-none absolute inset-0 ring-1 ring-white/10 rounded-2xl"></div>
        </div>
      </div>

      <!-- CTA -->
      <div class="flex animate-on-scroll mt-6 justify-center" style="animation: fadeSlideIn 1.0s ease-out 0.1s both;">
        <a href="#" class="inline-flex items-center gap-2 text-sm font-medium text-white/90 border border-white/10 rounded-full px-4 py-2 hover:bg-white/10 transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="flask-conical" class="lucide lucide-flask-conical h-4 w-4">
            <path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2">
            </path>
            <path d="M6.453 15h11.094"></path>
            <path d="M8.5 2h7"></path>
          </svg>
          View the method
        </a>
      </div>

      <!-- Philosophy -->
      <div class="grid grid-cols-1 lg:grid-cols-5 animate-on-scroll mt-14 gap-x-10 gap-y-10 items-start" style="animation: fadeSlideIn 1.0s ease-out 0.2s both;">
        <div class="lg:col-span-3" style="animation: fadeInSlideBlur linear both; animation-timeline: view(); animation-range: entry 0% entry 30%;">
          <p class="text-[11px] uppercase text-white/50 tracking-widest font-geist">
            Our philosophy</p>
          <h3 class="sm:text-3xl text-2xl font-medium tracking-tight font-geist mt-3">
            Strength is built with precision, consistency, and recovery.
          </h3>
          <p class="leading-relaxed text-white/70 font-geist mt-4">
            We program with intention: progressive overload, movement quality, and repeatable metrics. You'll know
            exactly what to do, why you're doing it, and how to adjust based on readiness—so each week stacks cleanly on
            the last.
          </p>

          <style>
            @keyframes fadeInSlideBlur {
              from {
                opacity: 0;
                transform: translateX(-30px);
                filter: blur(8px);
              }

              to {
                opacity: 1;
                transform: translateX(0);
                filter: blur(0px);
              }
            }

            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(20px);
                filter: blur(4px);
              }

              to {
                opacity: 1;
                transform: translateY(0);
                filter: blur(0px);
              }
            }
          </style>
        </div>
        <div class="lg:col-span-2">
          <div class="overflow-hidden bg-white/5 border-white/10 border rounded-2xl relative">
            <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/a5a3060b-c23f-4c61-96e2-35dc5b8c4ebc_1600w.jpg" alt="Minimal kettlebell on stone block" class="aspect-[4/3] w-full h-full object-cover">
            <div class="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 backdrop-blur px-3 py-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="activity" class="lucide lucide-activity h-4 w-4 text-white/90">
                <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2">
                </path>
              </svg>
              <span class="text-xs font-medium text-white/90 font-geist">Adaptive loads</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pillars -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 animate-on-scroll mt-12 gap-x-6 gap-y-6" style="animation: fadeSlideIn 1.0s ease-out 0.3s both;">
        <div class="group hover:bg-white/10 transition-colors bg-white/5 border-white/10 border rounded-xl pt-5 pr-5 pb-5 pl-5 backdrop-blur">
          <div class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="trending-up" class="lucide lucide-trending-up h-4.5 w-4.5 text-white/90">
              <path d="M16 7h6v6"></path>
              <path d="m22 7-8.5 8.5-5-5L2 17"></path>
            </svg>
          </div>
          <p class="mt-3 font-medium tracking-tight font-geist">Progress</p>
          <p class="mt-1 text-sm text-white/60 font-geist">Periodized blocks with RPE and velocity cues to drive
            measurable gains.</p>
        </div>

        <div class="group hover:bg-white/10 transition-colors bg-white/5 border-white/10 border rounded-xl pt-5 pr-5 pb-5 pl-5 backdrop-blur">
          <div class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="heart-handshake" class="lucide lucide-heart-handshake h-4.5 w-4.5 text-white/90">
              <path d="M19.414 14.414C21 12.828 22 11.5 22 9.5a5.5 5.5 0 0 0-9.591-3.676.6.6 0 0 1-.818.001A5.5 5.5 0 0 0 2 9.5c0 2.3 1.5 4 3 5.5l5.535 5.362a2 2 0 0 0 2.879.052 2.12 2.12 0 0 0-.004-3 2.124 2.124 0 1 0 3-3 2.124 2.124 0 0 0 3.004 0 2 2 0 0 0 0-2.828l-1.881-1.882a2.41 2.41 0 0 0-3.409 0l-1.71 1.71a2 2 0 0 1-2.828 0 2 2 0 0 1 0-2.828l2.823-2.762">
              </path>
            </svg>
          </div>
          <p class="mt-3 font-medium tracking-tight font-geist">Coaching care</p>
          <p class="mt-1 text-sm text-white/60 font-geist">Guidance when you need it, with form checks and weekly
            adjustments.</p>
        </div>

        <div class="group hover:bg-white/10 transition-colors bg-white/5 border-white/10 border rounded-xl pt-5 pr-5 pb-5 pl-5 backdrop-blur">
          <div class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="moon-star" class="lucide lucide-moon-star h-4.5 w-4.5 text-white/90">
              <path d="M18 5h4"></path>
              <path d="M20 3v4"></path>
              <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401">
              </path>
            </svg>
          </div>
          <p class="mt-3 font-medium tracking-tight font-geist">Recovery</p>
          <p class="mt-1 text-sm text-white/60 font-geist">Sleep, mobility, and conditioning integrated to keep you
            durable.</p>
        </div>

        <div class="group hover:bg-white/10 transition-colors bg-white/5 border-white/10 border rounded-xl pt-5 pr-5 pb-5 pl-5 backdrop-blur">
          <div class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="shield-check" class="lucide lucide-shield-check h-4.5 w-4.5 text-white/90">
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z">
              </path>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
          </div>
          <p class="mt-3 font-medium tracking-tight font-geist">Trust</p>
          <p class="mt-1 text-sm text-white/60 font-geist">Transparent methods, clear metrics, and results you can
            verify.</p>
        </div>
      </div>
    </div>
  </section>
  <section class="z-20 border-white/10 border-t relative">
    <div class="lg:px-8 max-w-7xl mr-auto ml-auto pt-16 pr-6 pb-16 pl-6">
      <!-- Header -->
      <div class="text-center max-w-3xl mx-auto">
        <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-widest text-white/70 font-geist animate-on-scroll" style="animation: fadeSlideIn 1.0s ease-out 0.1s both;">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="sparkles" class="lucide lucide-sparkles h-3.5 w-3.5"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path><path d="M20 2v4"></path><path d="M22 4h-4"></path><circle cx="4" cy="20" r="2"></circle></svg>
      Platform advantages
    </span>
        <h2 class="sm:text-5xl text-3xl font-semibold tracking-tight font-geist mt-4 animate-on-scroll" style="animation: fadeSlideIn 1.0s ease-out 0.2s both;">Advanced Training Technology</h2>
        <p class="leading-relaxed text-white/70 font-geist mt-3 animate-on-scroll" style="animation: fadeSlideIn 1.0s ease-out 0.3s both;">
          Experience intelligent training management with AI-powered analytics, seamless progress tracking, and
          professional-grade tools designed for serious athletes.
        </p>
      </div>

      <!-- Quadrant layout -->
      <div class="relative mt-12 rounded-2xl border border-white/10 bg-white/5 backdrop-blur animate-on-scroll" style="animation: fadeSlideIn 1.0s ease-out 0.4s both;">
        <!-- Dividers (desktop only) -->
        <div class="pointer-events-none hidden lg:block absolute inset-0">
          <div class="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent">
          </div>
          <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent">
          </div>
        </div>

        <!-- Central orb (desktop only) -->
        <div class="pointer-events-none hidden lg:flex absolute inset-0 items-center justify-center">
          <div class="h-24 w-24 rounded-full border border-white/10 bg-gradient-to-br from-white/10 to-white/5 shadow-[0_0_40px_rgba(255,255,255,0.08)] flex items-center justify-center">
            <div class="h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="chevrons-right" class="lucide lucide-chevrons-right h-5.5 w-5.5 text-white/90">
                <path d="m6 17 5-5-5-5"></path>
                <path d="m13 17 5-5-5-5"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:p-10 pt-6 pr-6 pb-6 pl-6">
          <!-- Top Left -->
          <div class="group sm:p-6 hover:bg-white/10 transition-colors rounded-xl pt-4 pr-4 pb-4 pl-4 animate-on-scroll" style="animation: fadeSlideIn 1.0s ease-out 0.5s both;">
            <div class="flex gap-3 items-start">
              <span class="inline-flex items-center justify-center sm:w-12 bg-white/5 w-24 h-9 border-white/10 border rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="database" class="lucide lucide-database h-4.5 w-4.5 text-white/90"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5V19A9 3 0 0 0 21 19V5"></path><path d="M3 12A9 3 0 0 0 21 12"></path></svg>
          </span>
              <div class="">
                <p class="font-medium tracking-tight font-geist">Smart Data Integration</p>
                <p class="text-sm text-white/60 font-geist">Seamlessly connect wearables, apps, and manual inputs for
                  comprehensive performance tracking.</p>
              </div>
            </div>
          </div>
          <!-- Top Right -->
          <div class="group rounded-xl p-4 sm:p-6 hover:bg-white/10 transition-colors animate-on-scroll" style="animation: fadeSlideIn 1.0s ease-out 0.6s both;">
            <div class="flex gap-3 items-start">
              <span class="inline-flex items-center justify-center sm:w-12 bg-white/5 w-24 h-9 border-white/10 border rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="line-chart" class="lucide lucide-line-chart h-4.5 w-4.5 text-white/90"><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
          </span>
              <div class="">
                <p class="font-medium tracking-tight font-geist">Predictive Analytics</p>
                <p class="text-sm text-white/60 font-geist">AI-driven insights that forecast performance trends and
                  suggest optimal training modifications.</p>
              </div>
            </div>
          </div>
          <!-- Bottom Left -->
          <div class="group rounded-xl p-4 sm:p-6 hover:bg-white/10 transition-colors animate-on-scroll" style="animation: fadeSlideIn 1.0s ease-out 0.7s both;">
            <div class="flex gap-3 items-start">
              <span class="inline-flex items-center justify-center sm:w-12 bg-white/5 w-24 h-9 border-white/10 border rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="users" class="lucide lucide-users h-4.5 w-4.5 text-white/90"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
          </span>
              <div class="">
                <p class="font-medium tracking-tight font-geist">Coach Collaboration Hub</p>
                <p class="text-sm text-white/60 font-geist">Secure workspace for athletes and coaches with video
                  analysis, program adjustments, and progress reviews.</p>
              </div>
            </div>
          </div>
          <!-- Bottom Right -->
          <div class="group rounded-xl p-4 sm:p-6 hover:bg-white/10 transition-colors animate-on-scroll" style="animation: fadeSlideIn 1.0s ease-out 0.8s both;">
            <div class="flex items-start gap-3">
              <span class="inline-flex items-center justify-center sm:w-12 bg-white/5 w-24 h-9 border-white/10 border rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="shield-check" class="lucide lucide-shield-check h-4.5 w-4.5 text-white/90"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>
          </span>
              <div class="">
                <p class="font-medium tracking-tight font-geist">Military-Grade Security</p>
                <p class="text-sm text-white/60 font-geist">Bank-level encryption, HIPAA compliance, and complete data
                  ownership with full export capabilities.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sub‑CTA -->
      <div class="mt-8 flex justify-center animate-on-scroll" style="animation: fadeSlideIn 1.0s ease-out 0.9s both;">
        <a href="#" class="inline-flex items-center gap-2 text-sm font-medium text-white/90 border border-white/10 rounded-full px-4 py-2 hover:bg-white/10 transition font-geist">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="gauge" class="lucide lucide-gauge h-4 w-4">
            <path d="m12 14 4-4"></path>
            <path d="M3.34 19a10 10 0 1 1 17.32 0"></path>
          </svg>
          Start your trial
        </a>
      </div>
    </div>
  </section>
  <section class="z-20 border-white/10 border-t relative">
    <div class="lg:px-8 max-w-7xl mx-auto px-6 py-16">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <!-- Left: Copy -->
        <div class="animate-on-scroll" style="animation: fadeSlideIn 1.0s ease-out 0.1s both;">
          <p class="text-xs uppercase tracking-widest text-white/50 font-geist">The science of Forge</p>
          <h2 class="sm:text-5xl text-3xl font-semibold tracking-tight font-geist mt-3">Where Science Meets Performance
          </h2>
          <p class="leading-relaxed text-white/70 font-geist mt-4">
            We combine evidence-based programming with real-time feedback to deliver training that's precise, adaptable,
            and measurable. Every block is engineered for progressive overload and backed by data.
          </p>

          <div class="mt-8 space-y-3">
            <!-- Feature 1 -->
            <div class="group flex hover:bg-white/10 transition-colors bg-white/5 border-white/10 border rounded-xl pt-4 pr-4 pb-4 pl-4 backdrop-blur items-center justify-between animate-on-scroll" style="animation: fadeSlideIn 1.0s ease-out 0.3s both;">
              <div class="flex items-center gap-3">
                <span class="inline-flex items-center justify-center sm:w-9 bg-white/5 w-16 h-9 border-white/10 border rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="flask-conical" class="lucide lucide-flask-conical h-4.5 w-4.5 text-white/90"><path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"></path><path d="M6.453 15h11.094"></path><path d="M8.5 2h7"></path></svg>
              </span>
                <div class="">
                  <p class="font-medium tracking-tight font-geist">Evidence‑based programming</p>
                  <p class="text-sm text-white/60 font-geist">Validated protocols, repeatable results</p>
                </div>
              </div>
              <span class="ml-4 inline-flex items-center gap-1 text-xs text-white/80 border border-white/10 rounded-full px-2.5 py-1">

              96% completion
            </span>
            </div>

            <!-- Feature 2 -->
            <div class="group flex hover:bg-white/10 transition-colors bg-white/5 border-white/10 border rounded-xl pt-4 pr-4 pb-4 pl-4 backdrop-blur items-center justify-between animate-on-scroll" style="animation: fadeSlideIn 1.0s ease-out 0.4s both;">
              <div class="flex items-center gap-3">
                <span class="inline-flex items-center justify-center sm:w-9 bg-white/5 w-16 h-9 border-white/10 border rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="database-backup" class="lucide lucide-database-backup w-[20px] h-[20px]" data-icon-replaced="true" style="width: 20px; height: 20px; color: rgb(255, 255, 255);"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 12a9 3 0 0 0 5 2.69"></path><path d="M21 9.3V5"></path><path d="M3 5v14a9 3 0 0 0 6.47 2.88"></path><path d="M12 12v4h4"></path><path d="M13 20a5 5 0 0 0 9-3 4.5 4.5 0 0 0-4.5-4.5c-1.33 0-2.54.54-3.41 1.41L12 16"></path></svg>
              </span>
                <div class="">
                  <p class="font-medium tracking-tight font-geist">Data‑driven progress</p>
                  <p class="text-sm text-white/60 font-geist">Auto‑adjusted loads and volumes</p>
                </div>
              </div>
              <span class="ml-4 inline-flex items-center gap-1 text-xs text-white/80 border border-white/10 rounded-full px-2.5 py-1">

              12‑week mesos
            </span>
            </div>

            <!-- Feature 3 -->
            <div class="group flex hover:bg-white/10 transition-colors bg-white/5 border-white/10 border rounded-xl pt-4 pr-4 pb-4 pl-4 backdrop-blur items-center justify-between animate-on-scroll" style="animation: fadeSlideIn 1.0s ease-out 0.5s both;">
              <div class="flex items-center gap-3">
                <span class="inline-flex items-center justify-center sm:w-9 bg-white/5 w-16 h-9 border-white/10 border rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="shield-check" class="lucide lucide-shield-check w-[20px] h-[20px]" data-icon-replaced="true" style="width: 20px; height: 20px; color: rgb(255, 255, 255);"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>
              </span>
                <div class="">
                  <p class="font-medium tracking-tight font-geist">Athlete‑approved</p>
                  <p class="text-sm text-white/60 font-geist">Built with elite coach oversight</p>
                </div>
              </div>
              <span class="ml-4 inline-flex items-center gap-1 text-xs text-white/80 border border-white/10 rounded-full px-2.5 py-1">

              15k+ athletes
            </span>
            </div>
          </div>
        </div>

        <!-- Right: Image -->
        <div class="relative animate-on-scroll" style="animation: fadeSlideIn 1.0s ease-out 0.2s both;">
          <div class="relative overflow-hidden rounded-2xl border border-white/10">
            <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/10a44c44-ef78-4c36-aa57-e016e3ef9a39_1600w.jpg" alt="Focused athlete during recovery with serum dropper" class="aspect-square w-full h-full object-cover">
            <div class="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10"></div>
          </div>

          <!-- Overlays -->
          <div class="absolute top-4 left-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 backdrop-blur px-3 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="gauge" class="lucide lucide-gauge h-4 w-4 text-white/90">
              <path d="m12 14 4-4"></path>
              <path d="M3.34 19a10 10 0 1 1 17.32 0"></path>
            </svg>
            <span class="text-xs font-medium text-white/90 font-geist">Readiness 87%</span>
          </div>

          <div class="absolute bottom-4 left-4 flex flex-col gap-2">
            <div class="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 backdrop-blur px-3 py-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="activity" class="lucide lucide-activity h-4 w-4 text-white/90">
                <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2">
                </path>
              </svg>
              <span class="text-xs font-medium text-white/90 font-geist">HRV 92</span>
            </div>
            <div class="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 backdrop-blur px-3 py-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="heart-pulse" class="lucide lucide-heart-pulse h-4 w-4 text-white/90">
                <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5">
                </path>
                <path d="M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"></path>
              </svg>
              <span class="text-xs font-medium text-white/90 font-geist">Recovery 94%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Trainers -->
  <section class="z-20 border-white/10 border-t relative">
    <div class="lg:px-8 max-w-7xl mr-auto ml-auto pt-16 pr-6 pb-6 pl-6">
      <div class="mb-10 flex items-end justify-between gap-6">
        <div class="animate-on-scroll" style="animation: fadeSlideIn 1.0s ease-out 0.1s both;">
          <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight font-geist">Meet the Coaches</h2>
          <p class="mt-2 text-white/70 font-geist">World-class trainers dedicated to your progress.</p>
        </div>
        <a href="#" class="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-white/90 border border-white/10 rounded-full px-4 py-2 hover:bg-white/10 transition animate-on-scroll" style="animation: fadeSlideIn 1.0s ease-out 0.2s both;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-lucide="users" class="lucide lucide-users h-4 w-4">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <circle cx="9" cy="7" r="4"></circle>
          </svg>
          All coaches
        </a>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Coach 1 -->
        <div class="group overflow-hidden hover:bg-white/10 transition-colors bg-white/5 border-white/10 border rounded-2xl backdrop-blur animate-on-scroll" style="animation: fadeSlideIn 1.0s ease-out 0.3s both;">
          <div class="relative h-56">
            <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/f6789185-8288-444d-b735-bb2e99496645_800w.jpg" alt="Head coach — strength and conditioning" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" style="">
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent"></div>
          </div>
          <div class="pt-5 pr-5 pb-5 pl-5">
            <div class="flex items-center justify-between">
              <div class="">
                <p class="text-lg font-medium font-geist tracking-tight">Avery Cole</p>
                <p class="text-sm text-white/60 font-geist">Head Coach — S&amp;C</p>
              </div>
              <span class="inline-flex items-center gap-1 text-xs text-white/80 border border-white/10 rounded-full px-2.5 py-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-lucide="zap" class="lucide lucide-zap h-3.5 w-3.5"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
                  Level IV
                </span>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <span class="text-xs text-white/80 border border-white/10 rounded-full px-2 py-1">Periodization</span>
              <span class="text-xs text-white/80 border border-white/10 rounded-full px-2 py-1">Olympic Lifts</span>
              <span class="text-xs text-white/80 border border-white/10 rounded-full px-2 py-1">Power</span>
            </div>
          </div>
        </div>

        <!-- Coach 2 -->
        <div class="group overflow-hidden hover:bg-white/10 transition-colors bg-white/5 border-white/10 border rounded-2xl backdrop-blur animate-on-scroll" style="animation: fadeSlideIn 1.0s ease-out 0.4s both;">
          <div class="relative h-56">
            <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/578af862-1f22-4fc5-80fa-63d65b09b74b_800w.jpg" alt="Hypertrophy specialist" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" style="">
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent"></div>
          </div>
          <div class="pt-5 pr-5 pb-5 pl-5">
            <div class="flex items-center justify-between">
              <div class="">
                <p class="text-lg font-medium font-geist tracking-tight">Riley Park</p>
                <p class="text-sm text-white/60 font-geist">Hypertrophy Specialist</p>
              </div>
              <span class="inline-flex items-center gap-1 text-xs text-white/80 border border-white/10 rounded-full px-2.5 py-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-lucide="dumbbell" class="lucide lucide-dumbbell h-3.5 w-3.5"><path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z"></path><path d="m2.5 21.5 1.4-1.4"></path><path d="m20.1 3.9 1.4-1.4"></path><path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z"></path><path d="m9.6 14.4 4.8-4.8"></path></svg>
                  IFBB Pro
                </span>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <span class="text-xs text-white/80 border border-white/10 rounded-full px-2 py-1">Volume Tuning</span>
              <span class="text-xs text-white/80 border border-white/10 rounded-full px-2 py-1">Nutrition</span>
              <span class="text-xs text-white/80 border border-white/10 rounded-full px-2 py-1">Recovery</span>
            </div>
          </div>
        </div>

        <!-- Coach 3 -->
        <div class="group overflow-hidden hover:bg-white/10 transition-colors bg-white/5 border-white/10 border rounded-2xl backdrop-blur animate-on-scroll" style="animation: fadeSlideIn 1.0s ease-out 0.5s both;">
          <div class="relative h-56">
            <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/00552811-c9ca-4219-a1c3-c56163ce4db1_800w.jpg" alt="Conditioning and mobility" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105">
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent"></div>
          </div>
          <div class="pt-5 pr-5 pb-5 pl-5">
            <div class="flex items-center justify-between">
              <div class="">
                <p class="text-lg font-medium font-geist tracking-tight">Jordan Lee</p>
                <p class="text-sm text-white/60 font-geist">Conditioning &amp; Mobility</p>
              </div>
              <span class="inline-flex items-center gap-1 text-xs text-white/80 border border-white/10 rounded-full px-2.5 py-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-lucide="activity" class="lucide lucide-activity h-3.5 w-3.5"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path></svg>
                  VO2 Max 62
                </span>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <span class="text-xs text-white/80 border border-white/10 rounded-full px-2 py-1">HIIT</span>
              <span class="text-xs text-white/80 border border-white/10 rounded-full px-2 py-1">Mobility</span>
              <span class="text-xs text-white/80 border border-white/10 rounded-full px-2 py-1">Breathwork</span>
            </div>
          </div>
        </div>
      </div>
    </div>
</section>

  <!-- Programs -->
  <section class="z-20 animate-on-scroll relative" style="animation: fadeSlideIn 1.0s ease-out 0.1s both;">
    <div class="lg:px-8 max-w-7xl mr-auto ml-auto pr-6 pl-6 pt-8 pb-20">
      <div class="mb-8 flex items-end justify-between gap-6">
        <div class="animate-on-scroll" style="animation: fadeSlideIn 1.0s ease-out 0.2s both;">
          <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight font-geist">Programs that deliver</h2>
          <p class="mt-2 text-white/70 font-geist">Structured phases, progressive overload, measurable results.</p>
        </div>
        <a href="#" class="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-white/90 border border-white/10 rounded-full px-4 py-2 hover:bg-white/10 transition animate-on-scroll" style="animation: fadeSlideIn 1.0s ease-out 0.3s both;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-lucide="calendar" class="lucide lucide-calendar h-4 w-4">
            <path d="M8 2v4"></path>
            <path d="M16 2v4"></path>
            <rect width="18" height="18" x="3" y="4" rx="2"></rect>
            <path d="M3 10h18"></path>
          </svg>
          View schedule
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Strength -->
        <div class="hover:bg-white/10 transition-colors bg-white/5 h-full border-white/10 border rounded-2xl pt-5 pr-5 pb-5 pl-5 backdrop-blur animate-on-scroll" style="animation: fadeSlideIn 1.0s ease-out 0.4s both;">
          <div class="flex items-center gap-3">
            <div class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-lucide="dumbbell" class="lucide lucide-dumbbell h-4.5 w-4.5">
                <path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z">
                </path>
                <path d="m2.5 21.5 1.4-1.4"></path>
                <path d="m20.1 3.9 1.4-1.4"></path>
                <path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z">
                </path>
                <path d="m9.6 14.4 4.8-4.8"></path>
              </svg>
            </div>
            <div>
              <p class="text-lg font-medium tracking-tight font-geist">Strength</p>
              <p class="text-sm text-white/60 font-geist">4-week microcycles</p>
            </div>
          </div>
          <ul class="mt-4 space-y-2">
            <li class="flex items-center gap-2 text-sm text-white/80"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-lucide="check" class="lucide lucide-check h-4 w-4 text-white/80">
                <path d="M20 6 9 17l-5-5"></path>
              </svg> Periodized compound lifts</li>
            <li class="flex items-center gap-2 text-sm text-white/80"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-lucide="check" class="lucide lucide-check h-4 w-4 text-white/80">
                <path d="M20 6 9 17l-5-5"></path>
              </svg> RPE-based progression</li>
            <li class="flex items-center gap-2 text-sm text-white/80"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-lucide="check" class="lucide lucide-check h-4 w-4 text-white/80">
                <path d="M20 6 9 17l-5-5"></path>
              </svg> 3–4 days/week</li>
          </ul>
          <div class="mt-5">
            <button class="inline-flex items-center gap-2 text-sm font-medium text-white/90 border border-white/10 rounded-full px-3.5 py-2 hover:bg-white/10 transition">Join Strength</button>
          </div>
        </div>

        <!-- Hypertrophy -->
        <div class="hover:bg-white/10 transition-colors bg-white/5 h-full border-white/10 border rounded-2xl pt-5 pr-5 pb-5 pl-5 backdrop-blur animate-on-scroll" style="animation: fadeSlideIn 1.0s ease-out 0.5s both;">
          <div class="flex items-center gap-3">
            <div class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-lucide="activity" class="lucide lucide-activity h-4.5 w-4.5">
                <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2">
                </path>
              </svg>
            </div>
            <div class="">
              <p class="text-lg font-medium tracking-tight font-geist">Hypertrophy</p>
              <p class="text-sm text-white/60 font-geist">Push / Pull / Legs</p>
            </div>
          </div>
          <ul class="mt-4 space-y-2">
            <li class="flex items-center gap-2 text-sm text-white/80"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-lucide="check" class="lucide lucide-check h-4 w-4 text-white/80">
                <path d="M20 6 9 17l-5-5"></path>
              </svg> Volume and intensity blocks</li>
            <li class="flex items-center gap-2 text-sm text-white/80"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-lucide="check" class="lucide lucide-check h-4 w-4 text-white/80">
                <path d="M20 6 9 17l-5-5"></path>
              </svg> Isolation precision</li>
            <li class="flex items-center gap-2 text-sm text-white/80"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-lucide="check" class="lucide lucide-check h-4 w-4 text-white/80">
                <path d="M20 6 9 17l-5-5"></path>
              </svg> 5 days/week</li>
          </ul>
          <div class="mt-5">
            <button class="inline-flex items-center gap-2 text-sm font-medium text-white/90 border border-white/10 rounded-full px-3.5 py-2 hover:bg-white/10 transition">Join Hypertrophy</button>
          </div>
        </div>

        <!-- Conditioning -->
        <div class="hover:bg-white/10 transition-colors bg-white/5 h-full border-white/10 border rounded-2xl pt-5 pr-5 pb-5 pl-5 backdrop-blur animate-on-scroll" style="animation: fadeSlideIn 1.0s ease-out 0.6s both;">
          <div class="flex items-center gap-3">
            <div class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-lucide="wind" class="lucide lucide-wind h-4.5 w-4.5">
                <path d="M12.8 19.6A2 2 0 1 0 14 16H2"></path>
                <path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"></path>
                <path d="M9.8 4.4A2 2 0 1 1 11 8H2"></path>
              </svg>
            </div>
            <div class="">
              <p class="text-lg font-medium tracking-tight font-geist">Conditioning</p>
              <p class="text-sm text-white/60 font-geist">Engine &amp; endurance</p>
            </div>
          </div>
          <ul class="mt-4 space-y-2">
            <li class="flex items-center gap-2 text-sm text-white/80"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-lucide="check" class="lucide lucide-check h-4 w-4 text-white/80">
                <path d="M20 6 9 17l-5-5"></path>
              </svg> Zone 2 + intervals</li>
            <li class="flex items-center gap-2 text-sm text-white/80"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-lucide="check" class="lucide lucide-check h-4 w-4 text-white/80">
                <path d="M20 6 9 17l-5-5"></path>
              </svg> Mobility integration</li>
            <li class="flex items-center gap-2 text-sm text-white/80"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-lucide="check" class="lucide lucide-check h-4 w-4 text-white/80">
                <path d="M20 6 9 17l-5-5"></path>
              </svg> 3 days/week</li>
          </ul>
          <div class="mt-5">
            <button class="inline-flex items-center gap-2 text-sm font-medium text-white/90 border border-white/10 rounded-full px-3.5 py-2 hover:bg-white/10 transition">Join Conditioning</button>
          </div>
        </div>
      </div>
    </div>
</section>

  <footer class="relative z-20 border-white/10 border-t">
    <div class="lg:px-8 max-w-7xl mx-auto px-6 py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <!-- Brand + Newsletter -->
        <div class="">
          <a href="#" class="inline-flex items-center justify-center bg-center w-[100px] h-[40px] bg-[url(https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/3185425e-0207-434a-9554-cdb5bd455ea5_320w.png)] bg-cover rounded"></a>
          <p class="mt-4 text-sm text-white/60 font-geist">Elite coaching and precision programming to build strength
            that lasts.</p>
          <form class="mt-6 flex items-center gap-2">
            <input type="email" placeholder="Email address" class="flex-1 rounded-full bg-white/5 border border-white/10 px-3.5 py-2 text-sm text-white/90 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 font-geist">
            <button class="inline-flex items-center gap-2 text-sm font-medium text-white/90 border border-white/10 rounded-full px-3.5 py-2 hover:bg-white/10 transition font-geist">
            Subscribe
            
          </button>
          </form>
          <p class="mt-2 text-xs text-white/45 font-geist">No spam. Unsubscribe anytime.</p>
        </div>

        <!-- Programs -->
        <div>
          <p class="text-xs uppercase tracking-widest text-white/50 font-geist">Programs</p>
          <ul class="mt-3 space-y-2">
            <li><a href="#" class="text-sm text-white/70 hover:text-white/90 transition font-geist">Strength</a></li>
            <li><a href="#" class="text-sm text-white/70 hover:text-white/90 transition font-geist">Hypertrophy</a></li>
            <li><a href="#" class="text-sm text-white/70 hover:text-white/90 transition font-geist">Conditioning</a>
            </li>
            <li><a href="#" class="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition font-geist">
                View schedule
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round stroke-linejoin=" round"="" data-lucide="calendar" class="lucide h-3.5 w-3.5">
                  <path d="M8 2v4"></path>
                  <path d="M16 2v4"></path>
                  <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                  <path d="M3 10h18"></path>
                </svg>
              </a></li>
          </ul>
        </div>

        <!-- Resources -->
        <div>
          <p class="text-xs uppercase tracking-widest text-white/50 font-geist">Resources</p>
          <ul class="mt-3 space-y-2">
            <li><a href="#" class="text-sm text-white/70 hover:text-white/90 transition font-geist">The Method</a></li>
            <li><a href="#" class="text-sm text-white/70 hover:text-white/90 transition font-geist">Guides &amp;
                Articles</a></li>
            <li><a href="#" class="text-sm text-white/70 hover:text-white/90 transition font-geist">FAQ</a></li>
            <li><a href="#" class="text-sm text-white/70 hover:text-white/90 transition font-geist">Support</a></li>
          </ul>
        </div>

        <!-- Company -->
        <div class="">
          <p class="text-xs uppercase tracking-widest text-white/50 font-geist">Company</p>
          <ul class="mt-3 space-y-2">
            <li><a href="#" class="text-sm text-white/70 hover:text-white/90 transition font-geist">About</a></li>
            <li><a href="#" class="text-sm text-white/70 hover:text-white/90 transition font-geist">Careers</a></li>
            <li><a href="#" class="text-sm text-white/70 hover:text-white/90 transition font-geist">Contact</a></li>
            <li><a href="#" class="text-sm text-white/70 hover:text-white/90 transition font-geist">Press</a></li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="mt-12 border-t border-white/10 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <p class="text-xs text-white/50 font-geist">© 2025 Forge. All rights reserved.
        </p>
        <div class="flex flex-wrap items-center gap-4">
          <a href="#" class="text-xs text-white/60 hover:text-white/90 transition font-geist">Terms</a>
          <span class="w-px h-3 bg-white/15"></span>
          <a href="#" class="text-xs text-white/60 hover:text-white/90 transition font-geist">Privacy</a>
          <span class="w-px h-3 bg-white/15"></span>
          <a href="#" class="text-xs text-white/60 hover:text-white/90 transition font-geist">Cookies</a>
          <span class="w-px h-3 bg-white/15"></span>
          <a href="#" class="inline-flex items-center gap-1 text-xs text-white/70 hover:text-white transition font-geist">
            Status
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" data-lucide="activity" class="lucide h-3 w-3">
              <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2">
              </path>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>

  <!-- Icons + Parallax <Script> -->
  <script src="https://unpkg.com/lucide@latest" class="" style="display: none;"></script>


</body></html>`;
