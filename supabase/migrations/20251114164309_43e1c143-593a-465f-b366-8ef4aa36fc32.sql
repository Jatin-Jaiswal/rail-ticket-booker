-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create trains table
CREATE TABLE public.trains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  train_number TEXT NOT NULL UNIQUE,
  train_name TEXT NOT NULL,
  source_station TEXT NOT NULL,
  destination_station TEXT NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  duration_hours DECIMAL(4,2) NOT NULL,
  total_seats INTEGER NOT NULL,
  available_seats INTEGER NOT NULL,
  class_type TEXT NOT NULL,
  price_per_seat DECIMAL(10,2) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on trains
ALTER TABLE public.trains ENABLE ROW LEVEL SECURITY;

-- Trains policies - everyone can view active trains
CREATE POLICY "Anyone can view active trains"
  ON public.trains FOR SELECT
  USING (active = TRUE);

CREATE POLICY "Admins can manage trains"
  ON public.trains FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  train_id UUID NOT NULL REFERENCES public.trains(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  journey_date DATE NOT NULL,
  passenger_name TEXT NOT NULL,
  passenger_age INTEGER NOT NULL,
  passenger_gender TEXT NOT NULL,
  seat_numbers TEXT[] NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  booking_status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_booking_status CHECK (booking_status IN ('pending', 'confirmed', 'cancelled')),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded'))
);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create seats table for seat management
CREATE TABLE public.seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  train_id UUID NOT NULL REFERENCES public.trains(id) ON DELETE CASCADE,
  seat_number TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  locked_until TIMESTAMP WITH TIME ZONE,
  locked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(train_id, seat_number)
);

-- Enable RLS on seats
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;

-- Seats policies
CREATE POLICY "Anyone can view seats"
  ON public.seats FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users can lock seats"
  ON public.seats FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trains_updated_at
  BEFORE UPDATE ON public.trains
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample trains data
INSERT INTO public.trains (train_number, train_name, source_station, destination_station, departure_time, arrival_time, duration_hours, total_seats, available_seats, class_type, price_per_seat)
VALUES
  ('12001', 'Express Metro', 'Delhi', 'Mumbai', '06:00:00', '14:00:00', 8.0, 72, 72, 'AC 2-Tier', 850.00),
  ('12002', 'Shatabdi Express', 'Mumbai', 'Bangalore', '08:30:00', '16:15:00', 7.75, 48, 48, 'AC Chair Car', 1200.00),
  ('12003', 'Rajdhani Express', 'Delhi', 'Kolkata', '10:00:00', '17:30:00', 7.5, 64, 64, 'AC 1-Tier', 1450.00),
  ('12004', 'Duronto Express', 'Chennai', 'Hyderabad', '14:00:00', '22:00:00', 8.0, 96, 96, 'Sleeper', 750.00),
  ('12005', 'Garib Rath', 'Bangalore', 'Delhi', '05:30:00', '13:00:00', 7.5, 80, 80, 'AC 3-Tier', 650.00);

-- Create function to generate seats for a train
CREATE OR REPLACE FUNCTION public.generate_seats_for_train(p_train_id UUID, p_total_seats INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  i INTEGER;
  seat_prefix TEXT;
BEGIN
  FOR i IN 1..p_total_seats LOOP
    -- Generate seat numbers like A1, A2, B1, B2, etc.
    seat_prefix := CHR(65 + ((i - 1) / 6));
    INSERT INTO public.seats (train_id, seat_number, is_available)
    VALUES (p_train_id, seat_prefix || ((i - 1) % 6 + 1)::TEXT, TRUE);
  END LOOP;
END;
$$;

-- Generate seats for all trains
DO $$
DECLARE
  train_record RECORD;
BEGIN
  FOR train_record IN SELECT id, total_seats FROM public.trains LOOP
    PERFORM public.generate_seats_for_train(train_record.id, train_record.total_seats);
  END LOOP;
END;
$$;