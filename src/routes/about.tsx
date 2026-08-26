import { createFileRoute } from "@tanstack/react-router";

const staff = [
  {
    name: "Ana",
    role: "Founder · Sculpted extensions",
    image: "/images/staff/ana.jpg",
    bio: "Twelve years behind the table and a quiet obsession with perfectly even apex.",
  },
  {
    name: "Mila",
    role: "Gel & structured overlays",
    image: "/images/staff/mila.jpg",
    bio: "Known for glassy finishes that last four weeks without a single lift.",
  },
  {
    name: "Sofia",
    role: "Hand-painted nail art",
    image: "/images/staff/sofia.jpg",
    bio: "Trained as an illustrator — brings tiny brushwork to every set.",
  },
];

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the Atelier — MaisonLune" },
      {
        name: "description",
        content:
          "Meet the three specialists behind MaisonLune, a small nail atelier in Belgrade built around calm, careful manicures.",
      },
      { property: "og:title", content: "About the Atelier — MaisonLune" },
      { property: "og:description", content: "A small team, unhurried appointments, considered manicures." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <section className="mx-auto w-full max-w-3xl px-5 py-14">
        <p className="eyebrow">Our story</p>
        <h1 className="mt-3 text-4xl">A calm room in the middle of the city</h1>
        <p className="text-muted-foreground mt-5 leading-relaxed">
          MaisonLune began as a single chair in a borrowed studio. We kept the pace slow on purpose:
          one guest at a time, generous appointment windows, and products chosen for nail health
          first. Today three specialists share the room, and the idea has not changed.
        </p>
        <p className="text-muted-foreground mt-4 leading-relaxed">
          We work with soft, buildable gels, sculpted forms rather than tips wherever possible, and
          removal methods that leave the natural nail intact. If you are unsure what suits you, book
          a classic manicure and we will talk it through.
        </p>
      </section>

      <section className="bg-secondary/40 border-y">
        <div className="mx-auto w-full max-w-6xl px-5 py-14">
          <h2 className="text-3xl">The team</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {staff.map((s) => (
              <article
                key={s.name}
                className="bg-card animate-fade-up overflow-hidden rounded-2xl border shadow-[var(--shadow-soft)]"
              >
                <img
                  src={s.image}
                  alt={`${s.name}, ${s.role} at MaisonLune`}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover"
                />
                <div className="p-5">
                  <h3 className="font-display text-lg">{s.name}</h3>
                  <p className="eyebrow mt-1">{s.role}</p>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{s.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
