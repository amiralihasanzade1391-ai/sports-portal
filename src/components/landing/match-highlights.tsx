"use client";

import Link from "next/link";
import Image from "next/image";
import { Play, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const highlights = [
  {
    id: "1",
    title: "Astonishing 90th-Minute Free Kick Decides Derby Thriller",
    match: "Inter Milan vs AC Milan",
    views: "184K",
    duration: "03:45",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "2",
    title: "Unbelievable Triple-Overtime Buzzer Beater Highlights",
    match: "Lakers vs Celtics",
    views: "340K",
    duration: "05:12",
    image: "https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "3",
    title: "Championship Point: 38-Shot Rally Clinches Historic Title",
    match: "Wimbledon Finals",
    views: "92K",
    duration: "02:20",
    image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=60",
  },
];

export function MatchHighlights() {
  return (
    <section className="py-14 border-b">
      <div className="container space-y-8">
        <div>
          <Badge variant="outline" className="mb-2 text-primary border-primary/30">
            Replays & Clips
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Match Highlights & Viral Moments
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {highlights.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl overflow-hidden border bg-card shadow-sm hover:shadow-xl transition-all flex flex-col"
            >
              <div className="relative h-48 w-full bg-muted">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </div>
                </div>

                <span className="absolute bottom-2.5 right-2.5 rounded bg-black/80 px-2 py-0.5 text-[11px] font-semibold text-white">
                  {item.duration}
                </span>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-primary uppercase">
                    {item.match}
                  </span>
                  <h3 className="font-bold text-base mt-1 line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{item.views} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
