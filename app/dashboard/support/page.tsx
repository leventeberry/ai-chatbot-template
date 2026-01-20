import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function SupportPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Support</h1>
        <p className="text-sm text-muted-foreground">
          Tell us what you need help with and we will get back to you.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact support</CardTitle>
            <CardDescription>We usually respond within 1 business day.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" aria-label="Contact support form">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-foreground">
                  Name
                  <Input name="name" type="text" placeholder="Jane Doe" />
                </label>
                <label className="space-y-2 text-sm font-medium text-foreground">
                  Email
                  <Input name="email" type="email" placeholder="you@example.com" />
                </label>
              </div>

              <label className="space-y-2 text-sm font-medium text-foreground">
                Subject
                <Input name="subject" type="text" placeholder="Billing question" />
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

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit">Send message</Button>
                <Button variant="outline" type="button">
                  Attach logs
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                This form is a placeholder for MVP. Wire it to your support inbox or
                helpdesk when ready.
              </p>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resources</CardTitle>
            <CardDescription>Quick links and status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Link href="/faq" className="text-primary hover:text-primary/80">
              Visit FAQ
            </Link>
            <Link href="/docs" className="text-primary hover:text-primary/80">
              Read documentation
            </Link>
            <Link href="/status" className="text-primary hover:text-primary/80">
              System status
            </Link>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Last response</p>
              <p className="text-sm font-medium">2 hours ago</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
