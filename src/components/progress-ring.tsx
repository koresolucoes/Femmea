import { DropletIcon } from "@/components/icons";

export function ProgressRing({ value = 50 }: { value?: number }) {
  const normalized = Math.max(0, Math.min(100, value));
  return (
    <div className="progress-ring" style={{ ["--progress" as string]: `${normalized * 3.6}deg` }}>
      <div className="progress-ring-inner">
        <DropletIcon className="water-icon" />
        <strong>{normalized}%</strong>
      </div>
    </div>
  );
}
