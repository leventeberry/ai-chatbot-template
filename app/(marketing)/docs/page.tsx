import Link from "next/link";

const quickStart = [
  "Install the widget on your site.",
  "Connect your FAQs or knowledge base.",
  "Publish and monitor conversations.",
];

const docLinks = [
  "Widget setup",
  "Theme customization",
  "Conversation routing",
  "Webhooks and exports",
];

const gotchas = [
  "Allowlist your domain for secure embeds.",
  "Set CORS rules for your API endpoints.",
  "Keep fallback answers short and helpful.",
];

export default function DocsPage() {
  return (
    <main className="px-6 py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16">
        <section className="text-center space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Documentation
          </p>
          <h1 className="text-4xl font-display font-bold text-foreground md:text-5xl">
            Everything you need to integrate fast.
          </h1>
          <p className="text-base text-muted-foreground md:text-lg">
            Clear steps, concise guidance, and practical defaults.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/integration"
              className="rounded-lg bg-foreground px-5 py-2 text-sm font-semibold text-background"
            >
              View quick start
            </Link>
            <Link
              href="/faq"
              className="rounded-lg border border-border px-5 py-2 text-sm font-semibold text-foreground"
            >
              Read FAQs
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-slate-50 p-8">
          <h2 className="text-xl font-semibold text-foreground">Quick start</h2>
          <ol className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
            {quickStart.map((step, index) => (
              <li key={step} className="rounded-lg border border-border/70 p-4">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Step {index + 1}
                </span>
                <p className="mt-2">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Key documentation
            </h2>
            <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
              {docLinks.map((item) => (
                <li key={item} className="rounded-lg border border-border/70 p-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Common gotchas
            </h2>
            <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
              {gotchas.map((item) => (
                <li key={item} className="rounded-lg border border-border/70 p-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="flex flex-col items-center gap-4 rounded-2xl bg-foreground px-6 py-10 text-center text-background">
          <h2 className="text-2xl font-semibold">Need a hand?</h2>
          <p className="text-sm text-background/80">
            Our team can help you get live quickly.
          </p>
          <Link
            href="/support"
            className="rounded-lg bg-background px-5 py-2 text-sm font-semibold text-foreground"
          >
            Contact support
          </Link>
        </section>
      </div>
    </main>
  );
}
