import { beforeEach, describe, expect, it, vi } from "vitest";

/* A fake SDK with the same shape the app uses: mutable builders that run when awaited. */
const calls: string[] = [];
const listeners: Array<(e: string, s: unknown) => void> = [];
let unsubscribed = 0;
function builder(name: string) {
  const b: any = {
    log: [name],
    then(ok: (v: unknown) => unknown, fail?: (e: unknown) => unknown) {
      calls.push(b.log.join("."));
      return Promise.resolve({ data: b.log.join("."), error: null }).then(ok, fail);
    },
  };
  for (const m of ["select", "eq", "in", "order", "limit", "single", "maybeSingle"]) {
    b[m] = (...a: unknown[]) => { b.log.push(`${m}(${a.join(",")})`); return b; };
  }
  return b;
}
const createClient = vi.fn(() => ({
  from: (t: string) => builder(`from(${t})`),
  rpc: (f: string, a: unknown) => builder(`rpc(${f},${JSON.stringify(a)})`),
  auth: {
    getSession: async () => ({ data: { session: "S" }, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange(cb: (e: string, s: unknown) => void) {
      listeners.push(cb);
      return { data: { subscription: { unsubscribe: () => { unsubscribed++; } } } };
    },
  },
}));
vi.mock("@supabase/supabase-js", () => ({ createClient }));

async function fresh() {
  vi.resetModules();
  // Typed loosely: the fake tables below are not in the generated Database types.
  return (await import("./client")).supabase as any;
}

beforeEach(() => {
  calls.length = 0; listeners.length = 0; unsubscribed = 0; createClient.mockClear();
  vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
});

describe("lazy supabase client", () => {
  it("does not load the SDK until it is used", async () => {
    const supabase = await fresh();
    expect(createClient).not.toHaveBeenCalled();
    const q = supabase.from("certifications").select("slug").eq("slug", "a");
    expect(createClient).not.toHaveBeenCalled();
    const { data } = await q;
    expect(data).toBe("from(certifications).select(slug).eq(slug,a)");
    expect(createClient).toHaveBeenCalledTimes(1);
  });

  it("keeps builders mutable, like Supabase's own", async () => {
    const supabase = await fresh();
    const q = supabase.from("t").select("*");
    q.eq("a", 1);
    q.limit(5);
    expect((await q).data).toBe("from(t).select(*).eq(a,1).limit(5)");
  });

  it("runs rpc calls, .then chains and Promise.all", async () => {
    const supabase = await fresh();
    const [a, b] = await Promise.all([
      supabase.rpc("public_stats" as any, { x: 1 } as any),
      supabase.from("t").select("id").then((r: any) => r.data),
    ]);
    expect((a as any).data).toBe('rpc(public_stats,{"x":1})');
    expect(b).toBe("from(t).select(id)");
  });

  it("auth methods return their promises", async () => {
    const supabase = await fresh();
    const { data } = await supabase.auth.getSession();
    expect(data.session).toBe("S");
    // after loading, calls go straight to the real client
    expect(await supabase.auth.signOut()).toEqual({ error: null });
  });

  it("onAuthStateChange subscribes at once and attaches when the SDK is ready", async () => {
    const supabase = await fresh();
    const seen: string[] = [];
    const { data } = supabase.auth.onAuthStateChange((e: string) => { seen.push(e); });
    expect(typeof data.subscription.unsubscribe).toBe("function");
    await supabase.auth.getSession(); // SDK is now loaded
    await Promise.resolve();
    expect(listeners).toHaveLength(1);
    listeners[0]("SIGNED_IN", null);
    expect(seen).toEqual(["SIGNED_IN"]);
    data.subscription.unsubscribe();
    expect(unsubscribed).toBe(1);
  });

  it("unsubscribing before the SDK loads cancels the listener", async () => {
    const supabase = await fresh();
    const { data } = supabase.auth.onAuthStateChange(() => {});
    data.subscription.unsubscribe();
    await supabase.auth.getSession();
    await Promise.resolve();
    expect(listeners).toHaveLength(0);
  });

  it("is not mistaken for a promise itself", async () => {
    const supabase = await fresh();
    expect((supabase as any).then).toBeUndefined();
    expect(await Promise.resolve(supabase)).toBe(supabase);
  });
});
