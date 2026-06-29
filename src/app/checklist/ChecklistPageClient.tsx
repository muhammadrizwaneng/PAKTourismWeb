'use client';

import { useState, useEffect } from 'react';
import { CheckSquare, Square, Plus, Trash2, RotateCcw, Luggage } from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  category: string;
}

const DEFAULT_ITEMS: ChecklistItem[] = [
  // Documents
  { id: 'd1', text: 'CNIC / Passport', checked: false, category: 'Documents' },
  { id: 'd2', text: 'Vehicle registration (if driving)', checked: false, category: 'Documents' },
  { id: 'd3', text: 'Hotel & package booking confirmations', checked: false, category: 'Documents' },
  { id: 'd4', text: 'Emergency contact list (printed)', checked: false, category: 'Documents' },
  // Clothing
  { id: 'c1', text: 'Warm jacket / fleece (for northern areas)', checked: false, category: 'Clothing' },
  { id: 'c2', text: 'Comfortable trekking shoes', checked: false, category: 'Clothing' },
  { id: 'c3', text: 'Rain poncho / waterproof cover', checked: false, category: 'Clothing' },
  { id: 'c4', text: 'Sun hat / cap', checked: false, category: 'Clothing' },
  { id: 'c5', text: 'Sunglasses (UV protected)', checked: false, category: 'Clothing' },
  // Health & Safety
  { id: 'h1', text: 'First aid kit', checked: false, category: 'Health & Safety' },
  { id: 'h2', text: 'Altitude sickness medicine (Diamox)', checked: false, category: 'Health & Safety' },
  { id: 'h3', text: 'Sunscreen SPF 50+', checked: false, category: 'Health & Safety' },
  { id: 'h4', text: 'Insect repellent', checked: false, category: 'Health & Safety' },
  { id: 'h5', text: 'Personal medications', checked: false, category: 'Health & Safety' },
  { id: 'h6', text: 'Water purification tablets', checked: false, category: 'Health & Safety' },
  // Tech & Gear
  { id: 't1', text: 'Power bank (large capacity)', checked: false, category: 'Tech & Gear' },
  { id: 't2', text: 'Universal charger & adapters', checked: false, category: 'Tech & Gear' },
  { id: 't3', text: 'Camera / extra memory cards', checked: false, category: 'Tech & Gear' },
  { id: 't4', text: 'Offline maps downloaded', checked: false, category: 'Tech & Gear' },
  { id: 't5', text: 'Offline PAKEZY bookmarks saved', checked: false, category: 'Tech & Gear' },
  // Food & Water
  { id: 'f1', text: 'Reusable water bottle (2L minimum)', checked: false, category: 'Food & Water' },
  { id: 'f2', text: 'High-energy snacks (nuts, bars)', checked: false, category: 'Food & Water' },
  { id: 'f3', text: 'Thermos for hot drinks (northern areas)', checked: false, category: 'Food & Water' },
  // Miscellaneous
  { id: 'm1', text: 'Pakistani Rupees cash (ATMs scarce in remote areas)', checked: false, category: 'Miscellaneous' },
  { id: 'm2', text: 'Torch / headlamp + spare batteries', checked: false, category: 'Miscellaneous' },
  { id: 'm3', text: 'Tipping budget for guides & staff', checked: false, category: 'Miscellaneous' },
  { id: 'm4', text: 'Prayer mat (if needed)', checked: false, category: 'Miscellaneous' },
];

const CATEGORIES = Array.from(new Set(DEFAULT_ITEMS.map((i) => i.category)));
const STORAGE_KEY = 'paktourism_checklist';

export default function ChecklistPageClient() {
  const [items, setItems] = useState<ChecklistItem[]>(DEFAULT_ITEMS);
  const [newText, setNewText] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  const save = (next: ChecklistItem[]) => {
    setItems(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const toggle = (id: string) =>
    save(items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));

  const remove = (id: string) => save(items.filter((i) => i.id !== id));

  const addItem = () => {
    const text = newText.trim();
    if (!text) return;
    const item: ChecklistItem = {
      id: `custom-${Date.now()}`,
      text,
      checked: false,
      category: 'Miscellaneous',
    };
    save([...items, item]);
    setNewText('');
  };

  const reset = () => save(DEFAULT_ITEMS);

  const checked = items.filter((i) => i.checked).length;
  const percent = Math.round((checked / items.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-28 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center">
              <Luggage size={22} className="text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">Travel Checklist</h1>
              <p className="text-gray-400 text-sm">{checked}/{items.length} packed</p>
            </div>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-2 text-gray-400 hover:text-primary-600 text-xs font-semibold transition-colors pt-1"
          >
            <RotateCcw size={13} /> Reset
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span className="text-gray-500">Progress</span>
            <span className="text-primary-600">{percent}%</span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          {percent === 100 && (
            <p className="text-center text-green-600 font-bold text-sm mt-3">
              You&apos;re all packed! Have a great trip! 🎉
            </p>
          )}
        </div>

        {/* Items by category */}
        {hydrated && CATEGORIES.map((category) => {
          const catItems = items.filter((i) => i.category === category);
          if (catItems.length === 0) return null;
          return (
            <div key={category} className="mb-6">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
                {category}
              </h2>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden divide-y divide-gray-50 dark:divide-gray-800">
                {catItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      className="shrink-0 text-primary-500 hover:text-primary-600 transition-colors"
                    >
                      {item.checked
                        ? <CheckSquare size={20} className="fill-primary-500 text-white" />
                        : <Square size={20} className="text-gray-300" />
                      }
                    </button>
                    <span className={`flex-1 text-sm font-medium transition-colors ${item.checked ? 'line-through text-gray-300 dark:text-gray-600' : 'text-gray-800 dark:text-gray-200'}`}>
                      {item.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Custom item */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex gap-3 mt-4">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder="Add a custom item…"
            className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={addItem}
            className="shrink-0 bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-xl transition-colors active:scale-95"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
