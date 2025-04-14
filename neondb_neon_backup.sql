--
-- PostgreSQL database dump
--

-- Dumped from database version 14.17 (Homebrew)
-- Dumped by pg_dump version 14.17 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: message_status; Type: TYPE; Schema: public; Owner: melchor
--

CREATE TYPE public.message_status AS ENUM (
    'unread',
    'read',
    'replied',
    'archived'
);


ALTER TYPE public.message_status OWNER TO inmobiHub_owner;

--
-- Name: property_type; Type: TYPE; Schema: public; Owner: melchor
--

CREATE TYPE public.property_type AS ENUM (
    'house',
    'condo',
    'apartment',
    'townhouse',
    'land'
);


ALTER TYPE public.property_type OWNER TO inmobiHub_owner;

--
-- Name: role; Type: TYPE; Schema: public; Owner: melchor
--

CREATE TYPE public.role AS ENUM (
    'user',
    'agent',
    'admin'
);


ALTER TYPE public.role OWNER TO inmobiHub_owner;

--
-- Name: subscription_tier; Type: TYPE; Schema: public; Owner: melchor
--

CREATE TYPE public.subscription_tier AS ENUM (
    'free',
    'premium',
    'enterprise'
);


ALTER TYPE public.subscription_tier OWNER TO inmobiHub_owner;

--
-- Name: tour_status; Type: TYPE; Schema: public; Owner: melchor
--

CREATE TYPE public.tour_status AS ENUM (
    'pending',
    'confirmed',
    'completed',
    'cancelled',
    'rescheduled'
);


ALTER TYPE public.tour_status OWNER TO inmobiHub_owner;

--
-- Name: tour_type; Type: TYPE; Schema: public; Owner: melchor
--

CREATE TYPE public.tour_type AS ENUM (
    'in-person',
    'virtual'
);


ALTER TYPE public.tour_type OWNER TO inmobiHub_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: chat_analytics; Type: TABLE; Schema: public; Owner: melchor
--

CREATE TABLE public.chat_analytics (
    id integer NOT NULL,
    user_id integer,
    message text NOT NULL,
    response text NOT NULL,
    property_id integer,
    category text,
    sentiment text,
    is_property_specific boolean DEFAULT false,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.chat_analytics OWNER TO inmobiHub_owner;

--
-- Name: chat_analytics_id_seq; Type: SEQUENCE; Schema: public; Owner: melchor
--

CREATE SEQUENCE public.chat_analytics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.chat_analytics_id_seq OWNER TO inmobiHub_owner;

--
-- Name: chat_analytics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: melchor
--

ALTER SEQUENCE public.chat_analytics_id_seq OWNED BY public.chat_analytics.id;


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: melchor
--

CREATE TABLE public.favorites (
    id integer NOT NULL,
    user_id integer NOT NULL,
    property_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.favorites OWNER TO inmobiHub_owner;

--
-- Name: favorites_id_seq; Type: SEQUENCE; Schema: public; Owner: melchor
--

CREATE SEQUENCE public.favorites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.favorites_id_seq OWNER TO inmobiHub_owner;

--
-- Name: favorites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: melchor
--

ALTER SEQUENCE public.favorites_id_seq OWNED BY public.favorites.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: melchor
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    sender_id integer NOT NULL,
    recipient_id integer NOT NULL,
    property_id integer,
    subject text NOT NULL,
    content text NOT NULL,
    status public.message_status DEFAULT 'unread'::public.message_status NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.messages OWNER TO inmobiHub_owner;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: melchor
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.messages_id_seq OWNER TO inmobiHub_owner;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: melchor
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: neighborhoods; Type: TABLE; Schema: public; Owner: melchor
--

CREATE TABLE public.neighborhoods (
    id integer NOT NULL,
    name text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    zip_code text NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    overall_score integer NOT NULL,
    rank integer,
    safety_score integer,
    school_score integer,
    transit_score integer,
    walkability_score integer,
    restaurant_score integer,
    shopping_score integer,
    nightlife_score integer,
    family_friendly_score integer,
    affordability_score integer,
    growth double precision,
    median_home_price integer,
    price_history jsonb,
    description text,
    highlights jsonb,
    challenges jsonb,
    population integer,
    demographics jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.neighborhoods OWNER TO inmobiHub_owner;

--
-- Name: neighborhoods_id_seq; Type: SEQUENCE; Schema: public; Owner: melchor
--

CREATE SEQUENCE public.neighborhoods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.neighborhoods_id_seq OWNER TO inmobiHub_owner;

--
-- Name: neighborhoods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: melchor
--

ALTER SEQUENCE public.neighborhoods_id_seq OWNED BY public.neighborhoods.id;


--
-- Name: properties; Type: TABLE; Schema: public; Owner: melchor
--

CREATE TABLE public.properties (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    price integer NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    zip_code text NOT NULL,
    country text DEFAULT 'USA'::text NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    location text,
    bedrooms integer NOT NULL,
    bathrooms integer NOT NULL,
    square_feet integer NOT NULL,
    property_type public.property_type NOT NULL,
    year_built integer,
    is_premium boolean DEFAULT false NOT NULL,
    features jsonb,
    images jsonb NOT NULL,
    lot_size integer,
    garage_spaces integer,
    listing_type text DEFAULT 'sale'::text,
    location_score integer,
    neighborhood_id integer,
    owner_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.properties OWNER TO inmobiHub_owner;

--
-- Name: properties_id_seq; Type: SEQUENCE; Schema: public; Owner: melchor
--

CREATE SEQUENCE public.properties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.properties_id_seq OWNER TO inmobiHub_owner;

--
-- Name: properties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: melchor
--

ALTER SEQUENCE public.properties_id_seq OWNED BY public.properties.id;


--
-- Name: property_drafts; Type: TABLE; Schema: public; Owner: melchor
--

CREATE TABLE public.property_drafts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    form_data jsonb NOT NULL,
    name text NOT NULL,
    last_updated timestamp without time zone DEFAULT now() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.property_drafts OWNER TO inmobiHub_owner;

--
-- Name: property_drafts_id_seq; Type: SEQUENCE; Schema: public; Owner: melchor
--

CREATE SEQUENCE public.property_drafts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.property_drafts_id_seq OWNER TO inmobiHub_owner;

--
-- Name: property_drafts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: melchor
--

ALTER SEQUENCE public.property_drafts_id_seq OWNED BY public.property_drafts.id;


--
-- Name: property_tours; Type: TABLE; Schema: public; Owner: melchor
--

CREATE TABLE public.property_tours (
    id integer NOT NULL,
    property_id integer NOT NULL,
    user_id integer NOT NULL,
    agent_id integer,
    tour_date timestamp without time zone NOT NULL,
    tour_time text NOT NULL,
    duration integer DEFAULT 30 NOT NULL,
    notes text,
    status public.tour_status DEFAULT 'pending'::public.tour_status NOT NULL,
    tour_type public.tour_type DEFAULT 'in-person'::public.tour_type NOT NULL,
    contact_phone text,
    contact_email text,
    additional_attendees integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.property_tours OWNER TO inmobiHub_owner;

--
-- Name: property_tours_id_seq; Type: SEQUENCE; Schema: public; Owner: melchor
--

CREATE SEQUENCE public.property_tours_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.property_tours_id_seq OWNER TO inmobiHub_owner;

--
-- Name: property_tours_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: melchor
--

ALTER SEQUENCE public.property_tours_id_seq OWNED BY public.property_tours.id;


--
-- Name: search_history; Type: TABLE; Schema: public; Owner: melchor
--

CREATE TABLE public.search_history (
    id integer NOT NULL,
    user_id integer NOT NULL,
    search_params jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.search_history OWNER TO inmobiHub_owner;

--
-- Name: search_history_id_seq; Type: SEQUENCE; Schema: public; Owner: melchor
--

CREATE SEQUENCE public.search_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.search_history_id_seq OWNER TO inmobiHub_owner;

--
-- Name: search_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: melchor
--

ALTER SEQUENCE public.search_history_id_seq OWNED BY public.search_history.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: melchor
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO inmobiHub_owner;

--
-- Name: suggested_questions; Type: TABLE; Schema: public; Owner: melchor
--

CREATE TABLE public.suggested_questions (
    id integer NOT NULL,
    question text NOT NULL,
    category text,
    property_type public.property_type,
    is_general_question boolean DEFAULT true NOT NULL,
    display_order integer DEFAULT 0,
    click_count integer DEFAULT 0,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.suggested_questions OWNER TO inmobiHub_owner;

--
-- Name: suggested_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: melchor
--

CREATE SEQUENCE public.suggested_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.suggested_questions_id_seq OWNER TO inmobiHub_owner;

--
-- Name: suggested_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: melchor
--

ALTER SEQUENCE public.suggested_questions_id_seq OWNED BY public.suggested_questions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: melchor
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    email text NOT NULL,
    full_name text NOT NULL,
    role public.role DEFAULT 'user'::public.role NOT NULL,
    subscription_tier public.subscription_tier DEFAULT 'free'::public.subscription_tier NOT NULL,
    subscription_expires_at timestamp without time zone,
    profile_image text,
    bio text,
    phone text,
    preferred_language text DEFAULT 'en-GB'::text,
    is_verified boolean DEFAULT false NOT NULL,
    verification_date timestamp without time zone,
    verified_by integer,
    passkey text,
    passkey_enabled boolean DEFAULT false NOT NULL,
    has_id_verification boolean DEFAULT false NOT NULL,
    id_verification_type text,
    id_verification_date timestamp without time zone,
    id_verification_status text DEFAULT 'none'::text,
    id_verification_notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO inmobiHub_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: melchor
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO inmobiHub_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: melchor
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: chat_analytics id; Type: DEFAULT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.chat_analytics ALTER COLUMN id SET DEFAULT nextval('public.chat_analytics_id_seq'::regclass);


--
-- Name: favorites id; Type: DEFAULT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.favorites ALTER COLUMN id SET DEFAULT nextval('public.favorites_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: neighborhoods id; Type: DEFAULT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.neighborhoods ALTER COLUMN id SET DEFAULT nextval('public.neighborhoods_id_seq'::regclass);


--
-- Name: properties id; Type: DEFAULT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.properties ALTER COLUMN id SET DEFAULT nextval('public.properties_id_seq'::regclass);


--
-- Name: property_drafts id; Type: DEFAULT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.property_drafts ALTER COLUMN id SET DEFAULT nextval('public.property_drafts_id_seq'::regclass);


--
-- Name: property_tours id; Type: DEFAULT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.property_tours ALTER COLUMN id SET DEFAULT nextval('public.property_tours_id_seq'::regclass);


--
-- Name: search_history id; Type: DEFAULT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.search_history ALTER COLUMN id SET DEFAULT nextval('public.search_history_id_seq'::regclass);


--
-- Name: suggested_questions id; Type: DEFAULT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.suggested_questions ALTER COLUMN id SET DEFAULT nextval('public.suggested_questions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: chat_analytics; Type: TABLE DATA; Schema: public; Owner: melchor
--

COPY public.chat_analytics (id, user_id, message, response, property_id, category, sentiment, is_property_specific, "timestamp") FROM stdin;
\.


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: melchor
--

COPY public.favorites (id, user_id, property_id, created_at) FROM stdin;
5	8	5	2025-04-14 05:30:25.352
6	8	6	2025-04-14 05:30:25.352
7	9	7	2025-04-14 05:30:25.352
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: melchor
--

COPY public.messages (id, sender_id, recipient_id, property_id, subject, content, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: neighborhoods; Type: TABLE DATA; Schema: public; Owner: melchor
--

COPY public.neighborhoods (id, name, city, state, zip_code, latitude, longitude, overall_score, rank, safety_score, school_score, transit_score, walkability_score, restaurant_score, shopping_score, nightlife_score, family_friendly_score, affordability_score, growth, median_home_price, price_history, description, highlights, challenges, population, demographics, created_at, updated_at) FROM stdin;
8	Downtown	San Francisco	CA	94105	37.7749	-122.4194	85	\N	80	75	90	85	\N	\N	\N	\N	\N	\N	\N	\N	Vibrant downtown area with excellent amenities	\N	\N	\N	\N	2025-04-14 05:30:25.348	2025-04-14 05:30:25.348
9	Marina District	San Francisco	CA	94123	37.8025	-122.436	90	\N	85	80	85	90	\N	\N	\N	\N	\N	\N	\N	\N	Upscale neighborhood with beautiful waterfront views	\N	\N	\N	\N	2025-04-14 05:30:25.348	2025-04-14 05:30:25.348
10	Mission District	San Francisco	CA	94110	37.7599	-122.4148	80	\N	75	70	85	90	\N	\N	\N	\N	\N	\N	\N	\N	Cultural hub with vibrant nightlife and diverse community	\N	\N	\N	\N	2025-04-14 05:30:25.348	2025-04-14 05:30:25.348
\.


--
-- Data for Name: properties; Type: TABLE DATA; Schema: public; Owner: melchor
--

COPY public.properties (id, title, description, price, address, city, state, zip_code, country, latitude, longitude, location, bedrooms, bathrooms, square_feet, property_type, year_built, is_premium, features, images, lot_size, garage_spaces, listing_type, location_score, neighborhood_id, owner_id, created_at, updated_at) FROM stdin;
5	Modern Downtown Apartment	Beautiful modern apartment in the heart of downtown with stunning city views	750000	123 Main St	San Francisco	CA	94105	USA	37.7749	-122.4194	\N	2	2	1200	apartment	2010	f	["gym", "pool", "parking", "doorman"]	["https://example.com/image1.jpg"]	\N	\N	sale	\N	8	8	2025-04-14 05:30:25.35	2025-04-14 05:30:25.35
6	Luxury Marina Condo	Spacious condo with panoramic bay views and high-end finishes	1200000	456 Beach St	San Francisco	CA	94123	USA	37.8025	-122.436	\N	3	2	1800	condo	2015	f	["view", "parking", "elevator", "fitness center"]	["https://example.com/image2.jpg"]	\N	\N	sale	\N	9	9	2025-04-14 05:30:25.35	2025-04-14 05:30:25.35
7	Charming Mission District Home	Historic home with modern updates in a vibrant neighborhood	950000	789 Valencia St	San Francisco	CA	94110	USA	37.7599	-122.4148	\N	3	2	1600	house	1920	f	["garden", "garage", "fireplace", "hardwood floors"]	["https://example.com/image3.jpg"]	\N	\N	sale	\N	10	9	2025-04-14 05:30:25.35	2025-04-14 05:30:25.35
8	Modern Downtown Condo	Stunning modern condo in the heart of downtown with panoramic city views. Features floor-to-ceiling windows, high-end finishes, and access to building amenities including pool, gym, and 24/7 concierge.	750000	123 Main St	San Francisco	CA	94105	USA	37.7749	-122.4194	\N	2	2	1200	condo	2018	t	["Pool", "Gym", "Concierge", "Parking", "Security"]	["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1560448204-603b3fc3ddc9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"]	\N	1	sale	95	\N	8	2025-04-14 07:23:56.331	2025-04-14 07:23:56.331
9	Luxury Hillside Mansion	Exquisite hillside mansion with breathtaking views of the bay. Features a gourmet kitchen, home theater, wine cellar, and expansive outdoor living spaces with infinity pool.	4500000	456 Hillside Dr	San Francisco	CA	94123	USA	37.8024	-122.4058	\N	5	6	8000	house	2015	t	["Pool", "Home Theater", "Wine Cellar", "Smart Home", "Garden"]	["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"]	15000	3	sale	98	\N	8	2025-04-14 07:23:56.338	2025-04-14 07:23:56.338
10	Charming Victorian Home	Beautifully restored Victorian home in a historic neighborhood. Features original architectural details, modern updates, and a lovely garden. Walking distance to shops and restaurants.	1200000	789 Victorian Ln	San Francisco	CA	94110	USA	37.7508	-122.4155	\N	3	2	2200	house	1890	f	["Garden", "Hardwood Floors", "Fireplace", "Original Details"]	["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"]	5000	1	sale	92	\N	8	2025-04-14 07:23:56.339	2025-04-14 07:23:56.339
11	Waterfront Apartment	Luxurious waterfront apartment with stunning bay views. Features modern appliances, in-unit laundry, and access to building amenities including pool and fitness center.	850000	101 Bay View Dr	San Francisco	CA	94111	USA	37.7946	-122.394	\N	1	1	900	apartment	2019	t	["Water View", "Pool", "Fitness Center", "Concierge"]	["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"]	\N	1	sale	96	\N	8	2025-04-14 07:23:56.34	2025-04-14 07:23:56.34
12	Modern Downtown Condo	Stunning modern condo in the heart of downtown with panoramic city views. Features floor-to-ceiling windows, high-end finishes, and access to building amenities including pool, gym, and 24/7 concierge.	750000	123 Main St	San Francisco	CA	94105	USA	37.7749	-122.4194	\N	2	2	1200	condo	2018	t	["Pool", "Gym", "Concierge", "Parking", "Security"]	["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1560448204-603b3fc3ddc9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"]	\N	1	sale	95	\N	8	2025-04-14 07:24:10.5	2025-04-14 07:24:10.5
13	Luxury Hillside Mansion	Exquisite hillside mansion with breathtaking views of the bay. Features a gourmet kitchen, home theater, wine cellar, and expansive outdoor living spaces with infinity pool.	4500000	456 Hillside Dr	San Francisco	CA	94123	USA	37.8024	-122.4058	\N	5	6	8000	house	2015	t	["Pool", "Home Theater", "Wine Cellar", "Smart Home", "Garden"]	["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"]	15000	3	sale	98	\N	8	2025-04-14 07:24:10.503	2025-04-14 07:24:10.503
14	Charming Victorian Home	Beautifully restored Victorian home in a historic neighborhood. Features original architectural details, modern updates, and a lovely garden. Walking distance to shops and restaurants.	1200000	789 Victorian Ln	San Francisco	CA	94110	USA	37.7508	-122.4155	\N	3	2	2200	house	1890	f	["Garden", "Hardwood Floors", "Fireplace", "Original Details"]	["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"]	5000	1	sale	92	\N	8	2025-04-14 07:24:10.504	2025-04-14 07:24:10.504
15	Waterfront Apartment	Luxurious waterfront apartment with stunning bay views. Features modern appliances, in-unit laundry, and access to building amenities including pool and fitness center.	850000	101 Bay View Dr	San Francisco	CA	94111	USA	37.7946	-122.394	\N	1	1	900	apartment	2019	t	["Water View", "Pool", "Fitness Center", "Concierge"]	["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"]	\N	1	sale	96	\N	8	2025-04-14 07:24:10.505	2025-04-14 07:24:10.505
16	Modern Townhouse	Contemporary townhouse in a vibrant neighborhood. Features open floor plan, rooftop deck, and smart home technology. Close to public transportation and local amenities.	950000	202 Urban St	San Francisco	CA	94103	USA	37.7749	-122.4194	\N	3	3	1800	townhouse	2017	f	["Rooftop Deck", "Smart Home", "Parking", "Modern Design"]	["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"]	2000	1	sale	90	\N	8	2025-04-14 07:24:10.505	2025-04-14 07:24:10.505
17	Luxury Penthouse	Spectacular penthouse with 360-degree city views. Features high-end finishes, private elevator, and expansive outdoor terrace. Includes access to building amenities.	3500000	303 Skyline Blvd	San Francisco	CA	94105	USA	37.7749	-122.4194	\N	4	5	4000	condo	2020	t	["Private Elevator", "Terrace", "Smart Home", "Concierge", "Parking"]	["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"]	\N	2	sale	99	\N	8	2025-04-14 07:24:10.507	2025-04-14 07:24:10.507
18	Historic Loft	Spacious loft in a converted historic building. Features exposed brick, high ceilings, and large windows. Located in a trendy neighborhood with great restaurants and shops.	1200000	404 Industrial Ave	San Francisco	CA	94107	USA	37.7749	-122.4194	\N	2	2	2000	condo	1920	f	["Exposed Brick", "High Ceilings", "Open Floor Plan", "Historic Building"]	["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"]	\N	1	sale	88	\N	8	2025-04-14 07:24:10.508	2025-04-14 07:24:10.508
19	Garden Cottage	Charming garden cottage with private outdoor space. Features updated kitchen and bathroom, hardwood floors, and plenty of natural light. Perfect for those seeking a peaceful retreat.	850000	505 Garden Way	San Francisco	CA	94117	USA	37.7749	-122.4194	\N	2	1	1200	house	1940	f	["Garden", "Hardwood Floors", "Updated Kitchen", "Private Outdoor Space"]	["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"]	3000	1	sale	85	\N	8	2025-04-14 07:24:10.509	2025-04-14 07:24:10.509
20	Modern Studio	Elegant studio apartment in a prime location. Features modern design, efficient layout, and access to building amenities. Perfect for urban living.	550000	606 Urban Ave	San Francisco	CA	94102	USA	37.7749	-122.4194	\N	0	1	600	apartment	2018	f	["Modern Design", "Efficient Layout", "Building Amenities", "Prime Location"]	["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"]	\N	0	sale	92	\N	8	2025-04-14 07:24:10.51	2025-04-14 07:24:10.51
21	Luxury Apartment	Sophisticated apartment in a prestigious building. Features high-end finishes, gourmet kitchen, and access to premium amenities including pool, spa, and fitness center.	1800000	707 Luxury Blvd	San Francisco	CA	94108	USA	37.7749	-122.4194	\N	3	3	2500	apartment	2019	t	["Pool", "Spa", "Fitness Center", "Gourmet Kitchen", "Concierge"]	["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"]	\N	2	sale	97	\N	8	2025-04-14 07:24:10.51	2025-04-14 07:24:10.51
\.


--
-- Data for Name: property_drafts; Type: TABLE DATA; Schema: public; Owner: melchor
--

COPY public.property_drafts (id, user_id, form_data, name, last_updated, created_at) FROM stdin;
4	8	{"price": 600000, "title": "New Property Draft", "description": "This is a draft property"}	Draft 1	2025-04-14 05:30:25.354	2025-04-14 05:30:25.354
5	9	{"price": 1200000, "title": "Luxury Property Draft", "description": "High-end property draft"}	Luxury Draft	2025-04-14 05:30:25.354	2025-04-14 05:30:25.354
\.


--
-- Data for Name: property_tours; Type: TABLE DATA; Schema: public; Owner: melchor
--

COPY public.property_tours (id, property_id, user_id, agent_id, tour_date, tour_time, duration, notes, status, tour_type, contact_phone, contact_email, additional_attendees, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: search_history; Type: TABLE DATA; Schema: public; Owner: melchor
--

COPY public.search_history (id, user_id, search_params, created_at) FROM stdin;
5	8	{"location": "San Francisco", "maxPrice": 1000000, "minPrice": 500000, "propertyType": "apartment"}	2025-04-14 05:30:25.353
6	8	{"location": "Marina District", "maxPrice": 1500000, "minPrice": 800000, "propertyType": "condo"}	2025-04-14 05:30:25.353
7	9	{"location": "Mission District", "maxPrice": 1200000, "minPrice": 700000, "propertyType": "house"}	2025-04-14 05:30:25.353
8	11	{"searchType": "text", "listingType": "buy", "propertyType": "house"}	2025-04-14 05:56:34.128
9	11	{"searchType": "text", "listingType": "buy"}	2025-04-14 07:21:08.01
10	11	{"searchType": "text"}	2025-04-14 07:21:08.007
11	11	{"searchType": "text"}	2025-04-14 07:29:14.704
12	11	{"location": "Barcelona, compra", "searchType": "text", "listingType": "buy"}	2025-04-14 07:29:14.734
13	11	{"searchType": "text"}	2025-04-14 07:44:32.984
14	11	{"searchType": "text", "listingType": "buy", "propertyType": "house"}	2025-04-14 12:50:45.724
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: melchor
--

COPY public.session (sid, sess, expire) FROM stdin;
4fdAHRgSvD3pevOriBeCaq0V0kqYRXmm	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-14T05:56:22.590Z","secure":false,"httpOnly":true,"path":"/"},"passport":{"user":11}}	2025-05-14 13:54:31
Ie-VcitKMl1hT1SLhUbKTnk0LFasCJ2O	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-14T08:13:26.166Z","secure":false,"httpOnly":true,"path":"/"},"passport":{"user":11}}	2025-05-14 15:43:42
\.


--
-- Data for Name: suggested_questions; Type: TABLE DATA; Schema: public; Owner: melchor
--

COPY public.suggested_questions (id, question, category, property_type, is_general_question, display_order, click_count, is_active, created_at, updated_at) FROM stdin;
7	What is the average price in this neighborhood?	pricing	\N	t	1	0	t	2025-04-14 05:30:25.355	2025-04-14 05:30:25.355
8	How safe is this area?	safety	\N	t	2	0	t	2025-04-14 05:30:25.355	2025-04-14 05:30:25.355
9	What are the nearby schools?	education	\N	t	3	0	t	2025-04-14 05:30:25.355	2025-04-14 05:30:25.355
10	What is the walkability score?	transportation	\N	t	4	0	t	2025-04-14 05:30:25.355	2025-04-14 05:30:25.355
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: melchor
--

COPY public.users (id, username, password, email, full_name, role, subscription_tier, subscription_expires_at, profile_image, bio, phone, preferred_language, is_verified, verification_date, verified_by, passkey, passkey_enabled, has_id_verification, id_verification_type, id_verification_date, id_verification_status, id_verification_notes, created_at, updated_at) FROM stdin;
8	testuser	password123	test@example.com	Test User	user	free	\N	\N	\N	\N	en-GB	t	\N	\N	\N	f	f	\N	\N	none	\N	2025-04-14 05:30:25.344	2025-04-14 05:30:25.344
9	agent1	agent123	agent@example.com	Real Estate Agent	agent	premium	\N	\N	\N	\N	en-GB	t	\N	\N	\N	f	f	\N	\N	none	\N	2025-04-14 05:30:25.344	2025-04-14 05:30:25.344
10	admin	admin123	admin@example.com	System Admin	admin	enterprise	\N	\N	\N	\N	en-GB	t	\N	\N	\N	f	f	\N	\N	none	\N	2025-04-14 05:30:25.344	2025-04-14 05:30:25.344
11	kaufast_395	365cc4525f3149105546dc0c97e4e6f04cb0cd9fcb79130dc9dd34d7321c9979beb60a5dc89925c200ee2008a845dc3cd7734e8fed2fdfde1602d87872a4102a.ae01e66c389a2906fe9dfe1d7f9a1444	kaufast@gmail.com	Red Kaufast	user	free	\N	https://lh3.googleusercontent.com/a/ACg8ocKD-xBvHlJ7ttr8MyGBrUYpDSCFpsbA9RGBzKrCvjHsezpHlA=s96-c	\N	\N	en-GB	f	\N	\N	\N	f	f	\N	\N	none	\N	2025-04-14 07:56:22.579426	2025-04-14 08:13:26.04
\.


--
-- Name: chat_analytics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: melchor
--

SELECT pg_catalog.setval('public.chat_analytics_id_seq', 1, false);


--
-- Name: favorites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: melchor
--

SELECT pg_catalog.setval('public.favorites_id_seq', 7, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: melchor
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- Name: neighborhoods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: melchor
--

SELECT pg_catalog.setval('public.neighborhoods_id_seq', 10, true);


--
-- Name: properties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: melchor
--

SELECT pg_catalog.setval('public.properties_id_seq', 21, true);


--
-- Name: property_drafts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: melchor
--

SELECT pg_catalog.setval('public.property_drafts_id_seq', 5, true);


--
-- Name: property_tours_id_seq; Type: SEQUENCE SET; Schema: public; Owner: melchor
--

SELECT pg_catalog.setval('public.property_tours_id_seq', 1, false);


--
-- Name: search_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: melchor
--

SELECT pg_catalog.setval('public.search_history_id_seq', 14, true);


--
-- Name: suggested_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: melchor
--

SELECT pg_catalog.setval('public.suggested_questions_id_seq', 10, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: melchor
--

SELECT pg_catalog.setval('public.users_id_seq', 12, true);


--
-- Name: chat_analytics chat_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.chat_analytics
    ADD CONSTRAINT chat_analytics_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: neighborhoods neighborhoods_pkey; Type: CONSTRAINT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.neighborhoods
    ADD CONSTRAINT neighborhoods_pkey PRIMARY KEY (id);


--
-- Name: properties properties_pkey; Type: CONSTRAINT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_pkey PRIMARY KEY (id);


--
-- Name: property_drafts property_drafts_pkey; Type: CONSTRAINT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.property_drafts
    ADD CONSTRAINT property_drafts_pkey PRIMARY KEY (id);


--
-- Name: property_tours property_tours_pkey; Type: CONSTRAINT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.property_tours
    ADD CONSTRAINT property_tours_pkey PRIMARY KEY (id);


--
-- Name: search_history search_history_pkey; Type: CONSTRAINT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.search_history
    ADD CONSTRAINT search_history_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: suggested_questions suggested_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.suggested_questions
    ADD CONSTRAINT suggested_questions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: melchor
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: chat_analytics chat_analytics_property_id_properties_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.chat_analytics
    ADD CONSTRAINT chat_analytics_property_id_properties_id_fk FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE SET NULL;


--
-- Name: chat_analytics chat_analytics_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.chat_analytics
    ADD CONSTRAINT chat_analytics_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: favorites favorites_property_id_properties_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_property_id_properties_id_fk FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: favorites favorites_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: messages messages_property_id_properties_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_property_id_properties_id_fk FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: messages messages_recipient_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_recipient_id_users_id_fk FOREIGN KEY (recipient_id) REFERENCES public.users(id);


--
-- Name: messages messages_sender_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_users_id_fk FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: properties properties_neighborhood_id_neighborhoods_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_neighborhood_id_neighborhoods_id_fk FOREIGN KEY (neighborhood_id) REFERENCES public.neighborhoods(id);


--
-- Name: properties properties_owner_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_owner_id_users_id_fk FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: property_drafts property_drafts_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.property_drafts
    ADD CONSTRAINT property_drafts_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: property_tours property_tours_agent_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.property_tours
    ADD CONSTRAINT property_tours_agent_id_users_id_fk FOREIGN KEY (agent_id) REFERENCES public.users(id);


--
-- Name: property_tours property_tours_property_id_properties_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.property_tours
    ADD CONSTRAINT property_tours_property_id_properties_id_fk FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: property_tours property_tours_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.property_tours
    ADD CONSTRAINT property_tours_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: search_history search_history_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: melchor
--

ALTER TABLE ONLY public.search_history
    ADD CONSTRAINT search_history_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

