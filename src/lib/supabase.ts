import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jqqtmvchpemsubnmjjvn.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_1nBSvujeUQbIyRhJv3JG0g_A0_xlqj2";
export const supabaseBucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "product";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export async function uploadImageToSupabase(
  file: File,
  folder: string = "products"
): Promise<{ url: string | null; error: Error | null; path?: string }> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(supabaseBucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase storage error:", error.message);
      return { url: null, error: new Error(error.message), path: fileName };
    }

    const { data: publicUrlData } = supabase.storage
      .from(supabaseBucket)
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl, error: null, path: data.path };
  } catch (err) {
    console.error("Direct Supabase upload exception:", err);
    return { url: null, error: err as Error };
  }
}

export async function listSupabaseFiles(folder: string = "products") {
  try {
    const { data, error } = await supabase.storage
      .from(supabaseBucket)
      .list(folder, {
        limit: 50,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) throw error;
    return { files: data, error: null };
  } catch (err) {
    return { files: [], error: err as Error };
  }
}
