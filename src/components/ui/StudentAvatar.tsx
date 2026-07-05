'use client';

import React from 'react';
import Image from 'next/image';

interface StudentAvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: { container: 'w-8 h-8', text: 'text-[10px]', imgSize: 32 },
  md: { container: 'w-9 h-9', text: 'text-xs', imgSize: 36 },
  lg: { container: 'w-16 h-16', text: 'text-xl', imgSize: 64 },
};

export default function StudentAvatar({ name, photoUrl, size = 'md' }: StudentAvatarProps) {
  const { container, text, imgSize } = sizeConfig[size];
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (photoUrl) {
    return (
      <div className={`${container} rounded-full overflow-hidden flex-shrink-0 relative`}>
        <Image
          src={photoUrl}
          alt={name}
          width={imgSize}
          height={imgSize}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div
      className={`${container} rounded-full bg-[#E8F5E9] text-[#1B5E20] font-bold ${text} flex items-center justify-center flex-shrink-0`}
    >
      {initials}
    </div>
  );
}
