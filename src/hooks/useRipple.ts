import { useState, useMemo } from "react";
import Ripple from "@nuttawoot_donut/react-ripple";

// 📌 Custom Hook สำหรับสร้าง Ripple
// การใช้ useState แบบ function (() => new Ripple())
// จะทำให้คลาส Ripple ถูกสร้างแค่ครั้งเดียวตอนที่ Component ถูกเรนเดอร์ครั้งแรก
export const useRipple = (isDark?: boolean) => {
  const [ripple] = useState(() => new Ripple());
  
  // สร้าง Wrapper เพื่อแก้ปัญหาของแพ็กเกจที่แอบไปเช็ค OS Preference ตอน Light Mode
  // โดยการบังคับโยนค่า mode ('dark' หรือ 'light') เข้าไปเสมอ
  const wrappedRipple = useMemo(() => {
    return {
      create: (e: any, opts?: any) => {
        if (isDark === undefined) return ripple.create(e, opts);
        
        const modeOpt = isDark ? "dark" : "light";
        let finalOpts = opts;
        
        if (!opts) {
          finalOpts = modeOpt;
        } else if (typeof opts === "string") {
          finalOpts = opts; // ถ้าโยน 'light' หรือ 'dark' มาตรงๆ ให้เคารพค่านั้น
        } else if (typeof opts === "object" && !opts.mode) {
          finalOpts = { ...opts, mode: modeOpt };
        }
        
        return ripple.create(e, finalOpts);
      }
    };
  }, [ripple, isDark]);

  return wrappedRipple;
};
