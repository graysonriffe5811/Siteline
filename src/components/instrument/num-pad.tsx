import { useState } from "react";
import { Button } from "@/components/ui/button";
import { parseAngle } from "@/lib/survey/angles";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onCommit: (n: number) => void;
  angle?: boolean;
}

export function NumPad({ label, value, onChange, onCommit, angle }: Props) {
  const [err, setErr] = useState<string | null>(null);

  function key(k: string) {
    setErr(null);
    if (k === "⌫") {
      onChange(value.slice(0, -1));
      return;
    }
    if (k === "C") {
      onChange("");
      return;
    }
    if (k === "±") {
      if (value.startsWith("-")) onChange(value.slice(1));
      else onChange("-" + value);
      return;
    }
    onChange(value + k);
  }

  function commit() {
    const n = angle ? parseAngle(value) : Number(value.replace(/,/g, ""));
    if (n == null || !Number.isFinite(n)) {
      setErr("Not a number");
      return;
    }
    onCommit(n);
  }

  const keys = ["7", "8", "9", "⌫", "4", "5", "6", "C", "1", "2", "3", "±", "0", ".", angle ? "°" : "00", "OK"];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium tracking-[0.14em] text-muted uppercase">{label}</span>
        {err ? <span className="text-xs text-hazard">{err}</span> : null}
      </div>
      <div className="rounded-md border border-border bg-bg px-3 py-3 font-mono text-2xl text-readout tabular-nums">
        {value || "0"}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {keys.map((k) => (
          <Button
            key={k}
            variant={k === "OK" ? "primary" : "ghost"}
            size="lg"
            className={cn("h-12 font-mono text-lg", k === "OK" && "col-span-1")}
            onClick={() => {
              if (k === "OK") commit();
              else if (k === "°") onChange(value + " ");
              else key(k);
            }}
          >
            {k === "00" ? "00" : k}
          </Button>
        ))}
      </div>
    </div>
  );
}
