-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create users table with admin flag
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Rest of the tables and policies remain the same
CREATE TABLE public.target_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  emails TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  email_body TEXT NOT NULL,
  target_list_id UUID REFERENCES target_lists(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent')),
  responses_count INTEGER DEFAULT 0,
  nps_score NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id),
  email TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(survey_id, email)
);

-- Create function to update NPS score
CREATE OR REPLACE FUNCTION update_nps_score()
RETURNS TRIGGER AS $$
DECLARE
  total_responses INTEGER;
  promoters INTEGER;
  detractors INTEGER;
BEGIN
  -- Get counts
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE score >= 9),
    COUNT(*) FILTER (WHERE score <= 6)
  INTO total_responses, promoters, detractors
  FROM survey_responses
  WHERE survey_id = NEW.survey_id;

  -- Update survey
  UPDATE surveys 
  SET 
    responses_count = total_responses,
    nps_score = ROUND((promoters::NUMERIC / total_responses * 100) - (detractors::NUMERIC / total_responses * 100))
  WHERE id = NEW.survey_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for NPS score updates
CREATE TRIGGER update_survey_stats
AFTER INSERT ON survey_responses
FOR EACH ROW
EXECUTE FUNCTION update_nps_score();

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can read their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Only admins can update users" ON public.users
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Only admins can delete users" ON public.users
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Only admins can insert users" ON public.users
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
  ));

-- Policies for target_lists table
CREATE POLICY "Admins can select target lists" ON public.target_lists
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can insert target lists" ON public.target_lists
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can update target lists" ON public.target_lists
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can delete target lists" ON public.target_lists
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
  ));

-- Policies for surveys table
CREATE POLICY "Admins can select surveys" ON public.surveys
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can insert surveys" ON public.surveys
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can update surveys" ON public.surveys
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can delete surveys" ON public.surveys
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
  ));

-- Policies for survey_responses table
CREATE POLICY "Anyone can create responses" ON public.survey_responses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view responses" ON public.survey_responses
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
  ));