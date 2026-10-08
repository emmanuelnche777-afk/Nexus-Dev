// Simulate verification code generation (sequential)
export const generateVerificationCode = (programSlug: string): string => {
  const programType = programSlug.substring(0, 2).toUpperCase(); // sd, ud, gd, aa
  const typeMap: Record<string, string> = {
    sd: "SD", // Software Development
    ud: "UD", // UI/UX Design
    gd: "GD", // Graphic Design
    aa: "AA", // AI Automation
  };
  const type = typeMap[programType] || "XX";
  const year = new Date().getFullYear().toString().substring(2);
  // In a real app, this would come from a database with proper sequencing
  // For now, we'll generate a deterministic code based on timestamp
  const sequence = Math.floor(Date.now() / 1000) % 1000;
  return `NX-${type}-${year}-${sequence.toString().padStart(3, "0")}`;
};
