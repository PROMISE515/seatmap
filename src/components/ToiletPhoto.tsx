import { useState } from "react";
import { Toilet } from "lucide-react";

const GRADIENTS = [
  "from-sky-400 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
  "from-violet-400 to-purple-500",
  "from-cyan-400 to-blue-500",
];

function pickGradient(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

type Props = {
  src?: string | null;
  seed: string;
  alt: string;
  className?: string;
  iconClassName?: string;
};

export function ToiletPhoto({ src, seed, alt, className, iconClassName }: Props) {
  const isRealPhoto = !!src && !src.endsWith("/placeholder.svg");
  const [broken, setBroken] = useState(false);

  if (!isRealPhoto || broken) {
    return (
      <div
        className={`bg-gradient-to-br ${pickGradient(seed)} flex items-center justify-center text-white/90 ${className ?? ""}`}
        aria-label={alt}
        role="img"
      >
        <Toilet className={iconClassName ?? "size-8"} aria-hidden />
      </div>
    );
  }

  return (
    <img
      src={src!}
      alt={alt}
      loading="lazy"
      className={`object-cover ${className ?? ""}`}
      onError={() => setBroken(true)}
    />
  );
}
