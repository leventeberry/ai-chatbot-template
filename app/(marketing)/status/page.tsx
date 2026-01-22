import Link from "next/link";

const components = [
  { name: "API", status: "Operational" },
  { name: "Widget delivery", status: "Operational" },
  { name: "Analytics", status: "Operational" },
  { name: "Webhooks", status: "Operational" },
];

const incidents = [
  { date: "Sep 12", summary: "No incidents reported." },
  { date: "Sep 05", summary: "No incidents reported." },
  { date: "Aug 29", summary: "No incidents reported." },
];

export default function StatusPage() {
  return (
    <main className="px-6 py-24">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-16">
        <section className="text-center space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Status
          </p>
          <h1 className="text-4xl font-display font-bold text-foreground md:text-5xl">
            System status at a glance.
          </h1>
          <p className="text-base text-muted-foreground md:text-lg">
            Track availability and incident history across core services.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-emerald-50 p-6 text-center">
          <p className="text-sm font-semibold text-emerald-700">
            All systems operational
          </p>
          <p className="mt-2 text-sm text-emerald-700/80">
            Last updated a few minutes ago.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-background p-6">
          <h2 className="text-lg font-semibold text-foreground">Components</h2>
          <div className="mt-4 grid gap-3">
            {components.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-lg border border-border/70 px-4 py-3 text-sm"
              >
                <span className="text-foreground">{item.name}</span>
                <span className="font-medium text-emerald-700">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-slate-50 p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Incident history
          </h2>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            {incidents.map((incident) => (
              <div
                key={incident.date}
                className="flex items-center justify-between rounded-lg border border-border/70 px-4 py-3"
              >
                <span>{incident.date}</span>
                <span>{incident.summary}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col items-center gap-4 rounded-2xl bg-foreground px-6 py-10 text-center text-background">
          <h2 className="text-2xl font-semibold">Stay in the loop</h2>
          <p className="text-sm text-background/80">
            Subscribe to status updates and incident alerts.
          </p>
          <Link
            href="/status"
            className="rounded-lg bg-background px-5 py-2 text-sm font-semibold text-foreground"
          >
            Subscribe to updates
          </Link>
        </section>
      </div>
    </main>
  );
}
