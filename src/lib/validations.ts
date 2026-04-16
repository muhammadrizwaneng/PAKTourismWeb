import { z } from 'zod';

// ─── Destination ───────────────────────────────────────────────────────────
export const CreateDestinationSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  bestTime: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  featuredImage: z.string().url().optional().or(z.literal('')),
  galleryImages: z.array(z.string()).optional(),
  taxonomyId: z.number().int().optional(),
  isFeatured: z.boolean().optional(),
});

export const UpdateDestinationSchema = CreateDestinationSchema.partial();

// ─── Attraction ────────────────────────────────────────────────────────────
export const CreateAttractionSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  destinationId: z.number().int(),
  entryFee: z.string().optional(),
  timings: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  taxonomyId: z.number().int().optional(),
});

export const UpdateAttractionSchema = CreateAttractionSchema.partial();

// ─── Hotel ─────────────────────────────────────────────────────────────────
export const CreateHotelSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  destinationId: z.number().int(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  starRating: z.number().int().min(1).max(5).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  whatsapp: z.string().optional(),
  priceRange: z.string().optional(),
  gallery: z.array(z.string()).optional(),
});

export const UpdateHotelSchema = CreateHotelSchema.partial();

// ─── Tour Package ──────────────────────────────────────────────────────────
export const CreatePackageSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  destinationId: z.number().int(),
  price: z.number().positive(),
  durationDays: z.number().int().positive(),
  maxPeople: z.number().int().positive().optional(),
  featuredImage: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  includes: z.array(z.string()).optional(),
  excludes: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
});

export const UpdatePackageSchema = CreatePackageSchema.partial();

// ─── Booking ───────────────────────────────────────────────────────────────
export const CreateBookingSchema = z.object({
  packageId: z.number().int(),
  travelDate: z.string().datetime(),
  numPeople: z.number().int().positive(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  userId: z.string().optional(),
});

// ─── Review ────────────────────────────────────────────────────────────────
export const CreateReviewSchema = z.object({
  userName: z.string().min(2),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  destinationId: z.number().int().optional(),
  hotelId: z.number().int().optional(),
  packageId: z.number().int().optional(),
  userId: z.string().optional(),
}).refine(
  (d) => d.destinationId ?? d.hotelId ?? d.packageId,
  { message: 'A review must be linked to a destination, hotel, or package.' }
);

// ─── Tour Guide ────────────────────────────────────────────────────────────
export const CreateGuideSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  photo: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  whatsapp: z.string().optional(),
  languages: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
});

export const UpdateGuideSchema = CreateGuideSchema.partial();

// ─── Banner ────────────────────────────────────────────────────────────────
export const CreateBannerSchema = z.object({
  title: z.string().min(2),
  subtitle: z.string().optional(),
  imageUrl: z.string().url(),
  videoUrl: z.string().url().optional().or(z.literal('')),
  linkUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const UpdateBannerSchema = CreateBannerSchema.partial();

// ─── Taxonomy ──────────────────────────────────────────────────────────────
export const CreateTaxonomySchema = z.object({
  name: z.string().min(2),
  type: z.enum(['destination', 'attraction']),
});
