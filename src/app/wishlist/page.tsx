import { Metadata } from 'next';
import WishlistPageClient from './WishlistPageClient';

export const metadata: Metadata = {
  title: 'My Wishlist — PakTourism',
  description: 'Your saved destinations, packages, and hotels on PakTourism.',
};

export default function WishlistPage() {
  return <WishlistPageClient />;
}
