import { Metadata } from 'next';
import ChecklistPageClient from './ChecklistPageClient';

export const metadata: Metadata = {
  title: 'Travel Checklist — PakTourism',
  description: 'Never forget a thing. Use our Pakistan travel packing checklist.',
};

export default function ChecklistPage() {
  return <ChecklistPageClient />;
}
