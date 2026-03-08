import { useState, useEffect } from "react";
import { AArrowUp, AArrowDown, RotateCcw } from "lucide-react";

const sizes = [
  { label: "Small", value: 87.5, class: "text-sm-size" },
  { label: "Default", value: 100, class: "text-default-size" },
  { label: "Large", value: 112.5, class: "text-lg-size" },
  { label: "Extra Large", value: 125, class: "text-xl-size" },
];

const TextSizeToggle = () => {
  const [sizeIndex, setSizeIndex] = useState(() => {
    const saved = localStorage.getItem("textSizeIndex");
    return saved ? Number(saved) : 1;
  });

  useEffect(() => {
    document.documentElement.style.fontSize = `${sizes[sizeIndex].value}%`;
    localStorage.setItem("textSizeIndex", String(sizeIndex));
  }, [sizeIndex]);

  const decrease = () => setSizeIndex((i) => Math.max(0, i - 1));
  const increase = () => setSizeIndex((i) => Math.min(sizes.length - 1, i + 1));
  const reset = () => setSizeIndex(1);

  return (
    <div
      className="flex items-center gap-1 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm px-1.5 py-1"
      role="group"
      aria-label="Text size adjustment"
    >
      <button
        onClick={decrease}
        disabled={sizeIndex === 0}
        className="p-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground transition-colors"
        aria-label="Decrease text size"
      >
        <AArrowDown className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={reset}
        className="px-1.5 py-0.5 text-[10px] font-medium tracking-wider uppercase text-muted-foreground hover:text-primary transition-colors min-w-[28px] text-center"
        aria-label={`Current size: ${sizes[sizeIndex].label}. Click to reset.`}
        title="Reset to default"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {sizeIndex === 1 ? (
          <span className="flex items-center justify-center">
            <RotateCcw className="w-3 h-3" />
          </span>
        ) : (
          sizes[sizeIndex].label.charAt(0)
        )}
      </button>
      <button
        onClick={increase}
        disabled={sizeIndex === sizes.length - 1}
        className="p-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground transition-colors"
        aria-label="Increase text size"
      >
        <AArrowUp className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default TextSizeToggle;
