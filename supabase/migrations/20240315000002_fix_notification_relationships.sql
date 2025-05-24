-- Drop existing tables if they exist
DROP TABLE IF EXISTS "public"."notifications";
DROP TABLE IF EXISTS "public"."likes";

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

-- Create notifications table with proper relationships
CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "user_id" uuid NOT NULL,
    "actor_id" uuid NOT NULL,
    "post_id" uuid,
    "type" text NOT NULL,
    "read" boolean DEFAULT false NOT NULL,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT "notifications_actor_id_fkey" FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT "notifications_post_id_fkey" FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE,
    CONSTRAINT "notifications_type_check" CHECK (type IN ('like', 'reply'))
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS "likes_post_id_idx" ON "public"."likes" ("post_id");
CREATE INDEX IF NOT EXISTS "likes_user_id_idx" ON "public"."likes" ("user_id");
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "public"."notifications" ("user_id");
CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "public"."notifications" ("created_at");
CREATE INDEX IF NOT EXISTS "notifications_actor_id_idx" ON "public"."notifications" ("actor_id");

-- Enable RLS
ALTER TABLE "public"."likes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

-- Create policies for likes
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

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications"
    ON "public"."notifications"
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON "public"."notifications"
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow any authenticated user to create notifications
CREATE POLICY "Enable insert for authenticated users"
    ON "public"."notifications"
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Drop the trigger and function as they're no longer needed
DROP TRIGGER IF EXISTS on_notification_created ON public.notifications;
DROP FUNCTION IF EXISTS public.handle_new_notification(); 