import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { StatusBadge, type BookingStatus } from "@/components/status-badge";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, formatPrice, formatTime } from "@/lib/format";

type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  created_at: string;
};

type ClientBooking = {
  id: string;
  booking_date: string;
  start_time: string;
  price: number;
  status: BookingStatus;
  services: { name: string } | null;
};

export const Route = createFileRoute("/_authenticated/admin/customer/$id")({
  head: () => ({
    meta: [
      { title: "Client — MaisonLune Admin" },
      {
        name: "description",
        content: "View a single client's profile and their full appointment history.",
      },
      { property: "og:title", content: "Client — MaisonLune Admin" },
      { property: "og:description", content: "Client record and appointments." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClientDetailPage,
});

function ClientDetailPage() {
  const { id } = Route.useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["client", id],
    queryFn: async () => {
      const [profileRes, roleRes, bookingsRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, phone, created_at").eq("id", id).maybeSingle(),
        supabase.from("user_roles").select("user_id, role").eq("user_id", id),
        supabase
          .from("bookings")
          .select("id, booking_date, start_time, price, status, services(name)")
          .eq("user_id", id)
          .order("booking_date", { ascending: false })
          .order("start_time", { ascending: false }),
      ]);
      if (profileRes.error) throw profileRes.error;
      if (bookingsRes.error) throw bookingsRes.error;
      if (!profileRes.data) throw redirect({ to: "/admin" });
      const role = roleRes.data?.[0]?.role ?? "user";
      return {
        profile: profileRes.data as Profile,
        role,
        bookings: (bookingsRes.data ?? []) as unknown as ClientBooking[],
      };
    },
  });

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-3xl px-5 py-14">
        <div className="bg-muted h-64 animate-pulse rounded-2xl" />
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="mx-auto w-full max-w-3xl px-5 py-14">
        <p className="text-muted-foreground">This client could not be loaded.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/admin">Back to admin</Link>
        </Button>
      </section>
    );
  }

  const { profile, role, bookings } = data;
  const total = bookings.reduce((sum, b) => sum + Number(b.price), 0);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.filter((b) => b.booking_date >= today && b.status !== "cancelled");
  const past = bookings.filter((b) => !upcoming.includes(b));

  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-14">
      <Link
        to="/admin"
        className="text-muted-foreground text-sm underline-offset-4 hover:underline"
      >
        ← Admin dashboard
      </Link>

      <p className="eyebrow mt-8">Client</p>
      <div className="mt-3 flex items-center gap-3">
        <h1 className="font-display text-3xl">{profile.full_name || "Unnamed guest"}</h1>
        <span className="eyebrow">{role}</span>
      </div>

      <dl className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border">
        <Row label="Phone" value={profile.phone ?? "—"} />
        <Row label="Client since" value={formatDate(profile.created_at.slice(0, 10))} />
        <Row label="Total bookings" value={`${bookings.length}`} />
        <Row label="Total spent" value={formatPrice(total)} mono />
      </dl>

      <h2 className="font-display mt-10 text-xl">Upcoming</h2>
      <div className="mt-4 space-y-3">
        {upcoming.length ? (
          upcoming.map((b) => <BookingRow key={b.id} b={b} />)
        ) : (
          <p className="text-muted-foreground text-sm">No upcoming appointments.</p>
        )}
      </div>

      <h2 className="font-display mt-10 text-xl">History</h2>
      <div className="mt-4 space-y-3">
        {past.length ? (
          past.map((b) => <BookingRow key={b.id} b={b} />)
        ) : (
          <p className="text-muted-foreground text-sm">No past appointments.</p>
        )}
      </div>
    </section>
  );
}

function BookingRow({ b }: { b: ClientBooking }) {
  return (
    <article className="bg-card flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4">
      <div>
        <div className="flex items-center gap-2">
          <p className="font-display text-sm">{b.services?.name ?? "Treatment"}</p>
          <StatusBadge status={b.status} />
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          {formatDate(b.booking_date)} · {formatTime(b.start_time)} ·{" "}
          <span className="font-mono">{formatPrice(b.price)}</span>
        </p>
      </div>
    </article>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-card flex items-center justify-between gap-4 px-5 py-4">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className={mono ? "font-mono text-sm" : "text-sm"}>{value}</dd>
    </div>
  );
}
