export type PublicSiteSettings = {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportEmail: string;
  phone: string;
  address: string;
  newsletter: boolean;
  blog: boolean;
  aiAssistant: boolean;
  certificateVerification: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  maintenanceMessageFr: string;
  academyOverviewVideoUrl: string;
  academyOverviewVideoPoster: string;
  paymentInfo: {
    mtnNumber: string;
    mtnLabel: string;
    orangeNumber: string;
    orangeLabel: string;
    instructions: string;
    instructionsFr: string;
  };
};

export const DEFAULT_PUBLIC_SITE_SETTINGS: PublicSiteSettings = {
  siteName: "NEXUS",
  siteDescription: "Empowering the next generation of Cameroonian technologists",
  contactEmail: "contact@nexus.cm",
  supportEmail: "support@nexus.cm",
  phone: "+237 6XX XXX XXX",
  address: "Douala, Cameroon",
  newsletter: true,
  blog: true,
  aiAssistant: true,
  certificateVerification: true,
  maintenanceMode: false,
  maintenanceMessage: "We'll be back soon!",
  maintenanceMessageFr: "Nous serons de retour bientôt !",
  academyOverviewVideoUrl: "",
  academyOverviewVideoPoster: "",
  paymentInfo: {
    mtnNumber: "+237673746047",
    mtnLabel: "MTN Mobile Money",
    orangeNumber: "",
    orangeLabel: "Orange Money",
    instructions: "Pay via Mobile Money to the number above, then submit your payment proof during registration. Keep your transaction ID handy.",
    instructionsFr: "Payer via Mobile Money au numéro ci-dessous, puis soumettez votre preuve de paiement lors de l'inscription. Conservez votre ID de transaction.",
  },
};
