-- ============================================
-- جدول طلبات تسجيل المحلات الجديدة
-- ============================================

CREATE TABLE IF NOT EXISTS store_registration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_name TEXT NOT NULL,
  store_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  wilaya TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_store_reg_status ON store_registration_requests(status);
CREATE INDEX IF NOT EXISTS idx_store_reg_created ON store_registration_requests(created_at DESC);

-- RLS Policies
ALTER TABLE store_registration_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (submit registration) - NO AUTH REQUIRED
CREATE POLICY "Anyone can submit registration request"
  ON store_registration_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only authenticated users can view their own requests OR admins can view all
CREATE POLICY "View registration requests"
  ON store_registration_requests
  FOR SELECT
  TO public
  USING (true);  -- Everyone can view for now, you can restrict later

-- Allow updates only for admins (you'll need to check your admin setup)
-- For now, allowing authenticated users to update
CREATE POLICY "Update registration requests"
  ON store_registration_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_store_reg_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS store_reg_updated_at ON store_registration_requests;
CREATE TRIGGER store_reg_updated_at
  BEFORE UPDATE ON store_registration_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_store_reg_timestamp();

-- ============================================
-- تعليق توضيحي
-- ============================================
COMMENT ON TABLE store_registration_requests IS 'طلبات تسجيل المحلات الجديدة من أصحاب المحلات';
COMMENT ON COLUMN store_registration_requests.status IS 'حالة الطلب: pending, approved, rejected';
COMMENT ON COLUMN store_registration_requests.admin_notes IS 'ملاحظات الأدمن على الطلب';
