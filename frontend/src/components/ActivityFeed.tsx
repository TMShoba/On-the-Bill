import { useMemo } from "react";
import { getDemoGigs } from "../Services/demoStore";

type FeedItem = {
  id: string;
  text: string;
  tone: "emerald" | "amber" | "slate";
};

/**
 * Lightweight, anonymized activity strip so the homepage feels alive
 * even with a small real user base. Mixes live demo data with seeded copy.
 */
export default function ActivityFeed() {
  const items = useMemo(() => {
    const gigs = getDemoGigs();
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const confirmedThisWeek = gigs.filter((g) => {
      if (g.status !== "confirmed") return false;
      const t = new Date(g.createdAt || g.eventDate).getTime();
      return t >= weekAgo;
    });

    const byCity: Record<string, number> = {};
    for (const g of confirmedThisWeek) {
      const city = g.city || "Johannesburg";
      byCity[city] = (byCity[city] || 0) + 1;
    }

    const live: FeedItem[] = [];

    for (const [city, n] of Object.entries(byCity)) {
      if (n > 0) {
        live.push({
          id: `city-${city}`,
          text: `${n} booking${n === 1 ? "" : "s"} confirmed in ${city} this week`,
          tone: "emerald",
        });
      }
    }

    const pending = gigs.filter((g) => g.status === "pending").length;
    if (pending > 0) {
      live.push({
        id: "pending",
        text: `${pending} request${pending === 1 ? "" : "s"} waiting on artists right now`,
        tone: "amber",
      });
    }

    // Seeded anonymized lines so the strip never feels empty
    const seeds: FeedItem[] = [
      {
        id: "s1",
        text: "A promoter in Cape Town shortlisted 4 Amapiano DJs",
        tone: "slate",
      },
      {
        id: "s2",
        text: "2 festival holds placed for Durban next month",
        tone: "slate",
      },
      {
        id: "s3",
        text: "An artist in Pretoria updated their demo mix",
        tone: "slate",
      },
      {
        id: "s4",
        text: "Average response time on The LineUp: under 18 hours",
        tone: "emerald",
      },
    ];

    const combined = [...live, ...seeds].slice(0, 6);
    if (combined.length === 0) return seeds.slice(0, 3);
    return combined;
  }, []);

  const toneClass = {
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    slate: "text-slate-300",
  };

  return (
    <section className="border-y border-white/10 bg-slate-900/80 py-3">
      <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-hidden px-4 sm:px-6">
        <span className="shrink-0 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
          Live
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex animate-[marquee_28s_linear_infinite] gap-8 whitespace-nowrap">
            {[...items, ...items].map((item, i) => (
              <span
                key={`${item.id}-${i}`}
                className={`text-sm ${toneClass[item.tone]}`}
              >
                <span className="mr-2 text-emerald-500/80">●</span>
                {item.text}
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
