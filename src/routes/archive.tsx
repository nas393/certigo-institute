import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/archive")({
  head: () => ({ meta: [{ title: "Archive — Kredo" }, { name: "description", content: "All your generated courses." }] }),
  component: Archive,
});

function Archive() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [user, loading]);
  useEffect(() => {
    if (!user) return;
    supabase.from("courses").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => setCourses(data || []));
  }, [user]);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="micro-label">◆ Archive</div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter">All courses</h1>
        <div className="mt-8 grid gap-3">
          {courses.map((c) => (
            <Link key={c.id} to="/course/$id" params={{ id: c.id }}>
              <Card className="p-5 hover:border-primary/40">
                <div className="font-display text-lg font-bold">{c.topic}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString()} · {c.level}
                </div>
              </Card>
            </Link>
          ))}
          {!courses.length && <p className="text-muted-foreground">No courses yet.</p>}
        </div>
      </div>
    </div>
  );
}
