-- Create notifications table
CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "user_id" uuid NOT NULL,
    "actor_id" uuid NOT NULL,
    "post_id" uuid,
    "type" text NOT NULL,
    "read" boolean DEFAULT false NOT NULL,
    "content" text,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT "notifications_actor_id_fkey" FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT "notifications_post_id_fkey" FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE,
    CONSTRAINT "notifications_type_check" CHECK (type IN ('comment', 'like', 'reply'))
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "public"."notifications" ("user_id");
CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "public"."notifications" ("created_at");
CREATE INDEX IF NOT EXISTS "notifications_actor_id_idx" ON "public"."notifications" ("actor_id");

-- Enable RLS
ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications"
    ON "public"."notifications"
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON "public"."notifications"
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create notifications"
    ON "public"."notifications"
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON "public"."notifications" TO authenticated;
GRANT ALL ON "public"."notifications" TO service_role; 