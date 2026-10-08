CREATE TABLE "TechHubFeaturedWork" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleFr" TEXT,
    "category" TEXT NOT NULL,
    "categoryFr" TEXT,
    "description" TEXT NOT NULL,
    "descriptionFr" TEXT,
    "features" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "featuresFr" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT NOT NULL DEFAULT '',
    "linkType" TEXT NOT NULL DEFAULT 'website',
    "linkLabel" TEXT,
    "linkLabelFr" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechHubFeaturedWork_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TechHubFeaturedWork_status_sortOrder_idx" ON "TechHubFeaturedWork"("status", "sortOrder");

-- Preserve the five existing hard-coded showcase entries for the Tech Hub
-- Manager to review. They remain drafts until an official destination URL is set.
INSERT INTO "TechHubFeaturedWork"
    ("id", "title", "titleFr", "category", "categoryFr", "description", "descriptionFr", "features", "featuresFr", "imageUrl", "linkType", "linkLabel", "linkLabelFr", "status", "sortOrder", "updatedAt")
VALUES
    ('featured-trendora', 'Trendora', 'Trendora', 'E-Commerce Platform', 'Plateforme E-Commerce', 'A full-featured online shopping ecosystem with multi-vendor support, real-time inventory management, secure payment processing, and mobile-responsive design built to handle high traffic volumes.', 'Un écosystème de vente en ligne complet avec support multi-vendeurs, gestion des stocks en temps réel, traitement sécurisé des paiements et design adaptatif.', ARRAY['Multi-vendor marketplace', 'Payment integration', 'Real-time inventory', 'Admin dashboard'], ARRAY['Marketplace multi-vendeurs', 'Intégration paiements', 'Stocks en temps réel', 'Tableau de bord admin'], '/images/projects/trendora.svg', 'website', 'Visit website', 'Visiter le site', 'draft', 10, CURRENT_TIMESTAMP),
    ('featured-vipfarm', 'VIP Farm', 'VIP Farm', 'Farm Management System', 'Gestion d''Élevage', 'A comprehensive poultry management system designed for commercial farms, featuring livestock tracking, feed management, health monitoring, production analytics, and automated reporting for farm operations.', 'Un système complet de gestion d''élevage avicole pour fermes commerciales, incluant le suivi du cheptel, la gestion de l''alimentation, le suivi sanitaire et l''analyse de production.', ARRAY['Livestock tracking', 'Health monitoring', 'Feed management', 'Production analytics'], ARRAY['Suivi du cheptel', 'Suivi sanitaire', 'Gestion alimentation', 'Analyses de production'], '/images/projects/vipfarm.svg', 'website', 'Visit website', 'Visiter le site', 'draft', 20, CURRENT_TIMESTAMP),
    ('featured-academy', 'NEXUS Academy Portal', 'Portail NEXUS Academy', 'Academic Portal', 'Portail Académique', 'Internal student registration and course management system used by NEXUS Academy, featuring enrollment tracking, certificate generation, payment processing, and student verification tools.', 'Système interne d''inscription et de gestion des cours utilisé par NEXUS Academy, incluant le suivi des inscriptions, la génération de certificats et la vérification des étudiants.', ARRAY['Course registration', 'Certificate generation', 'Payment tracking', 'Student verification'], ARRAY['Inscription aux cours', 'Génération de certificats', 'Suivi des paiements', 'Vérification des étudiants'], '/images/projects/academy.svg', 'website', 'Visit website', 'Visiter le site', 'draft', 30, CURRENT_TIMESTAMP),
    ('featured-foundation', 'Foundation Campaign Tracker', 'Suivi de Campagnes Fondation', 'Campaign Management', 'Gestion de Campagnes', 'A campaign management tool built for NEXUS Foundation to track MoMo scam awareness initiatives, measuring community reach, distributing educational materials, and generating impact reports for stakeholders.', 'Outil de gestion conçu pour la NEXUS Foundation pour suivre les initiatives de sensibilisation aux arnaques MoMo, mesurer la portée communautaire et générer des rapports d''impact.', ARRAY['Campaign tracking', 'Reach analytics', 'Material distribution', 'Impact reporting'], ARRAY['Suivi de campagne', 'Analyses de portée', 'Distribution de contenus', 'Rapports d''impact'], '/images/projects/foundation.svg', 'website', 'Visit website', 'Visiter le site', 'draft', 40, CURRENT_TIMESTAMP),
    ('featured-mentorship', 'Mentorship Matching System', 'Système de Jumelage Mentorat', 'Matching Platform', 'Plateforme de Jumelage', 'An internal platform to pair NEXUS Academy graduates with industry mentors, featuring profile matching algorithms, session scheduling, progress tracking, and mentor-mentee communication tools.', 'Plateforme interne pour jumeler les diplômés de la NEXUS Academy avec des mentors du secteur, avec algorithme de correspondance, planification de sessions et suivi de progression.', ARRAY['Smart matching', 'Session scheduling', 'Progress tracking', 'Communication hub'], ARRAY['Jumelage intelligent', 'Planification des sessions', 'Suivi de progression', 'Espace de communication'], '/images/projects/mentorship.svg', 'website', 'Visit website', 'Visiter le site', 'draft', 50, CURRENT_TIMESTAMP);
