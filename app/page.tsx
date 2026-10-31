import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ui';

export const dynamic = 'force-dynamic';

const features = [
  { title: 'AI plan builder', text: 'Turn a short event brief into a structured plan with timeline, budget and backup ideas.', accent: 'from-violet-500 to-indigo-500' },
  { title: 'Budget clarity', text: 'Track spend across venue, food, decor and staffing without losing control of the budget.', accent: 'from-amber-400 to-orange-500' },
  { title: 'Guest RSVP flow', text: 'Keep chatty family lists organized with yes/maybe/no tracking and live confirmations.', accent: 'from-rose-400 to-pink-500' },
  { title: 'Checklist + exports', text: 'Move from planning to execution with task checklists, guest CSV, plan JSON, and calendar ICS exports.', accent: 'from-emerald-400 to-teal-500' },
  { title: 'Multilingual output', text: 'With Gemini configured, generate event plans in English, Hindi or Marathi. Demo mode uses sample suggestions.', accent: 'from-cyan-400 to-blue-500' },
  { title: 'Demo-ready mode', text: 'Try the planner immediately without an API key and move faster in hackathon mode.', accent: 'from-fuchsia-500 to-violet-500' }
];

const steps = [
  ['1', 'Share the brief', 'Tell us the date, budget, city, guest count and vibe.'],
  ['2', 'Generate the plan', 'AI builds the event summary, tasks, menu and guest coordination.'],
  ['3', 'Execute with confidence', 'Track RSVPs, tasks and budget with a polished event dashboard.']
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 text-lg font-bold text-white shadow-soft">C</div>
            <div>
              <p className="font-display text-2xl leading-none tracking-tight text-foreground">Celebrate AI</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/planner" className="text-sm font-medium text-foreground/80 transition hover:text-foreground">Planner</Link>
            <Link href="#features" className="text-sm font-medium text-foreground/80 transition hover:text-foreground">Features</Link>
            <ThemeToggle />
          </nav>

          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <Link href="/planner" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft">Planner</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-12 md:px-6 md:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-flex rounded-full border border-violet-200 bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-200">AI event planning</span>
            <h1 className="mt-6 max-w-xl font-display text-5xl leading-none tracking-tight text-foreground md:text-7xl">
              Plan joyful moments that feel effortless.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              From intimate birthdays to large celebrations, Celebrate AI turns a short brief into a live event plan with tasks, menus, budgets and guest coordination.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/planner" className="rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-soft transition hover:bg-violet-700">
                Plan my event
              </Link>
              <Link href="#features" className="rounded-xl border border-border bg-card px-6 py-3 text-base font-semibold text-foreground shadow-sm hover:bg-muted">
                Explore features
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="rounded-full bg-card px-3 py-1.5 shadow-sm ring-1 ring-border">✓ Budget aware</span>
              <span className="rounded-full bg-card px-3 py-1.5 shadow-sm ring-1 ring-border">✓ Guest ready</span>
              <span className="rounded-full bg-card px-3 py-1.5 shadow-sm ring-1 ring-border">✓ Export friendly</span>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-4 shadow-soft md:p-6">
            <div className="relative mb-4 h-48 overflow-hidden rounded-[1.5rem] bg-rose-50 sm:h-60">
              <Image
                src="/images/elegant-celebration.png"
                alt="An elegant outdoor celebration dinner with floral arrangements and warm lights"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" aria-hidden="true" />
              <p className="absolute bottom-4 left-4 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur">A little celebration inspiration</p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-950 p-5 text-slate-50 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-violet-200">
                <span>Event brief</span>
                <span className="rounded-full bg-emerald-500/15 px-2 py-1 font-semibold text-emerald-300">Demo mode</span>
              </div>
              <p className="text-base leading-7 text-slate-200">
                “Plan my parents’ 25th anniversary for 60 guests in Pune with a warm, elegant theme, vegetarian menu and a budget of ₹2 lakh.”
              </p>

              <div className="mt-6 grid gap-3 text-sm text-slate-100">
                {['Timeline and tasks', 'Budget breakdown', 'Menu and decor', 'Invitation and backup plan'].map((item) => (
                  <div key={item} className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-600">Everything you need</p>
          <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">Designed for smoother celebrations.</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
              <div className={`mb-4 h-11 w-11 rounded-xl bg-gradient-to-br ${feature.accent}`} />
              <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6" aria-label="Garden celebration inspiration">
        <div className="relative isolate min-h-44 overflow-hidden rounded-[2rem] border border-rose-100 bg-rose-50 shadow-sm sm:min-h-56">
          <Image
            src="/images/celebration-hero.png"
            alt="Pastel garden celebration inspiration with leafy details and a candlelit reception"
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/25 via-transparent to-transparent" aria-hidden="true" />
          <p className="absolute bottom-4 left-4 rounded-full border border-white/70 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur sm:bottom-6 sm:left-6">A warm sunset garden, made yours</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-600">How it works</p>
          <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">Three steps to a better event.</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {steps.map(([index, title, text]) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6 text-left shadow-sm">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{index}</div>
              <h3 className="text-xl font-semibold text-foreground">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border bg-card/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
          <p>© 2026 Celebrate AI</p>
          <div className="flex items-center gap-5">
            <Link href="/planner" className="hover:text-foreground">Planner</Link>
            <Link href="#features" className="hover:text-foreground">Features</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
