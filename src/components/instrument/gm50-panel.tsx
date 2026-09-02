import { formatDms } from "@/lib/survey/angles";
import type { LaserHit } from "@/lib/survey/site-scene";
import type { Units } from "@/lib/survey/types";
import { UNIT_LABEL } from "@/lib/survey/units";
import { cn } from "@/lib/utils";

interface Props {
  v: number;
  hr: number;
  sd: number | null;
  hd: number | null;
  distMode: "sd" | "hd";
  prism: boolean;
  held: boolean;
  measuring: boolean;
  units: Units;
  levelOk: boolean;
  hit: LaserHit | null;
  onMeas: () => void;
  onToggleDist: () => void;
  onZero: () => void;
  onHold: () => void;
  onBs: () => void;
  onEnter: () => void;
  enterDisabled?: boolean;
}

export function Gm50Panel({
  v,
  hr,
  sd,
  hd,
  distMode,
  prism,
  held,
  measuring,
  units,
  levelOk,
  hit,
  onMeas,
  onToggleDist,
  onZero,
  onHold,
  onBs,
  onEnter,
  enterDisabled,
}: Props) {
  const u = UNIT_LABEL[units];
  const shown = distMode === "hd" ? hd : sd;
  const tag = distMode === "hd" ? "HD" : "SD";
  const star = measuring || (shown != null && !held) ? "*" : " ";
  const mode = prism ? "P" : "NP";

  return (
    <div className="border-t border-[#1a1c1b] bg-[#141618] px-2 pt-1.5 pb-1.5">
      <div
        className="rounded-[2px] border-2 border-[#3a3d38] px-3 py-1.5 font-mono"
        style={{
          background: "linear-gradient(#2c332c, #232824)",
          boxShadow: "inset 0 0 0 1px #4a5248, inset 0 8px 18px rgba(0,0,0,0.35)",
        }}
      >
        <LcdLine k="V" v={formatDms(v, 0)} />
        <LcdLine k="HR" v={formatDms(hr, 0)} />
        <div className="flex items-baseline justify-between text-[15px] leading-tight text-[#d7e6d4]">
          <span>
            {tag}
            {star} {shown != null && shown > 0 ? shown.toFixed(3) : "———.---"} {u}
          </span>
          {!levelOk ? <span className="text-[10px] text-[#d07a6a]">TILT</span> : null}
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] tracking-wide text-[#a8b8a6]">
          <span>MEAS MODE {mode}</span>
          <span>
            {prism ? "P↓" : "NP"}
            {hit ? `  ${hit.label}` : ""}
            {held ? "  HOLD" : ""}
          </span>
        </div>
        <div className="mt-1 grid grid-cols-4 gap-1 text-center text-[10px] tracking-wide text-[#c4d4c2]">
          <span>MEAS</span>
          <span>HD/SD</span>
          <span>0SET</span>
          <span>HOLD</span>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-4 gap-1">
        <SoftKey label="F1" onClick={onMeas} />
        <SoftKey label="F2" onClick={onToggleDist} />
        <SoftKey label="F3" onClick={onZero} />
        <SoftKey label="F4" onClick={onHold} active={held} />
      </div>
      <div className="mt-1 grid grid-cols-4 gap-1">
        <HardKey label="ESC" />
        <HardKey label="B.S." accent="yellow" onClick={onBs} />
        <HardKey label="FUNC" />
        <HardKey label="STORE" accent="cyan" onClick={onEnter} disabled={enterDisabled} />
      </div>
    </div>
  );
}

function LcdLine({ k, v }: { k: string; v: string }) {
  return (
    <p className="flex items-baseline gap-2 text-[15px] leading-tight text-[#d7e6d4] tabular-nums">
      <span className="w-7 text-[#9aab98]">{k}</span>
      <span>:</span>
      <span>{v}</span>
    </p>
  );
}

function SoftKey({ label, onClick, active }: { label: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 rounded-sm border text-[11px] font-semibold tracking-wide outline-none select-none",
        "[-webkit-tap-highlight-color:transparent]",
        active
          ? "border-[#8a6a18] bg-[#f0c040] text-[#2a2208]"
          : "border-[#6a5a18] bg-[#d4a428] text-[#2a2208]",
      )}
    >
      {label}
    </button>
  );
}

function HardKey({
  label,
  onClick,
  accent,
  disabled,
}: {
  label: string;
  onClick?: () => void;
  accent?: "yellow" | "cyan";
  disabled?: boolean;
}) {
  const cls =
    accent === "cyan"
      ? "border-[#1a7a88] bg-[#2eb8d4] text-[#062026]"
      : accent === "yellow"
        ? "border-[#6a5a18] bg-[#d4a428] text-[#2a2208]"
        : "border-[#3a3e3c] bg-[#2a2e2c] text-[#d0d4d0]";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-9 rounded-sm border text-[11px] font-semibold tracking-wide outline-none select-none disabled:opacity-40",
        "[-webkit-tap-highlight-color:transparent]",
        cls,
      )}
    >
      {label}
    </button>
  );
}
