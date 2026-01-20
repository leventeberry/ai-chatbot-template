import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export default function BillingPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Review your plan, usage, invoices, and payment methods.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current plan</CardTitle>
            <CardDescription>Starter · Renews on Feb 1, 2026</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Monthly price</span>
                <span className="font-medium">$49</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Included messages</span>
                <span className="font-medium">50,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Overage</span>
                <span className="font-medium">$0.002 / msg</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button>Upgrade plan</Button>
              <Button variant="outline">Downgrade</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usage this month</CardTitle>
            <CardDescription>Keep an eye on your quota.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Messages used</span>
                <span className="font-medium">12,340 / 50,000</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 w-[25%] rounded-full bg-primary" />
              </div>
              <p className="text-xs text-muted-foreground">
                Estimated remaining: 37,660 messages
              </p>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">API tokens</span>
                <span className="font-medium">3 active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last invoice</span>
                <span className="font-medium">$49 · Jan 1, 2026</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment method</CardTitle>
            <CardDescription>Primary card on file.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">Visa •••• 4242</span>
                <span className="text-muted-foreground">Exp 08/27</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Billing ZIP 94107
              </p>
            </div>
            <Button variant="outline">Update payment method</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Billing email</CardTitle>
            <CardDescription>Invoices and receipts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input type="email" placeholder="billing@company.com" />
            <Button>Save billing email</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoices</CardTitle>
          <CardDescription>Download past invoices.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            { id: "INV-2026-001", date: "Jan 1, 2026", amount: "$49" },
            { id: "INV-2025-012", date: "Dec 1, 2025", amount: "$49" },
            { id: "INV-2025-011", date: "Nov 1, 2025", amount: "$49" },
          ].map((invoice, index, items) => (
            <div key={invoice.id} className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{invoice.id}</p>
                  <p className="text-xs text-muted-foreground">{invoice.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{invoice.amount}</span>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              </div>
              {index < items.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  )
}
