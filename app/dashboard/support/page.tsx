import Link from "next/link"

export default function SupportPage() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Support</h1>
        <p className="text-sm text-muted-foreground">
          Tell us what you need help with and we will get back to you.
        </p>
      </header>

      <form className="mt-6 space-y-6" aria-label="Contact support form">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-foreground">
            Name
            <input
              name="name"
              type="text"
              placeholder="Jane Doe"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-foreground">
            Email
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
        </div>

        <label className="space-y-2 text-sm font-medium text-foreground">
          Subject
          <input
            name="subject"
            type="text"
            placeholder="Billing question"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-foreground">
          Message
          <textarea
            name="message"
            rows={6}
            placeholder="Tell us how we can help."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Send message
          </button>
          <Link href="/faq" className="text-sm text-primary hover:text-primary/80">
            Visit FAQ
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          This form is a placeholder for MVP. Wire it to your support inbox or
          helpdesk when ready.
        </p>
      </form>
    </div>
  )
}
