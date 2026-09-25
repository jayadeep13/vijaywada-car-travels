import type { GlobeMarker } from "@/components/ui/3d-globe";

export const CITY_MARKERS: GlobeMarker[] = [
  { lat: 16.5062, lng: 80.648, label: "Vijayawada" },
  { lat: 17.385, lng: 78.4867, label: "Hyderabad" },
  { lat: 17.6868, lng: 83.2185, label: "Visakhapatnam" },
  { lat: 13.6288, lng: 79.4192, label: "Tirupati" },
  { lat: 13.0827, lng: 80.2707, label: "Chennai" },
  { lat: 12.9716, lng: 77.5946, label: "Bengaluru" },
];

export const SERVICE_CITIES = CITY_MARKERS.map((m) => m.label!);
