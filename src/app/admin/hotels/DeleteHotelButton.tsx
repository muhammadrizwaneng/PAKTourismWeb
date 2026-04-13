'use client';

import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

export default function DeleteHotelButton({ id }: { id: number }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('Delete this hotel? This cannot be undone.')) return;

    const res = await fetch(`/api/admin/hotels/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data?.message || 'Failed to delete hotel.');
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
