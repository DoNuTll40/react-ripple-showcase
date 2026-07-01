import { useState } from "react";
import { Code2, ChevronDown } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyButton } from "./ui/CopyButton";
import { motion, AnimatePresence } from "framer-motion";

// 📌 Type สำหรับโค้ดตัวอย่างในแต่ละ Framework
export interface CodeSnippets {
  react: string;
  vue: string;
  svelte: string;
  html: string;
}

// 📌 Props (ข้อมูลที่ต้องส่งเข้ามาให้ Component นี้)
export interface DemoCardProps {
  title: string;        // ชื่อหัวข้อ (เช่น "Auto Theme")
  description: string;  // คำอธิบาย
  codeSnippets: CodeSnippets; // โค้ดตัวอย่างของแต่ละ Framework
  isDark: boolean;      // เช็คว่าเป็น Dark Mode หรือไม่
  onCopy?: () => void;  // ฟังก์ชันทำงานตอนก๊อปปี้เสร็จ
  ripple: any;          // ตัวแปร ripple
  lang: string;         // ภาษา (en/th)
  children: React.ReactNode; // UI ปุ่มที่เราส่งเข้ามาให้แสดง (อยู่ข้างในแท็ก <DemoCard> ... </DemoCard>)
}

// ⚡ Optimization: เอาตัวแปร tabs ออกมาไว้นอก Component 
// เพื่อไม่ให้มันถูกสร้างใหม่ (Allocate Memory) ทุกครั้งที่ปุ่มโดนคลิกหรือรีเรนเดอร์
const TABS: { id: keyof CodeSnippets; name: string; syntax: string }[] = [
  { id: "react", name: "React", syntax: "jsx" }, // หรือใช้ "tsx" ถ้าโค้ดเป็น TypeScript
  { id: "vue", name: "Vue 3", syntax: "html" }, // Vue มี <template> และ <script> ใช้ "html" จะเป๊ะสุด
  { id: "svelte", name: "Svelte", syntax: "html" }, // Svelte โครงสร้างเหมือน HTML เช่นกัน
  { id: "html", name: "Vanilla JS", syntax: "javascript" }, // ถ้าโค้ดเป็น JS เพียวๆ ใช้ "javascript" (แต่ถ้าโค้ดมี HTML ด้วยก็ใช้ "html")
];

// 📌 Component หลักสำหรับการ์ดแสดงตัวอย่าง (โชว์ปุ่ม + โชว์โค้ด)
export const DemoCard = ({
  title,
  description,
  codeSnippets,
  isDark,
  onCopy,
  ripple,
  lang,
  children,
}: DemoCardProps) => {
  // State สำหรับเปิด/ปิด แถบโค้ดด้านล่าง
  const [isOpen, setIsOpen] = useState(false);
  // State สำหรับเก็บว่าตอนนี้กำลังดูโค้ดของ Framework อะไรอยู่
  const [activeTab, setActiveTab] = useState<keyof CodeSnippets>("react");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="group flex flex-col p-5 md:p-8 bg-white dark:bg-[#111113] rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm transition-all hover:shadow-lg"
    >
      <div className="mb-6 md:mb-10">
        <h2 className="text-lg md:text-xl font-bold mb-2 tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-auto space-y-4">
        {children}

        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/50">
          <button
            onPointerDown={(e) => ripple.create(e)}
            onClick={() => setIsOpen(!isOpen)}
            className="relative overflow-hidden flex items-center justify-between w-full p-2 -mx-2 rounded-lg text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors focus:outline-none cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Code2 size={14} />{" "}
              {lang === "th" ? "ดูโค้ดตัวอย่าง" : "View Source Code"}
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={14} />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: "auto", opacity: 1, marginTop: 8 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden flex flex-col"
              >
                {/* 📌 แถบหน้าต่างโค้ดสไตล์ macOS พร้อมแสง Glow อ่อนๆ */}
                <div className="flex flex-col relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700/50 shadow-sm bg-white dark:bg-[#1e1e1e] ring-1 ring-black/5 dark:ring-white/10 mt-2">

                  {/* แถบหัวหน้าต่าง macOS แบบคลีนๆ (เหมือนหน้า Docs) */}
                  <div className="flex items-center justify-between px-4 py-3 bg-neutral-100/80 dark:bg-[#252526] border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400/90 shadow-inner"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400/90 shadow-inner"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-400/90 shadow-inner"></div>
                    </div>
                    <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider px-2 font-semibold">
                      {activeTab}
                    </div>
                  </div>

                  {/* 🔄 แท็บสลับภาษา (ย้ายมาไว้ข้างล่างแบบ minimal) */}
                  <div className="flex border-b border-neutral-100 dark:border-neutral-800/50 bg-neutral-50 dark:bg-[#1e1e1e]">
                    {TABS.map((tab) => (
                      <button
                        key={tab.id}
                        onPointerDown={(e) => ripple.create(e)}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative outline-none active:outline-none overflow-hidden py-2.5 px-3 text-[11px] md:text-xs font-semibold tracking-wide transition-all focus:outline-none cursor-pointer border-b-2 ${activeTab === tab.id
                          ? "text-indigo-600 dark:text-indigo-400 border-indigo-500 -mb-[1px]"
                          : "text-neutral-500 border-transparent hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
                          }`}
                      >
                        {tab.name}
                      </button>
                    ))}
                  </div>

                  {/* พื้นที่แสดงโค้ด */}
                  <div className="relative group/code">
                    <div className="absolute right-3 top-3 z-10 opacity-0 group-hover/code:opacity-100 transition-opacity duration-200">
                      <CopyButton
                        text={codeSnippets[activeTab]}
                        onCopy={onCopy}
                        ripple={ripple}
                      />
                    </div>
                    <SyntaxHighlighter
                      style={isDark ? (vscDarkPlus as any) : (vs as any)}
                      language={TABS.find(tab => tab.id === activeTab)?.syntax || "javascript"} // เปลี่ยนมาใช้ .syntax
                      customStyle={{
                        margin: 0,
                        padding: "1.25rem",
                        fontSize: "0.875rem",
                        lineHeight: "1.5",
                        backgroundColor: "transparent",
                      }}
                    >
                      {codeSnippets[activeTab]}
                    </SyntaxHighlighter>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
