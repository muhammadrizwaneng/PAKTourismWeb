'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DeleteDestinationButton({ id }: { id: number }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this destination? This action cannot be undone.')) {
      return;
    }

    const res = await fetch(`/api/destinations/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data?.error || 'Failed to delete destination.');
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="p-2.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
    >
      <Trash2 size={16} />
    </button>
  );
}
