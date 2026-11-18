import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Star,
} from 'lucide-react';
import {
  HERO_STUDIO_IMAGE,
  type CreatorAccount,
  type Project,
} from '../data/mockData';
import {
  EASE_STUDIO,
  SPRING_SNAPPY,
  SPRING_SMOOTH,
  staggerContainer,
  staggerItem,
} from '../utils/motion';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectLightboxModal } from '../components/ProjectLightboxModal';

interface LandingScreenProps {
  featuredCreator: CreatorAccount;
  currentUser: CreatorAccount | null;
}

interface CoverflowItem {
  id: string;
  dockPrompt: string;
  actionLabel: string;
  href: string;
  kind: 'settlement' | 'design-system' | 'cv-proof' | 'storefront' | 'vouch-link';
}

const COVERFLOW_ITEMS: CoverflowItem[] = [
  {
    id: 'settlement',
    dockPrompt: 'Track shipped fintech builds with verifiable collaborator and merchant sign-offs.',
    actionLabel: 'View Kwame’s profile',
    href: '#/u/kwame-boateng',
    kind: 'settlement',
  },
  {
    id: 'design-system',
    dockPrompt: 'Showcase multi-screen UI systems alongside direct client ratings and feedback.',
    actionLabel: 'View Tomiwa’s profile',
    href: '#/u/tomiwa-adeyemi',
    kind: 'design-system',
  },
  {
    id: 'cv-proof',
    dockPrompt: 'Publish a print-ready portfolio and CV backed by verified client vouches.',
    actionLabel: 'Inspect featured CV',
    href: '#/u/chidi-okeke/cv',
    kind: 'cv-proof',
  },
  {
    id: 'storefront',
    dockPrompt: 'Pair visual case studies with real testimonials local and global clients trust.',
    actionLabel: 'Open Chidi’s portfolio',
    href: '#/u/chidi-okeke',
    kind: 'storefront',
  },
  {
    id: 'vouch-link',
    dockPrompt: 'Send a one-click WhatsApp confirm link clients complete without signing up.',
    actionLabel: 'Try confirm link',
    href: '#/confirm/vouch-sweetcrumbs-2',
    kind: 'vouch-link',
  },
];

const MARQUEE_ITEMS = [
  'Brand identity',
  'Full-stack web engineering',
  'Product & UI design',
  'Motion & video editing',
  'Technical writing',
  'Confirmed by teammates',
  'Rated by paying clients',
  'Print-ready PDF CV',
];

const FAQ_ITEMS = [
  {
    q: 'Do clients or teammates need a CREATDEV account to vouch?',
    a: 'No. Every project invite creates a direct confirm link you can send over WhatsApp or email. Your teammate or client opens the link, verifies your role, and submits in under 30 seconds without signing up.',
  },
  {
    q: 'What happens if a client clicks “No, not accurate”?',
    a: 'Nothing is published on your public portfolio. The invite status updates to Declined on your private dashboard so you can review the project details and send a corrected request.',
  },
  {
    q: 'Can I download a clean CV for local and international job applications?',
    a: 'Yes. Your public portfolio includes a dedicated CV view formatted for A4 and Letter print, complete with your verified vouches and a one-click “Download as PDF” button.',
  },
  {
    q: 'Who is CREATDEV designed for?',
    a: 'Designers, software developers, video editors, writers, and creative technologists across Nigeria and Africa who want international and local clients to trust their track record immediately.',
  },
];

function getCyclicOffset(index: number, activeIdx: number, total: number): number {
  let diff = index - activeIdx;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;
  return diff;
}

export function LandingScreen({ featuredCreator, currentUser }: LandingScreenProps) {
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement | null>(null);
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const [heroOffscreen, setHeroOffscreen] = useState(false);
  const [marqueeOffscreen, setMarqueeOffscreen] = useState(false);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
  const [activeIdx, setActiveIdx] = useState(2);
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [inspectedProject, setInspectedProject] = useState<Project | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const checkWidth = () => setIsCompactViewport(window.innerWidth < 640);
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setHeroOffscreen(!entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = marqueeRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setMarqueeOffscreen(!entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Gentle auto-rotation when visible and not interacted with
  useEffect(() => {
    if (prefersReducedMotion || heroOffscreen || isCarouselHovered) return;
    const timer = window.setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % COVERFLOW_ITEMS.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [prefersReducedMotion, heroOffscreen, isCarouselHovered]);

  function handlePrev() {
    setActiveIdx((prev) => (prev - 1 + COVERFLOW_ITEMS.length) % COVERFLOW_ITEMS.length);
  }

  function handleNext() {
    setActiveIdx((prev) => (prev + 1) % COVERFLOW_ITEMS.length);
  }

  const activeItem = COVERFLOW_ITEMS[activeIdx];
  const featuredProject = featuredCreator.projects[0];
  const featuredVouches = featuredProject
    ? featuredCreator.invites.filter(
        (inv) => inv.projectId === featuredProject.id && inv.status === 'confirmed'
      )
    : [];

  return (
    <div>
      {/* LAYERED COVERFLOW WELCOME STAGE */}
      <section
        ref={heroRef}
        className={`relative overflow-hidden border-b border-[var(--border-line)] bg-[var(--bg-canvas)] ${
          heroOffscreen ? 'is-offscreen' : ''
        }`}
      >
        {/* Subtle centered top atmospheric glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[720px] -translate-x-1/2 rounded-full bg-[#2f5bff]/16 blur-[120px]"
        />

        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-12">
          {/* Centered Crisp Headline + 1-line Subtitle */}
          <motion.div
            variants={staggerContainer(0.07, 0.02)}
            initial={prefersReducedMotion ? false : 'hidden'}
            animate="visible"
            className="mx-auto max-w-2xl text-center"
          >
            <motion.h1
              variants={staggerItem}
              className="font-display text-[2.2rem] font-extrabold leading-[1.06] tracking-tight text-[var(--text-main)] sm:text-5xl"
            >
              Build proof with CREATDEV
            </motion.h1>

            <motion.p
              variants={staggerItem}
              className="mx-auto mt-2.5 text-sm leading-relaxed text-[var(--text-muted)] sm:text-base"
            >
              Turn shipped work into verified client vouches, a public portfolio, and a clean PDF CV.
            </motion.p>
          </motion.div>

          {/* Studio Matrix Backdrop + 5-Card Layered Coverflow Carousel */}
          <div
            onMouseEnter={() => setIsCarouselHovered(true)}
            onMouseLeave={() => setIsCarouselHovered(false)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') handlePrev();
              if (e.key === 'ArrowRight') handleNext();
            }}
            tabIndex={0}
            aria-roledescription="carousel"
            aria-label="CREATDEV portfolio and vouch showcase"
            className="relative mx-auto mt-7 max-w-5xl rounded-3xl px-2 pt-3 pb-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-cobalt)]"
          >
            {/* Faded Studio Dot Grid Backdrop matching dark studio workspace depth */}
            <div
              aria-hidden="true"
              className="studio-dots-bg pointer-events-none absolute inset-x-4 top-0 bottom-14 rounded-3xl [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_88%)]"
            />

            {/* Fanned 5-Card Coverflow Deck */}
            <div className="relative mx-auto h-[300px] w-full overflow-hidden sm:h-[340px]">
              {COVERFLOW_ITEMS.map((item, idx) => {
                const offset = getCyclicOffset(idx, activeIdx, COVERFLOW_ITEMS.length);
                const absOffset = Math.abs(offset);
                const isCenter = offset === 0;
                const xStep = isCompactViewport ? 128 : 196;
                const xPos = offset * xStep - (absOffset === 2 ? Math.sign(offset) * 28 : 0);
                const scale = isCenter ? 1 : absOffset === 1 ? 0.85 : 0.72;
                const opacity = isCenter
                  ? 1
                  : absOffset === 1
                  ? isCompactViewport
                    ? 0.45
                    : 0.72
                  : isCompactViewport
                  ? 0
                  : 0.38;
                const zIndex = isCenter ? 30 : absOffset === 1 ? 20 : 10;

                return (
                  <motion.div
                    key={item.id}
                    initial={false}
                    animate={{
                      x: xPos,
                      scale,
                      opacity,
                    }}
                    transition={prefersReducedMotion ? { duration: 0 } : SPRING_SMOOTH}
                    style={{
                      zIndex,
                      left: '50%',
                      pointerEvents: absOffset === 2 && isCompactViewport ? 'none' : 'auto',
                    }}
                    onClick={() => {
                      if (!isCenter) {
                        setActiveIdx(idx);
                      } else {
                        window.location.hash = item.href;
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (!isCenter) {
                          setActiveIdx(idx);
                        } else {
                          window.location.hash = item.href;
                        }
                      }
                    }}
                    role="button"
                    tabIndex={isCenter ? 0 : -1}
                    aria-label={
                      isCenter
                        ? `${item.actionLabel}`
                        : `Select showcase card: ${item.actionLabel}`
                    }
                    className={`group absolute top-2 -ml-[128px] h-[278px] w-[256px] overflow-hidden rounded-2xl border sm:-ml-[140px] sm:h-[316px] sm:w-[280px] cursor-pointer transition-shadow ${
                      isCenter
                        ? 'border-[var(--border-strong)] shadow-[0_30px_70px_-14px_rgba(0,0,0,0.85)]'
                        : 'border-[var(--border-line)] shadow-[0_20px_40px_-16px_rgba(0,0,0,0.65)]'
                    }`}
                  >
                    {/* Card 0: Settlement UI card */}
                    {item.kind === 'settlement' && (
                      <div className="flex h-full flex-col justify-between bg-[#0e1226] p-4 text-[#f4f6fc]">
                        <div className="flex items-center justify-between text-[11px] text-[#a9b1d9]">
                          <span>Payout ledger</span>
                          <span className="font-semibold text-[#c9f2dc]">Confirmed</span>
                        </div>
                        <div className="my-2 space-y-2">
                          <p className="font-display text-lg font-extrabold leading-tight">
                            CediPay settlement portal
                          </p>
                          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                            <p className="font-display text-2xl font-extrabold tabular-nums text-white">
                              380+
                            </p>
                            <p className="text-[11px] text-[#a9b1d9]">
                              Active retail merchants reconciled daily
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 pt-1">
                            {[48, 72, 95].map((h, barIdx) => (
                              <div
                                key={barIdx}
                                className="flex h-12 items-end rounded-md bg-white/5 p-1"
                              >
                                <div
                                  className="w-full rounded-sm bg-[#2f5bff]"
                                  style={{ height: `${h}%` }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        <p className="text-[11px] font-medium text-[#a9b1d9]">
                          Kwame Boateng · Accra, Ghana
                        </p>
                      </div>
                    )}

                    {/* Card 1: Design System Showcase Card */}
                    {item.kind === 'design-system' && (
                      <div className="relative flex h-full flex-col justify-between bg-[#1b2255] text-white">
                        {!failedImages[item.id] ? (
                          <img
                            src="/src/assets/images/project_design_system_1795000153690.jpg"
                            alt="Aura mobile banking design system workspace"
                            referrerPolicy="no-referrer"
                            onError={() => setFailedImages((p) => ({ ...p, [item.id]: true }))}
                            className="h-36 w-full object-cover"
                          />
                        ) : (
                          <div className="h-36 w-full bg-[#2f3bd9]" />
                        )}
                        <div className="flex flex-1 flex-col justify-between p-4">
                          <div>
                            <p className="text-[11px] text-[#8fa2ff]">Figma · React · TypeScript</p>
                            <p className="mt-1 font-display text-base font-bold leading-snug">
                              Aura mobile banking design system
                            </p>
                          </div>
                          <div className="rounded-lg bg-[#c9f2dc] px-2.5 py-1.5 text-[11px] font-bold text-[#14163a]">
                            Vouched by PayBridge Africa · 5/5
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Card 2 (Default Center Hero Card): High-contrast Light CV Sheet */}
                    {item.kind === 'cv-proof' && (
                      <div className="flex h-full flex-col justify-between bg-[#f7f8fc] p-4 text-[#14163a]">
                        <div>
                          <div className="flex items-start justify-between gap-2 border-b border-[#14163a]/15 pb-3">
                            <div>
                              <p className="font-display text-lg font-extrabold leading-none">
                                {featuredCreator.fullName}
                              </p>
                              <p className="mt-1 text-[11px] font-semibold text-[#2f3bd9]">
                                {featuredCreator.headline}
                              </p>
                            </div>
                            <FileText className="h-4 w-4 shrink-0 text-[#2f3bd9]" aria-hidden="true" />
                          </div>

                          <div className="mt-3 space-y-2">
                            <p className="text-[11px] font-medium text-[#494d72]">
                              Selected shipped project
                            </p>
                            <p className="font-display text-sm font-bold leading-snug text-[#14163a]">
                              {featuredProject?.title ?? 'Bakery rebrand and online store'}
                            </p>
                            <p className="text-[11px] text-[#494d72]">
                              {featuredProject?.tools.join(' · ') ?? 'Figma · PHP · MySQL'}
                            </p>
                          </div>
                        </div>

                        <div className="mb-7 space-y-1.5">
                          <div className="flex items-center gap-1.5 rounded-lg border border-[#7fd0a5] bg-[#c9f2dc] px-2.5 py-1.5 text-[11px] font-bold text-[#14163a]">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span>Sweet Crumbs Ltd · 5/5 Client</span>
                          </div>
                          <div className="flex items-center gap-1.5 rounded-lg border border-[#14163a]/15 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#14163a]">
                            <CheckCircle2 className="h-3 w-3 shrink-0 text-[#2f3bd9]" aria-hidden="true" />
                            <span>Ngozi A. · Collaborator confirmed</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Card 3: Brand Packaging & Online Store Card */}
                    {item.kind === 'storefront' && (
                      <div className="relative flex h-full flex-col justify-between bg-[#1c2364] text-white">
                        {!failedImages[item.id] ? (
                          <img
                            src="/src/assets/images/project_bakery_rebrand_1795000152931.jpg"
                            alt="Sweet Crumbs bakery packaging rebrand showcase"
                            referrerPolicy="no-referrer"
                            onError={() => setFailedImages((p) => ({ ...p, [item.id]: true }))}
                            className="h-36 w-full object-cover"
                          />
                        ) : (
                          <div className="h-36 w-full bg-[#232db3]" />
                        )}
                        <div className="flex flex-1 flex-col justify-between p-4">
                          <div>
                            <p className="text-[11px] text-[#c9f2dc]">Identity &amp; Storefront</p>
                            <p className="mt-1 font-display text-lg font-extrabold tracking-tight">
                              SWEET CRUMBS
                            </p>
                          </div>
                          <p className="text-xs text-white/80">
                            “Delivered on time and the shop looks great.”
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Card 4: One-Click Confirm Invite Link Card */}
                    {item.kind === 'vouch-link' && (
                      <div className="flex h-full flex-col justify-between bg-[#101325] p-4 text-[#f4f6fc]">
                        <div className="flex items-center justify-between text-[11px] text-[#a9b1d9]">
                          <span>Confirm invite</span>
                          <span>No account needed</span>
                        </div>
                        <div className="space-y-3">
                          <p className="font-display text-base font-bold leading-snug">
                            Did Chidi Okeke ship Bakery rebrand and online store?
                          </p>
                          <div className="flex items-center gap-1 text-[#ff9f43]">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star key={n} className="h-3.5 w-3.5 fill-[#ff9f43]" aria-hidden="true" />
                            ))}
                            <span className="ml-1 text-[11px] font-semibold text-white">5/5</span>
                          </div>
                          <div className="rounded-lg bg-[#2f5bff] px-3 py-2 text-center text-xs font-semibold text-white">
                            Yes, this is accurate
                          </div>
                        </div>
                        <p className="text-[11px] text-[#a9b1d9]">
                          Mint badge publishes instantly
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Overlapping Floating Action Dock anchored on lower-center of active card */}
            <div className="relative z-40 -mt-14 mx-auto max-w-[460px] px-2 sm:-mt-16">
              <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)]/95 p-4 backdrop-blur-md shadow-[0_26px_60px_-14px_rgba(0,0,0,0.82)] sm:p-5">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={activeItem.id}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, ease: EASE_STUDIO }}
                    className="text-sm font-medium leading-snug text-[var(--text-main)]"
                  >
                    {activeItem.dockPrompt}
                  </motion.p>
                </AnimatePresence>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <a
                    href={activeItem.href}
                    className="text-xs font-semibold text-[var(--accent-cobalt)] hover:underline whitespace-nowrap"
                  >
                    {activeItem.actionLabel}
                  </a>

                  <motion.a
                    href={currentUser ? '#/dashboard' : '#/auth?mode=signup'}
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                    transition={SPRING_SNAPPY}
                    className="group relative inline-flex min-h-[40px] items-center justify-center gap-2 overflow-hidden rounded-xl bg-[var(--btn-cobalt)] px-4 py-2 text-xs font-semibold text-white shadow-[0_10px_24px_-8px_rgba(47,91,255,0.75)] hover:bg-[var(--btn-cobalt-hover)] transition-colors whitespace-nowrap shrink-0"
                  >
                    {!prefersReducedMotion && (
                      <motion.span
                        aria-hidden="true"
                        initial={{ x: '-130%' }}
                        animate={{ x: '230%' }}
                        transition={{
                          repeat: Infinity,
                          repeatDelay: 3.2,
                          duration: 1.2,
                          ease: EASE_STUDIO,
                        }}
                        className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                      />
                    )}
                    <ArrowRight
                      className="relative z-10 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                    <span className="relative z-10">
                      {currentUser ? 'Open studio' : 'Get started'}
                    </span>
                  </motion.a>
                </div>
              </div>
            </div>

            {/* Centered < > Segmented Carousel Buttons directly below dock */}
            <div className="mt-4 flex items-center justify-center gap-4">
              <div className="inline-flex divide-x divide-[var(--border-line)] overflow-hidden rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)]">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous showcase card"
                  className="inline-flex h-10 w-11 items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next showcase card"
                  className="inline-flex h-10 w-11 items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Quiet Secondary Links */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-[var(--text-muted)]">
              <a
                href="#/explore"
                className="hover:text-[var(--accent-cobalt)] hover:underline transition-colors whitespace-nowrap"
              >
                Explore creator directory
              </a>
              <span aria-hidden="true" className="text-[var(--border-strong)]">
                ·
              </span>
              <a
                href={`#/u/${featuredCreator.username}`}
                className="hover:text-[var(--accent-cobalt)] hover:underline transition-colors whitespace-nowrap"
              >
                See Chidi Okeke’s sample portfolio
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* KINETIC CRAFT MARQUEE */}
      <div
        ref={marqueeRef}
        className={`overflow-hidden border-b border-[var(--border-line)] bg-[var(--bg-banner)] py-3.5 text-[#f6f7fb] ${
          marqueeOffscreen ? 'is-offscreen' : ''
        }`}
        aria-label="Supported creative and engineering disciplines"
      >
        <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap text-sm font-medium">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
            <span key={`${item}-${idx}`} className="inline-flex items-center gap-8">
              <span className={idx % 3 === 1 ? 'text-[#c9f2dc]' : 'text-[#f6f7fb]/90'}>
                {item}
              </span>
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#ff9f43]" />
            </span>
          ))}
        </div>
      </div>

      {/* HOW VOUCHING WORKS */}
      <motion.section
        variants={staggerContainer(0.1, 0.05)}
        initial={prefersReducedMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.18 }}
        className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
      >
        <motion.div
          variants={staggerItem}
          className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
        >
          <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--text-main)] sm:text-4xl">
            How vouching turns claims into proof
          </h2>
          <p className="text-sm text-[var(--text-muted)] md:max-w-sm">
            Three straightforward steps from finished project to a portfolio clients trust immediately.
          </p>
        </motion.div>

        <ol className="mt-10 grid gap-8 border-t border-[var(--border-line)] pt-10 md:grid-cols-3 md:gap-10">
          <motion.li variants={staggerItem} className="flex flex-col">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--btn-ink)] font-display text-lg font-bold text-[var(--btn-ink-text)] tabular-nums"
                aria-hidden="true"
              >
                1
              </span>
              <motion.span
                initial={prefersReducedMotion ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.1, ease: EASE_STUDIO }}
                style={{ originX: 0 }}
                className="h-px flex-1 bg-[var(--border-line)]"
                aria-hidden="true"
              />
            </div>

            <h3 className="mt-5 font-display text-xl font-bold text-[var(--text-main)]">
              Add a project you actually shipped
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--text-muted)]">
              Record your role, list the tools you used, and tell the short story of what changed
              because of your work.
            </p>
          </motion.li>

          <motion.li variants={staggerItem} className="flex flex-col">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--btn-cobalt)] font-display text-lg font-bold text-white tabular-nums"
                aria-hidden="true"
              >
                2
              </span>
              <motion.span
                initial={prefersReducedMotion ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.22, ease: EASE_STUDIO }}
                style={{ originX: 0 }}
                className="h-px flex-1 bg-[var(--border-line)]"
                aria-hidden="true"
              />
            </div>

            <h3 className="mt-5 font-display text-xl font-bold text-[var(--text-main)]">
              Share a one-click confirm link
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--text-muted)]">
              Send the invite link to a collaborator or client on WhatsApp or email. They verify in
              seconds without signing up.
            </p>
          </motion.li>

          <motion.li variants={staggerItem} className="flex flex-col">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#7fd0a5] bg-[#c9f2dc] font-display text-lg font-bold text-[#14163a] tabular-nums"
                aria-hidden="true"
              >
                3
              </span>
              <motion.span
                initial={prefersReducedMotion ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.34, ease: EASE_STUDIO }}
                style={{ originX: 0 }}
                className="h-px flex-1 bg-[var(--border-line)]"
                aria-hidden="true"
              />
            </div>

            <h3 className="mt-5 font-display text-xl font-bold text-[var(--text-main)]">
              Publish verified badges everywhere
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--text-muted)]">
              Every confirmation lights up as a mint vouch badge with client ratings and quotes on
              your public portfolio and CV.
            </p>
          </motion.li>
        </ol>
      </motion.section>

      {/* FEATURED PORTFOLIO CASE STUDY + STUDIO PHOTO */}
      <section className="border-t border-[var(--border-line)] bg-[var(--bg-surface)] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="text-sm font-semibold text-[var(--accent-cobalt)]">Featured creator</p>
              <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-[var(--text-main)] sm:text-4xl">
                {featuredCreator.fullName} — {featuredCreator.headline}
              </h2>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{featuredCreator.location}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  href={`#/u/${featuredCreator.username}/cv`}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-4 py-2 text-sm font-semibold text-[var(--text-main)] hover:border-[var(--accent-cobalt)] hover:text-[var(--accent-cobalt)] transition-colors whitespace-nowrap"
                >
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  <span>View CV</span>
                </a>
                <a
                  href={`#/u/${featuredCreator.username}`}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[var(--btn-ink)] px-4 py-2 text-sm font-semibold text-[var(--btn-ink-text)] hover:bg-[var(--btn-cobalt)] hover:text-white transition-colors whitespace-nowrap"
                >
                  <span>Open portfolio</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 overflow-hidden rounded-2xl border border-[var(--border-line)] bg-[#0e1126]">
              {!failedImages.studioHero ? (
                <img
                  src={HERO_STUDIO_IMAGE}
                  alt="Creative designer and developer collaborating in a Lagos studio"
                  referrerPolicy="no-referrer"
                  onError={() => setFailedImages((p) => ({ ...p, studioHero: true }))}
                  className="aspect-[16/9] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[16/9] items-center justify-center p-6 text-white">
                  <span className="font-display text-lg font-bold">CREATDEV Studio</span>
                </div>
              )}
            </div>
          </div>

          {featuredProject && (
            <div className="mt-10">
              <ProjectCard
                project={featuredProject}
                confirmedVouches={featuredVouches}
                featured
                enableSharedLayout={!inspectedProject}
                onInspect={(proj) => setInspectedProject(proj)}
              />
            </div>
          )}

          <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-[var(--border-line)] bg-[var(--bg-subtle)] p-6 sm:flex-row sm:items-center">
            <div>
              <p className="font-display text-lg font-bold text-[var(--text-main)]">
                Ready to build your verified track record?
              </p>
              <p className="mt-0.5 text-sm text-[var(--text-muted)]">
                Set up your portfolio link in under two minutes and invite your first client.
              </p>
            </div>
            <motion.a
              href={currentUser ? '#/dashboard' : '#/auth?mode=signup'}
              whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              transition={SPRING_SNAPPY}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[var(--btn-cobalt)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--btn-cobalt-hover)] transition-colors whitespace-nowrap shrink-0"
            >
              <span>{currentUser ? 'Open dashboard' : 'Get started'}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </motion.a>
          </div>
        </div>
      </section>

      {/* FAQ ACCORDION */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--text-main)]">
              Questions creatives ask
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
              Everything you need to know about project vouches, privacy, and exporting your CV.
            </p>
          </div>

          <div className="lg:col-span-8 divide-y divide-[var(--border-line)] rounded-2xl border border-[var(--border-line)] bg-[var(--bg-surface)]">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div key={item.q} className="px-6 py-4">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="flex min-h-[44px] w-full items-center justify-between gap-4 text-left font-display text-base font-bold text-[var(--text-main)] hover:text-[var(--accent-cobalt)] transition-colors cursor-pointer sm:text-lg"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[var(--accent-cobalt)]' : 'text-[var(--text-muted)]'
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={prefersReducedMotion ? false : { opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
                        transition={{ duration: 0.2, ease: EASE_STUDIO }}
                        className="pb-2 pt-2 text-sm leading-relaxed text-[var(--text-muted)]"
                      >
                        {item.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MULTI-COLUMN FOOTER */}
      <footer className="border-t border-[var(--border-line)] bg-[#05060d] text-[#f6f7fb]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-xl font-extrabold tracking-tight text-white">
              CREATDEV
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#f6f7fb]/75">
              Portfolios and print-ready CVs backed by real collaborator and client confirmations.
              Built for Nigerian and African creatives winning trust worldwide.
            </p>
          </div>

          <div className="md:col-span-3">
            <h3 className="font-display text-sm font-bold text-white">Explore</h3>
            <ul className="mt-3 space-y-2 text-sm text-[#f6f7fb]/80">
              <li>
                <a href="#/explore" className="hover:text-[#c9f2dc] transition-colors">
                  Talent directory
                </a>
              </li>
              <li>
                <a
                  href={`#/u/${featuredCreator.username}`}
                  className="hover:text-[#c9f2dc] transition-colors"
                >
                  Featured portfolio
                </a>
              </li>
              <li>
                <a
                  href={`#/u/${featuredCreator.username}/cv`}
                  className="hover:text-[#c9f2dc] transition-colors"
                >
                  Featured CV
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="font-display text-sm font-bold text-white">Studio access</h3>
            <ul className="mt-3 space-y-2 text-sm text-[#f6f7fb]/80">
              <li>
                <a href="#/auth?mode=signup" className="hover:text-[#c9f2dc] transition-colors">
                  Create your portfolio
                </a>
              </li>
              <li>
                <a href="#/auth?mode=login" className="hover:text-[#c9f2dc] transition-colors">
                  Sign in to studio
                </a>
              </li>
              <li>
                <a href="#/dashboard" className="hover:text-[#c9f2dc] transition-colors">
                  Creator dashboard
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Shared-Element Project Case Study Lightbox */}
      <ProjectLightboxModal
        project={inspectedProject}
        confirmedVouches={
          inspectedProject
            ? featuredCreator.invites.filter(
                (i) => i.projectId === inspectedProject.id && i.status === 'confirmed'
              )
            : []
        }
        creatorName={featuredCreator.fullName}
        onClose={() => setInspectedProject(null)}
      />
    </div>
  );
}
