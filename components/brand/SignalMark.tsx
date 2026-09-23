/** Official Afronomics Feed signal — seven bars, peak just right of centre. */
export function SignalMark({ className = "h-10 w-auto" }: { className?: string }) {
  const bars = [
    { x: 0, h: 14 },
    { x: 10, h: 28 },
    { x: 20, h: 42 },
    { x: 30, h: 50 },
    { x: 40, h: 56 },
    { x: 50, h: 40 },
    { x: 62, h: 16 },
  ];
  const width = 5;
  const floor = 56;

  return (
    <svg
      viewBox="0 0 67 56"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      {bars.map((bar) => (
        <rect key={bar.x} x={bar.x} y={floor - bar.h} width={width} height={bar.h} />
      ))}
    </svg>
  );
}
