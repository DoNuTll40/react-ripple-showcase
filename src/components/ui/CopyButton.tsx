import { useState } from "react";
import { Copy, Check } from "lucide-react";

// 📌 Type สำหรับ CopyButton
export interface CopyButtonProps {
  text: string;
  onCopy?: () => void;
  ripple: any;
}

export const CopyButton = ({ text, onCopy, ripple }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (onCopy) onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onPointerDown={(e) => ripple.create(e)}
      onClick={handleCopy}
      className="relative overflow-hidden p-2 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors focus:outline-none bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700 cursor-pointer"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check size={14} className="text-emerald-500" />
      ) : (
        <Copy size={14} className="text-neutral-500 dark:text-neutral-400" />
      )}
    </button>
  );
};
