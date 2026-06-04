import { getTrigramVisual } from "@/data/gua";

export function TrigramIcon({ number, size = "md", showNature = true }: { number: number; size?: "sm" | "md" | "lg"; showNature?: boolean }) {
  const trigram = getTrigramVisual(number);
  const lineClass = size === "sm" ? "h-1.5" : size === "lg" ? "h-2.5" : "h-2";
  const gapClass = size === "sm" ? "gap-1.5" : "gap-2";
  const widthClass = size === "sm" ? "w-14" : size === "lg" ? "w-24" : "w-20";

  return (
    <div className="flex items-center gap-3">
      <div className={`grid ${gapClass}`} aria-label={`${trigram.name}卦图`}>
        {[...trigram.lines].reverse().map((isYang, index) => (
          <div key={`${number}-${index}`} className={`flex ${widthClass} items-center justify-between`}>
            {isYang ? (
              <span className={`${lineClass} block w-full rounded-full bg-yellow-100`} />
            ) : (
              <>
                <span className={`${lineClass} block w-[42%] rounded-full bg-yellow-100`} />
                <span className={`${lineClass} block w-[42%] rounded-full bg-yellow-100`} />
              </>
            )}
          </div>
        ))}
      </div>
      {showNature ? (
        <div className="min-w-0">
          <p className="text-lg font-semibold text-stone-100">{trigram.nature}</p>
          <p className="text-xs text-stone-500">{trigram.name} · {trigram.quality}</p>
        </div>
      ) : null}
    </div>
  );
}

export function HexagramIcon({ upperNumber, lowerNumber, compact = false }: { upperNumber: number; lowerNumber: number; compact?: boolean }) {
  const upper = getTrigramVisual(upperNumber);
  const lower = getTrigramVisual(lowerNumber);

  return (
    <div className="flex items-center gap-3">
      <div className="grid gap-1.5" aria-label={`${upper.name}上${lower.name}下卦图`}>
        {[...lower.lines, ...upper.lines].reverse().map((isYang, index) => (
          <div key={`${upperNumber}-${lowerNumber}-${index}`} className="flex w-16 items-center justify-between">
            {isYang ? (
              <span className="block h-1.5 w-full rounded-full bg-yellow-100" />
            ) : (
              <>
                <span className="block h-1.5 w-[42%] rounded-full bg-yellow-100" />
                <span className="block h-1.5 w-[42%] rounded-full bg-yellow-100" />
              </>
            )}
          </div>
        ))}
      </div>
      {!compact ? (
        <div>
          <p className="text-sm text-stone-400">上{upper.name}为{upper.nature}，下{lower.name}为{lower.nature}</p>
          <p className="text-xs text-stone-500">{upper.imageHint} {lower.imageHint}</p>
        </div>
      ) : null}
    </div>
  );
}
