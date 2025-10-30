// 🧪 Script de test hors du front-end (facultatif)
// Ne pas importer dans React, ne sert qu’à tester la connexion manuellement.
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function testSupabaseConnection() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Variables manquantes");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase.from("profiles").select("id").limit(1);

  if (error) console.error("❌ Erreur :", error.message);
  else console.log("✅ Connexion Supabase OK :", data?.length ?? 0, "lignes");
}

testSupabaseConnection();
