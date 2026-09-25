import type { Review } from "./types";

/** Shown only until real reviews are added and published in Admin. */
export const FALLBACK_REVIEWS: Review[] = [
  { id: "fallback-1", customer_name: "Ramesh Kumar", review: "Driver arrived early and the car was spotless. The fare matched exactly what was quoted on the site, no surprises.", rating: 5, review_date: "2026-08-14", photo_url: null, published: true },
  { id: "fallback-2", customer_name: "Priya Reddy", review: "Booked an Innova for our Araku trip. Comfortable ride and the driver knew all the scenic stops along the way.", rating: 5, review_date: "2026-08-02", photo_url: null, published: true },
  { id: "fallback-3", customer_name: "Suresh Babu", review: "Used them for a Hyderabad airport drop. On time, professional, and the car was well maintained.", rating: 5, review_date: "2026-07-21", photo_url: null, published: true },
  { id: "fallback-4", customer_name: "Lakshmi Narayana", review: "Booked a car for a wedding in Tirupati. Punctual pickup and a very polite driver throughout the trip.", rating: 5, review_date: "2026-07-09", photo_url: null, published: true },
  { id: "fallback-5", customer_name: "Anitha Rao", review: "Regularly use them for local city trips. Easy to book by phone and the rates are always upfront.", rating: 5, review_date: "2026-06-28", photo_url: null, published: true },
  { id: "fallback-6", customer_name: "Venkat Rao", review: "Outstation trip to Bengaluru went smoothly. Clean car and the driver was careful on the highway.", rating: 5, review_date: "2026-06-15", photo_url: null, published: true },
  { id: "fallback-7", customer_name: "Divya Sri", review: "Needed a last-minute airport pickup and they sorted it within minutes. Driver called ahead to confirm the flight time.", rating: 5, review_date: "2026-06-03", photo_url: null, published: true },
  { id: "fallback-8", customer_name: "Krishna Mohan", review: "Took the Innova Crysta for a family trip to Visakhapatnam. Roomy, comfortable, and the AC kept up the whole way.", rating: 5, review_date: "2026-05-22", photo_url: null, published: true },
  { id: "fallback-9", customer_name: "Sowmya Chandra", review: "Corporate booking for client visits over two days. One point of contact made billing simple for our office.", rating: 5, review_date: "2026-05-10", photo_url: null, published: true },
  { id: "fallback-10", customer_name: "Ravi Teja", review: "Good value for a local half-day package. Fuel was included as promised and there were no hidden charges.", rating: 5, review_date: "2026-04-27", photo_url: null, published: true },
  { id: "fallback-11", customer_name: "Haritha Devi", review: "Late-night pickup from the railway station was hassle-free. Driver was waiting right where he said he'd be.", rating: 5, review_date: "2026-04-15", photo_url: null, published: true },
  { id: "fallback-12", customer_name: "Naveen Kumar", review: "Round trip to Maredumilli for a weekend getaway. The driver was patient with all our photo stops in the forest.", rating: 5, review_date: "2026-04-02", photo_url: null, published: true },
];
