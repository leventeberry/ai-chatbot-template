import type { ReactNode } from "react";
import { ChatWidget } from "@/components/chat-widget";
import { RedirectIfAuthed } from "@/components/redirect-if-authed";
import {
  ArrowRight,
  CheckCircle,
  Code,
  Globe,
  Shield,
  Zap,
} from "lucide-react";

export default function Home() {
  return (
    <>
      <RedirectIfAuthed />

      <main className="relative overflow-hidden pb-32 pt-20">
        <div className="absolute top-0 left-1/2 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 h-[600px] w-[800px] rounded-full bg-purple-500/5 blur-3xl -z-10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
              v2.0 Now Available
            </div>

            <h1 className="mb-6 text-5xl font-display font-bold leading-[1.1] tracking-tight text-foreground md:text-7xl">
              Add AI Intelligence <br />
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                to your application
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-muted-foreground">
              A production-ready chatbot widget template built with Go and
              React. Embed it anywhere and start engaging your users with
              AI-powered conversations.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button className="flex items-center gap-2 rounded-xl bg-foreground px-8 py-4 text-lg font-semibold text-background shadow-xl shadow-black/5 transition-colors hover:bg-foreground/90">
                Start Integration
                <ArrowRight className="h-5 w-5" />
              </button>
              <button className="flex items-center gap-2 rounded-xl border border-border bg-white px-8 py-4 text-lg font-semibold text-foreground transition-colors hover:bg-slate-50">
                <Code className="h-5 w-5 text-muted-foreground" />
                View Documentation
              </button>
            </div>
          </div>

          <div className="mt-32 grid grid-cols-1 gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-amber-500" />}
              title="Lightning Fast"
              description="Powered by Go for high-concurrency backend performance and optimized React frontend."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-emerald-500" />}
              title="Secure by Default"
              description="Enterprise-grade security practices with proper API validation and rate limiting."
            />
            <FeatureCard
              icon={<Globe className="h-6 w-6 text-blue-500" />}
              title="Universal Embed"
              description="Drop-in React component that works seamlessly in any existing application."
            />
          </div>

          <div className="relative mt-32 overflow-hidden rounded-2xl border border-border bg-slate-900 p-8 shadow-2xl">
            <div className="absolute right-4 top-4 flex gap-2">
              <div className="h-3 w-3 rounded-full border border-red-500/50 bg-red-500/20" />
              <div className="h-3 w-3 rounded-full border border-yellow-500/50 bg-yellow-500/20" />
              <div className="h-3 w-3 rounded-full border border-green-500/50 bg-green-500/20" />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-2">
              <div>
                <h3 className="mb-4 text-2xl font-display font-bold text-white">
                  Simple Integration
                </h3>
                <p className="mb-8 text-slate-400">
                  Just import the widget and add it to your app root. It handles
                  all the state, API calls, and animations automatically.
                </p>
                <ul className="mb-8 space-y-3">
                  {[
                    "Zero configuration required",
                    "Auto-reconnecting websocket support",
                    "Markdown rendering support",
                    "Customizable theme variables",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-slate-300"
                    >
                      <CheckCircle className="h-5 w-5 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-sm text-slate-300 shadow-inner">
                <pre>{`import { ChatWidget } from "@/components/chat-widget";

function App() {
  return (
    <div className="app-container">
      <Header />
      <MainContent />
      
      {/* Add the widget anywhere */}
      <ChatWidget />
    </div>
  );
}`}</pre>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ChatWidget />
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold font-display">{title}</h3>
      <p className="leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
