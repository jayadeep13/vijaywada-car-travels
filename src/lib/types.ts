export type CarPricing = {
  car_id: string;
  day_12hr: number | null;
  day_24hr: number | null;
  day_fuel_km_per_litre: number | null;
  day_chauffeur_12hr: number | null;
  day_chauffeur_24hr: number | null;
  day_extra_hour: number | null;
  reg_4hr_40km: number | null;
  reg_8hr_80km: number | null;
  reg_extra_hour: number | null;
  reg_extra_km: number | null;
  out_per_km: number | null;
  out_chauffeur: number | null;
  out_min_km: number | null;
  out_notes: string | null;
};

export type CarImage = { id: string; car_id: string; url: string; alt: string | null; sort_order: number };

export type Car = {
  id: string;
  name: string;
  slug: string;
  category: string;
  seating_capacity: number;
  fuel_type: string | null;
  transmission: string | null;
  air_conditioned: boolean;
  description: string | null;
  features: string[];
  image_url: string | null;
  featured: boolean;
  active: boolean;
  display_order: number;
  updated_at?: string;
  car_pricing: CarPricing | null;
  car_images?: CarImage[];
};

export type Faq = { q: string; a: string };

export type Service = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string | null;
  steps: string[];
  faqs: Faq[];
  seo_title: string | null;
  seo_description: string | null;
  active: boolean;
  display_order: number;
  updated_at?: string;
};

export type Route = {
  id: string;
  slug: string;
  from_city: string;
  to_city: string;
  distance_km: number | null;
  duration: string | null;
  description: string | null;
  highlights: string[];
  faqs: Faq[];
  seo_title: string | null;
  seo_description: string | null;
  active: boolean;
  display_order: number;
  updated_at?: string;
};

export type Location = { id: string; name: string; slug: string; description: string | null; active: boolean; display_order: number };

export type Announcement = {
  id: string;
  title: string;
  description: string | null;
  cta_text: string | null;
  cta_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  active: boolean;
  created_at: string;
};

export type PosterFrequency = "session" | "hours" | "every_visit";

export type Poster = {
  id: string;
  title: string;
  image_url: string;
  cta_text: string | null;
  cta_url: string | null;
  placement: "home" | "all";
  frequency: PosterFrequency;
  frequency_hours: number;
  starts_at: string | null;
  ends_at: string | null;
  active: boolean;
  created_at: string;
};

export const ENQUIRY_STATUSES = ["new", "contacted", "confirmed", "completed", "cancelled"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export type Enquiry = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  car_id: string | null;
  vehicle_name: string | null;
  service_type: string;
  pickup: string;
  destination: string | null;
  travel_date: string | null;
  pickup_time: string | null;
  passengers: number | null;
  message: string | null;
  status: EnquiryStatus;
  is_read: boolean;
  admin_notes: string | null;
  created_at: string;
};

export type Review = {
  id: string;
  customer_name: string;
  review: string;
  rating: number;
  review_date: string | null;
  photo_url: string | null;
  published: boolean;
};

export type SiteSettings = {
  company_name: string;
  tagline: string | null;
  phone: string | null;
  whatsapp: string | null;
  /** Second call number, shown next to the main phone */
  alt_phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  maps_url: string | null;
  maps_embed_url: string | null;
  google_business_url: string | null;
  business_hours: string | null;
  hero_image_url: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  social_links: Record<string, string>;
  seo_title: string | null;
  seo_description: string | null;
  ga_id: string | null;
  gsc_verification: string | null;
  footer_text: string | null;
};

export const SERVICE_TYPES = [
  { value: "local", label: "Local rental" },
  { value: "outstation-oneway", label: "Outstation, one way" },
  { value: "outstation-round", label: "Outstation, round trip" },
  { value: "airport", label: "Airport transfer" },
  { value: "corporate", label: "Corporate travel" },
] as const;
