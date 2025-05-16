'use client';

import Image from 'next/image';
import { useState } from 'react';

type ImageWithFallbackProps = {
  src: string;
  alt: string;
  fallbackSrc?: string;
  fill?: boolean;
  className?: string;
};

export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc = '/placeholder.jpg',
  fill = false,
  className = '',
  ...props
}: ImageWithFallbackProps & Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'>) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt || ''}
      fill={fill}
      className={className}
      onError={() => setImgSrc(fallbackSrc)}
      {...props}
    />
  );
} 