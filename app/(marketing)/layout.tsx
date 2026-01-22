import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingNav } from "@/components/marketing-nav";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 selection:text-primary">
      <MarketingNav />
      <div className="flex min-h-[calc(100vh-4rem)] flex-col">
        <div className="flex-1">{children}</div>
        <MarketingFooter />
      </div>
    </div>
  );
}
