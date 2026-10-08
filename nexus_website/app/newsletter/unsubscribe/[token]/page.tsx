import UnsubscribeForm from "./UnsubscribeForm";

export default async function NewsletterUnsubscribePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-nexus-gray/40 px-4 py-16">
      <UnsubscribeForm token={token} />
    </main>
  );
}
