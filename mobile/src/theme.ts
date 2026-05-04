export const colors = {
  brand: "#0E7C3A",
  brandDark: "#0A5C2C",
  brandTint: "#E8F5EC",
  surface: "#FFFFFF",
  background: "#F5F7F9",
  border: "#E5E7EB",
  borderStrong: "#D7DBE0",
  textPrimary: "#111827",
  textSecondary: "#4B5563",
  textTertiary: "#9CA3AF",
  ripple: "rgba(14, 124, 58, 0.08)",
  shadow: "rgba(15, 23, 42, 0.08)",
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const levelStyle = (level?: string | null) => {
  const l = (level || "").toLowerCase();
  if (l.includes("primary")) return { bg: "#E8F5EC", fg: "#0A5C2C" };
  if (l.includes("secondary") || l.includes("school"))
    return { bg: "#E0EAFF", fg: "#1E3A8A" };
  if (l.includes("college") || l.includes("higher"))
    return { bg: "#FCE7F3", fg: "#9D174D" };
  if (l.includes("madrasah") || l.includes("madrasa"))
    return { bg: "#FEF3C7", fg: "#92400E" };
  if (l.includes("technical") || l.includes("vocational"))
    return { bg: "#EDE9FE", fg: "#5B21B6" };
  return { bg: "#F3F4F6", fg: "#374151" };
};

export const initialOf = (s?: string | null) => {
  const t = (s || "").trim();
  if (!t) return "•";
  return t.charAt(0).toUpperCase();
};
