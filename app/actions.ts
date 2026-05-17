export async function revalidateSite() {
  if (typeof window !== "undefined") {
    console.log("Static Export Mode: Dynamic content is loaded in real-time from Supabase.");
  }
}

