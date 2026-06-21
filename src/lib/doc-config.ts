import type { DocumentFileType } from "@/types/app.types";

export const FILE_TYPE_CONFIG: Record<
  DocumentFileType,
  { label: string; icon: string; bg: string; color: string }
> = {
  pdf:   { label: "PDF",   icon: "ti-file-type-pdf",    bg: "#fef2f2", color: "#dc2626" },
  doc:   { label: "Word",  icon: "ti-file-type-doc",    bg: "#eff6ff", color: "#1d4ed8" },
  xls:   { label: "Excel", icon: "ti-file-spreadsheet", bg: "#f0fdf4", color: "#16a34a" },
  img:   { label: "Image", icon: "ti-photo",            bg: "#faf5ff", color: "#7e22ce" },
  zip:   { label: "ZIP",   icon: "ti-file-zip",         bg: "#fff7ed", color: "#c2410c" },
  other: { label: "File",  icon: "ti-file",             bg: "#f8fafc", color: "#64748b" },
};

export const FILE_TYPE_TABS = [
  { key: "all" as const,   label: "All"    },
  { key: "pdf" as const,   label: "PDF"    },
  { key: "doc" as const,   label: "Word"   },
  { key: "xls" as const,   label: "Excel"  },
  { key: "img" as const,   label: "Images" },
  { key: "zip" as const,   label: "ZIP"    },
];

export function inferFileType(file: File): DocumentFileType {
  const mime = file.type.toLowerCase();
  const ext  = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (mime === "application/pdf" || ext === "pdf") return "pdf";
  if (mime.includes("word") || ["doc", "docx"].includes(ext)) return "doc";
  if (
    mime.includes("excel") ||
    mime.includes("spreadsheet") ||
    ["xls", "xlsx"].includes(ext)
  )
    return "xls";
  if (
    mime.startsWith("image/") ||
    ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)
  )
    return "img";
  if (mime === "application/zip" || ext === "zip") return "zip";
  return "other";
}
