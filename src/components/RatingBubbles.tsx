import React from 'react';

interface RatingBubblesProps {
  rating?: number;
  count?: number;
}

const RatingBubbles = ({ rating = 4.5, count = 1240 }: RatingBubblesProps) => {
  return (
    <div className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map((i) => {
        const full = i <= Math.floor(rating);
        const half = !full && i <= Math.ceil(rating) && rating % 1 !== 0;
        return (
          <div
            key={i}
            className={`w-3.5 h-3.5 rounded-full border border-primary-500 ${
              full ? 'bg-primary-500' : half ? 'relative overflow-hidden' : ''
            }`}
          >
            {half && <div className="absolute inset-0 bg-primary-500 w-1/2 h-full" />}
          </div>
        );
      })}
      {count > 0 && (
        <span className="ml-2 text-xs font-bold text-gray-900">
          {count.toLocaleString()} reviews
        </span>
      )}
    </div>
  );
};

export default RatingBubbles;
