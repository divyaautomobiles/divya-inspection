-- ═══════════════════════════════════════════════════════════
-- DIVYA AUTOMOBILES — Complete Supabase Setup SQL
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════

-- 1. PROFILES TABLE (user roles)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  name text,
  role text DEFAULT 'inspector' CHECK (role IN ('inspector','negotiator','admin')),
  branch text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_all" ON profiles FOR ALL USING (true) WITH CHECK (true);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    COALESCE(new.raw_user_meta_data->>'role', 'inspector')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. BRANCHES TABLE
CREATE TABLE IF NOT EXISTS branches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  city text,
  manager text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "branches_all" ON branches FOR ALL USING (true) WITH CHECK (true);

-- 3. INSPECTIONS TABLE
CREATE TABLE IF NOT EXISTS inspections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  inspector_id uuid REFERENCES auth.users(id),
  status text DEFAULT 'Draft',
  make text, model text, variant text, year int, color text,
  fuel_type text, transmission text, odometer int, ownership text,
  registration_number text, rto text, inspection_date date,
  inspector_name text, branch text,
  customer_name text, customer_phone text, customer_email text, customer_city text,
  overall_score int, exterior_score int, engine_score int,
  electrical_score int, interior_score int, steering_score int, document_risk int,
  market_value bigint, dealer_value bigint, resale_value bigint, repair_cost bigint,
  remarks text,
  inspection_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inspections_all" ON inspections FOR ALL USING (true) WITH CHECK (true);

-- 4. NEGOTIATION QUOTES TABLE
CREATE TABLE IF NOT EXISTS negotiation_quotes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id uuid REFERENCES inspections(id) ON DELETE CASCADE,
  negotiator_id uuid REFERENCES auth.users(id),
  offered_price bigint NOT NULL,
  remarks text,
  status text DEFAULT 'Pending',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE negotiation_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quotes_all" ON negotiation_quotes FOR ALL USING (true) WITH CHECK (true);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  message text NOT NULL,
  read boolean DEFAULT false,
  inspection_id uuid,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifs_own" ON notifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. STORAGE BUCKET for inspection photos/videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('inspection-media', 'inspection-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "media_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'inspection-media');
CREATE POLICY "media_auth_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'inspection-media' AND auth.role() = 'authenticated');
CREATE POLICY "media_auth_update" ON storage.objects FOR UPDATE USING (bucket_id = 'inspection-media' AND auth.role() = 'authenticated');

-- 7. Auto-notify on inspection status change
CREATE OR REPLACE FUNCTION notify_on_status_change()
RETURNS trigger AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Notify admin
    INSERT INTO notifications (user_id, message, inspection_id)
    SELECT id, 
      CONCAT(NEW.make, ' ', NEW.model, ' → ', NEW.status),
      NEW.id
    FROM profiles WHERE role = 'admin';

    -- Notify negotiator if submitted
    IF NEW.status = 'Submitted' THEN
      INSERT INTO notifications (user_id, message, inspection_id)
      SELECT id,
        CONCAT('New inspection ready: ', NEW.make, ' ', NEW.model, ' ', NEW.year),
        NEW.id
      FROM profiles WHERE role = 'negotiator';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_inspection_status_change ON inspections;
CREATE TRIGGER on_inspection_status_change
  AFTER UPDATE ON inspections
  FOR EACH ROW EXECUTE FUNCTION notify_on_status_change();

-- ═══ DONE! ═══
-- Now go to: Authentication → Users → Add User
-- Set their role in profiles table after creation
