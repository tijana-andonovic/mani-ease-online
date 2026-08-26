import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Opening Hours — MaisonLune" },
      {
        name: "description",
        content:
          "Find MaisonLune nail atelier in Belgrade: address, phone, email and opening hours, or book your manicure online.",
      },
      { property: "og:title", content: "Contact & Opening Hours — MaisonLune" },
      { property: "og:description", content: "Address, phone, email and opening hours for MaisonLune." },
    ],
  }),
  component: ContactPage,
});

const items = [
  { icon: MapPin, label: "Studio", value: "Gospodar Jevremova 12, Belgrade" },
  { icon: Phone, label: "Phone", value: "+381 11 234 5678" },
  { icon: Mail, label: "Email", value: "hello@maisonlune.rs" },
  { icon: Clock, label: "Hours", value: "Mon–Sat, 09:00–18:00" },
];

function ContactPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-14">
      <p className="eyebrow">Say hello</p>
      <h1 className="mt-3 text-4xl">Contact</h1>
      <p className="text-muted-foreground mt-4 leading-relaxed">
        For appointments, the fastest route is the online calendar — availability is live. For
        anything else, we answer messages within a day.
      </p>

      <dl className="mt-10 grid gap-5 sm:grid-cols-2">
        {items.map((i) => (
          <div key={i.label} className="bg-card rounded-2xl border p-5 shadow-[var(--shadow-soft)]">
            <i.icon className="text-primary size-5" />
            <dt className="eyebrow mt-3">{i.label}</dt>
            <dd className="mt-1 text-sm">{i.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-10">
        <Button asChild size="lg">
          <Link to="/book">Book an appointment</Link>
        </Button>
      </div>
    </section>
  );
}
