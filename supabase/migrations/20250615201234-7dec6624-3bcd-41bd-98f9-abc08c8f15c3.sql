
-- 1. User profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name text,
  phone_number text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- 2. Contributions table
CREATE TABLE public.contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  contributor_name text NOT NULL,
  amount integer NOT NULL,
  phone_number text NOT NULL,
  payment_method text NOT NULL,
  purpose text,
  timestamp timestamp with time zone default timezone('utc', now()),
  status text NOT NULL DEFAULT 'pending'
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Profiles: users can access their own profile
CREATE POLICY "Individuals can view/update their profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Individuals can update their profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Contributions: 
-- Only owner (user) can see and write their contributions, but allow INSERT while not logged in for now
CREATE POLICY "Allow insert for anonymous and authenticated users" ON public.contributions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "User can select/update their own contributions" ON public.contributions
  FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "User can update their own contributions" ON public.contributions
  FOR UPDATE USING (profile_id = auth.uid());

-- If you want to allow anyone to read all contributions for now, add this:
-- CREATE POLICY "Anyone can read all contributions" ON public.contributions FOR SELECT USING (true);

