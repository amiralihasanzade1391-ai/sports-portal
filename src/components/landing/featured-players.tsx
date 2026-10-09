import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface FeaturedPlayerItem {
  id: string;
  name: string;
  team: string;
  position: string;
  stats: string;
  image: string;
}

const defaultPlayers: FeaturedPlayerItem[] = [
  {
    id: "1",
    name: "Kylian Mbappé",
    team: "Real Madrid",
    position: "Forward",
    stats: "28 Goals • 8 Assists",
    image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "2",
    name: "Erling Haaland",
    team: "Manchester City",
    position: "Striker",
    stats: "31 Goals • 4 Assists",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "3",
    name: "Jude Bellingham",
    team: "Real Madrid",
    position: "Midfielder",
    stats: "18 Goals • 12 Assists",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "4",
    name: "Bukayo Saka",
    team: "Arsenal",
    position: "Winger",
    stats: "15 Goals • 14 Assists",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=60",
  },
];

export function FeaturedPlayers({ players }: { players?: FeaturedPlayerItem[] }) {
  const displayPlayers = players && players.length > 0 ? players : defaultPlayers;

  return (
    <section className="py-14 bg-card/20">
      <div className="container space-y-8">
        <div>
          <Badge variant="outline" className="mb-2 text-primary border-primary/30">
            Spotlight
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Featured Players of the Month
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayPlayers.map((p) => (
            <Card
              key={p.id}
              className="overflow-hidden border bg-card hover:shadow-lg transition-all group"
            >
              <div className="relative h-60 w-full bg-muted">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-xs font-semibold text-primary-foreground/90 uppercase tracking-wider">
                    {p.position}
                  </p>
                  <h3 className="text-lg font-black leading-tight">{p.name}</h3>
                  <p className="text-xs text-white/80">{p.team}</p>
                </div>
              </div>
              <CardContent className="p-3 text-center bg-card">
                <span className="text-xs font-semibold text-primary">
                  {p.stats}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
