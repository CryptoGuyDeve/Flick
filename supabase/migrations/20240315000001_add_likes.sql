-- Create likes table
CREATE TABLE IF NOT EXISTS "public"."likes" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "user_id" uuid NOT NULL,
    "post_id" uuid NOT NULL,
    CONSTRAINT "likes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "likes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT "likes_post_id_fkey" FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE,
    CONSTRAINT "likes_user_id_post_id_key" UNIQUE (user_id, post_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS "likes_post_id_idx" ON "public"."likes" ("post_id");
CREATE INDEX IF NOT EXISTS "likes_user_id_idx" ON "public"."likes" ("user_id");

-- Enable RLS
ALTER TABLE "public"."likes" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all likes"
    ON "public"."likes"
    FOR SELECT
    USING (true);

CREATE POLICY "Users can like posts"
    ON "public"."likes"
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
    ON "public"."likes"
    FOR DELETE
    USING (auth.uid() = user_id); 