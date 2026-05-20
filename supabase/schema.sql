-- =====================================================
-- AISANTÉ — Complete Database Schema for Supabase
-- Run this in your Supabase SQL Editor
-- =====================================================

-- ─── Enable necessary extensions ───
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES (extends auth.users)
-- =====================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  national_id TEXT,
  blood_type TEXT,
  allergies TEXT,
  chronic_conditions TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- 2. USER ROLES (patient, doctor, pharmacy, admin)
-- =====================================================
CREATE TABLE public.user_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'pharmacy', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage roles" ON public.user_roles
  FOR ALL USING (true);

-- =====================================================
-- 3. DOCTOR PROFILES
-- =====================================================
CREATE TABLE public.doctor_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  specialty TEXT,
  license_number TEXT,
  hospital TEXT,
  bio TEXT,
  consultation_fee NUMERIC(10,2),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view own profile" ON public.doctor_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Doctors can update own profile" ON public.doctor_profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Doctors can insert own profile" ON public.doctor_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Patients can view doctor profiles" ON public.doctor_profiles
  FOR SELECT USING (true);

-- =====================================================
-- 4. PHARMACY PROFILES
-- =====================================================
CREATE TABLE public.pharmacy_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pharmacy_name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  wilaya TEXT,
  phone TEXT,
  is_open BOOLEAN DEFAULT true,
  opening_hours TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.pharmacy_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pharmacies can view own profile" ON public.pharmacy_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Pharmacies can update own profile" ON public.pharmacy_profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Pharmacies can insert own profile" ON public.pharmacy_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Anyone can view pharmacy profiles" ON public.pharmacy_profiles
  FOR SELECT USING (true);

-- =====================================================
-- 5. VITALS (patient health data)
-- =====================================================
CREATE TABLE public.vitals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  heart_rate INTEGER,
  glucose NUMERIC(5,2),
  systolic INTEGER,
  diastolic INTEGER,
  oxygen INTEGER,
  temperature NUMERIC(4,1),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vitals" ON public.vitals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vitals" ON public.vitals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Doctors can view patient vitals" ON public.vitals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'doctor'
    )
  );

-- =====================================================
-- 6. WEARABLE DATA (bracelet connecté)
-- =====================================================
CREATE TABLE public.wearable_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  steps INTEGER,
  sleep_minutes INTEGER,
  heart_rate INTEGER,
  calories_burned INTEGER,
  distance_meters INTEGER,
  battery_level INTEGER,
  device_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.wearable_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wearable data" ON public.wearable_data
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wearable data" ON public.wearable_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Doctors can view patient wearable data" ON public.wearable_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'doctor'
    )
  );

-- =====================================================
-- 7. APPOINTMENTS
-- =====================================================
CREATE TABLE public.appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id),
  doctor_name TEXT NOT NULL,
  specialty TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  mode TEXT DEFAULT 'in_person' CHECK (mode IN ('in_person', 'teleconsultation')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = doctor_id);
CREATE POLICY "Users can insert own appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own appointments" ON public.appointments
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = doctor_id);
CREATE POLICY "Users can delete own appointments" ON public.appointments
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Doctors can view all their appointments" ON public.appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'doctor'
    )
  );

-- =====================================================
-- 8. PRESCRIPTIONS
-- =====================================================
CREATE TABLE public.prescriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id),
  pharmacy_id UUID REFERENCES auth.users(id),
  doctor_name TEXT,
  patient_name TEXT,
  pharmacy_name TEXT,
  medications JSONB NOT NULL DEFAULT '[]',
  diagnosis TEXT,
  notes TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'received', 'processing', 'ready', 'delivered')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own prescriptions" ON public.prescriptions
  FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Doctors can manage prescriptions" ON public.prescriptions
  FOR ALL USING (auth.uid() = doctor_id);
CREATE POLICY "Pharmacies can view assigned prescriptions" ON public.prescriptions
  FOR SELECT USING (auth.uid() = pharmacy_id);
CREATE POLICY "Pharmacies can update prescription status" ON public.prescriptions
  FOR UPDATE USING (auth.uid() = pharmacy_id);

-- =====================================================
-- 9. MEDICATIONS (pharmacy inventory)
-- =====================================================
CREATE TABLE public.medications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pharmacy_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  generic_name TEXT,
  dosage TEXT,
  form TEXT,
  stock_quantity INTEGER DEFAULT 0,
  min_threshold INTEGER DEFAULT 10,
  price NUMERIC(10,2),
  requires_prescription BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pharmacies can manage own inventory" ON public.medications
  FOR ALL USING (auth.uid() = pharmacy_id);
CREATE POLICY "Anyone can view available medications" ON public.medications
  FOR SELECT USING (is_available = true);

-- =====================================================
-- 10. CHAT MESSAGES (AI Consultant)
-- =====================================================
CREATE TABLE public.chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" ON public.chat_messages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 11. HEALTH SUMMARIES (AI-generated)
-- =====================================================
CREATE TABLE public.health_summaries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.health_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own summaries" ON public.health_summaries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own summaries" ON public.health_summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 12. NOTIFICATIONS
-- =====================================================
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'alert', 'reminder', 'prescription')),
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- 13. DOCTOR-PATIENT RELATIONSHIPS
-- =====================================================
CREATE TABLE public.doctor_patients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(doctor_id, patient_id)
);

ALTER TABLE public.doctor_patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can manage their patients" ON public.doctor_patients
  FOR ALL USING (auth.uid() = doctor_id);
CREATE POLICY "Patients can view their doctors" ON public.doctor_patients
  FOR SELECT USING (auth.uid() = patient_id);

-- =====================================================
-- 14. MEDICAL RECORDS
-- =====================================================
CREATE TABLE public.medical_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id),
  record_type TEXT NOT NULL CHECK (record_type IN ('diagnosis', 'lab_result', 'imaging', 'procedure', 'note')),
  title TEXT NOT NULL,
  description TEXT,
  data JSONB,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own records" ON public.medical_records
  FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Doctors can manage patient records" ON public.medical_records
  FOR ALL USING (
    auth.uid() = doctor_id OR
    EXISTS (
      SELECT 1 FROM public.doctor_patients
      WHERE doctor_id = auth.uid() AND patient_id = medical_records.patient_id
    )
  );

-- =====================================================
-- 15. WEARABLE ALERTS
-- =====================================================
CREATE TABLE public.wearable_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('heart_rate_high', 'heart_rate_low', 'spo2_low', 'temperature_high', 'fall_detected', 'inactivity')),
  severity TEXT DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  value TEXT,
  message TEXT,
  is_acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.wearable_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts" ON public.wearable_alerts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON public.wearable_alerts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Doctors can view patient alerts" ON public.wearable_alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'doctor'
    )
  );
CREATE POLICY "System can insert alerts" ON public.wearable_alerts
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- TRIGGER: Auto-create profile on signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name, email, phone, date_of_birth, gender, national_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone',
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'date_of_birth' IS NOT NULL 
      THEN (NEW.raw_user_meta_data ->> 'date_of_birth')::DATE 
      ELSE NULL 
    END,
    NEW.raw_user_meta_data ->> 'gender',
    NEW.raw_user_meta_data ->> 'national_id'
  );

  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'patient')
  );

  -- Create doctor profile if role is doctor
  IF (NEW.raw_user_meta_data ->> 'role') = 'doctor' THEN
    INSERT INTO public.doctor_profiles (id, specialty, license_number)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data ->> 'specialty',
      NEW.raw_user_meta_data ->> 'license_number'
    );
  END IF;

  -- Create pharmacy profile if role is pharmacy
  IF (NEW.raw_user_meta_data ->> 'role') = 'pharmacy' THEN
    INSERT INTO public.pharmacy_profiles (id, pharmacy_name, address)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'pharmacy_name', 'Pharmacie'),
      NEW.raw_user_meta_data ->> 'pharmacy_address'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- INDEXES for performance
-- =====================================================
CREATE INDEX idx_vitals_user_id ON public.vitals(user_id);
CREATE INDEX idx_vitals_recorded_at ON public.vitals(recorded_at DESC);
CREATE INDEX idx_wearable_user_id ON public.wearable_data(user_id);
CREATE INDEX idx_wearable_recorded_at ON public.wearable_data(recorded_at DESC);
CREATE INDEX idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_scheduled_at ON public.appointments(scheduled_at);
CREATE INDEX idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor_id ON public.prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_pharmacy_id ON public.prescriptions(pharmacy_id);
CREATE INDEX idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id) WHERE is_read = false;
CREATE INDEX idx_medications_pharmacy_id ON public.medications(pharmacy_id);
CREATE INDEX idx_doctor_patients_doctor ON public.doctor_patients(doctor_id);
CREATE INDEX idx_doctor_patients_patient ON public.doctor_patients(patient_id);
CREATE INDEX idx_medical_records_patient ON public.medical_records(patient_id);
CREATE INDEX idx_wearable_alerts_user ON public.wearable_alerts(user_id);

-- =====================================================
-- DONE! Your AISANTÉ database is ready.
-- =====================================================
