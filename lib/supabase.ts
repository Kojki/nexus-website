import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;



// lib/supabase.ts
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
console.log("Supabase URL Debug:", {
  length: url.length,
  startsWith: url.substring(0, 8), // "https://" であるべき
  endsWithSlash: url.endsWith("/"), // false であるべき
  hasRestV1: url.includes("rest/v1"), // false であるべき
});

export const supabase = createClient(
  url,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
