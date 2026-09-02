import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSurvey } from "@/lib/survey/store";
import { UNIT_NAME } from "@/lib/survey/units";

export function JobsSheet({ onClose }: { onClose: () => void }) {
  const jobs = useSurvey((s) => s.jobs);
  const current = useSurvey((s) => s.currentJobId);
  const selectJob = useSurvey((s) => s.selectJob);
  const createJob = useSurvey((s) => s.createJob);
  const deleteJob = useSurvey((s) => s.deleteJob);
  const renameJob = useSurvey((s) => s.renameJob);
  const [name, setName] = useState("");

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-muted uppercase">Field book</p>
          <h2 className="text-lg font-semibold">Jobs</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </header>
      <ul className="min-h-0 flex-1 overflow-y-auto">
        {jobs.map((j) => (
          <li key={j.id} className="flex items-center gap-2 border-b border-border px-4 py-3">
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={() => {
                selectJob(j.id);
                onClose();
              }}
            >
              <span className="block font-medium">{j.name}</span>
              <span className="text-xs text-muted">
                {j.points.length} pts · {UNIT_NAME[j.units]}
                {current === j.id ? " · open" : ""}
              </span>
            </button>
            <Button
              variant="subtle"
              size="sm"
              onClick={() => {
                const next = window.prompt("Rename job", j.name);
                if (next) renameJob(j.id, next);
              }}
            >
              Rename
            </Button>
            <Button variant="subtle" size="sm" onClick={() => deleteJob(j.id)}>
              Delete
            </Button>
          </li>
        ))}
      </ul>
      <form
        className="flex gap-2 border-t border-border p-4"
        onSubmit={(e) => {
          e.preventDefault();
          createJob(name.trim() || "New job");
          setName("");
          onClose();
        }}
      >
        <Input placeholder="New job name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button type="submit">Create</Button>
      </form>
    </div>
  );
}
