import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge, type BookingStatus } from "@/components/status-badge";
import { supabase } from "@/lib/supabase";
import { formatDate, formatPrice, formatTime } from "@/lib/format";

type BookingDetail = {
  id: string;
  booking_date: string;
  start_time: string;
  price: number;
  status: BookingStatus;
  comment: string | null;
  created_at: string;
  duration_minutes: number | null;
  services: {
    name: string;
    description: string;
    duration_minutes: number;
  } | null;
};

export const Route = createFileRoute("/_authenticated/appointments/$id")({
  head: () => ({
    meta: [
      { title: "Appointment details — MaisonLune" },
      {
        name: "description",
        content: "View the full details of a single MaisonLune manicure appointment.",
      },
      { property: "og:title", content: "Appointment details — MaisonLune" },
      { property: "og:description", content: "A single MaisonLune booking." },
    ],
  }),
  component: BookingDetailPage,
});

function BookingDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["booking", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          "id, booking_date, start_time, price, status, comment, created_at, duration_minutes, services(name, description, duration_minutes)",
        )
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw redirect({ to: "/appointments" });
      return data as unknown as BookingDetail;
    },
  });

  const cancel = async () => {
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Appointment cancelled.");
    void queryClient.invalidateQueries({ queryKey: ["bookings"] });
    void queryClient.invalidateQueries({ queryKey: ["booking", id] });
    navigate({ to: "/appointments", replace: true });
  };

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-2xl px-5 py-14">
        <div className="bg-muted h-64 animate-pulse rounded-2xl" />
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="mx-auto w-full max-w-2xl px-5 py-14">
        <p className="text-muted-foreground">This appointment could not be loaded.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/appointments">Back to appointments</Link>
        </Button>
      </section>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const canCancel =
    data.booking_date >= today && (data.status === "pending" || data.status === "confirmed");

  const service = data.services;
  const minutes = data.duration_minutes ?? service?.duration_minutes ?? null;

  return (
    <section className="mx-auto w-full max-w-2xl px-5 py-14">
      <Link
        to="/appointments"
        className="text-muted-foreground text-sm underline-offset-4 hover:underline"
      >
        ← My appointments
      </Link>

      <p className="eyebrow mt-8">Appointment</p>
      <div className="mt-3 flex items-center gap-3">
        <h1 className="font-display text-3xl">{service?.name ?? "Treatment"}</h1>
        <StatusBadge status={data.status} />
      </div>

      {service?.description ? (
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{service.description}</p>
      ) : null}

      <dl className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border">
        <Row label="Date" value={formatDate(data.booking_date)} />
        <Row label="Time" value={formatTime(data.start_time)} />
        {minutes ? <Row label="Duration" value={`${minutes} min`} /> : null}
        <Row label="Price" value={formatPrice(data.price)} mono />
        <Row
          label="Booked on"
          value={new Date(data.created_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        />
        <Row
          label="Reference"
          value={data.id.slice(0, 8).toUpperCase()}
          mono
        />
      </dl>

      {data.comment ? (
        <div className="mt-6 rounded-2xl border border-dashed p-5">
          <p className="eyebrow">Your note</p>
          <p className="mt-2 text-sm italic">“{data.comment}”</p>
        </div>
      ) : null}

      {canCancel ? (
        <div className="mt-8">
          <Button variant="outline" onClick={() => void cancel()}>
            Cancel this appointment
          </Button>
        </div>
      ) : null}
    </section>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="bg-card flex items-center justify-between gap-4 px-5 py-4">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className={mono ? "font-mono text-sm" : "text-sm"}>{value}</dd>
    </div>
  );
}
