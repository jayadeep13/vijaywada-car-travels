import { Briefcase, Clapperboard, Clock, Flag, Heart, Landmark, Plane, Route as RouteIcon } from "lucide-react";

export const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "local-car-rental": Clock,
  "outstation-cabs": RouteIcon,
  "airport-transfer": Plane,
  "corporate-travel": Briefcase,
  "wedding-cars": Heart,
  "government-offices": Landmark,
  "cinema-shootings": Clapperboard,
  "protocol-duty": Flag,
};

export const FALLBACK_SERVICES = [
  { slug: "local-car-rental", title: "Local car rental", summary: "Hourly and full-day travel within Vijayawada." },
  { slug: "outstation-cabs", title: "Outstation cabs", summary: "One-way and round-trip journeys." },
  { slug: "airport-transfer", title: "Airport transfers", summary: "Pickup and drop services." },
  { slug: "corporate-travel", title: "Corporate travel", summary: "Reliable transportation for companies, executives and business travel." },
  { slug: "wedding-cars", title: "Wedding & event cars", summary: "Decorated cars and multiple vehicles for weddings and celebrations." },
  { slug: "government-offices", title: "Government offices", summary: "Scheduled cars for government departments and official duty." },
  { slug: "cinema-shootings", title: "Cinema shootings", summary: "Cars for film crews, unit movement and shoot schedules." },
  { slug: "protocol-duty", title: "Protocol duty", summary: "VIP escort and protocol vehicles for official visits and events." },
];
