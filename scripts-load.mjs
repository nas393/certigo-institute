import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false }});
const rows = JSON.parse(readFileSync("/tmp/seed/rows.json","utf8"));
const { data, error } = await sb.from("certifications").upsert(rows, { onConflict: "slug" }).select("slug");
if (error) { console.error(error); process.exit(1); }
console.log("upserted:", data.length);
