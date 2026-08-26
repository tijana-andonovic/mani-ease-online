import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ServiceCard, type Service } from "@/components/service-card";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services & Prices — MaisonLune Nail Atelier" },
      {
        name: "description",
        content:
          "Classic, gel, extensions, enhancements, French, nail art and safe removal. See prices, durations and book online.",
      },
      { property: "og:title", content: "Services & Prices — MaisonLune" },
      { property: "og:description", content: "Seven manicure treatments with transparent pricing." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["services", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("active", true)
        .order("price");
      if (error) throw error;
      return data as Service[];
    },
  });

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-14">
      <p className="eyebrow">The menu</p>
      <h1 className="mt-3 text-4xl">Services &amp; prices</h1>
      <p className="text-muted-foreground mt-4 max-w-xl text-sm leading-relaxed">
        Every appointment includes shaping, cuticle care and a hand massage. Times below are the full
        chair time, so nothing feels rushed.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-muted h-80 animate-pulse rounded-2xl" />
            ))
          : (data ?? []).map((s) => <ServiceCard key={s.id} service={s} />)}
      </div>
    </section>
  );
}
