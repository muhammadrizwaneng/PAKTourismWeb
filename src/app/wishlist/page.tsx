import { Metadata } from 'next';
import WishlistPageClient from './WishlistPageClient';

export const metadata: Metadata = {
  title: 'My Wishlist — PAKEZY',
  description: 'Your saved destinations, packages, and hotels on PAKEZY.',
};

export default function WishlistPage() {
  return <WishlistPageClient />;
}
