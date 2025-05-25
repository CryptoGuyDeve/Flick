-- Create push_tokens table
CREATE TABLE IF NOT EXISTS "public"."push_tokens" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "token" text NOT NULL,
    "platform" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "push_tokens_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "push_tokens_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    CONSTRAINT "push_tokens_token_key" UNIQUE (token)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS "push_tokens_user_id_idx" ON "public"."push_tokens" ("user_id");

-- Enable RLS
ALTER TABLE "public"."push_tokens" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own push tokens"
    ON "public"."push_tokens"
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_push_tokens_updated_at
    BEFORE UPDATE ON push_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 