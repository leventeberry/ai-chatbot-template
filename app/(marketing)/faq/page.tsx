import Link from "next/link";

const faqs = [
  {
    question: "How long does setup take?",
    answer:
      "Most teams are live in under 30 minutes with the quick start guide.",
  },
  {
    question: "Can I customize colors and copy?",
    answer: "Yes. Match your brand with theme controls and editable prompts.",
  },
  {
    question: "How is data handled?",
    answer: "You control what the widget can access, with built-in rate limits.",
  },
  {
    question: "Can I hand off to a human?",
    answer: "Yes. Route conversations to your inbox or support tool when needed.",
  },
  {
    question: "Does it work on any website?",
    answer: "Yes. Embed it on any site or app with a single snippet.",
  },
];

export default function FaqPage() {
  return (
    <main className="px-6 py-24">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-16">
        <section className="text-center space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            FAQ
          </p>
          <h1 className="text-4xl font-display font-bold text-foreground md:text-5xl">
            Answers to common questions.
          </h1>
          <p className="text-base text-muted-foreground md:text-lg">
            Everything you need to know before launching your AI widget.
          </p>
        </section>

        <section className="grid gap-4">
          {faqs.map((item) => (
            <div
              key={item.question}
              className="rounded-2xl border border-border bg-background p-6 shadow-sm"
            >
              <h2 className="text-base font-semibold text-foreground">
                {item.question}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
            </div>
          ))}
        </section>

        <section className="flex flex-col items-center gap-4 rounded-2xl bg-foreground px-6 py-10 text-center text-background">
          <h2 className="text-2xl font-semibold">Still need help?</h2>
          <p className="text-sm text-background/80">
            We are ready to help you launch with confidence.
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
