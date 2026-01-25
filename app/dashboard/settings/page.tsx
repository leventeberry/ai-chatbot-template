"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import {
  ColorField,
  DashboardSectionHeader,
} from "@/components/dashboard/dashboard-helpers"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

export default function SettingsPage() {
  return (
    <DashboardShell section="settings">
      {(data) => (
        <section className="space-y-6">
          <DashboardSectionHeader
            title="Widget Settings"
            description="Configure widget behavior and appearance."
          />
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Behavior</CardTitle>
                <CardDescription>Greeting and assistant behavior.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Widget name</label>
                  <Input
                    value={data.widgetName}
                    onChange={(event) => data.setWidgetName(event.target.value)}
                    placeholder="Your widget name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Greeting message</label>
                  <Input
                    value={data.welcomeMessage}
                    onChange={(event) => data.setWelcomeMessage(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Initial prompt (optional)
                  </label>
                  <Input
                    value={data.initialPrompt}
                    onChange={(event) => data.setInitialPrompt(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={data.openOnLoad}
                      onCheckedChange={(value) => data.setOpenOnLoad(Boolean(value))}
                    />
                    <span className="text-sm">Open on load</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={data.showOnline}
                      onCheckedChange={(value) => data.setShowOnline(Boolean(value))}
                    />
                    <span className="text-sm">Show online indicator</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Theme</CardTitle>
                <CardDescription>Update widget colors and branding.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <ColorField
                    label="Header"
                    value={data.headerBackground}
                    onChange={data.setHeaderBackground}
                  />
                  <ColorField
                    label="Header Text"
                    value={data.headerText}
                    onChange={data.setHeaderText}
                  />
                  <ColorField
                    label="Button"
                    value={data.buttonBackground}
                    onChange={data.setButtonBackground}
                  />
                  <ColorField
                    label="Button Text"
                    value={data.buttonText}
                    onChange={data.setButtonText}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Logo URL</label>
                  <Input
                    value={data.logoUrl}
                    onChange={(event) => data.setLogoUrl(event.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={data.showLogo}
                      onCheckedChange={(value) => data.setShowLogo(Boolean(value))}
                    />
                    <span className="text-sm">Show logo in header</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">AI guardrails</CardTitle>
                <CardDescription>
                  Provide safe guidance for the assistant.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">System prompt</label>
                  <textarea
                    value={data.systemPrompt}
                    onChange={(event) => data.setSystemPrompt(event.target.value)}
                    rows={4}
                    placeholder="Define behavior, tone, and safety boundaries."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Documentation</label>
                  <textarea
                    value={data.documentation}
                    onChange={(event) => data.setDocumentation(event.target.value)}
                    rows={4}
                    placeholder="Paste support docs or FAQ content."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Placement</CardTitle>
                <CardDescription>Position the widget on the page.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <select
                    value={data.position}
                    onChange={(event) =>
                      data.setPosition(event.target.value as "bottom-right" | "bottom-left")
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="bottom-right">Bottom right</option>
                    <option value="bottom-left">Bottom left</option>
                  </select>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={data.offsetX}
                      onChange={(event) => data.setOffsetX(Number(event.target.value))}
                      placeholder="Offset X"
                    />
                    <Input
                      type="number"
                      value={data.offsetY}
                      onChange={(event) => data.setOffsetY(Number(event.target.value))}
                      placeholder="Offset Y"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Allowed domains</CardTitle>
                <CardDescription>
                  Set the exact domain where the widget can be embedded.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  value={data.allowedOrigin}
                  onChange={(event) =>
                    data.setAllowedOrigin(
                      data.normalizeAllowedOrigin(event.target.value)
                    )
                  }
                  placeholder="https://example.com"
                />
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>Current origin: {data.currentOrigin || "unknown"}</span>
                  <Button size="sm" variant="ghost" onClick={data.appendCurrentOrigin}>
                    Use current domain
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Embed snippet</CardTitle>
              <CardDescription>Use this HTML snippet on any site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>Copy and paste this into your app.</span>
                <Button size="sm" variant="outline" onClick={data.handleCopyEmbedSnippet}>
                  {data.embedCopied ? "Copied" : "Copy snippet"}
                </Button>
              </div>
              <pre className="rounded-lg border border-border bg-muted px-3 py-2 text-xs overflow-x-auto">
{data.embedSnippet}
              </pre>
              <p className="text-xs text-muted-foreground">
                Load the script from the domain hosting your widget.
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={data.handleSave} disabled={data.isSaving}>
              {data.isSaving ? "Saving..." : "Save settings"}
            </Button>
            {data.saveMessage && (
              <span className="text-sm text-emerald-600">{data.saveMessage}</span>
            )}
            {data.error && (
              <span className="text-sm text-destructive">{data.error}</span>
            )}
            <span className="text-xs text-muted-foreground">
              Saving the allowed origin enforces widget CORS checks.
            </span>
          </div>
        </section>
      )}
    </DashboardShell>
  )
}
