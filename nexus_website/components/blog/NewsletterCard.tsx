import NewsletterForm from "@/components/foundation/NewsletterForm";
import { usePublicSettings } from "@/components/PublicSettingsProvider";

export default function NewsletterCard() {
  const { settings, loading } = usePublicSettings();
  if (loading || !settings.newsletter) return null;

  return (
    <div className="my-12 rounded-2xl bg-nexus-navy p-8 text-center sm:p-12">
      <h3 className="text-xl font-bold text-white sm:text-2xl">
        Want more insights like this?
      </h3>
      <p className="mt-2 text-nexus-gray/80">
        Subscribe to our newsletter to stay updated on our latest developments.
      </p>
      <div className="mt-8 flex justify-center">
        <NewsletterForm
          placeholder="Enter your email"
          buttonLabel="Subscribe"
          successMessage="Thank you for subscribing!"
          invalidMessage="Invalid email address"
        />
      </div>
    </div>
  );
}
