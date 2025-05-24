-- Drop all notification-related objects
DROP POLICY IF EXISTS "Users can view their own notifications" ON "public"."notifications";
DROP POLICY IF EXISTS "Users can update their own notifications" ON "public"."notifications";
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "public"."notifications";
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON "public"."notifications";
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON "public"."notifications";
DROP POLICY IF EXISTS "Enable insert for all authenticated users" ON "public"."notifications";

-- Drop the notifications table
DROP TABLE IF EXISTS "public"."notifications";

-- Revoke all permissions
REVOKE ALL ON "public"."notifications" FROM authenticated;
REVOKE ALL ON "public"."notifications" FROM service_role;
REVOKE ALL ON "public"."notifications" FROM anon; 