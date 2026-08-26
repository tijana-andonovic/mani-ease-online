import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge, type BookingStatus } from "@/components/status-badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatDate, formatPrice, formatTime, toDateKey } from "@/lib/format";

type Row = {
  id: string;
  booking_date: string;
  start_time: string;
  price: number;
  status: BookingStatus;
  comment: string | null;
  services: { name: string } | null;
};

export const Route = createFileRoute("/_authenticated/appointments")({
  head: () => ({
    meta: [
      { title: "My Appointments — MaisonLune" },
      {
        name: "description",
        content: "View upcoming MaisonLune manicure appointments, cancel a booking, and browse your history.",
      },
      { property: "og:title", content: "My Appointments — MaisonLune" },
      { property: "og:description", content: "Manage your MaisonLune bookings." },
    ],
  }),
  component: AppointmentsPage,
});

function AppointmentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["bookings", "mine", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, booking_date, start_time, price, status, comment, services(name)")
        .order("booking_date", { ascending: false })
        .order("start_time", { ascending: false });
      if (error) throw error;
      return data as unknown as Row[];
    },
  });

  const cancel = async (id: string) => {
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Appointment cancelled.");
    void queryClient.invalidateQueries({ queryKey: ["bookings"] });
  };


  const today = toDateKey(new Date());
  const rows = data ?? [];
  const upcoming = rows.filter((r) => r.booking_date >= today && r.status !== "cancelled");
  const past = rows.filter((r) => !upcoming.includes(r));

  const Card = ({ r }: { r: Row }) => (
    <Link
      to="/appointments/$id"
      params={{ id: r.id }}
      className="bg-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 shadow-[var(--shadow-soft)] transition hover:border-primary/50"
    >
      <div>
        <div className="flex items-center gap-3">
          <h3 className="font-display text-lg">{r.services?.name ?? "Treatment"}</h3>
          <StatusBadge status={r.status} />
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          {formatDate(r.booking_date)} · {formatTime(r.start_time)} ·{" "}
          <span className="font-mono">{formatPrice(r.price)}</span>
        </p>
        {r.comment ? <p className="text-muted-foreground mt-2 text-sm italic">“{r.comment}”</p> : null}
      </div>
      <span className="text-muted-foreground text-sm underline-offset-4 group-hover:underline">View details →</span>
    </Link>
  );

  return (
    <section className="mx-auto w-full max-w-4xl px-5 py-14">
      <p className="eyebrow">Your visits</p>
      <h1 className="mt-3 text-4xl">My appointments</h1>

      <h2 className="font-display mt-10 text-xl">Upcoming</h2>
      <div className="mt-4 space-y-3">
        {upcoming.length ? (
          upcoming.map((r) => <Card key={r.id} r={r} />)
        ) : (
          <p className="text-muted-foreground text-sm">
            Nothing booked yet.{" "}
            <Link to="/book" className="text-primary underline-offset-4 hover:underline">
              Book a treatment
            </Link>
            .
          </p>
        )}
      </div>

      <h2 className="font-display mt-12 text-xl">History</h2>
      <div className="mt-4 space-y-3">
        {past.length ? (
          past.map((r) => <Card key={r.id} r={r} />)
        ) : (
          <p className="text-muted-foreground text-sm">No past appointments.</p>
        )}
      </div>
    </section>
  );
}
