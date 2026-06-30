import React, { useRef, useState, useEffect, useMemo } from "react";
import Ripple from "@nuttawoot_donut/react-ripple";
import {
  Sun,
  Moon,
  Package,
  Code2,
  ChevronDown,
  Copy,
  Check,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";

// 📌 ฟังก์ชันอ่านตัวหนังสือจาก Markdown (ใส่ Type เป็น any ไปก่อนสำหรับ node)
const extractTextFromNode = (node: any): string => {
  if (!node) return "";
  if (node.type === "text") return node.value || "";
  if (node.children) return node.children.map(extractTextFromNode).join("");
  return "";
};

// 📌 ฟังก์ชันสร้าง ID สำหรับหัวข้อ
const generateId = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-\u0E00-\u0E7F]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

// 📌 ไอคอน GitHub
const GithubSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

// 📌 Type สำหรับ CopyButton
interface CopyButtonProps {
  text: string;
  onCopy?: () => void;
  ripple: any;
}

const CopyButton = ({ text, onCopy, ripple }: CopyButtonProps) => {
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

// 📌 Type สำหรับโค้ดในแต่ละ Framework
interface CodeSnippets {
  react: string;
  vue: string;
  svelte: string;
  html: string;
}

// 📌 Type สำหรับ DemoCard
interface DemoCardProps {
  title: string;
  description: string;
  codeSnippets: CodeSnippets;
  isDark: boolean;
  onCopy?: () => void;
  ripple: any;
  lang: string;
  children: React.ReactNode;
}

const DemoCard = ({
  title,
  description,
  codeSnippets,
  isDark,
  onCopy,
  ripple,
  lang,
  children,
}: DemoCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<keyof CodeSnippets>("react");

  const tabs: { id: keyof CodeSnippets; name: string }[] = [
    { id: "react", name: "React" },
    { id: "vue", name: "Vue 3" },
    { id: "svelte", name: "Svelte" },
    { id: "html", name: "Vanilla JS" },
  ];

  return (
    <div className="group flex flex-col p-5 md:p-8 bg-white dark:bg-[#111113] rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm transition-all hover:shadow-lg">
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
            <ChevronDown
              size={14}
              className={`transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <div
            className={`grid transition-all duration-300 ease-in-out ${
              isOpen ? "grid-rows-[1fr] mt-2" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden relative flex flex-col">
              {/* 🔄 แท็บสลับภาษา */}
              <div className="flex border-b border-neutral-200 dark:border-neutral-800 mb-2 gap-1 text-[11px] font-medium pt-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onPointerDown={(e) => ripple.create(e)}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative overflow-hidden px-3 py-1.5 rounded-t-lg transition-colors focus:outline-none cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-neutral-100 dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-500"
                        : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>

              <div className="relative">
                <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <CopyButton
                    text={codeSnippets[activeTab]}
                    onCopy={onCopy}
                    ripple={ripple}
                  />
                </div>
                <SyntaxHighlighter
                  style={isDark ? (vscDarkPlus as any) : (vs as any)}
                  language={activeTab === "html" ? "html" : "jsx"}
                  customStyle={{
                    margin: 0,
                    padding: "1.25rem",
                    borderRadius: "1rem",
                    fontSize: "0.875rem",
                    lineHeight: "1.5",
                  }}
                  className="border border-neutral-200 dark:border-neutral-800 shadow-inner"
                >
                  {codeSnippets[activeTab]}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const ripple = useRef(new Ripple()).current;
  const [activeView, setActiveView] = useState<"showcase" | "docs">("showcase");

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return (
        document.documentElement.classList.contains("dark") ||
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }
    return false;
  });

  const [lang, setLang] = useState<"en" | "th">("en");

  const translations: Record<string, any> = {
    en: {
      heroDesc: (
        <>
          A lightweight, intelligent material ripple effect.{" "}
          <br className="hidden sm:block" />
          Automatically adapts to your theme with full color customization.
        </>
      ),
      copiedNpm: "Copied NPM install command!",
      autoTheme: "Auto Theme",
      autoThemeDesc:
        "Ripple color is automatically determined by the parent container's theme context.",
      autoThemeBtn: "Click to Ripple",
      forcedLight: "Forced Light",
      forcedLightDesc:
        "Ignores the current theme and forces a dark transparent ripple designed for light backgrounds.",
      forcedLightBtn: "Light Ripple",
      forcedDark: "Forced Dark",
      forcedDarkDesc:
        "Ignores the current theme and forces a white transparent ripple designed for dark backgrounds.",
      forcedDarkBtn: "Dark Ripple",
      customColor: "Custom Configuration",
      customColorDesc:
        "Pass a custom color (HEX/RGB) and adjust alpha channels to match your brand's identity.",
      customColorBtn: "Custom Color",
      webVersion: "Website Version",
      onThisPage: "On this page",
    },
    th: {
      heroDesc: (
        <>
          เอฟเฟกต์ Ripple สไตล์ Material Design ที่เบาและฉลาด{" "}
          <br className="hidden sm:block" />
          ปรับสีอัตโนมัติตามธีมของคุณ พร้อมตั้งค่าสีเองได้อย่างอิสระ
        </>
      ),
      copiedNpm: "คัดลอกคำสั่งติดตั้ง NPM แล้ว!",
      autoTheme: "ธีมอัตโนมัติ (Auto Theme)",
      autoThemeDesc:
        "สีของ Ripple จะถูกกำหนดอัตโนมัติ ขึ้นอยู่กับสีพื้นหลังและธีมของคอนเทนเนอร์ที่ครอบอยู่",
      autoThemeBtn: "คลิกเพื่อดูเอฟเฟกต์",
      forcedLight: "บังคับโหมดสว่าง (Forced Light)",
      forcedLightDesc:
        "เพิกเฉยต่อธีมปัจจุบัน และบังคับใช้ Ripple โปร่งแสงสีดำ สำหรับนำไปใช้กับปุ่มพื้นหลังสีสว่าง",
      forcedLightBtn: "โหมดสว่าง",
      forcedDark: "บังคับโหมดมืด (Forced Dark)",
      forcedDarkDesc:
        "เพิกเฉยต่อธีมปัจจุบัน และบังคับใช้ Ripple โปร่งแสงสีขาว สำหรับนำไปใช้กับปุ่มพื้นหลังสีมืด",
      forcedDarkBtn: "โหมดมืด",
      customColor: "ตั้งค่าสีเอง (Custom Color)",
      customColorDesc:
        "กำหนดสีที่คุณต้องการเอง (HEX/RGB) และปรับค่าความโปร่งใสให้เข้ากับเอกลักษณ์ของแบรนด์คุณ",
      customColorBtn: "สีแบบกำหนดเอง",
      webVersion: "เวอร์ชันหน้าเว็บ",
      onThisPage: "หัวข้อในหน้านี้",
    },
  };
  const t = translations[lang];

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [version, setVersion] = useState("v2.0.x");
  useEffect(() => {
    fetch(
      "https://data.jsdelivr.com/v1/package/npm/@nuttawoot_donut/react-ripple"
    )
      .then((res) => res.json())
      .then((data) => {
        if (data?.tags?.latest) setVersion(`v${data.tags.latest}`);
      })
      .catch(() => {});
  }, []);

  const [readme, setReadme] = useState("");
  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/DoNuTll40/ripple-effects-auto-darklight/main/README.md"
    )
      .then((res) => res.text())
      .then((text) => setReadme(text))
      .catch(() => setReadme("Failed to load documentation."));
  }, []);

  const docSections = useMemo(() => {
    if (!readme) return [];
    const parts = ("\n" + readme).split(/\n(?=## )/).filter((p) => p.trim());
    return parts.map((part) => {
      const lines = part.split("\n");
      const headerLine = lines.find((l) => l.startsWith("## "));
      let title = "Introduction";
      let id = "introduction";

      if (headerLine) {
        title = headerLine.replace("## ", "").replace(/\*/g, "").trim();
        id = generateId(title);
      }
      return { id, title };
    });
  }, [readme]);

  const [activeSectionId, setActiveSectionId] = useState("introduction");
  const currentSectionRef = useRef("introduction");

  useEffect(() => {
    if (activeView !== "docs" || docSections.length === 0) return;

    const handleScroll = () => {
      const elements = docSections
        .map((sec) => ({
          id: sec.id,
          el: document.getElementById(sec.id),
        }))
        .filter(
          (item): item is { id: string; el: HTMLElement } => item.el !== null
        );

      if (elements.length === 0) return;

      let newActiveId = elements[0].id;

      for (const item of elements) {
        const rect = item.el.getBoundingClientRect();
        if (rect.top <= 150) {
          newActiveId = item.id;
        }
      }

      if (currentSectionRef.current !== newActiveId) {
        currentSectionRef.current = newActiveId;
        setActiveSectionId(newActiveId);
        window.history.replaceState(null, "", "#" + newActiveId);
      }
    };

    const timeout = setTimeout(() => {
      handleScroll();
      window.addEventListener("scroll", handleScroll, { passive: true });
    }, 300);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activeView, docSections]);

  const scrollToSection = (id: string) => {
    window.history.pushState(null, "", "#" + id);
    if (id === "introduction") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <div className="min-h-screen transition-colors duration-500 bg-[#fafafa] dark:bg-[#09090b] text-neutral-900 dark:text-neutral-50 selection:bg-indigo-500/30 relative flex flex-col">
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-6 py-3 rounded-full shadow-2xl font-medium text-sm flex items-center gap-2">
            <Check
              size={16}
              className="text-emerald-400 dark:text-emerald-600"
            />
            {toastMessage}
          </div>
        </div>
      )}

      <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-[#09090b]/80 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="font-bold text-lg tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs">
              R
            </div>
            <span className="hidden sm:block">React Ripple</span>
          </div>

          <div className="flex bg-neutral-100 dark:bg-neutral-900/80 p-1 rounded-full border border-neutral-200 dark:border-neutral-800">
            <button
              onPointerDown={(e) => ripple.create(e as any)}
              onClick={() => {
                setActiveView("showcase");
                window.history.pushState(null, "", window.location.pathname);
                window.scrollTo(0, 0);
              }}
              className={`relative overflow-hidden px-4 sm:px-6 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all focus:outline-none cursor-pointer ${
                activeView === "showcase"
                  ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Showcase
            </button>
            <button
              onPointerDown={(e) => ripple.create(e as any)}
              onClick={() => {
                setActiveView("docs");
                window.history.pushState(null, "", "#introduction");
                window.scrollTo(0, 0);
              }}
              className={`relative overflow-hidden px-4 sm:px-6 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all focus:outline-none cursor-pointer ${
                activeView === "docs"
                  ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Docs
            </button>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <button
              onPointerDown={(e) => ripple.create(e as any)}
              onClick={() => setLang(lang === "en" ? "th" : "en")}
              className="relative overflow-hidden w-9 h-9 flex items-center justify-center rounded-full font-bold text-xs uppercase text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none cursor-pointer"
            >
              {lang}
            </button>
            <button
              onPointerDown={(e) => ripple.create(e as any)}
              onClick={() => setIsDark(!isDark)}
              className="relative overflow-hidden w-9 h-9 flex items-center justify-center rounded-full text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none cursor-pointer"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a
              href="https://github.com/DoNuTll40/ripple-effects-auto-darklight"
              target="_blank"
              rel="noreferrer"
              onPointerDown={(e) => ripple.create(e as any)}
              className="relative overflow-hidden hidden sm:flex w-9 h-9 items-center justify-center rounded-full text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none cursor-pointer"
            >
              <GithubSVG />
            </a>
          </div>
        </div>
      </nav>

      <div className="flex-grow w-full">
        {activeView === "showcase" ? (
          <main className="max-w-4xl mx-auto w-full flex flex-col space-y-10 md:space-y-16 py-10 md:py-12 px-4 md:px-8">
            <header className="text-center space-y-5 md:space-y-6">
              <div className="inline-flex items-center justify-center px-4 py-1.5 mb-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium text-[10px] md:text-xs tracking-widest uppercase ring-1 ring-inset ring-indigo-500/20">
                Current Release : {version}
              </div>
              <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight">
                React Ripple
              </h1>
              <p className="text-sm md:text-xl text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed px-2">
                {t.heroDesc}
              </p>

              <div className="flex items-center justify-between w-full max-w-md mx-auto mt-8 bg-white dark:bg-[#111113] border border-neutral-200 dark:border-neutral-800 shadow-sm rounded-2xl p-1.5 pl-4 md:pl-5 overflow-hidden">
                <code className="text-[11px] md:text-sm font-mono text-neutral-600 dark:text-neutral-300 truncate pr-2">
                  npm i @nuttawoot_donut/react-ripple
                </code>
                <CopyButton
                  text="npm i @nuttawoot_donut/react-ripple"
                  onCopy={() => showToast(t.copiedNpm)}
                  ripple={ripple}
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 pt-4 md:pt-6">
                <a
                  href="https://github.com/DoNuTll40/ripple-effects-auto-darklight"
                  target="_blank"
                  rel="noreferrer"
                  onPointerDown={(e) => ripple.create(e as any)}
                  className="relative overflow-hidden flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 rounded-full border border-transparent bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm hover:scale-105 transition-all text-xs md:text-sm font-semibold focus:outline-none cursor-pointer"
                >
                  <GithubSVG /> GitHub
                </a>
                <a
                  href="https://www.npmjs.com/package/@nuttawoot_donut/react-ripple"
                  target="_blank"
                  rel="noreferrer"
                  onPointerDown={(e) => ripple.create(e as any, "light")}
                  className="relative overflow-hidden flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 rounded-full border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 shadow-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition-all text-xs md:text-sm font-semibold focus:outline-none cursor-pointer"
                >
                  <Package size={16} /> NPM
                </a>
              </div>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-8">
              <DemoCard
                title={t.autoTheme}
                description={t.autoThemeDesc}
                codeSnippets={{
                  react: `<button onPointerDown={(e) => ripple.create(e)}>\n  Click to Ripple\n</button>`,
                  vue: `<template>\n  <button @pointerdown="ripple.create($event)">\n    Click to Ripple\n  </button>\n</template>\n\n<script setup>\nimport Ripple from '@nuttawoot_donut/react-ripple';\nconst ripple = new Ripple();\n</script>`,
                  svelte: `<script>\n  import Ripple from '@nuttawoot_donut/react-ripple';\n  const ripple = new Ripple();\n</script>\n\n<button on:pointerdown={(e) => ripple.create(e)}>\n  Click to Ripple\n</button>`,
                  html: `\n<button onpointerdown="ripple.create(event)">\n  Click to Ripple\n</button>\n\n<script>\n  const ripple = new Ripple();\n</script>`,
                }}
                isDark={isDark}
                onCopy={() => showToast("Copied Auto Theme code!")}
                ripple={ripple}
                lang={lang}
              >
                <button
                  onPointerDown={(e) => ripple.create(e as any)}
                  className="w-full relative overflow-hidden px-5 py-3.5 md:px-6 md:py-4 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 active:scale-[0.98] transition-all focus:outline-none shadow-md shadow-indigo-500/20 dark:shadow-none cursor-pointer select-none text-sm md:text-base"
                >
                  {t.autoThemeBtn}
                </button>
              </DemoCard>
              <DemoCard
                title={t.forcedLight}
                description={t.forcedLightDesc}
                codeSnippets={{
                  react: `<button onPointerDown={(e) => ripple.create(e, "light")}>\n  Light Ripple\n</button>`,
                  vue: `<template>\n  <button @pointerdown="ripple.create($event, 'light')">\n    Light Ripple\n  </button>\n</template>\n\n<script setup>\nimport Ripple from '@nuttawoot_donut/react-ripple';\nconst ripple = new Ripple();\n</script>`,
                  svelte: `<script>\n  import Ripple from '@nuttawoot_donut/react-ripple';\n  const ripple = new Ripple();\n</script>\n\n<button on:pointerdown={(e) => ripple.create(e, 'light')}>\n  Light Ripple\n</button>`,
                  html: `<button onpointerdown="ripple.create(event, 'light')">\n  Light Ripple\n</button>\n\n<script>\n  const ripple = new Ripple();\n</script>`,
                }}
                isDark={isDark}
                onCopy={() => showToast("Copied Forced Light code!")}
                ripple={ripple}
                lang={lang}
              >
                <button
                  onPointerDown={(e) => ripple.create(e as any, "light")}
                  className="w-full relative overflow-hidden px-5 py-3.5 md:px-6 md:py-4 bg-white text-neutral-900 font-semibold rounded-2xl border border-neutral-200 hover:bg-neutral-50 active:scale-[0.98] transition-all focus:outline-none shadow-sm cursor-pointer select-none text-sm md:text-base"
                >
                  {t.forcedLightBtn}
                </button>
              </DemoCard>
              <DemoCard
                title={t.forcedDark}
                description={t.forcedDarkDesc}
                codeSnippets={{
                  react: `<button onPointerDown={(e) => ripple.create(e, "dark")}>\n  Dark Ripple\n</button>`,
                  vue: `<template>\n  <button @pointerdown="ripple.create($event, 'dark')">\n    Dark Ripple\n  </button>\n</template>\n\n<script setup>\nimport Ripple from '@nuttawoot_donut/react-ripple';\nconst ripple = new Ripple();\n</script>`,
                  svelte: `<script>\n  import Ripple from '@nuttawoot_donut/react-ripple';\n  const ripple = new Ripple();\n</script>\n\n<button on:pointerdown={(e) => ripple.create(e, 'dark')}>\n  Dark Ripple\n</button>`,
                  html: `<button onpointerdown="ripple.create(event, 'dark')">\n  Dark Ripple\n</button>\n\n<script>\n  const ripple = new Ripple();\n</script>`,
                }}
                isDark={isDark}
                onCopy={() => showToast("Copied Forced Dark code!")}
                ripple={ripple}
                lang={lang}
              >
                <button
                  onPointerDown={(e) => ripple.create(e as any, "dark")}
                  className="w-full relative overflow-hidden px-5 py-3.5 md:px-6 md:py-4 bg-neutral-900 text-white font-semibold rounded-2xl hover:bg-black active:scale-[0.98] transition-all focus:outline-none shadow-lg cursor-pointer select-none text-sm md:text-base"
                >
                  {t.forcedDarkBtn}
                </button>
              </DemoCard>
              <DemoCard
                title={t.customColor}
                description={t.customColorDesc}
                codeSnippets={{
                  react: `<button \n  onPointerDown={(e) => ripple.create(e, {\n    color: "#10b981",\n    alpha: 0.35\n  })}\n>\n  Custom Color\n</button>`,
                  vue: `<template>\n  <button \n    @pointerdown="ripple.create($event, {\n      color: '#10b981',\n      alpha: 0.35\n    })"\n  >\n    Custom Color\n  </button>\n</template>\n\n<script setup>\nimport Ripple from '@nuttawoot_donut/react-ripple';\nconst ripple = new Ripple();\n</script>`,
                  svelte: `<script>\n  import Ripple from '@nuttawoot_donut/react-ripple';\n  const ripple = new Ripple();\n</script>\n\n<button \n  on:pointerdown={(e) => ripple.create(e, {\n    color: '#10b981',\n    alpha: 0.35\n  })}\n>\n  Custom Color\n</button>`,
                  html: `<button \n  onpointerdown="ripple.create(event, { color: '#10b981', alpha: 0.35 })"\n>\n  Custom Color\n</button>\n\n<script>\n  const ripple = new Ripple();\n</script>`,
                }}
                isDark={isDark}
                onCopy={() => showToast("Copied Custom Configuration code!")}
                ripple={ripple}
                lang={lang}
              >
                <button
                  onPointerDown={(e) =>
                    ripple.create(e as any, { color: "#10b981", alpha: 0.35 })
                  }
                  className="w-full relative overflow-hidden px-5 py-3.5 md:px-6 md:py-4 bg-emerald-500 text-white font-semibold rounded-2xl hover:bg-emerald-600 active:scale-[0.98] transition-all focus:outline-none shadow-md shadow-emerald-500/20 dark:shadow-none cursor-pointer select-none text-sm md:text-base"
                >
                  {t.customColorBtn}
                </button>
              </DemoCard>
            </section>
          </main>
        ) : (
          <main className="max-w-6xl mx-auto w-full flex flex-col md:flex-row gap-8 py-4 md:py-8 px-4 md:px-8">
            <aside className="hidden md:block w-64 flex-shrink-0 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide pb-8">
              <h3 className="font-bold text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-4 px-3">
                {t.onThisPage}
              </h3>
              <div className="flex flex-col gap-1 border-l border-neutral-200 dark:border-neutral-800 w-full">
                {docSections.map((sec, idx) => {
                  const isActive = activeSectionId === sec.id;
                  return (
                    <button
                      key={idx}
                      onPointerDown={(e) => ripple.create(e as any)}
                      onClick={() => scrollToSection(sec.id)}
                      className={`relative overflow-hidden text-left px-4 py-2.5 text-sm transition-all focus:outline-none cursor-pointer border-l-2 -ml-[1px] ${
                        isActive
                          ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/50 dark:bg-indigo-500/10"
                          : "border-transparent text-neutral-500 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                      }`}
                    >
                      {sec.title}
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className="flex-1 min-w-0 bg-transparent md:bg-white md:dark:bg-[#111113] md:border border-neutral-200 dark:border-neutral-800 md:rounded-3xl md:p-12 md:shadow-sm min-h-[500px]">
              {readme ? (
                <ReactMarkdown
                  components={{
                    // 📌 ใส่ Type เป็น any ให้ Component ทั้งหมดเพื่อป้องกัน Error
                    h1: ({ node, children, ...props }: any) => {
                      const text = extractTextFromNode(node);
                      return (
                        <h1
                          id="introduction"
                          title={text}
                          className="text-3xl md:text-4xl font-extrabold mb-8 line-clamp-1 scroll-mt-24"
                          {...props}
                        >
                          {children}
                        </h1>
                      );
                    },
                    h2: ({ node, children, ...props }: any) => {
                      const text = extractTextFromNode(node);
                      const id = generateId(text);

                      return (
                        <h2
                          id={id}
                          className="scroll-mt-24 text-2xl font-bold mt-16 md:mt-20 mb-6 border-b border-neutral-200 dark:border-neutral-800 pb-3"
                          {...props}
                        >
                          {children}
                        </h2>
                      );
                    },
                    h3: (props: any) => (
                      <h3
                        className="text-xl font-semibold mt-10 mb-3"
                        {...props}
                      />
                    ),
                    p: (props: any) => (
                      <p
                        className="mb-5 text-neutral-600 dark:text-neutral-400 leading-relaxed text-base"
                        {...props}
                      />
                    ),
                    a: (props: any) => (
                      <a
                        className="text-indigo-500 hover:underline font-medium"
                        target="_blank"
                        {...props}
                      />
                    ),
                    ul: (props: any) => (
                      <ul
                        className="list-disc pl-6 mb-6 text-neutral-600 dark:text-neutral-400 space-y-2 text-base"
                        {...props}
                      />
                    ),
                    li: (props: any) => <li {...props} />,
                    blockquote: (props: any) => (
                      <blockquote
                        className="border-l-4 border-indigo-500 pl-5 my-6 italic text-neutral-500 bg-indigo-50/50 dark:bg-indigo-950/20 py-3 rounded-r-xl text-base"
                        {...props}
                      />
                    ),
                    code: (props: any) => {
                      const { node, inline, className, children, ...rest } =
                        props;
                      const match = /language-(\w+)/.exec(className || "");

                      return !inline && match ? (
                        <div className="relative group my-8">
                          <div className="absolute right-3 top-3 z-10 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <CopyButton
                              text={String(children).replace(/\n$/, "")}
                              onCopy={() => showToast("Copied code from docs!")}
                              ripple={ripple}
                            />
                          </div>
                          <SyntaxHighlighter
                            style={isDark ? (vscDarkPlus as any) : (vs as any)}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              padding: "1.5rem",
                              borderRadius: "1rem",
                              fontSize: "0.875rem",
                            }}
                            className="border border-neutral-200 dark:border-neutral-800 shadow-sm"
                            {...rest}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code
                          className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-md text-sm font-mono text-pink-500 dark:text-pink-400"
                          {...rest}
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {readme}
                </ReactMarkdown>
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-400">
                  Loading documentation...
                </div>
              )}
            </div>
          </main>
        )}
      </div>

      <footer className="w-full border-t border-neutral-200 dark:border-neutral-800 mt-auto bg-white/50 dark:bg-[#111113]/50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col items-center justify-center gap-6 text-xs md:text-sm text-neutral-500 dark:text-neutral-400">
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 font-medium">
            <a
              href="https://github.com/DoNuTll40/ripple-effects-auto-darklight"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <GithubSVG /> GitHub Repository
            </a>
            <a
              href="https://www.npmjs.com/package/@nuttawoot_donut/react-ripple"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-red-500 transition-colors"
            >
              <Package size={16} /> NPM Package
            </a>
            <a
              href="https://github.com/DoNuTll40/ripple-effects-auto-darklight/issues"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Bug Report & Issues
            </a>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 w-full text-center">
            <p>
              &copy; {new Date().getFullYear()} Released under the{" "}
              <strong>MIT License</strong>.
            </p>
            <p className="hidden md:block text-neutral-300 dark:text-neutral-700">
              •
            </p>
            <p>
              Designed & Built by{" "}
              <a
                href="https://github.com/DoNuTll40"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-neutral-900 dark:text-white hover:underline transition-all"
              >
                @nuttawoot_donut
              </a>
            </p>
            <p className="hidden md:block text-neutral-300 dark:text-neutral-700">
              •
            </p>
            <p>{t.webVersion}: 2.8.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
