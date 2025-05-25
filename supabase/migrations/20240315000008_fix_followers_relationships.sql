-- Drop existing followers table
DROP TABLE IF EXISTS "public"."followers";

-- Recreate followers table with correct relationships
CREATE TABLE IF NOT EXISTS "public"."followers" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "follower_id" uuid NOT NULL,
    "following_id" uuid NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "followers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "followers_follower_id_fkey" FOREIGN KEY (follower_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    CONSTRAINT "followers_following_id_fkey" FOREIGN KEY (following_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    CONSTRAINT "followers_follower_id_following_id_key" UNIQUE (follower_id, following_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS "followers_follower_id_idx" ON "public"."followers" ("follower_id");
CREATE INDEX IF NOT EXISTS "followers_following_id_idx" ON "public"."followers" ("following_id");

-- Enable RLS
ALTER TABLE "public"."followers" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view followers"
    ON "public"."followers"
    FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can follow others"
    ON "public"."followers"
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.uid() = follower_id
        AND follower_id != following_id
    );

CREATE POLICY "Users can unfollow others"
    ON "public"."followers"
    FOR DELETE
    USING (auth.uid() = follower_id);

-- Create function to get follower count
CREATE OR REPLACE FUNCTION get_follower_count(user_id uuid)
RETURNS integer AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM followers
        WHERE following_id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get following count
CREATE OR REPLACE FUNCTION get_following_count(user_id uuid)
RETURNS integer AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM followers
        WHERE follower_id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 