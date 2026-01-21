"use client"

import { useState } from "react"
import { DashboardShell } from "../_components/dashboard-shell"
import { formatDate } from "../../../lib/dashboard-helpers"
import { type TokenSummary } from "../../../hooks/use-dashboard-data"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export default function TokensPage() {
  const [tokenToRevoke, setTokenToRevoke] = useState<TokenSummary | null>(null)

  return (
    <DashboardShell section="tokens">
      {(data) => (
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Embed & Tokens</h2>
            <p className="text-sm text-muted-foreground">
              Securely manage widget tokens and embed instructions.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Embed snippet</CardTitle>
                <CardDescription>
                  Drop this script tag into any HTML page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>Copy and paste this into your app.</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={data.handleCopyEmbedSnippet}
                  >
                    {data.embedCopied ? "Copied" : "Copy snippet"}
                  </Button>
                </div>
                <pre className="rounded-lg border border-border bg-muted px-3 py-2 text-xs overflow-x-auto">
{data.embedSnippet}
                </pre>
                <p className="text-xs text-muted-foreground">
                  Set <code>data-origin</code> to the domain where you embed the
                  widget.
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Safety tips:</p>
                  <p>• Tokens are secrets. Do not expose them in public repos.</p>
                  <p>• Rotate tokens immediately if leaked.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Create / Rotate token</CardTitle>
                <CardDescription>Generate new widget access tokens.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Input
                    value={data.tokenName}
                    onChange={(event) => data.setTokenName(event.target.value)}
                    placeholder="Token name"
                  />
                  <div className="flex gap-2">
                    <Button onClick={data.handleCreateToken} disabled={data.tokenBusy}>
                      Create
                    </Button>
                    <Button
                      variant="outline"
                      onClick={data.handleRotateTokens}
                      disabled={data.tokenBusy}
                    >
                      Rotate
                    </Button>
                  </div>
                </div>
                {data.tokenError && (
                  <p className="text-xs text-destructive">{data.tokenError}</p>
                )}
                {data.createdToken && (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 space-y-2">
                    <div>
                      New token (copy now): <strong>{data.createdToken}</strong>
                    </div>
                    <Button size="sm" variant="outline" onClick={data.handleCopyToken}>
                      {data.tokenCopied ? "Copied" : "Copy token"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Allowed domains</CardTitle>
                <CardDescription>
                  Restrict where the widget can be embedded.
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
                <div className="flex items-center gap-2">
                  <Button onClick={data.handleSaveAllowedOrigin} disabled={data.isSaving}>
                    {data.isSaving ? "Saving..." : "Save domains"}
                  </Button>
                  {data.saveMessage && (
                    <span className="text-xs text-emerald-600">
                      {data.saveMessage}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Active tokens</CardTitle>
                <CardDescription>Manage tokens and revoke access.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.tokens.length === 0 && (
                  <p className="text-sm text-muted-foreground">No tokens yet.</p>
                )}
                {data.tokens.map((token, index) => (
                  <div key={token.id} className="space-y-2 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{token.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Created {formatDate(token.created_at)} • Last used{" "}
                          {formatDate(token.last_used_at)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setTokenToRevoke(token)}
                      >
                        Revoke
                      </Button>
                    </div>
                    {index < data.tokens.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Dialog open={Boolean(tokenToRevoke)} onOpenChange={() => setTokenToRevoke(null)}>
            <DialogContent className="max-w-md bg-background">
              <DialogHeader>
                <DialogTitle>Revoke token</DialogTitle>
                <DialogDescription>
                  This token will be disabled immediately. You can create a new
                  token at any time.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2 px-6 pb-6">
                <Button variant="ghost" onClick={() => setTokenToRevoke(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (tokenToRevoke) {
                      void data.handleRevokeToken(tokenToRevoke.id)
                      setTokenToRevoke(null)
                    }
                  }}
                >
                  Revoke token
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </section>
      )}
    </DashboardShell>
  )
}
