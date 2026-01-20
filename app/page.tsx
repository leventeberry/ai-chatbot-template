import type { ReactNode } from "react";
import { ChatWidget } from "@/components/ChatWidget";
import { LoginDialog } from "@/components/LoginDialog";
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
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 selection:text-primary">
      <RedirectIfAuthed />
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold font-display">
                AI
              </div>
              <span className="font-display font-bold text-xl tracking-tight">
                ChatTemplate
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">
                Features
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Integration
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Pricing
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Docs
              </a>
            </div>
            <div className="flex items-center gap-4">
              <LoginDialog />
              <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-8 border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              v2.0 Now Available
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
              Add AI Intelligence <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                to your application
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              A production-ready chatbot widget template built with Go and
              React. Embed it anywhere and start engaging your users with
              AI-powered conversations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="px-8 py-4 rounded-xl bg-foreground text-background font-semibold text-lg hover:bg-foreground/90 transition-colors flex items-center gap-2 shadow-xl shadow-black/5">
                Start Integration
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 rounded-xl bg-white border border-border text-foreground font-semibold text-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
                <Code className="w-5 h-5 text-muted-foreground" />
                View Documentation
              </button>
            </div>
          </div>

          <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-amber-500" />}
              title="Lightning Fast"
              description="Powered by Go for high-concurrency backend performance and optimized React frontend."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-emerald-500" />}
              title="Secure by Default"
              description="Enterprise-grade security practices with proper API validation and rate limiting."
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6 text-blue-500" />}
              title="Universal Embed"
              description="Drop-in React component that works seamlessly in any existing application."
            />
          </div>

          <div className="mt-32 border border-border rounded-2xl p-8 bg-slate-900 shadow-2xl overflow-hidden relative">
            <div className="absolute top-4 right-4 flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
              <div>
                <h3 className="text-2xl font-display font-bold text-white mb-4">
                  Simple Integration
                </h3>
                <p className="text-slate-400 mb-8">
                  Just import the widget and add it to your app root. It handles
                  all the state, API calls, and animations automatically.
                </p>
                <ul className="space-y-3 mb-8">
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
                      <CheckCircle className="w-5 h-5 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-300 border border-slate-800 shadow-inner overflow-x-auto">
                <pre>{`import { ChatWidget } from "@components/ChatWidget";

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

      <footer className="bg-slate-50 border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-muted-foreground">
            © 2024 AI Chat Template. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground">
              Terms
            </a>
            <a href="#" className="hover:text-foreground">
              Twitter
            </a>
            <a href="#" className="hover:text-foreground">
              GitHub
            </a>
          </div>
        </div>
      </footer>

      <ChatWidget />
    </div>
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
    <div className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold font-display mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
