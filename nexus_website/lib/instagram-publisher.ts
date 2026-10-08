import { getPublicUrl } from "@/lib/urls";
import { getUsableInstagramConnection } from "@/lib/instagram-login";

type InstagramApiError = { error?: { message?: string; error_user_msg?: string } };

async function readInstagramError(response: Response): Promise<string> {
  try {
    const data = await response.json() as InstagramApiError;
    return data.error?.error_user_msg || data.error?.message || `Instagram returned HTTP ${response.status}.`;
  } catch {
    return `Instagram returned HTTP ${response.status}.`;
  }
}

export async function publishInstagramPhoto(mediaPath: string, caption: string): Promise<string> {
  const connection = await getUsableInstagramConnection();
  if (!connection) throw new Error("Connect the NEXUS Instagram account before publishing.");

  let imageUrl: URL;
  try {
    imageUrl = new URL(mediaPath, getPublicUrl());
  } catch {
    throw new Error("The attached image URL is invalid.");
  }
  if (imageUrl.protocol !== "https:") {
    throw new Error("Instagram needs a public HTTPS image URL. Local uploads cannot be published.");
  }
  if (!/\.(jpe?g)$/i.test(imageUrl.pathname)) {
    throw new Error("Instagram publishing currently needs an attached JPG or JPEG image.");
  }

  const version = process.env.INSTAGRAM_GRAPH_API_VERSION || "v26.0";
  const token = connection.accessToken;
  const containerResponse = await fetch(`https://graph.instagram.com/${version}/${encodeURIComponent(connection.userId)}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ image_url: imageUrl.toString(), caption, access_token: token }),
    cache: "no-store",
  });
  if (!containerResponse.ok) throw new Error(await readInstagramError(containerResponse));
  const container = await containerResponse.json() as { id?: string };
  if (!container.id) throw new Error("Instagram did not return a media container ID.");

  const publishResponse = await fetch(`https://graph.instagram.com/${version}/${encodeURIComponent(connection.userId)}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ creation_id: container.id, access_token: token }),
    cache: "no-store",
  });
  if (!publishResponse.ok) throw new Error(await readInstagramError(publishResponse));
  const published = await publishResponse.json() as { id?: string };
  if (!published.id) throw new Error("Instagram did not confirm the published post.");
  return published.id;
}
