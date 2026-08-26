import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, CalendarCheck, HeartHandshake } from "lucide-react";
import heroImage from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { ServiceCard, type Service } from "@/components/service-card";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MaisonLune — Manicure Booking in Belgrade" },
      {
        name: "description",
        content:
          "Book classic, gel, extension and nail art manicures online at MaisonLune nail atelier. Real-time availability, instant confirmation.",
      },
      { property: "og:title", content: "MaisonLune — Manicure Booking in Belgrade" },
      {
        property: "og:description",
        content: "Book your next manicure at MaisonLune nail atelier in minutes.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: services } = useQuery({
    queryKey: ["services", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("active", true)
        .order("price")
        .limit(3);
      if (error) throw error;
      return data as Service[];
    },
  });

  return (
    <>
      <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-2 lg:py-24">
        <div className="animate-fade-up">
          <p className="eyebrow">Nail atelier · Belgrade</p>
          <h1 className="mt-4 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
            Hands worth
            <em className="text-primary"> slowing down</em> for.
          </h1>
          <p className="text-muted-foreground mt-5 max-w-md text-base leading-relaxed">
            Considered manicures, unhurried appointments and a calm room. Choose your treatment,
            pick a time that suits you, and we'll take care of the rest.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/book">Book an appointment</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/services">View services</Link>
            </Button>
          </div>
        </div>
        <div className="animate-fade-up overflow-hidden rounded-3xl border shadow-[var(--shadow-soft)]">
          <img
            src={heroImage}
            alt="Manicurist finishing a soft blush manicure at MaisonLune atelier"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="bg-secondary/40 border-y">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-14 sm:grid-cols-3">
          {[
            { icon: Sparkles, title: "Seven treatments", text: "From classic care to sculpted extensions and hand-painted art." },
            { icon: CalendarCheck, title: "Live availability", text: "Slots update instantly — no double bookings, no phone tag." },
            { icon: HeartHandshake, title: "Three specialists", text: "A small team that remembers your shape, shade and rhythm." },
          ].map((f) => (
            <div key={f.title}>
              <f.icon className="text-primary size-5" />
              <h3 className="mt-3 text-lg">{f.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">The menu</p>
            <h2 className="mt-3 text-3xl">Signature treatments</h2>
          </div>
          <Link to="/services" className="text-primary text-sm underline-offset-4 hover:underline">
            All services
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(services ?? []).map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </section>
    </>
  );
}
