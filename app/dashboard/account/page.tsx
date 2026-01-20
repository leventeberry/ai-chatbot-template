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

export default function AccountPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Account</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, security settings, and team access.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>Update your personal details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full name</label>
              <Input placeholder="Jane Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="jane@company.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Avatar URL</label>
              <Input placeholder="https://example.com/avatar.png" />
            </div>
            <Button>Save profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Password</CardTitle>
            <CardDescription>Change your account password.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input type="password" placeholder="Current password" />
            <Input type="password" placeholder="New password" />
            <Input type="password" placeholder="Confirm new password" />
            <Button>Update password</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Two-factor authentication</CardTitle>
            <CardDescription>Extra protection for your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Enable 2FA</p>
                <p className="text-xs text-muted-foreground">
                  Require a verification code at login.
                </p>
              </div>
              <Checkbox checked={false} />
            </div>
            <Button variant="outline">Set up authenticator</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team access</CardTitle>
            <CardDescription>Invite teammates and manage roles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { name: "Jane Doe", role: "Owner", email: "jane@company.com" },
              { name: "Marcus Lee", role: "Admin", email: "marcus@company.com" },
              { name: "Ava Patel", role: "Member", email: "ava@company.com" },
            ].map((member, index, items) => (
              <div key={member.email} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{member.role}</span>
                </div>
                {index < items.length - 1 && <Separator />}
              </div>
            ))}
            <Button variant="outline">Invite teammate</Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
