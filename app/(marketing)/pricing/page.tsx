import Link from "next/link";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    cadence: "per month",
    cta: "Get started",
    ctaStyle: "border border-border text-foreground",
    features: [
      "Limited access to models",
      "50 message credits/month",
      "400 KB per AI agent",
      "Embed on unlimited websites",
    ],
    footnote: "AI agents get deleted after 14 days of inactivity on the free plan.",
  },
  {
    name: "Hobby",
    price: "$32",
    cadence: "per month, $384 billed annually",
    cta: "Subscribe",
    ctaStyle: "border border-border text-foreground",
    features: [
      "Everything in Free +",
      "Access to advanced models",
      "1,500 message credits/month",
      "5 AI Actions per AI agent",
      "20 MB per AI agent",
      "Integrations (Zendesk, WhatsApp, and more)",
      "API access",
      "Basic analytics",
    ],
  },
  {
    name: "Standard",
    price: "$120",
    cadence: "per month, $1,440 billed annually",
    cta: "Subscribe",
    ctaStyle: "bg-foreground text-background",
    popular: true,
    features: [
      "Everything in Hobby +",
      "10,000 message credits/month",
      "10 AI Actions per AI agent",
      "40 MB per AI agent",
      "Auto retrain agents",
    ],
  },
  {
    name: "Pro",
    price: "$400",
    cadence: "per month, $4,800 billed annually",
    cta: "Subscribe",
    ctaStyle: "border border-border text-foreground",
    features: [
      "Everything in Standard +",
      "40,000 message credits/month",
      "15 AI Actions per AI agent",
      "60 MB per AI agent",
      "Advanced analytics",
      "Source suggestions",
      "Tickets as a source",
    ],
  },
  {
    name: "Enterprise",
    price: "Let's Talk",
    cadence: "",
    cta: "Contact us",
    ctaStyle: "border border-border text-foreground",
    features: [
      "Everything in Pro +",
      "Higher limits",
      "Priority support",
      "SLAs",
      "Success manager (CSM)",
      "SSO",
    ],
  },
];

export default function PricingPage() {
  return (
    <main className="px-6 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <section className="text-center space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Pricing
          </p>
          <h1 className="text-4xl font-display font-bold text-foreground md:text-5xl">
            Choose a plan that grows with you.
          </h1>
        </section>

        <section className="rounded-3xl border border-border bg-background shadow-sm">
          <div className="overflow-x-auto">
            <div className="grid min-w-[980px] grid-cols-5">
              {tiers.map((tier) => (
                <div
                  key={tier.name}
                  className="border-r border-border last:border-r-0"
                >
                  <div className="relative flex min-h-[220px] flex-col border-b border-border px-6 pb-6 pt-8">
                    {tier.popular ? (
                      <span className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-2xl bg-foreground px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-background">
                        Popular
                      </span>
                    ) : null}
                    <div className="flex min-h-[24px] items-center gap-2 text-sm font-semibold text-foreground">
                      <span className="text-base">{tier.name}</span>
                    </div>
                    <div className="min-h-[96px]">
                      <p className="my-3 text-4xl font-semibold text-foreground">
                        {tier.price}
                      </p>
                      <div className="min-h-[32px]">
                        {tier.cadence ? (
                          <p className="my-2 line-clamp-2 text-xs text-muted-foreground">
                            {tier.cadence}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <Link
                      href="/pricing"
                      className={`mt-auto inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold ${tier.ctaStyle}`}
                    >
                      {tier.cta}
                    </Link>
                  </div>
                  <div className="px-6 py-6 text-sm text-muted-foreground">
                    <ul className="min-h-[300px] space-y-3">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check className="mt-0.5 h-4 w-4 text-foreground" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="min-h-[56px]">
                      {tier.footnote ? (
                        <p className="mt-6 text-xs text-muted-foreground">
                          {tier.footnote}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="text-center text-sm text-muted-foreground">
          Trusted by 10,000+ businesses worldwide
        </section>
      </div>
    </main>
  );
}
