-- ====================================================================
-- Mihnati (مهنتي) — Initial Schema & RLS Policies
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & DOMAINS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'professional', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reminder_type AS ENUM ('maintenance', 'follow_up', 'booking', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE my_service_status AS ENUM ('active', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'customer',
    avatar_url TEXT,
    city TEXT NOT NULL DEFAULT 'رام الله والبيرة',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. SERVICE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    icon TEXT NOT NULL,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 5. CRAFTSMEN (PROFESSIONALS) TABLE
CREATE TABLE IF NOT EXISTS public.craftsmen (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    description TEXT,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
    review_count INT NOT NULL DEFAULT 0,
    distance_km NUMERIC(4, 1) NOT NULL DEFAULT 1.0,
    area TEXT NOT NULL DEFAULT 'رام الله',
    city TEXT NOT NULL DEFAULT 'رام الله والبيرة',
    is_open BOOLEAN NOT NULL DEFAULT true,
    photo TEXT,
    phone TEXT NOT NULL,
    price_hint TEXT DEFAULT 'معاينة فنية ميدانية',
    price_value TEXT DEFAULT '30 شيكل (تُخصم عند التصليح)',
    fast_response BOOLEAN NOT NULL DEFAULT true,
    keywords TEXT,
    result_info TEXT,
    category_ids TEXT[] NOT NULL DEFAULT '{}',
    latitude DOUBLE PRECISION NOT NULL DEFAULT 31.9073,
    longitude DOUBLE PRECISION NOT NULL DEFAULT 35.2034,
    experience_years INT NOT NULL DEFAULT 5,
    verified BOOLEAN NOT NULL DEFAULT false,
    working_hours TEXT NOT NULL DEFAULT '08:00 - 18:00',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.craftsmen ENABLE ROW LEVEL SECURITY;

-- 6. CRAFTSMAN SERVICES TABLE (Priced offerings per craftsman)
CREATE TABLE IF NOT EXISTS public.craftsman_services (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    craftsman_id TEXT NOT NULL REFERENCES public.craftsmen(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    duration TEXT,
    price_range TEXT,
    price_note TEXT,
    icon TEXT NOT NULL DEFAULT 'toolbox',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.craftsman_services ENABLE ROW LEVEL SECURITY;

-- 7. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    craftsman_id TEXT NOT NULL REFERENCES public.craftsmen(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    service_title TEXT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TEXT NOT NULL,
    status booking_status NOT NULL DEFAULT 'confirmed',
    notes TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 8. MY SERVICES (Client maintenance & service tracking)
CREATE TABLE IF NOT EXISTS public.my_services (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    craftsman_id TEXT REFERENCES public.craftsmen(id) ON DELETE SET NULL,
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    last_service_date DATE NOT NULL,
    cost NUMERIC(10, 2),
    currency TEXT NOT NULL DEFAULT '₪',
    status my_service_status NOT NULL DEFAULT 'active',
    notes TEXT,
    source_booking_id TEXT REFERENCES public.bookings(id) ON DELETE SET NULL,
    next_booking_date DATE,
    next_booking_time TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.my_services ENABLE ROW LEVEL SECURITY;

-- 9. SERVICE REMINDERS
CREATE TABLE IF NOT EXISTS public.service_reminders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    service_id TEXT NOT NULL REFERENCES public.my_services(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    reminder_date DATE NOT NULL,
    type reminder_type NOT NULL DEFAULT 'maintenance',
    is_completed BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.service_reminders ENABLE ROW LEVEL SECURITY;

-- 10. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    craftsman_id TEXT NOT NULL REFERENCES public.craftsmen(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    booking_id TEXT REFERENCES public.bookings(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    author_initial TEXT NOT NULL,
    rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    service TEXT NOT NULL,
    comment TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    helpful INT NOT NULL DEFAULT 0,
    time_ago TEXT,
    verified_request BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 11. SAVED CRAFTSMEN (User bookmarks/favorites)
CREATE TABLE IF NOT EXISTS public.saved_craftsmen (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    craftsman_id TEXT NOT NULL REFERENCES public.craftsmen(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, craftsman_id)
);

ALTER TABLE public.saved_craftsmen ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- TRIGGERS & FUNCTIONS
-- ====================================================================

-- A. Auto-create Profile upon auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, role, city)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'مستخدم مهنتي'),
        NEW.phone,
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'customer'::public.user_role),
        COALESCE(NEW.raw_user_meta_data->>'city', 'رام الله والبيرة')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- B. Recalculate craftsman rating & review_count when a review is added
CREATE OR REPLACE FUNCTION public.recalculate_craftsman_rating()
RETURNS TRIGGER AS $$
DECLARE
    target_craftsman_id TEXT;
    new_avg NUMERIC(3, 2);
    new_count INT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_craftsman_id := OLD.craftsman_id;
    ELSE
        target_craftsman_id := NEW.craftsman_id;
    END IF;

    SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 5.0), COUNT(*)
    INTO new_avg, new_count
    FROM public.reviews
    WHERE craftsman_id = target_craftsman_id;

    UPDATE public.craftsmen
    SET rating = new_avg, review_count = new_count, updated_at = now()
    WHERE id = target_craftsman_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_change ON public.reviews;
CREATE TRIGGER on_review_change
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.recalculate_craftsman_rating();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- PROFILES
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- CATEGORIES
CREATE POLICY "Categories are viewable by everyone"
    ON public.categories FOR SELECT USING (true);

-- CRAFTSMEN
CREATE POLICY "Craftsmen are viewable by everyone"
    ON public.craftsmen FOR SELECT USING (true);

CREATE POLICY "Craftsmen can be created by authenticated users or public onboarding"
    ON public.craftsmen FOR INSERT WITH CHECK (true);

CREATE POLICY "Craftsmen can be updated by owning user"
    ON public.craftsmen FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- CRAFTSMAN SERVICES
CREATE POLICY "Craftsman services are viewable by everyone"
    ON public.craftsman_services FOR SELECT USING (true);

CREATE POLICY "Craftsman services can be created by craftsman owner"
    ON public.craftsman_services FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.craftsmen
            WHERE id = craftsman_id AND (user_id = auth.uid() OR user_id IS NULL)
        )
    );

CREATE POLICY "Craftsman services can be updated by craftsman owner"
    ON public.craftsman_services FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.craftsmen
            WHERE id = craftsman_id AND (user_id = auth.uid() OR user_id IS NULL)
        )
    );

-- BOOKINGS
CREATE POLICY "Customers can view their bookings"
    ON public.bookings FOR SELECT USING (
        auth.uid() = customer_id
        OR EXISTS (
            SELECT 1 FROM public.craftsmen
            WHERE id = craftsman_id AND user_id = auth.uid()
        )
        OR customer_id IS NULL
    );

CREATE POLICY "Anyone can create a booking"
    ON public.bookings FOR INSERT WITH CHECK (true);

CREATE POLICY "Participants can update booking status"
    ON public.bookings FOR UPDATE USING (
        auth.uid() = customer_id
        OR EXISTS (
            SELECT 1 FROM public.craftsmen
            WHERE id = craftsman_id AND user_id = auth.uid()
        )
        OR customer_id IS NULL
    );

-- MY SERVICES
CREATE POLICY "Users can view their own services"
    ON public.my_services FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own services"
    ON public.my_services FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own services"
    ON public.my_services FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own services"
    ON public.my_services FOR DELETE USING (auth.uid() = user_id);

-- SERVICE REMINDERS
CREATE POLICY "Users can view their own reminders"
    ON public.service_reminders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminders"
    ON public.service_reminders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders"
    ON public.service_reminders FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders"
    ON public.service_reminders FOR DELETE USING (auth.uid() = user_id);

-- REVIEWS
CREATE POLICY "Reviews are viewable by everyone"
    ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Reviews can be inserted by anyone"
    ON public.reviews FOR INSERT WITH CHECK (true);

CREATE POLICY "Reviews can be updated by author"
    ON public.reviews FOR UPDATE USING (auth.uid() = customer_id OR customer_id IS NULL);

-- SAVED CRAFTSMEN
CREATE POLICY "Users can view their own saved craftsmen"
    ON public.saved_craftsmen FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save a craftsman"
    ON public.saved_craftsmen FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove a saved craftsman"
    ON public.saved_craftsmen FOR DELETE USING (auth.uid() = user_id);

-- ====================================================================
-- STORAGE BUCKETS
-- ====================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('service-images', 'service-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Avatars are publicly readable"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload avatars"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Service images are publicly readable"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'service-images');

CREATE POLICY "Anyone can upload service images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'service-images');
