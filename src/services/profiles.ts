import { supabase } from "@/lib/supabase";
import { TablesInsert } from "@/types/database.types";

export const getProfileById = async (id: string) => {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single()
    .throwOnError();

  return data;
};

export const updateProfile = async (
  id: string,
  updateProfile: TablesInsert<"profiles">
) => {
  const { data } = await supabase
    .from("profiles")
    .update(updateProfile)
    .eq("id", id)
    .throwOnError()
    .select("*")
    .single();

  return data;
};
