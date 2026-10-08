export interface MaintenanceTranslations {
  title: string;
  description: string;
  message: string;
}

export function getMaintenanceTranslations(language = "en"): MaintenanceTranslations {
  if (language === "fr") {
    return {
      title: "Site en maintenance",
      description: "Nous effectuons actuellement des améliorations sur notre site.",
      message: "Nous serons de retour bientôt !",
    };
  }

  return {
    title: "Site Under Maintenance",
    description: "We're currently making improvements to our site.",
    message: "We'll be back soon!",
  };
}
