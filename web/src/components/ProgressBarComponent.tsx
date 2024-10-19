import { useEffect, useState } from "react";

export function ProgressBarComponent({
  length,
}: { length: number; frozen?: boolean }) {
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [start, setStart] = useState(length);

  const firstFrame = (frame: number) => {
    setStart(frame);
    setProgress(0);
  };
  useEffect(() => {
    requestAnimationFrame(firstFrame);
  }, []);

  const step = (frame: number) =>
    setProgress(Math.max(start + length - frame, 0));
  useEffect(() => {
    requestAnimationFrame(step);
  }, [progress]);

  return <progress className="progress" max={length} value={progress || 0} />;
}
