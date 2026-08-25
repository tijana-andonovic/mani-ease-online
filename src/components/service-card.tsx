import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { formatDuration, formatPrice } from "@/lib/format";

export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  image_url: string;
  active?: boolean;
};

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="group bg-card animate-fade-up overflow-hidden rounded-2xl border shadow-[var(--shadow-soft)]">
      <div className="bg-muted aspect-[4/3] overflow-hidden">
        {service.image_url ? (
          <img
            src={service.image_url}
            alt={service.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-lg">{service.name}</h3>
          <span className="text-primary font-mono text-sm">{formatPrice(service.price)}</span>
        </div>
        <p className="text-muted-foreground mt-2 line-clamp-3 text-sm leading-relaxed">
          {service.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="eyebrow">{formatDuration(service.duration_minutes)}</span>
          <Button asChild size="sm" variant="secondary">
            <Link to="/book" search={{ service: service.id }}>
              Book
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
