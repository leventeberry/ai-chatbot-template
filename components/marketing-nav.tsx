import Link from "next/link";
import { LoginDialog } from "@/components/login-dialog";

export function MarketingNav() {
  return (
    <nav className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600 font-display text-white">
              AI
            </div>
            <span className="font-display text-xl font-bold tracking-tight">
              ChatTemplate
            </span>
          </Link>
          <div className="hidden items-center space-x-8 text-sm font-medium text-muted-foreground md:flex">
            <Link href="/features" className="hover:text-primary transition-colors">
              Features
            </Link>
            <Link
              href="/integration"
              className="hover:text-primary transition-colors"
            >
              Integration
            </Link>
            <Link href="/pricing" className="hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="/docs" className="hover:text-primary transition-colors">
              Docs
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <LoginDialog
              triggerLabel="Log in"
              defaultMode="login"
              triggerClassName="text-sm font-medium text-muted-foreground hover:text-foreground"
            />
            <Link
              href="/pricing"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-primary/30"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
