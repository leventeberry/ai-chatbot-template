import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SupportPage() {
  return (
    <main className="px-6 py-24">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16">
        <section className="text-center space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Support
          </p>
          <h1 className="text-4xl font-display font-bold text-foreground md:text-5xl">
            Talk to our team.
          </h1>
          <p className="text-base text-muted-foreground md:text-lg">
            Send us a message and we will help you get live quickly.
          </p>
        </section>

        <section className="grid gap-8 md:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">
              Contact support
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We usually respond within 1 business day.
            </p>
            <form className="mt-6 space-y-4">
              <label className="text-sm font-medium text-foreground">
                Name
                <Input
                  name="name"
                  type="text"
                  placeholder="Alex Johnson"
                  className="mt-2"
                />
              </label>
              <label className="text-sm font-medium text-foreground">
                Work email
                <Input
                  name="email"
                  type="email"
                  placeholder="alex@company.com"
                  className="mt-2"
                />
              </label>
              <label className="text-sm font-medium text-foreground">
                Message
                <textarea
                  name="message"
                  rows={5}
                  placeholder="Tell us how we can help."
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit">Send message</Button>
                <Button variant="outline" type="button">
                  Attach logs
                </Button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-foreground">
                Quick links
              </h2>
              <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
                <Link href="/docs" className="hover:text-foreground">
                  Documentation
                </Link>
                <Link href="/faq" className="hover:text-foreground">
                  Frequently asked questions
                </Link>
                <Link href="/status" className="hover:text-foreground">
                  System status
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-foreground p-6 text-background">
              <h3 className="text-lg font-semibold">Need priority help?</h3>
              <p className="mt-2 text-sm text-background/80">
                Enterprise support includes dedicated response times and a
                success manager.
              </p>
              <Link
                href="/pricing"
                className="mt-4 inline-flex rounded-lg bg-background px-4 py-2 text-sm font-semibold text-foreground"
              >
                View plans
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
