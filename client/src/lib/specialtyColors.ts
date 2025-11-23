// Specialty color management
export const defaultSpecialtyColors: Record<string, { bgColor: string; textColor: string }> = {
  "Dental": { bgColor: "bg-blue-100", textColor: "text-blue-700" },
  "Chiropractor": { bgColor: "bg-emerald-100", textColor: "text-emerald-700" },
  "Optometry": { bgColor: "bg-purple-100", textColor: "text-purple-700" },
  "Physical Therapy": { bgColor: "bg-orange-100", textColor: "text-orange-700" },
  "Orthodontics": { bgColor: "bg-pink-100", textColor: "text-pink-700" },
};

export function getSpecialtyColors(specialty: string) {
  return defaultSpecialtyColors[specialty] || { bgColor: "bg-gray-100", textColor: "text-gray-700" };
}

export async function fetchSpecialtyColors() {
  try {
    const response = await fetch("/api/specialty-colors");
    if (!response.ok) throw new Error("Failed to fetch colors");
    const colors = await response.json();
    return colors.reduce((acc: Record<string, any>, color: any) => {
      acc[color.specialty] = { bgColor: color.bgColor, textColor: color.textColor };
      return acc;
    }, {});
  } catch (error) {
    console.error("Error fetching specialty colors:", error);
    return defaultSpecialtyColors;
  }
}
