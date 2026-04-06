'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { DEFAULT_TOURISM_IMAGE } from '@/lib/constants';

interface SafeImageProps extends ImageProps {
  fallback?: string;
}

export default function SafeImage({ src, fallback = DEFAULT_TOURISM_IMAGE, alt, ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => {
        if (imgSrc !== fallback) {
          setImgSrc(fallback);
        }
      }}
    />
  );
}
