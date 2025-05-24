import { Tables } from "./database.types";

export type PostWithUser = Tables<"posts"> & {
  user: Tables<"profiles">;
  likes: Tables<"likes">[];
  replies: Tables<"posts">[];
  likes_count?: number;
  reposts_count?: number;
  is_liked?: boolean;
  is_reposted?: boolean;
}; 