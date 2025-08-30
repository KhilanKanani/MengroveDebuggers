-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  phone TEXT,
  organization TEXT,
  user_role TEXT DEFAULT 'community_member' CHECK (user_role IN ('community_member', 'fisherman', 'ngo', 'government_authority', 'researcher')),
  points INTEGER DEFAULT 0,
  total_reports INTEGER DEFAULT 0,
  verified_reports INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mangrove reports table
CREATE TABLE public.mangrove_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  incident_type TEXT NOT NULL CHECK (incident_type IN ('cutting', 'dumping', 'damage', 'illegal_fishing', 'pollution', 'other')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location_description TEXT,
  photos TEXT[], -- Array of photo URLs
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'investigating', 'resolved', 'rejected')),
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  points_required INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user badges junction table
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mangrove_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Anyone can view reports" ON public.mangrove_reports FOR SELECT USING (true);
CREATE POLICY "Users can create reports" ON public.mangrove_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reports" ON public.mangrove_reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Authorities can update all reports" ON public.mangrove_reports FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_role IN ('government_authority', 'ngo', 'researcher')
  )
);

-- Badges policies
CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Anyone can view user badges" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Users can earn badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for report photos
INSERT INTO storage.buckets (id, name, public) VALUES ('report-photos', 'report-photos', true);

-- Storage policies
CREATE POLICY "Anyone can view report photos" ON storage.objects FOR SELECT USING (bucket_id = 'report-photos');
CREATE POLICY "Authenticated users can upload photos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'report-photos' AND auth.role() = 'authenticated'
);
CREATE POLICY "Users can update own photos" ON storage.objects FOR UPDATE USING (
  bucket_id = 'report-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Insert default badges
INSERT INTO public.badges (name, description, icon, points_required) VALUES
('First Reporter', 'Submit your first mangrove report', '🌱', 0),
('Guardian', 'Submit 5 verified reports', '🛡️', 50),
('Protector', 'Submit 15 verified reports', '🌳', 150),
('Champion', 'Submit 50 verified reports', '🏆', 500),
('Environmental Hero', 'Submit 100 verified reports', '⭐', 1000);

-- Function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profile stats when report status changes
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    IF NEW.status = 'verified' THEN
      UPDATE public.profiles 
      SET 
        points = points + 10,
        verified_reports = verified_reports + 1
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;
  
  -- Update total reports count on insert
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles 
    SET total_reports = total_reports + 1
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating user stats
CREATE TRIGGER update_user_stats_trigger
  AFTER INSERT OR UPDATE ON public.mangrove_reports
  FOR EACH ROW EXECUTE FUNCTION update_user_stats();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.mangrove_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();