"use client";

import { useState } from "react";
import JourneyHero from "@/components/journey/JourneyHero";
import JourneyStats from "@/components/journey/JourneyStats";
import JourneyFilterBar from "@/components/journey/JourneyFilterBar";
import JourneyTimeline from "@/components/journey/JourneyTimeline";
import JourneyMediaGallery from "@/components/journey/JourneyMediaGallery";
import NewsletterSection from "@/components/journey/NewsletterSection";
import SocialLinks from "@/components/journey/SocialLinks";
import JourneyCta from "@/components/journey/JourneyCta";
import type { JourneyCategory } from "@/lib/journey";

export default function Journey() {
  const [activeFilter, setActiveFilter] = useState<JourneyCategory | "all">("all");

  return (
    <div className="bg-nexus-dark">
      <JourneyHero />
      <JourneyStats />

      {/* Timeline section */}
      <section id="timeline" className="relative overflow-hidden bg-nexus-dark py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex justify-center">
            <JourneyFilterBar
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>
          <JourneyTimeline activeFilter={activeFilter} />
        </div>
      </section>

      <JourneyMediaGallery />
      <NewsletterSection />
      <SocialLinks />
      <JourneyCta />
    </div>
  );
}
