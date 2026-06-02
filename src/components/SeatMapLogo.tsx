type SeatMapLogoProps = {
  className?: string;
};

export function SeatMapLogo({ className = "size-10" }: SeatMapLogoProps) {
  return (
    <img
      src="/brand/seatmap-logo.png"
      alt=""
      className={`${className} rounded-2xl object-cover shadow-brand`}
      aria-hidden
      draggable={false}
    />
  );
}
