// 📌 ฟังก์ชันอ่านตัวหนังสือจาก Markdown
export const extractTextFromNode = (node: any): string => {
  if (!node) return "";
  if (node.type === "text") return node.value || "";
  if (node.children) return node.children.map(extractTextFromNode).join("");
  return "";
};

// 📌 ฟังก์ชันสร้าง ID สำหรับหัวข้อ
export const generateId = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-\u0E00-\u0E7F]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};
