import Link from "next/link";

const features = [
  {
    title: "Instant answers",
    description:
      "Give visitors fast, accurate responses with a widget trained on your content.",
  },
  {
    title: "Human handoff",
    description:
      "Route conversations to your team when questions need a personal touch.",
  },
  {
    title: "Brand-matched UI",
    description:
      "Customize colors, tone, and placement so it feels native to your site.",
  },
];

const useCases = [
  "Deflect support tickets with self-serve help.",
  "Qualify leads without adding forms.",
  "Guide customers to the right product or plan.",
];

export default function FeaturesPage() {
  return (
    <main className="px-6 py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16">
        <section className="text-center space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Features
          </p>
          <h1 className="text-4xl font-display font-bold text-foreground md:text-5xl">
            Everything your website needs to answer, convert, and support.
          </h1>
          <p className="text-base text-muted-foreground md:text-lg">
            Launch an AI chat widget that feels like part of your brand, not an
            add-on.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/pricing"
              className="rounded-lg bg-foreground px-5 py-2 text-sm font-semibold text-background"
            >
              Get started
            </Link>
            <Link
              href="/docs"
              className="rounded-lg border border-border px-5 py-2 text-sm font-semibold text-foreground"
            >
              View docs
            </Link>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-background/70 p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-foreground">
                {feature.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-border bg-slate-50 p-8">
          <h2 className="text-xl font-semibold text-foreground">Use cases</h2>
          <ul className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
            {useCases.map((item) => (
              <li
                key={item}
                className="rounded-lg border border-border/70 p-4"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col items-center gap-4 rounded-2xl bg-foreground px-6 py-10 text-center text-background">
          <h2 className="text-2xl font-semibold">Start integrating in minutes.</h2>
          <p className="text-sm text-background/80">
            Add the widget, connect your data, and launch.
          </p>
          <Link
            href="/integration"
            className="rounded-lg bg-background px-5 py-2 text-sm font-semibold text-foreground"
          >
            See integration steps
          </Link>
        </section>
      </div>
    </main>
  );
}
