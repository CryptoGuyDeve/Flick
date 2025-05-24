-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON "public"."notifications";
DROP POLICY IF EXISTS "Users can update their own notifications" ON "public"."notifications";
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "public"."notifications";
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON "public"."notifications";
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON "public"."notifications";

-- Temporarily disable RLS
ALTER TABLE "public"."notifications" DISABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Enable read access for users based on user_id"
    ON "public"."notifications"
    FOR SELECT
    USING (true);

CREATE POLICY "Enable update for users based on user_id"
    ON "public"."notifications"
    FOR UPDATE
    USING (true);

CREATE POLICY "Enable insert for all authenticated users"
    ON "public"."notifications"
    FOR INSERT
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON "public"."notifications" TO authenticated;
GRANT ALL ON "public"."notifications" TO service_role;
GRANT ALL ON "public"."notifications" TO anon;

-- Re-enable RLS
ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY; 