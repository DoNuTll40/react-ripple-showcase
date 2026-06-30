import { useState, useEffect, useMemo } from "react";
import { Sun, Moon, Package, Check } from "lucide-react";
import { translations } from "./locales/translations";
import { generateId } from "./utils/stringUtils";
import { useRipple } from "./hooks/useRipple";
import { useScrollSpy } from "./hooks/useScrollSpy";
import { GithubSVG } from "./components/icons/GithubSVG";
import { CopyButton } from "./components/ui/CopyButton";
import { DemoCard } from "./components/DemoCard";
import { MarkdownRenderer } from "./components/MarkdownRenderer";

import { motion, AnimatePresence } from "framer-motion";

export default function App() {
  // 📌 1. ดึง custom hook ของ Ripple มาใช้งาน
  const ripple = useRipple();

  // 📌 2. สร้าง State เพื่อเลือกว่าจะแสดงหน้า Showcase หรือ Docs
  const [activeView, setActiveView] = useState<"showcase" | "docs">("showcase");

  // 📌 3. State สำหรับ Dark Mode (เช็คค่าเริ่มต้นจากระบบของผู้ใช้)
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return (
        document.documentElement.classList.contains("dark") ||
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }
    return false;
  });

  // 📌 4. State สำหรับเปลี่ยนภาษา (อังกฤษ / ไทย)
  const [lang, setLang] = useState<"en" | "th">("en");
  // ดึงข้อความแปลภาษามาเก็บไว้ในตัวแปร t ให้เรียกใช้ง่ายๆ (เช่น t.heroDesc)
  const t = translations[lang];

  // 📌 5. State สำหรับข้อความแจ้งเตือน (Toast) เมื่อก๊อปปี้โค้ดเสร็จ
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000); // ให้ข้อความหายไปหลัง 3 วินาที
  };

  // 📌 6. ดึงเวอร์ชันล่าสุดของแพ็กเกจจาก NPM มาแสดง
  const [version, setVersion] = useState("v2.0.x");

  // useEffect ตัวนี้จะทำงานแค่ 1 ครั้งตอนโหลดหน้าเว็บ (สังเกตจาก [] ด้านท้าย)
  useEffect(() => {
    const abortController = new AbortController();
    fetch("https://data.jsdelivr.com/v1/package/npm/@nuttawoot_donut/react-ripple", {
      signal: abortController.signal
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.tags?.latest) setVersion(`v${data.tags.latest}`);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') console.error("Failed to fetch version");
      });
    return () => abortController.abort(); // ยกเลิกการโหลด หากปิดหน้าเว็บไปก่อน
  }, []);

  // 📌 7. ดึงข้อมูลคู่มือการใช้งาน (README.md) จาก Github Repository
  const [readme, setReadme] = useState("");
  const [isLoadingReadme, setIsLoadingReadme] = useState(true); // ใช้สำหรับแสดง Loading...

  useEffect(() => {
    const abortController = new AbortController();
    fetch("https://raw.githubusercontent.com/DoNuTll40/ripple-effects-auto-darklight/main/README.md", {
      signal: abortController.signal
    })
      .then((res) => res.text())
      .then((text) => {
        setReadme(text);
        setIsLoadingReadme(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setReadme("Failed to load documentation.");
          setIsLoadingReadme(false);
        }
      });
    return () => abortController.abort();
  }, []);

  // 📌 8. สกัดเอาหัวข้อ (Header) จากไฟล์ README.md มาทำเมนูด้านข้าง
  // ⚡ Optimization: เปลี่ยนจากการใช้ .split() และ .map() ซ้อนกันที่กินเมมโมรี่ (Big O หนักตรงสร้าง Array ใหม่เพียบ)
  // มาใช้ Regex .matchAll() แทน ทำให้หาหัวข้อเจอในรอบเดียว ประหยัดเวลา (O(N) แบบตัวคูณน้อยลงมาก) และกิน RAM น้อยลง
  const docSections = useMemo(() => {
    if (!readme) return [];

    // ค้นหาบรรทัดที่ขึ้นต้นด้วย "## " ตามด้วยข้อความอะไรก็ได้
    const matches = Array.from(readme.matchAll(/^##\s+(.+)$/gm));

    return matches.map((match) => {
      const title = match[1].replace(/\*/g, "").trim();
      return {
        id: generateId(title),
        title: title,
      };
    });
  }, [readme]);

  // 📌 9. Custom Hook สำหรับบอกว่าตอนนี้เรา "เลื่อนหน้าจอ" ไปอ่านถึงหัวข้อไหนแล้ว (จะได้ไฮไลท์เมนูด้านซ้าย)
  const activeSectionId = useScrollSpy(docSections, activeView);

  // 📌 10. ฟังก์ชันเลื่อนหน้าจอไปยังหัวข้อที่ผู้ใช้คลิก
  const scrollToSection = (id: string) => {
    window.history.pushState(null, "", "#" + id);
    if (id === "introduction") {
      window.scrollTo({ top: 0, behavior: "smooth" }); // เลื่อนไปบนสุด
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" }); // ค่อยๆ ไถลลงไป (smooth scroll)
    }
  };

  // 📌 11. อัปเดตคลาสของ <html> ให้เป็น Dark หรือ Light ตามที่ผู้ใช้เลือก
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]); // useEffect นี้ทำงานทุกครั้งที่ isDark เปลี่ยนไป

  return (
    <div className="min-h-screen transition-colors duration-500 bg-[#fafafa] dark:bg-[#09090b] text-neutral-900 dark:text-neutral-50 selection:bg-indigo-500/30 relative flex flex-col">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-10 left-1/2 z-50"
          >
            <div className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-6 py-3 rounded-full shadow-2xl font-medium text-sm flex items-center gap-2">
              <Check size={16} className="text-emerald-400 dark:text-emerald-600" />
              {toastMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              className={`relative overflow-hidden px-4 sm:px-6 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all focus:outline-none cursor-pointer ${activeView === "showcase"
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
              className={`relative overflow-hidden px-4 sm:px-6 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all focus:outline-none cursor-pointer ${activeView === "docs"
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

            <section className="grid grid-cols-1 md:grid-cols-2 items-start gap-4 md:gap-6 pb-8">
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
                      className={`relative overflow-hidden text-left px-4 py-2.5 text-sm transition-all focus:outline-none cursor-pointer border-l-2 -ml-[1px] ${isActive
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
              {isLoadingReadme ? (
                <div className="flex items-center justify-center h-full text-neutral-400">
                  <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                    <div className="h-4 w-48 bg-neutral-100 dark:bg-neutral-900 rounded"></div>
                  </div>
                </div>
              ) : readme && readme !== "Failed to load documentation." ? (
                <MarkdownRenderer
                  content={readme}
                  isDark={isDark}
                  ripple={ripple}
                  showToast={showToast}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-red-400">
                  {readme}
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
            <p>{t.webVersion}: 2.9.5</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
