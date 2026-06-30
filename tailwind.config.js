/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // <---- 📌 เพิ่มบรรทัดนี้เข้าไปเลยครับ
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
