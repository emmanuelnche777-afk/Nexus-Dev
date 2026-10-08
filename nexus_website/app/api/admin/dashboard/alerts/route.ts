import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/admin-auth";
import { hasPermission, type AdminRole } from "@/lib/permissions";
import { PERMISSIONS } from "@/lib/permissions-data";

/**
 * Dashboard alerts, filtered by what the caller is allowed to see.
 *
 * Previously gated on `content:*` alone, which meant five of eight roles could
 * not load their own dashboard. The Join Us intake alerts added here would also
 * have been invisible to every intake role for the same reason.
 *
 * Each alert now carries its own permission, so a role sees exactly the alerts
 * for the areas it owns. Counts are aggregate only — no applicant or record
 * details are exposed through this endpoint.
 */

type Alert = {
  id: string;
  title: string;
  description: string;
  href: string;
  hrefLabel: string;
  icon: string;
  priority: string;
  count: number;
};

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = user.role as AdminRole;
  const may = (permission: string) => hasPermission(role, permission);

  try {
    // Only run the queries whose alert the caller could actually receive.
    const wantRegistrations = may("academy:registrations:*");
    const wantPartnerships = may("foundation:partnerships:*");
    const wantNewsletter = may("newsletter:read");
    const wantOrders = may("techhub:services:*");
    const wantInquiries = may(PERMISSIONS.PATHWAY_INQUIRIES_READ);
    const wantApplications = may(PERMISSIONS.APPLICATIONS_READ);
    const wantListings = may(PERMISSIONS.LISTINGS_WRITE);

    const [
      pendingApps,
      privateEnrollmentRequests,
      partnerInquiries,
      newsletterCount,
      pendingOrders,
      newPathwayInquiries,
      newApplications,
      openListings,
    ] = await Promise.all([
      wantRegistrations
        ? prisma.pendingApplication.count({ where: { status: "new" } })
        : 0,
      wantRegistrations
        ? prisma.academyPrivateEnrollmentRequest.count({ where: { status: "new" } })
        : 0,
      wantPartnerships
        ? prisma.partnerInquiry.count({
            where: { status: { in: ["new", "pending", "under-review", "reviewing", "interested"] } },
          })
        : 0,
      wantNewsletter ? prisma.newsletterSubscriber.count() : 0,
      wantOrders
        ? prisma.serviceOrder.count({
            where: { status: { in: ["new", "in_progress"] } },
          })
        : 0,
      wantInquiries
        ? prisma.pathwayInquiry.count({ where: { status: "NEW" } })
        : 0,
      wantApplications
        ? prisma.opportunityApplication.count({ where: { status: "NEW" } })
        : 0,
      wantListings
        ? prisma.opportunity.count({ where: { lifecycle: "OPEN" } })
        : 0,
    ]);

    const alerts: Alert[] = [];

    if (pendingApps > 0) {
      alerts.push({
        id: "pending-apps",
        title: "Academy Registrations Awaiting Verification",
        description: `${pendingApps} registration${pendingApps !== 1 ? "s" : ""} pending review`,
        href: "/admin/academy/registrations",
        hrefLabel: "View Registrations",
        icon: "Users",
        priority: "critical",
        count: pendingApps,
      });
    }

    if (privateEnrollmentRequests > 0) {
      alerts.push({
        id: "academy-private-enrollment-requests",
        title: "New Private Training Requests",
        description: `${privateEnrollmentRequests} request${privateEnrollmentRequests !== 1 ? "s" : ""} awaiting review`,
        href: "/admin/academy/private-requests",
        hrefLabel: "Review Requests",
        icon: "GraduationCap",
        priority: "important",
        count: privateEnrollmentRequests,
      });
    }

    if (newPathwayInquiries > 0) {
      alerts.push({
        id: "new-pathway-inquiries",
        title: "New Join Us Inquiries",
        description: `${newPathwayInquiries} pathway inquir${
          newPathwayInquiries !== 1 ? "ies" : "y"
        } awaiting first review`,
        href: "/admin/joiners",
        hrefLabel: "View Inquiries",
        icon: "UserPlus",
        priority: "important",
        count: newPathwayInquiries,
      });
    }

    if (newApplications > 0) {
      alerts.push({
        id: "new-opportunity-applications",
        title: "New Opportunity Applications",
        description: `${newApplications} application${
          newApplications !== 1 ? "s" : ""
        } awaiting review`,
        href: "/admin/opportunity-applications",
        hrefLabel: "View Applications",
        icon: "Briefcase",
        priority: "important",
        count: newApplications,
      });
    }

    if (openListings > 0) {
      alerts.push({
        id: "open-listings",
        title: "Open Opportunity Listings",
        description: `${openListings} listing${
          openListings !== 1 ? "s are" : " is"
        } live on the Join Us page`,
        href: "/admin/content/opportunities",
        hrefLabel: "Manage Listings",
        icon: "BookOpen",
        priority: "normal",
        count: openListings,
      });
    }

    if (partnerInquiries > 0) {
      alerts.push({
        id: "partner-requests",
        title: "Partnership Requests Pending",
        description: `${partnerInquiries} partnership${
          partnerInquiries !== 1 ? "s" : ""
        } awaiting review`,
        href: "/admin/partnerships",
        hrefLabel: "View Requests",
        icon: "Briefcase",
        priority: "important",
        count: partnerInquiries,
      });
    }

    if (newsletterCount > 0) {
      alerts.push({
        id: "newsletter",
        title: "New Newsletter Subscribers",
        description: `${newsletterCount} new subscriber${newsletterCount !== 1 ? "s" : ""}`,
        href: "/admin/newsletter",
        hrefLabel: "View Subscribers",
        icon: "Mail",
        priority: "normal",
        count: newsletterCount,
      });
    }

    if (pendingOrders > 0) {
      alerts.push({
        id: "service-orders",
        title: "Service Orders Requiring Attention",
        description: `${pendingOrders} service order${
          pendingOrders !== 1 ? "s" : ""
        } need response`,
        href: "/admin/tech-hub/orders",
        hrefLabel: "View Orders",
        icon: "ClipboardList",
        priority: "important",
        count: pendingOrders,
      });
    }

    return NextResponse.json({ alerts });
  } catch {
    return NextResponse.json({ alerts: [] });
  }
}
