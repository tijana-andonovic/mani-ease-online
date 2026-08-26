import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge, type BookingStatus } from "@/components/status-badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatDate, formatDuration, formatPrice, formatTime, toDateKey } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — MaisonLune" },
      { name: "description", content: "Manage MaisonLune services, appointments, time slots and clients." },
      { property: "og:title", content: "Admin Dashboard — MaisonLune" },
      { property: "og:description", content: "Internal management for the MaisonLune atelier." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type ServiceRow = {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
  active: boolean;
};

type BookingRow = {
  id: string;
  booking_date: string;
  start_time: string;
  price: number;
  status: BookingStatus;
  user_id: string;
  services: { name: string } | null;
};

function AdminPage() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-20">
        <div className="bg-muted h-40 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <section className="mx-auto w-full max-w-md px-5 py-20 text-center">
        <h1 className="text-2xl">Admins only</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          This area is reserved for the atelier team.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-14">
      <p className="eyebrow">Atelier</p>
      <h1 className="mt-3 text-4xl">Admin dashboard</h1>

      <Tabs defaultValue="bookings" className="mt-8">
        <TabsList>
          <TabsTrigger value="bookings">Appointments</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="slots">Time slots</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>
        <TabsContent value="bookings" className="mt-6">
          <BookingsTab />
        </TabsContent>
        <TabsContent value="services" className="mt-6">
          <ServicesTab />
        </TabsContent>
        <TabsContent value="slots" className="mt-6">
          <SlotsTab />
        </TabsContent>
        <TabsContent value="clients" className="mt-6">
          <ClientsTab />
        </TabsContent>
      </Tabs>
    </section>
  );
}

const statuses: BookingStatus[] = ["pending", "confirmed", "completed", "cancelled"];

function BookingsTab() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["bookings", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, booking_date, start_time, price, status, user_id, services(name)")
        .order("booking_date", { ascending: false })
        .order("start_time", { ascending: false });
      if (error) throw error;
      return data as unknown as BookingRow[];
    },
  });

  const setStatus = async (id: string, status: BookingStatus) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Marked as ${status}.`);
    void queryClient.invalidateQueries({ queryKey: ["bookings"] });
  };

  return (
    <div className="space-y-3">
      {(data ?? []).map((b) => (
        <div
          key={b.id}
          className="bg-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4"
        >
          <div>
            <div className="flex items-center gap-3">
              <span className="font-display">{b.services?.name ?? "Treatment"}</span>
              <StatusBadge status={b.status} />
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {formatDate(b.booking_date)} · {formatTime(b.start_time)} ·{" "}
              <span className="font-mono">{formatPrice(b.price)}</span>
            </p>
          </div>
          <Select value={b.status} onValueChange={(v) => void setStatus(b.id, v as BookingStatus)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
      {(data ?? []).length === 0 ? (
        <p className="text-muted-foreground text-sm">No appointments yet.</p>
      ) : null}
    </div>
  );
}

function ServicesTab() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["services", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, price, duration_minutes, active")
        .order("name");
      if (error) throw error;
      return data as ServiceRow[];
    },
  });

  const update = async (id: string, patch: Partial<ServiceRow>) => {
    const { error } = await supabase.from("services").update(patch).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    void queryClient.invalidateQueries({ queryKey: ["services"] });
  };

  return (
    <div className="space-y-3">
      {(data ?? []).map((s) => (
        <div
          key={s.id}
          className="bg-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4"
        >
          <div>
            <p className="font-display">{s.name}</p>
            <p className="text-muted-foreground text-sm">
              {formatDuration(s.duration_minutes)} · {formatPrice(s.price)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor={`price-${s.id}`} className="eyebrow">
                Price
              </Label>
              <Input
                id={`price-${s.id}`}
                type="number"
                defaultValue={s.price}
                className="w-24"
                onBlur={(e) => {
                  const price = Number(e.target.value);
                  if (price && price !== s.price) void update(s.id, { price });
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="eyebrow">Active</span>
              <Switch
                checked={s.active}
                onCheckedChange={(active) => void update(s.id, { active })}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SlotsTab() {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(toDateKey(new Date()));
  const [time, setTime] = useState("10:00");

  const { data } = useQuery({
    queryKey: ["slots", "admin", date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_slots")
        .select("id, start_time")
        .eq("slot_date", date)
        .order("start_time");
      if (error) throw error;
      return data;
    },
  });

  const add = async () => {
    const { error } = await supabase
      .from("time_slots")
      .insert({ slot_date: date, start_time: `${time}:00` });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Slot published.");
    void queryClient.invalidateQueries({ queryKey: ["slots"] });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("time_slots").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    void queryClient.invalidateQueries({ queryKey: ["slots"] });
  };

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-2">
          <Label htmlFor="slot-date">Date</Label>
          <Input id="slot-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slot-time">Time</Label>
          <Input id="slot-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        <Button onClick={() => void add()}>Publish slot</Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(data ?? []).map((s) => (
          <button
            key={s.id}
            onClick={() => void remove(s.id)}
            title="Remove slot"
            className="hover:border-destructive hover:text-destructive rounded-xl border px-4 py-2 font-mono text-sm"
          >
            {formatTime(s.start_time)} ✕
          </button>
        ))}
        {(data ?? []).length === 0 ? (
          <p className="text-muted-foreground text-sm">No slots for this day.</p>
        ) : null}
      </div>
    </div>
  );
}

function ClientsTab() {
  const { data } = useQuery({
    queryKey: ["profiles", "admin"],
    queryFn: async () => {
      const [profiles, roles] = await Promise.all([
        supabase.from("profiles").select("id, full_name, phone, created_at").order("created_at"),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      if (profiles.error) throw profiles.error;
      if (roles.error) throw roles.error;
      const roleMap = new Map((roles.data ?? []).map((r) => [r.user_id, r.role]));
      return (profiles.data ?? []).map((p) => ({ ...p, role: roleMap.get(p.id) ?? "user" }));
    },
  });

  return (
    <div className="space-y-3">
      {(data ?? []).map((p) => (
        <Link
          key={p.id}
          to="/admin/client/$id"
          params={{ id: p.id }}
          className="bg-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 transition hover:border-primary/50"
        >
          <div>
            <p className="font-display">{p.full_name || "Unnamed guest"}</p>
            <p className="text-muted-foreground text-sm">{p.phone ?? "No phone on file"}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="eyebrow">{p.role}</span>
            <span className="text-muted-foreground text-sm">View →</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
