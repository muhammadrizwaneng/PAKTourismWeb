import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError, slugify, toJson } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { destinations, attractions, hotels, packages, guides, taxonomies } = body;

    let importedCount = 0;

    // 1. Import Taxonomies first
    if (taxonomies) {
      for (const tax of taxonomies) {
        await prisma.taxonomy.upsert({
          where: { id: tax.id },
          update: { name: tax.name, type: tax.type },
          create: { id: tax.id, name: tax.name, type: tax.type },
        });
        importedCount++;
      }
    }

    // 2. Import Destinations
    if (destinations) {
      for (const dest of destinations) {
        await prisma.destination.upsert({
          where: { slug: dest.slug || slugify(dest.title) },
          update: {
             title: dest.title,
             description: dest.description,
             city: dest.city,
             province: dest.province,
             bestTime: dest.best_time,
             latitude: dest.latitude ? parseFloat(dest.latitude) : null,
             longitude: dest.longitude ? parseFloat(dest.longitude) : null,
             featuredImage: dest.featured_image,
             galleryImages: toJson(dest.gallery_images || []),
             taxonomyId: dest.taxonomy_id,
          },
          create: {
             title: dest.title,
             slug: dest.slug || slugify(dest.title),
             description: dest.description,
             city: dest.city,
             province: dest.province,
             bestTime: dest.best_time,
             latitude: dest.latitude ? parseFloat(dest.latitude) : null,
             longitude: dest.longitude ? parseFloat(dest.longitude) : null,
             featuredImage: dest.featured_image,
             galleryImages: toJson(dest.gallery_images || []),
             taxonomyId: dest.taxonomy_id,
          }
        });
        importedCount++;
      }
    }

    // 3. Import Attractions
    if (attractions) {
      for (const attr of attractions) {
         await prisma.attraction.upsert({
            where: { slug: attr.slug || slugify(attr.title) },
            update: {
                title: attr.title,
                description: attr.description,
                destinationId: attr.destination_id,
                entryFee: attr.entry_fee,
                timings: attr.timings,
                gallery: toJson(attr.gallery || []),
                taxonomyId: attr.taxonomy_id,
            },
            create: {
                title: attr.title,
                slug: attr.slug || slugify(attr.title),
                description: attr.description,
                destinationId: attr.destination_id,
                entryFee: attr.entry_fee,
                timings: attr.timings,
                gallery: toJson(attr.gallery || []),
                taxonomyId: attr.taxonomy_id,
            }
         });
         importedCount++;
      }
    }

    // 4. Import Hotels
    if (hotels) {
      for (const hotel of hotels) {
        await prisma.hotel.upsert({
          where: { slug: hotel.slug || slugify(hotel.title) },
          update: {
            title: hotel.title,
            description: hotel.description,
            destinationId: hotel.destination_id,
            address: hotel.address,
            starRating: hotel.star_rating,
            phone: hotel.phone,
            email: hotel.email,
            website: hotel.website,
            whatsapp: hotel.whatsapp,
            priceRange: hotel.price_range,
            gallery: toJson(hotel.gallery || []),
          },
          create: {
            title: hotel.title,
            slug: hotel.slug || slugify(hotel.title),
            description: hotel.description,
            destinationId: hotel.destination_id,
            address: hotel.address,
            starRating: hotel.star_rating,
            phone: hotel.phone,
            email: hotel.email,
            website: hotel.website,
            whatsapp: hotel.whatsapp,
            priceRange: hotel.price_range,
            gallery: toJson(hotel.gallery || []),
          }
        });
        importedCount++;
      }
    }

    // 5. Import Packages
    if (packages) {
      for (const pkg of packages) {
        await prisma.tourPackage.upsert({
          where: { slug: pkg.slug || slugify(pkg.title) },
          update: {
            title: pkg.title,
            description: pkg.description,
            destinationId: pkg.destination_id,
            price: pkg.price,
            durationDays: pkg.duration_days,
            maxPeople: pkg.max_people,
            featuredImage: pkg.featured_image,
            gallery: toJson(pkg.gallery || []),
            includes: toJson(pkg.includes || []),
            excludes: toJson(pkg.excludes || []),
            isFeatured: pkg.is_featured,
          },
          create: {
            title: pkg.title,
            slug: pkg.slug || slugify(pkg.title),
            description: pkg.description,
            destinationId: pkg.destination_id,
            price: pkg.price,
            durationDays: pkg.duration_days,
            maxPeople: pkg.max_people,
            featuredImage: pkg.featured_image,
            gallery: toJson(pkg.gallery || []),
            includes: toJson(pkg.includes || []),
            excludes: toJson(pkg.excludes || []),
            isFeatured: pkg.is_featured,
          }
        });
        importedCount++;
      }
    }

    // 6. Import Guides
    if (guides) {
      for (const guide of guides) {
        await prisma.tourGuide.upsert({
          where: { slug: guide.slug || slugify(guide.name) },
          update: {
            name: guide.name,
            description: guide.description,
            photo: guide.photo,
            phone: guide.phone,
            email: guide.email,
            whatsapp: guide.whatsapp,
            languages: toJson(guide.languages || []),
            rating: guide.rating,
          },
          create: {
            name: guide.name,
            slug: guide.slug || slugify(guide.name),
            description: guide.description,
            photo: guide.photo,
            phone: guide.phone,
            email: guide.email,
            whatsapp: guide.whatsapp,
            languages: toJson(guide.languages || []),
            rating: guide.rating,
          }
        });
        importedCount++;
      }
    }

    return NextResponse.json(apiSuccess({ importedCount, message: 'Import successful' }));
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json(apiError('Failed to import data: ' + error.message), { status: 500 });
  }
}
