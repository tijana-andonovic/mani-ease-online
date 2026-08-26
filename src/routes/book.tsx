import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import type { Service } from "@/components/service-card";
import { formatDate, formatDuration, formatPrice, formatTime, toDateKey } from "@/lib/format";

export const Route = createFileRoute("/book")({
  validateSearch: (search: Record<string, unknown>): { service?: string } =>
    typeof search['service'] === "string" ? { service: search['service'] } : {},

  head: () => ({
    meta: [
      { title: "Book a Manicure — MaisonLune" },
      {
        name: "description",
        content:
          "Pick your treatment, choose a date and a free time slot, and confirm your MaisonLune manicure in under a minute.",
      },
      { property: "og:title", content: "Book a Manicure — MaisonLune" },
      { property: "og:description", content: "Live availability, instant confirmation." },
    ],
  }),
  component: BookPage,
});

function BookPage() {
  const { service: preselected } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [serviceId, setServiceId] = useState<string | undefined>(preselected);
  const [dateKey, setDateKey] = useState<string | undefined>();
  const [slot, setSlot] = useState<string | undefined>();
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: services } = useQuery({
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

  const todayKey = toDateKey(new Date());

  const { data: slots } = useQuery({
    queryKey: ["slots", dateKey],
    enabled: Boolean(dateKey),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_slots")
        .select("start_time, is_booked")
        .eq("slot_date", dateKey!)
        .order("start_time");
      if (error) throw error;
      return (data ?? []).map((s) => ({ time: s.start_time, taken: s.is_booked }));
    },
  });

  const days = useMemo(() => {
    const out: string[] = [];
    const base = new Date();
    for (let i = 0; i < 21; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      out.push(toDateKey(d));
    }
    return out;
  }, []);

  const service = (services ?? []).find((s) => s.id === serviceId);

  const confirm = async () => {
    if (!user) {
      toast.error("Please sign in to finish your booking.");
      void navigate({ to: "/auth" });
      return;
    }
    if (!service || !dateKey || !slot) return;
    setSaving(true);
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      service_id: service.id,
      booking_date: dateKey,
      start_time: slot,
      price: service.price,
      duration_minutes: service.duration_minutes,
      comment: comment || null,
    });
    setSaving(false);
    if (error) {
      toast.error(
        error.message.includes("duplicate")
          ? "That slot was just taken — please pick another."
          : error.message,
      );
      void queryClient.invalidateQueries({ queryKey: ["slots", dateKey] });
      return;
    }
    toast.success("Appointment requested — see you soon.");
    void queryClient.invalidateQueries({ queryKey: ["bookings"] });
    void navigate({ to: "/appointments" });
  };

  return (
    <section className="mx-auto w-full max-w-4xl px-5 py-14">
      <p className="eyebrow">Booking</p>
      <h1 className="mt-3 text-4xl">Reserve your chair</h1>

      <ol className="mt-10 space-y-10">
        <li>
          <h2 className="font-display text-xl">1 · Choose a treatment</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(services ?? []).map((s) => (
              <button
                key={s.id}
                onClick={() => setServiceId(s.id)}
                className={`rounded-2xl border p-4 text-left transition-colors ${
                  serviceId === s.id ? "border-primary bg-primary/5" : "hover:bg-muted/60"
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-display">{s.name}</span>
                  <span className="text-primary font-mono text-sm">{formatPrice(s.price)}</span>
                </div>
                <span className="eyebrow mt-2 block">{formatDuration(s.duration_minutes)}</span>
              </button>
            ))}
          </div>
        </li>

        <li className={serviceId ? "" : "pointer-events-none opacity-40"}>
          <h2 className="font-display text-xl">2 · Pick a date</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {days.map((d) => {
              const date = new Date(`${d}T00:00:00`);
              return (
                <button
                  key={d}
                  onClick={() => {
                    setDateKey(d);
                    setSlot(undefined);
                  }}
                  className={`w-16 rounded-xl border px-2 py-3 text-center transition-colors ${
                    dateKey === d ? "border-primary bg-primary/5" : "hover:bg-muted/60"
                  }`}
                >
                  <span className="eyebrow block">
                    {date.toLocaleDateString("en-GB", { weekday: "short" })}
                  </span>
                  <span className="font-display mt-1 block text-lg">{date.getDate()}</span>
                  <span className="text-muted-foreground block text-[0.65rem]">
                    {date.toLocaleDateString("en-GB", { month: "short" })}
                  </span>
                </button>
              );
            })}
          </div>
        </li>

        <li className={dateKey ? "" : "pointer-events-none opacity-40"}>
          <h2 className="font-display text-xl">3 · Choose a time</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {(slots ?? []).length === 0 && dateKey ? (
              <p className="text-muted-foreground text-sm">No slots published for this day.</p>
            ) : null}
            {(slots ?? []).map((s) => {
              const past = dateKey === todayKey && s.time.slice(0, 5) <= new Date().toTimeString().slice(0, 5);
              return (
                <button
                  key={s.time}
                  disabled={s.taken || past}
                  onClick={() => setSlot(s.time)}
                  className={`rounded-xl border px-4 py-2 font-mono text-sm transition-colors disabled:cursor-not-allowed disabled:line-through disabled:opacity-35 ${
                    slot === s.time ? "border-primary bg-primary/5" : "hover:bg-muted/60"
                  }`}
                >
                  {formatTime(s.time)}
                </button>
              );
            })}
          </div>
        </li>

        <li className={slot ? "" : "pointer-events-none opacity-40"}>
          <h2 className="font-display text-xl">4 · Confirm</h2>
          <div className="bg-card mt-4 rounded-2xl border p-5 shadow-[var(--shadow-soft)]">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="eyebrow">Treatment</dt>
                <dd className="mt-1">{service?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="eyebrow">When</dt>
                <dd className="mt-1">
                  {dateKey ? formatDate(dateKey) : "—"}
                  {slot ? ` · ${formatTime(slot)}` : ""}
                </dd>
              </div>
              <div>
                <dt className="eyebrow">Duration</dt>
                <dd className="mt-1">{service ? formatDuration(service.duration_minutes) : "—"}</dd>
              </div>
              <div>
                <dt className="eyebrow">Price</dt>
                <dd className="text-primary mt-1 font-mono">
                  {service ? formatPrice(service.price) : "—"}
                </dd>
              </div>
            </dl>
            <Textarea
              className="mt-4"
              placeholder="Anything we should know? (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            {user ? (
              <Button className="mt-4" size="lg" disabled={saving} onClick={() => void confirm()}>
                <Check className="size-4" /> Confirm booking
              </Button>
            ) : (
              <div className="mt-4 flex items-center gap-3">
                <Button asChild size="lg">
                  <Link to="/auth">Sign in to confirm</Link>
                </Button>
                <span className="text-muted-foreground text-sm">Your selection is kept.</span>
              </div>
            )}
          </div>
        </li>
      </ol>
    </section>
  );
}
