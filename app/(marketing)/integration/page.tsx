import Link from "next/link";

const steps = [
  {
    title: "Install the widget",
    description: "Add the script or React component to your site.",
  },
  {
    title: "Configure responses",
    description: "Connect your FAQs, docs, or support content.",
  },
  {
    title: "Go live",
    description: "Launch with confidence and monitor conversations.",
  },
];

const compatibility = [
  "Next.js",
  "React",
  "Shopify",
  "Webflow",
  "WordPress",
  "Custom sites",
];

export default function IntegrationPage() {
  return (
    <main className="px-6 py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16">
        <section className="text-center space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Integration
          </p>
          <h1 className="text-4xl font-display font-bold text-foreground md:text-5xl">
            Drop-in widget, no rebuild required.
          </h1>
          <p className="text-base text-muted-foreground md:text-lg">
            Install in minutes and keep your existing site exactly as it is.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/docs"
              className="rounded-lg bg-foreground px-5 py-2 text-sm font-semibold text-background"
            >
              View docs
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-border px-5 py-2 text-sm font-semibold text-foreground"
            >
              See pricing
            </Link>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.title}
              className="rounded-2xl border border-border bg-background/70 p-6 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Step
              </p>
              <h2 className="mt-3 text-lg font-semibold text-foreground">
                {step.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-border bg-slate-50 p-8">
          <h2 className="text-xl font-semibold text-foreground">
            Works with the tools you already use
          </h2>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {compatibility.map((item) => (
              <span
                key={item}
                className="rounded-full border border-border/70 px-4 py-1"
              >
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-background p-8">
          <h2 className="text-xl font-semibold text-foreground">
            Secure by default
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Built-in rate limits, content controls, and audit trails keep your
            customers safe from day one.
          </p>
        </section>

        <section className="flex flex-col items-center gap-4 rounded-2xl bg-foreground px-6 py-10 text-center text-background">
          <h2 className="text-2xl font-semibold">Ready to launch?</h2>
          <p className="text-sm text-background/80">
            Follow the quick start and be live today.
          </p>
          <Link
            href="/docs"
            className="rounded-lg bg-background px-5 py-2 text-sm font-semibold text-foreground"
          >
            View quick start
          </Link>
        </section>
      </div>
    </main>
  );
}
