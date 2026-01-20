import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export default function NotificationsPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Control how and when we notify you about activity.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Channels</CardTitle>
            <CardDescription>Choose how we reach you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <label className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span>Email alerts</span>
              <Checkbox checked />
            </label>
            <label className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span>Weekly summary</span>
              <Checkbox />
            </label>
            <label className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span>Product updates</span>
              <Checkbox />
            </label>
            <Button className="w-full" variant="outline">
              Save channel preferences
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alert thresholds</CardTitle>
            <CardDescription>Get notified when usage spikes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Error spike threshold</label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="5" />
                <span className="text-xs text-muted-foreground">errors / hour</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Session spike threshold</label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="200" />
                <span className="text-xs text-muted-foreground">sessions / hour</span>
              </div>
            </div>
            <Button>Save thresholds</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent notifications</CardTitle>
          <CardDescription>Latest alerts and summaries.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            {
              title: "Usage spike detected",
              detail: "245 sessions in the last hour",
              time: "10m ago",
            },
            {
              title: "Weekly summary ready",
              detail: "Sessions up 12% week over week",
              time: "2d ago",
            },
            {
              title: "Billing receipt sent",
              detail: "Invoice INV-2026-001 delivered",
              time: "Jan 1, 2026",
            },
          ].map((item, index, items) => (
            <div key={item.title} className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
              {index < items.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  )
}
