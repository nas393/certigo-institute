import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

type Client = SupabaseClient<Database>;

/*
 * The Supabase SDK (about 220 KB) loads on first use, not in the entry bundle, so the first paint and
 * hydration do not wait for it. `supabase` keeps the same API for every caller:
 * - query builders (from, rpc, ...) record their calls and run them when awaited (or .then'd);
 * - auth methods return their usual promises; onAuthStateChange returns its subscription at once and
 *   attaches the listener as soon as the SDK is ready (unsubscribing before that cancels it);
 * - once the SDK has loaded, every access goes straight to the real client.
 *
 * Import the client like this:
 * import { supabase } from "@/integrations/supabase/client";
 */
let real: Client | undefined;
let loading: Promise<Client> | undefined;

export function loadSupabase(): Promise<Client> {
  if (real) return Promise.resolve(real);
  loading ??= import('@supabase/supabase-js')
    .then(({ createClient }) => {
      // Use import.meta.env for client-side (Vite build-time replacement)
      // Fall back to process.env for SSR (server-side rendering)
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
      const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

      if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
        const missing = [
          ...(!SUPABASE_URL ? ['SUPABASE_URL'] : []),
          ...(!SUPABASE_PUBLISHABLE_KEY ? ['SUPABASE_PUBLISHABLE_KEY'] : []),
        ];
        const message = `Missing Supabase environment variable(s): ${missing.join(', ')}. Set them in your hosting environment.`;
        console.error(`[Supabase] ${message}`);
        throw new Error(message);
      }

      real = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: {
          storage: typeof window !== 'undefined' ? localStorage : undefined,
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return real;
    })
    .catch((e) => {
      loading = undefined; // a failed chunk download can be retried on the next call
      throw e;
    });
  return loading;
}

type Step = { prop: PropertyKey; args?: unknown[] };
// Probes from React, JSON and test tools: never part of a query chain.
const SKIP = new Set<PropertyKey>(['toJSON', '$$typeof', 'constructor', 'asymmetricMatch', 'nodeType', '@@__IMMUTABLE_ITERABLE__@@']);

function replay(c: Client, steps: Step[]): unknown {
  let cur: any = c;
  for (const s of steps) {
    const v = cur[s.prop];
    cur = s.args ? v.apply(cur, s.args) : v;
  }
  return cur;
}

/* A recorded call chain. Like Supabase's own builders it is mutable: every call adds to the same chain
   and returns it, so `q.eq(...)` without reassignment still applies. */
function chain(steps: Step[]): any {
  const p: any = new Proxy(function () {}, {
    get(_, prop) {
      if (prop === 'then') {
        return (ok?: (v: any) => unknown, fail?: (e: any) => unknown) =>
          loadSupabase().then((c) => replay(c, steps)).then(ok, fail);
      }
      if (typeof prop === 'symbol' || SKIP.has(prop)) return undefined;
      steps.push({ prop });
      return p;
    },
    apply(_, __, args) {
      const last = steps[steps.length - 1];
      if (last) last.args = args;
      return p;
    },
  });
  return p;
}

const lazyAuth = new Proxy({} as Client['auth'], {
  get(_, m) {
    if (real) {
      const v = Reflect.get(real.auth, m);
      return typeof v === 'function' ? v.bind(real.auth) : v;
    }
    if (typeof m === 'symbol' || m === 'then' || SKIP.has(m)) return undefined;
    if (m === 'onAuthStateChange') {
      return (cb: Parameters<Client['auth']['onAuthStateChange']>[0]) => {
        let sub: { unsubscribe(): void } | undefined;
        let gone = false;
        loadSupabase().then((c) => {
          if (!gone) sub = c.auth.onAuthStateChange(cb).data.subscription;
        }, (e) => console.error('[Supabase] could not load the SDK', e));
        return {
          data: {
            subscription: {
              id: 'pending',
              callback: cb,
              unsubscribe() {
                gone = true;
                sub?.unsubscribe();
              },
            },
          },
        };
      };
    }
    return (...args: unknown[]) => loadSupabase().then((c) => (c.auth as any)[m](...args));
  },
});

export const supabase = new Proxy({} as Client, {
  get(_, prop) {
    if (real) {
      const v = Reflect.get(real, prop);
      return typeof v === 'function' ? v.bind(real) : v;
    }
    if (prop === 'auth') return lazyAuth;
    if (typeof prop === 'symbol' || prop === 'then' || SKIP.has(prop)) return undefined;
    return chain([{ prop }]);
  },
});
