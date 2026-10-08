"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, ToggleLeft, ToggleRight, Upload } from "lucide-react";
import { resolveVideoUrl } from "@/lib/video-url";
import { removeCloudinaryVideo, uploadCloudinaryVideo, type CloudinaryVideoUpload } from "@/lib/cloudinary-video-upload";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
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
    academyOverviewVideoPublicId: "",
    academyOverviewVideoPoster: "",
    paymentInfo: {
      mtnNumber: "+237673746047",
      mtnLabel: "MTN Mobile Money",
      orangeNumber: "",
      orangeLabel: "Orange Money",
      instructions: "Pay via Mobile Money to the number above, then submit your payment proof during registration. Keep your transaction ID handy.",
      instructionsFr: "Payer via Mobile Money au numéro ci-dessous, puis soumettez votre preuve de paiement lors de l'inscription. Conservez votre ID de transaction.",
    },
  });
  const [providers, setProviders] = useState({
    resend: { configured: false, from: "" },
    twilio: { configured: false, phone: "", whatsapp: "" },
  });
  const [editing, setEditing] = useState(false);
  const pendingVideoUploadRef = useRef<CloudinaryVideoUpload | null>(null);

  useEffect(() => () => {
    if (pendingVideoUploadRef.current) void removeCloudinaryVideo(pendingVideoUploadRef.current, "academy-settings");
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            siteName: settings.siteName,
            siteDescription: settings.siteDescription,
            contactEmail: settings.contactEmail,
            supportEmail: settings.supportEmail,
            phone: settings.phone,
            address: settings.address,
            newsletter: settings.newsletter,
            blog: settings.blog,
            aiAssistant: settings.aiAssistant,
            certificateVerification: settings.certificateVerification,
            academyOverviewVideoUrl: settings.academyOverviewVideoUrl,
            academyOverviewVideoPublicId: settings.academyOverviewVideoPublicId,
            academyOverviewVideoPoster: settings.academyOverviewVideoPoster,
            paymentInfo: settings.paymentInfo,
          },
          maintenance: {
            enabled: settings.maintenanceMode,
            message: settings.maintenanceMessage,
            messageFr: settings.maintenanceMessageFr,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.success) {
          pendingVideoUploadRef.current = null;
          alert("Settings saved successfully");
        } else {
          alert("Failed to save settings: " + (data.error || "Unknown server error."));
        }
      } else {
        const data = await res.json().catch(() => ({}));
        alert("Failed to save settings. Server error: " + (data.error || res.status + " " + res.statusText));
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Error saving settings. Please try again.");
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      const str = (v: unknown) => (v == null ? "" : String(v));
      if (data.settings) {
        const s = data.settings;
        setSettings((prev) => ({
          ...prev,
          siteName: str(s.siteName),
          siteDescription: str(s.siteDescription),
          contactEmail: str(s.contactEmail),
          supportEmail: str(s.supportEmail),
          phone: str(s.phone),
          address: str(s.address),
          newsletter: typeof s.newsletter === "boolean" ? s.newsletter : prev.newsletter,
          blog: typeof s.blog === "boolean" ? s.blog : prev.blog,
          aiAssistant: typeof s.aiAssistant === "boolean" ? s.aiAssistant : prev.aiAssistant,
          certificateVerification: typeof s.certificateVerification === "boolean" ? s.certificateVerification : prev.certificateVerification,
          academyOverviewVideoUrl: str(s.academyOverviewVideoUrl),
          academyOverviewVideoPublicId: str(s.academyOverviewVideoPublicId),
          academyOverviewVideoPoster: str(s.academyOverviewVideoPoster) || prev.academyOverviewVideoPoster,
          paymentInfo: {
            ...prev.paymentInfo,
            mtnNumber: str(s.paymentInfo?.mtnNumber),
            mtnLabel: str(s.paymentInfo?.mtnLabel),
            orangeNumber: str(s.paymentInfo?.orangeNumber),
            orangeLabel: str(s.paymentInfo?.orangeLabel),
            instructions: str(s.paymentInfo?.instructions),
            instructionsFr: str(s.paymentInfo?.instructionsFr),
          },
        }));
      }
      if (data.maintenance) {
        setSettings((prev) => ({
          ...prev,
          maintenanceMode: typeof data.maintenance.enabled === "boolean" ? data.maintenance.enabled : prev.maintenanceMode,
          maintenanceMessage: str(data.maintenance.message) || prev.maintenanceMessage,
          maintenanceMessageFr: str(data.maintenance.messageFr) || prev.maintenanceMessageFr,
        }));
      }
      if (data.providers) setProviders(data.providers);
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void loadSettings());
  }, [loadSettings]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/dashboard"
            className="rounded-md p-2 text-nexus-navy hover:bg-nexus-navy/5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-nexus-navy">Settings</h1>
            <p className="mt-1 text-sm text-nexus-navy">
              Manage site settings and integrations
            </p>
          </div>
        </div>
        <button
          onClick={editing ? handleSave : () => setEditing(true)}
          disabled={saving}
          className="rounded-lg bg-nexus-cyan px-4 py-2.5 text-sm font-medium text-white transition hover:bg-nexus-cyan-bright disabled:opacity-50"
        >
          {saving ? "Saving..." : editing ? "Update" : "Edit"}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-nexus-cyan border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* General Settings */}
          <div className="rounded-xl border border-nexus-navy/10 bg-white p-6">
            <h3 className="font-semibold text-nexus-navy">General Settings</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-nexus-navy">Site Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nexus-navy">Contact Email</label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nexus-navy">Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nexus-navy">Phone</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-nexus-navy">Address</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="rounded-xl border border-nexus-navy/10 bg-white p-6">
            <h3 className="font-semibold text-nexus-navy">Features</h3>
            <div className="mt-4 space-y-3">
              {[
                { key: "newsletter", label: "Newsletter Subscription" },
                { key: "blog", label: "Blog" },
                { key: "aiAssistant", label: "AI Assistant" },
                { key: "certificateVerification", label: "Certificate Verification" },
              ].map((feature) => (
                <div key={feature.key} className="flex items-center justify-between">
                  <span className="text-sm text-nexus-navy">{feature.label}</span>
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        [feature.key]: !settings[feature.key as keyof typeof settings],
                      })
                    }
                    className="text-nexus-cyan"
                  >
                    {settings[feature.key as keyof typeof settings] ? (
                      <ToggleRight className="h-6 w-6" />
                    ) : (
                      <ToggleLeft className="h-6 w-6" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="rounded-xl border border-nexus-navy/10 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-nexus-navy">Maintenance Mode</h3>
                <p className="mt-1 text-sm text-nexus-navy">
                  Enable to show a maintenance page to all visitors
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })
                }
                className="text-nexus-cyan"
              >
                {settings.maintenanceMode ? (
                  <ToggleRight className="h-6 w-6" />
                ) : (
                  <ToggleLeft className="h-6 w-6" />
                )}
              </button>
            </div>
            {settings.maintenanceMode && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-nexus-navy">Message (EN)</label>
                  <input
                    type="text"
                    value={settings.maintenanceMessage}
                    onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nexus-navy">Message (FR)</label>
                  <input
                    type="text"
                    value={settings.maintenanceMessageFr}
                    onChange={(e) => setSettings({ ...settings, maintenanceMessageFr: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Academy Overview Video */}
          <div className="rounded-xl border border-nexus-navy/10 bg-white p-6">
            <h3 className="font-semibold text-nexus-navy">Academy Overview Video</h3>
            <p className="mt-1 text-sm text-nexus-navy">
              Shown in the &quot;Who We Are&quot; section of the Academy page. Choose one YouTube/Vimeo link or MP4 upload (up to 40 MB) at a time.
            </p>
            <div className="mt-4 grid gap-4">
              <div>
                <label className="block text-sm font-medium text-nexus-navy">Video URL</label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={settings.academyOverviewVideoUrl}
                    onChange={(e) => {
                      const nextUrl = e.target.value;
                      const isUploadedVideo = Boolean(settings.academyOverviewVideoPublicId) || settings.academyOverviewVideoUrl.startsWith("/videos/");
                      if (isUploadedVideo && nextUrl.trim()) {
                        alert("Remove the uploaded video before entering a URL.");
                        return;
                      }
                      if (!nextUrl.trim() && settings.academyOverviewVideoUrl) {
                        if (pendingVideoUploadRef.current) void removeCloudinaryVideo(pendingVideoUploadRef.current, "academy-settings");
                        pendingVideoUploadRef.current = null;
                        setSettings((current) => ({ ...current, academyOverviewVideoUrl: "", academyOverviewVideoPublicId: "" }));
                        return;
                      }
                      setSettings((current) => ({ ...current, academyOverviewVideoUrl: nextUrl }));
                    }}
                    placeholder="/videos/academy/overview.mp4 or https://youtube.com/..."
                    className="w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                  />
                  <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-nexus-cyan bg-nexus-cyan/10 px-3 py-2 text-sm text-nexus-cyan hover:bg-nexus-cyan/20">
                    <Upload className="h-4 w-4" />
                    Upload
                    <input
                      type="file"
                      accept="video/mp4"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (settings.academyOverviewVideoUrl.trim()) {
                          alert("Remove the current URL or uploaded video before adding another video.");
                          e.target.value = "";
                          return;
                        }
                        try {
                          const uploaded = await uploadCloudinaryVideo(file, "academy-settings");
                          pendingVideoUploadRef.current = uploaded;
                          setSettings((current) => ({ ...current, academyOverviewVideoUrl: uploaded.url, academyOverviewVideoPublicId: uploaded.publicId }));
                        } catch (error) {
                          alert(error instanceof Error ? error.message : "Upload failed");
                        }
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
                {settings.academyOverviewVideoUrl && !resolveVideoUrl(settings.academyOverviewVideoUrl) && (
                  <p className="mt-1 text-xs text-red-600">Use a YouTube/Vimeo link, an MP4 file URL, or clear the field to remove the video.</p>
                )}
                <p className="mt-1 text-xs text-nexus-navy/60">Paste a YouTube or Vimeo link, or upload an MP4 file.</p>
                {settings.academyOverviewVideoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      if (pendingVideoUploadRef.current) void removeCloudinaryVideo(pendingVideoUploadRef.current, "academy-settings");
                      pendingVideoUploadRef.current = null;
                      setSettings((current) => ({ ...current, academyOverviewVideoUrl: "", academyOverviewVideoPublicId: "" }));
                    }}
                    className="mt-2 text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    Remove video
                  </button>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-nexus-navy">Poster / Thumbnail URL (optional)</label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={settings.academyOverviewVideoPoster}
                    onChange={(e) =>
                      setSettings({ ...settings, academyOverviewVideoPoster: e.target.value })
                    }
                    placeholder="/images/logo/nexus-front-md.jpg"
                    className="w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                  />
                  <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-nexus-cyan bg-nexus-cyan/10 px-3 py-2 text-sm text-nexus-cyan hover:bg-nexus-cyan/20">
                    <Upload className="h-4 w-4" />
                    Upload
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.append("file", file);
                        fd.append("type", "image");
                        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                        const data = await res.json();
                        if (res.ok && data.url) {
                          setSettings({ ...settings, academyOverviewVideoPoster: data.url });
                        } else {
                          alert(data.error || "Upload failed");
                        }
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-xl border border-nexus-navy/10 bg-white p-6">
            <h3 className="font-semibold text-nexus-navy">Mobile Money Payment Info</h3>
            <p className="mt-1 text-sm text-nexus-navy">
              Numbers shown to prospective students during registration and payment.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-nexus-navy">MTN Number</label>
                <input
                  type="text"
                  value={settings.paymentInfo.mtnNumber}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentInfo: { ...settings.paymentInfo, mtnNumber: e.target.value },
                    })
                  }
                  placeholder="+237673746047"
                  className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nexus-navy">MTN Label</label>
                <input
                  type="text"
                  value={settings.paymentInfo.mtnLabel}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentInfo: { ...settings.paymentInfo, mtnLabel: e.target.value },
                    })
                  }
                  placeholder="MTN Mobile Money"
                  className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nexus-navy">Orange Number</label>
                <input
                  type="text"
                  value={settings.paymentInfo.orangeNumber}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentInfo: { ...settings.paymentInfo, orangeNumber: e.target.value },
                    })
                  }
                  placeholder="Leave blank to hide Orange Money"
                  className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nexus-navy">Orange Label</label>
                <input
                  type="text"
                  value={settings.paymentInfo.orangeLabel}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentInfo: { ...settings.paymentInfo, orangeLabel: e.target.value },
                    })
                  }
                  placeholder="Orange Money"
                  className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-nexus-navy">Instructions (EN)</label>
                <textarea
                  rows={3}
                  value={settings.paymentInfo.instructions}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentInfo: { ...settings.paymentInfo, instructions: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nexus-navy">Instructions (FR)</label>
                <textarea
                  rows={3}
                  value={settings.paymentInfo.instructionsFr}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentInfo: { ...settings.paymentInfo, instructionsFr: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Notification Providers */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-nexus-navy/10 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-nexus-navy">Resend (Email)</h3>
                  <p className="mt-1 text-sm text-nexus-navy">
                    Send transactional and marketing emails
                  </p>
                </div>
                {providers.resend.configured ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div className="mt-4 space-y-2 text-sm text-nexus-navy">
                <p>Status: {providers.resend.configured ? "Configured" : "Not configured"}</p>
                {providers.resend.from && <p>From: {providers.resend.from}</p>}
              </div>
            </div>

            <div className="rounded-xl border border-nexus-navy/10 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-nexus-navy">Twilio (SMS / WhatsApp)</h3>
                  <p className="mt-1 text-sm text-nexus-navy">
                    Send SMS and WhatsApp notifications
                  </p>
                </div>
                {providers.twilio.configured ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div className="mt-4 space-y-2 text-sm text-nexus-navy">
                <p>Status: {providers.twilio.configured ? "Configured" : "Not configured"}</p>
                {providers.twilio.phone && <p>Phone: {providers.twilio.phone}</p>}
                {providers.twilio.whatsapp && <p>WhatsApp: {providers.twilio.whatsapp}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
