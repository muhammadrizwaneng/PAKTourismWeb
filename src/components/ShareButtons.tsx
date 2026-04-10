'use client';

import { useState } from 'react';
import { Share2, Link as LinkIcon, Twitter, MessageCircle, Check } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  url?: string;
}

export default function ShareButtons({ title, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(`${title} — PakTourism`);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold px-4 py-2 rounded-xl text-sm transition-all"
      >
        <Share2 size={15} />
        Share
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-full mt-2 z-20 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl p-2 min-w-[180px]">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors"
              onClick={() => setOpen(false)}
            >
              <MessageCircle size={16} className="text-green-500" />
              WhatsApp
            </a>

            {/* Twitter/X */}
            <a
              href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors"
              onClick={() => setOpen(false)}
            >
              <Twitter size={16} className="text-sky-500" />
              Twitter / X
            </a>

            {/* Copy Link */}
            <button
              type="button"
              onClick={handleCopy}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-primary-500" />
                  <span className="text-primary-600">Copied!</span>
                </>
              ) : (
                <>
                  <LinkIcon size={16} className="text-gray-400" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
