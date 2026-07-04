import Link from 'next/link';
import Image from 'next/image';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="absolute top-6 left-6 md:top-8 md:left-8 z-50">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
            <Image 
              src="/logo.png" 
              alt="Ligital Logo" 
              width={48} 
              height={48} 
              className="object-contain p-1"
            />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight hidden sm:block">Ligital</span>
        </Link>
      </div>
      {children}
    </>
  );
}
