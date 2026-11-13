// Clara, the mascot. Two candidates while Laura decides: the ghost and the comma.
// Pick with ?clara=ghost | ?clara=comma (default comma).
export type Mood = "smirk" | "wow" | "soft";

export function mascotKind(): "ghost" | "comma" {
  if (typeof location === "undefined") return "ghost";
  return new URLSearchParams(location.search).get("clara") === "ghost" ? "ghost" : "comma";
}

const INK = "#071626";

function Eyes({ cx1, cx2, cy, mood }: { cx1: number; cx2: number; cy: number; mood: Mood }) {
  const r = mood === "wow" ? 15 : 13;
  const look = mood === "soft" ? 0 : 5;            // side-eye: pupils look right
  return (
    <g>
      <circle cx={cx1} cy={cy} r={r} fill="#fff" stroke={INK} strokeWidth="5" />
      <circle cx={cx2} cy={cy - 3} r={r + 1} fill="#fff" stroke={INK} strokeWidth="5" />
      <g className="rp-blink">
        <circle cx={cx1 + look} cy={cy + 1} r={mood === "wow" ? 5 : 6.5} fill={INK} />
        <circle cx={cx2 + look} cy={cy - 2} r={mood === "wow" ? 5 : 6.5} fill={INK} />
      </g>
      {/* raised eyebrow on the right, flat on the left */}
      <path d={`M${cx1 - 13} ${cy - 24}q12 ${mood === "soft" ? -6 : 2} 24 -2`} fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <path d={`M${cx2 - 12} ${cy - 30}q12 ${mood === "wow" ? -14 : -10} 24 -4`} fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
    </g>
  );
}

function Mouth({ x, y, mood }: { x: number; y: number; mood: Mood }) {
  if (mood === "wow") return <ellipse cx={x + 6} cy={y + 2} rx="6" ry="8" fill={INK} />;
  if (mood === "soft") return <path d={`M${x - 10} ${y}q12 10 24 0`} fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />;
  return <path d={`M${x - 8} ${y + 2}q14 6 24 -8`} fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />;
}

export function Ghost({ mood = "smirk", size = 40 }: { mood?: Mood; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true" className="rp-mascot">
      <path d="M50 180L50 95C50 50 75 22 102 22C130 22 154 50 154 95L154 112C166 98 182 94 186 104C190 114 174 128 154 140L154 180Q145 168 136 180Q127 192 118 180Q110 168 102 180Q94 192 86 180Q77 168 68 180Q59 192 50 180Z"
        fill="#fff" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      <Eyes cx1={84} cx2={124} cy={92} mood={mood} />
      <Mouth x={104} y={134} mood={mood} />
    </svg>
  );
}

/** Clara as a comma: round head, tail curling down-left, half-lidded "mmm… I see" eyes. */
export function Comma({ mood = "smirk", size = 40 }: { mood?: Mood; size?: number }) {
  const S = { fill: "none", stroke: INK, strokeWidth: 7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const wow = mood === "wow", soft = mood === "soft";
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true" className="rp-mascot">
      <path d="M104 12C152 12 186 46 186 92C186 140 154 176 96 192C72 198 44 196 34 192C28 190 30 182 36 180C60 174 74 166 84 156C46 150 18 122 18 86C18 44 56 12 104 12Z"
        fill="#42c5ca" stroke={INK} strokeWidth="7" strokeLinejoin="round" />
      {wow ? (
        <g>
          <path d="M58 58q14 -12 30 -6" {...S} /><path d="M114 50q16 -12 32 -2" {...S} />
          <circle cx="74" cy="80" r="9" fill={INK} /><circle cx="130" cy="76" r="9" fill={INK} />
          <ellipse cx="104" cy="118" rx="8" ry="10" fill={INK} />
        </g>
      ) : soft ? (
        <g>
          <path d="M58 62q14 -8 30 -4" {...S} /><path d="M116 58q16 -8 30 -2" {...S} />
          <path d="M60 84q12 -10 26 0" {...S} /><path d="M118 80q12 -10 26 0" {...S} />
          <path d="M86 108q16 14 34 0" {...S} />
        </g>
      ) : (
        <g>
          {/* simple and sweet: solid oval eyes with a sparkle, soft smile, blush. No hand. */}
          <path d="M60 60q12 -7 24 -3" {...S} strokeWidth={6} /><path d="M120 56q12 -7 24 -1" {...S} strokeWidth={6} />
          <g className="rp-blink">
            <ellipse cx="74" cy="84" rx="9" ry="12" fill={INK} /><ellipse cx="130" cy="80" rx="9" ry="12" fill={INK} />
            <circle cx="77" cy="79" r="3.2" fill="#fff" /><circle cx="133" cy="75" r="3.2" fill="#fff" />
          </g>
          <path d="M88 108q14 12 28 0" {...S} strokeWidth={6} />
          <ellipse cx="56" cy="106" rx="10" ry="6" fill="#ff8b45" opacity=".5" /><ellipse cx="150" cy="102" rx="10" ry="6" fill="#ff8b45" opacity=".5" />
        </g>
      )}
    </svg>
  );
}

export function Clara(props: { mood?: Mood; size?: number }) {
  return mascotKind() === "comma" ? <Comma {...props} /> : <Ghost {...props} />;
}
