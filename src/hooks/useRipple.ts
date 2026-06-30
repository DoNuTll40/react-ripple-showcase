import { useState } from "react";
import Ripple from "@nuttawoot_donut/react-ripple";

// 📌 Custom Hook สำหรับสร้าง Ripple
// การใช้ useState แบบ function (() => new Ripple())
// จะทำให้คลาส Ripple ถูกสร้างแค่ครั้งแรกครั้งเดียว ป้องกันปัญหาการสร้างใหม่ซ้ำๆ ตอนรีเรนเดอร์
export const useRipple = () => {
  const [ripple] = useState(() => new Ripple());
  return ripple;
};
