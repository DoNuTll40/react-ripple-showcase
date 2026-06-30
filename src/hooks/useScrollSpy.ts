import { useState, useEffect, useRef } from "react";

// 📌 Custom Hook สำหรับเช็คว่าตอนนี้เลื่อนจอไปถึงหัวข้อไหนแล้ว
// คืนค่ากลับมาเป็น id ของหัวข้อนั้นๆ เพื่อเอาไปทำไฮไลท์ที่เมนูด้านซ้าย
export const useScrollSpy = (
  docSections: { id: string; title: string }[],
  activeView: "showcase" | "docs"
) => {
  const [activeSectionId, setActiveSectionId] = useState("introduction");
  
  // ใช้ useRef เพื่อเก็บค่าปัจจุบันไว้เทียบ โดยไม่ทำให้ component รีเรนเดอร์บ่อยๆ
  const currentSectionRef = useRef("introduction");

  useEffect(() => {
    if (activeView !== "docs" || docSections.length === 0) return;

    let rafId: number;

    const updateActiveSection = () => {
      const elements = docSections
        .map((sec) => document.getElementById(sec.id))
        .filter((el): el is HTMLElement => el !== null);

      if (elements.length === 0) return;

      let newActiveId = elements[0].id; // Default to first section
      
      // หา element ที่เลื่อนขึ้นไปเกิน offset (150px) 
      // ตัวที่อยู่ล่างสุดที่ผ่านเงื่อนไขนี้ จะเป็นตัวที่กำลังอ่านอยู่
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 150) {
          newActiveId = el.id;
        }
      }

      if (currentSectionRef.current !== newActiveId) {
        currentSectionRef.current = newActiveId;
        setActiveSectionId(newActiveId);
        window.history.replaceState(null, "", "#" + newActiveId);
      }
    };

    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActiveSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Initial check (รอให้ DOM เรนเดอร์เสร็จก่อน)
    const initialTimeout = setTimeout(updateActiveSection, 150);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
      clearTimeout(initialTimeout);
    };
  }, [activeView, docSections]);

  return activeSectionId;
};
