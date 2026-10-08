import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();
const DATA_DIR = path.join(process.cwd(), "data");

// Seed fixtures currently use several legacy JSON layouts. Keep this boundary
// dynamic until each fixture is migrated to an explicit schema.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function readJson(name: string): Promise<any> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, name), "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function safeCreate<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T | null> {
  try {
    const result = await fn();
    console.log(`  ✓ ${label}`);
    return result;
  } catch (err: unknown) {
    console.error(`  ✗ ${label}: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

async function main() {
  console.log("🌱 Seeding NEXUS database...\n");

  console.log("📌 Admin users");
  await safeCreate("admin users (skipped — use env credentials)", async () => {
    const count = await prisma.adminUser.count();
    return count;
  });

  console.log("\n📚 Academy");
  const programs = (await readJson("academy-programs.json")) || [];
  for (const p of programs) {
    await safeCreate(`program: ${p.slug}`, () =>
      prisma.program.upsert({
        where: { slug: p.slug },
        update: {
          title: p.title,
          durationWeeks: p.durationWeeks || 12,
          price: p.price || 0,
          currency: p.currency || "XAF",
          thumbnailUrl: p.thumbnailUrl,
          overviewVideoUrl: p.overviewVideoUrl,
          shortDescription: p.shortDescription,
          fullDescription: p.fullDescription,
          targetAudience: p.targetAudience,
          certification: p.certification,
          tools: p.tools || [],
          highlights: p.highlights || [],
          requirements: p.requirements || [],
          awards: p.awards || [],
          curriculumModules: p.curriculumModules || [],
          instructors: p.instructors || [],
          featured: p.featured || false,
          status: p.status || "active",
        },
        create: {
          slug: p.slug,
          title: p.title,
          durationWeeks: p.durationWeeks || 12,
          price: p.price || 0,
          currency: p.currency || "XAF",
          thumbnailUrl: p.thumbnailUrl,
          overviewVideoUrl: p.overviewVideoUrl,
          shortDescription: p.shortDescription,
          fullDescription: p.fullDescription,
          targetAudience: p.targetAudience,
          certification: p.certification,
          tools: p.tools || [],
          highlights: p.highlights || [],
          requirements: p.requirements || [],
          awards: p.awards || [],
          curriculumModules: p.curriculumModules || [],
          instructors: p.instructors || [],
          featured: p.featured || false,
          status: p.status || "active",
        },
      })
    );
  }

  console.log("\n🛠 Services");
  const defaultServices = [
    {
      slug: "web-and-mobile-apps",
      title: "Custom Web & Mobile Apps",
      tagline: "Full-stack web apps and cross-platform mobile apps.",
      description: "Modern, scalable web applications and mobile apps built with React, Next.js, Node.js, and cloud architecture. We take you from idea and design to a deployed, production-ready product with ongoing support.",
      iconKey: "Code2",
      features: ["Modern tech stack", "Responsive design", "Secure architecture", "Ongoing support"],
      deliverables: ["Web application", "Mobile app", "Deployment & CI/CD", "Documentation"],
      sortOrder: 1,
    },
    {
      slug: "cloud-and-infrastructure",
      title: "Cloud & Infrastructure",
      tagline: "Secure deployment, pipelines, and server architecture.",
      description: "Cloud deployment, CI/CD pipelines, and server architecture tailored for reliability and performance. We help you scale confidently on AWS, Vercel, and other providers.",
      iconKey: "Server",
      features: ["Cloud deployment", "CI/CD pipelines", "Monitoring & alerts", "Scalability planning"],
      deliverables: ["Infrastructure setup", "Pipeline configuration", "Performance tuning", "Backups & recovery"],
      sortOrder: 2,
    },
    {
      slug: "digital-security-audits",
      title: "Digital Security Audits",
      tagline: "Vulnerability assessment and security hardening.",
      description: "Vulnerability assessments, code reviews, and security hardening to protect your systems from fraud and breaches. We give you a clear action plan to close every gap we find.",
      iconKey: "ShieldCheck",
      features: ["Vulnerability scan", "Code review", "Fraud prevention", "Security roadmap"],
      deliverables: ["Audit report", "Remediation plan", "Hardening guide", "Follow-up scan"],
      sortOrder: 3,
    },
    {
      slug: "technical-consulting",
      title: "Technical Consulting",
      tagline: "Architecture guidance and digital transformation strategy.",
      description: "Architecture guidance, digital transformation strategy, and technical advisory for startups and established enterprises. We help you choose the right technology and build the right roadmap.",
      iconKey: "Brain",
      features: ["Tech strategy", "Architecture design", "Team guidance", "Digital roadmap"],
      deliverables: ["Strategy document", "Architecture blueprint", "Advisory sessions", "Implementation plan"],
      sortOrder: 4,
    },
  ];

  for (const svc of defaultServices) {
    await safeCreate(`service: ${svc.slug}`, () =>
      prisma.service.upsert({
        where: { slug: svc.slug },
        update: {
          title: svc.title,
          tagline: svc.tagline,
          description: svc.description,
          iconKey: svc.iconKey,
          features: svc.features,
          deliverables: svc.deliverables,
          status: "active",
          sortOrder: svc.sortOrder,
        },
        create: {
          slug: svc.slug,
          title: svc.title,
          tagline: svc.tagline,
          description: svc.description,
          iconKey: svc.iconKey,
          features: svc.features,
          deliverables: svc.deliverables,
          status: "active",
          sortOrder: svc.sortOrder,
        },
      })
    );
  }

  const cohorts = (await readJson("academy-cohorts.json")) || [];
  for (const c of cohorts) {
    await safeCreate(`cohort: ${c.name}`, () =>
      prisma.cohort.upsert({
        where: { id: c.id },
        update: {
          programSlug: c.programSlug,
          name: c.name,
          period: c.period,
          status: c.status,
          startDate: new Date(c.startDate),
          endDate: new Date(c.endDate),
          applicationDeadline: new Date(c.applicationDeadline),
          maxStudents: c.maxStudents,
          currentStudents: c.currentStudents || 0,
          location: c.location,
          schedule: c.schedule,
          price: c.price || 0,
          currency: c.currency || "XAF",
          description: c.description,
        },
        create: {
          id: c.id,
          programSlug: c.programSlug,
          name: c.name,
          period: c.period,
          status: c.status,
          startDate: new Date(c.startDate),
          endDate: new Date(c.endDate),
          applicationDeadline: new Date(c.applicationDeadline),
          maxStudents: c.maxStudents,
          currentStudents: c.currentStudents || 0,
          location: c.location,
          schedule: c.schedule,
          price: c.price || 0,
          currency: c.currency || "XAF",
          description: c.description,
        },
      })
    );
  }

  console.log("\n❓ FAQ");
  const faqs = (await readJson("faq.json")) || [];
  for (const f of faqs) {
    await safeCreate(`faq: ${f.question.slice(0, 40)}...`, () =>
      prisma.faq.upsert({
        where: { id: f.id },
        update: {
          question: f.question,
          answer: f.answer,
          category: f.category || "general",
          order: f.order || 0,
        },
        create: {
          id: f.id,
          question: f.question,
          answer: f.answer,
          category: f.category || "general",
          order: f.order || 0,
        },
      })
    );
  }

  console.log("\n📰 Blog posts");
  const blogPostsFile = await readJson("blog/posts.json");
  // The checked-in blog fixture has a legacy, content-dependent shape.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blogPosts: any[] = Array.isArray(blogPostsFile) ? blogPostsFile : [];
  for (const post of blogPosts) {
    const authorName =
      typeof post.author === "string"
        ? post.author
        : post.author
          ? JSON.stringify(post.author)
          : null;
    await safeCreate(`blog: ${post.slug}`, () =>
      prisma.blogPost.upsert({
        where: { slug: post.slug },
        update: {
          title: post.title,
          titleFr: post.titleFr,
          excerpt: post.excerpt || "",
          excerptFr: post.excerptFr,
          content: post.content || [],
          contentFr: post.contentFr || [],
          date: post.date,
          category: post.category || "general",
          categoryFr: post.categoryFr,
          readingTime: post.readingTime,
          featured: post.featured || false,
          seo: post.seo,
          author: authorName,
          coverImage: post.coverImage,
          tags: post.tags || [],
          published: post.status !== "draft",
          publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
        },
        create: {
          slug: post.slug,
          title: post.title,
          titleFr: post.titleFr,
          excerpt: post.excerpt || "",
          excerptFr: post.excerptFr,
          content: post.content || [],
          contentFr: post.contentFr || [],
          date: post.date,
          category: post.category || "general",
          categoryFr: post.categoryFr,
          readingTime: post.readingTime,
          featured: post.featured || false,
          seo: post.seo,
          author: authorName,
          coverImage: post.coverImage,
          tags: post.tags || [],
          published: post.status !== "draft",
          publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
        },
      })
    );
  }

  console.log("\n🗺 Journey");
  const journey = (await readJson("journey.json")) || [];
  for (const j of journey) {
    await safeCreate(`journey: ${j.title}`, () =>
      prisma.journeyEntry.upsert({
        where: { id: j.id },
        update: {
          date: j.date,
          title: j.title,
          description: j.description,
          fullContent: j.fullContent,
          status: j.status,
          category: j.category,
          priority: j.priority || 5,
          tags: j.tags || [],
          media: j.media || [],
        },
        create: {
          id: j.id,
          date: j.date,
          title: j.title,
          description: j.description,
          fullContent: j.fullContent,
          status: j.status,
          category: j.category,
          priority: j.priority || 5,
          tags: j.tags || [],
          media: j.media || [],
        },
      })
    );
  }

  console.log("\n🎬 AI Videos");
  const videos = (await readJson("ai-videos.json")) || [];
  for (const v of videos) {
    await safeCreate(`video: ${v.title}`, () =>
      prisma.aiVideo.upsert({
        where: { id: v.id },
        update: {
          title: v.title,
          description: v.description,
          videoUrl: v.videoUrl,
          thumbnailUrl: v.thumbnailUrl,
          category: v.category,
          duration: v.duration,
          tags: v.tags || [],
          status: v.status || "published",
        },
        create: {
          id: v.id,
          title: v.title,
          description: v.description,
          videoUrl: v.videoUrl,
          thumbnailUrl: v.thumbnailUrl,
          category: v.category,
          duration: v.duration,
          tags: v.tags || [],
          status: v.status || "published",
        },
      })
    );
  }

  console.log("\n💬 AI Conversations");
  const conversations = (await readJson("ai-conversations.json")) || [];
  for (const c of conversations) {
    await safeCreate(`ai conv: ${c.id}`, () =>
      prisma.aiConversation.upsert({
        where: { id: c.id },
        update: {
          language: c.language || "en",
          messageCount: c.messageCount || 0,
          messages: c.messages || [],
        },
        create: {
          id: c.id,
          language: c.language || "en",
          startedAt: c.startedAt ? new Date(c.startedAt) : new Date(),
          lastMessageAt: c.lastMessageAt
            ? new Date(c.lastMessageAt)
            : new Date(),
          messageCount: c.messageCount || 0,
          messages: c.messages || [],
        },
      })
    );
  }

  console.log("\n📧 Contact messages");
  const contacts = (await readJson("contact-messages.json")) || [];
  for (const c of contacts) {
    await safeCreate(`contact: ${c.id}`, () =>
      prisma.contactMessage.upsert({
        where: { id: c.id },
        update: {
          name: c.name,
          email: c.email,
          phone: c.phone,
          subject: c.subject,
          message: c.message,
          status: c.status || "new",
        },
        create: {
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          subject: c.subject,
          message: c.message,
          status: c.status || "new",
          source: c.source || "contact-form",
          createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
        },
      })
    );
  }

  console.log("\n🤝 Partner inquiries");
  const partners = (await readJson("partner-inquiries.json")) || [];
  for (const p of partners) {
    await safeCreate(`partner: ${p.id}`, () =>
      prisma.partnerInquiry.upsert({
        where: { id: p.id },
        update: {
          name: p.name,
          email: p.email,
          organization: p.organization,
          type: p.type,
          message: p.message,
          status: p.status || "new",
        },
        create: {
          id: p.id,
          name: p.name,
          email: p.email,
          organization: p.organization,
          type: p.type,
          message: p.message,
          status: p.status || "new",
          createdAt: p.date ? new Date(p.date) : new Date(),
        },
      })
    );
  }

  console.log("\n📰 Newsletter");
  const newsletter = (await readJson("newsletter.json")) || [];
  for (const n of newsletter) {
    await safeCreate(`newsletter: ${n.email}`, () =>
      prisma.newsletterSubscriber.upsert({
        where: { id: n.id },
        update: { email: n.email, status: n.status || "active" },
        create: {
          id: n.id,
          email: n.email,
          status: n.status || "active",
          source: n.source || "footer",
          createdAt: n.date ? new Date(n.date) : new Date(),
        },
      })
    );
  }

  console.log("\n💼 Service orders + milestones");
  const orders = (await readJson("service-orders.json")) || [];
  for (const o of orders) {
    await safeCreate(`order: ${o.id}`, async () => {
      await prisma.serviceOrder.upsert({
        where: { id: o.id },
        update: {
          serviceType: o.serviceType,
          serviceTypeKey: o.serviceTypeKey,
          clientName: o.clientName,
          clientEmail: o.clientEmail,
          clientPhone: o.clientPhone,
          company: o.company,
          description: o.description,
          budget: o.budget,
          timeline: o.timeline,
          status: o.status,
          priority: o.priority,
          assignedTo: o.assignedTo,
          notes: o.notes,
        },
        create: {
          id: o.id,
          serviceType: o.serviceType,
          serviceTypeKey: o.serviceTypeKey,
          clientName: o.clientName,
          clientEmail: o.clientEmail,
          clientPhone: o.clientPhone,
          company: o.company,
          description: o.description,
          budget: o.budget,
          timeline: o.timeline,
          status: o.status,
          priority: o.priority,
          assignedTo: o.assignedTo,
          notes: o.notes,
          createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
        },
      });

      const milestones = o.milestones || [];
      for (const m of milestones) {
        await prisma.milestone.upsert({
          where: { id: m.id },
          update: {
            title: m.title,
            description: m.description,
            status: m.status,
            dueDate: m.dueDate ? new Date(m.dueDate) : null,
            completedAt: m.completedAt ? new Date(m.completedAt) : null,
          },
          create: {
            id: m.id,
            orderId: o.id,
            title: m.title,
            description: m.description,
            status: m.status,
            dueDate: m.dueDate ? new Date(m.dueDate) : null,
            completedAt: m.completedAt ? new Date(m.completedAt) : null,
            createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
          },
        });
      }
    });
  }

  console.log("\n💬 Live chat");
  const liveChats = (await readJson("live-chat.json")) || [];
  for (const lc of liveChats) {
    await safeCreate(`live chat: ${lc.id}`, () =>
      prisma.liveChat.upsert({
        where: { id: lc.id },
        update: {
          visitorName: lc.visitorName,
          visitorEmail: lc.visitorEmail,
          visitorPhone: lc.visitorPhone,
          messages: lc.messages || [],
          status: lc.status,
        },
        create: {
          id: lc.id,
          visitorName: lc.visitorName,
          visitorEmail: lc.visitorEmail,
          visitorPhone: lc.visitorPhone,
          messages: lc.messages || [],
          status: lc.status,
          createdAt: lc.createdAt ? new Date(lc.createdAt) : new Date(),
        },
      })
    );
  }

  console.log("\n📌 Pending applications");
  const applications = (await readJson("pending-applications.json")) || [];
  for (const a of applications) {
    const appId = a.applicationID || a.id || `app-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const appName = a.fullName || a.name || "Unknown";
    await safeCreate(`application: ${a.email}`, () =>
      prisma.pendingApplication.upsert({
        where: { id: appId },
        update: {
          name: appName,
          email: a.email,
          phone: a.phone,
          role: a.pathway || a.role,
          message: a.message,
          status: a.status || "new",
        },
        create: {
          id: appId,
          name: appName,
          email: a.email,
          phone: a.phone,
          role: a.pathway || a.role,
          message: a.message,
          status: a.status || "new",
          createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
        },
      })
    );
  }

  console.log("\n🎯 Opportunities");
  const opportunities = (await readJson("opportunities.json")) || [];
  for (const o of opportunities) {
    await safeCreate(`opportunity: ${o.id}`, () =>
      prisma.opportunity.upsert({
        where: { id: o.id },
        update: {
          title: o.title,
          description: o.description,
          type: o.type,
          location: o.location,
          url: o.url,
          deadline: o.deadline ? new Date(o.deadline) : null,
          status: o.status || "open",
        },
        create: {
          id: o.id,
          title: o.title,
          description: o.description,
          type: o.type,
          location: o.location,
          url: o.url,
          deadline: o.deadline ? new Date(o.deadline) : null,
          status: o.status || "open",
        },
      })
    );
  }

  console.log("\n🔔 Notification log");
  const notifications = (await readJson("notifications.json")) || [];
  for (const n of notifications) {
    await safeCreate(`notification: ${n.id}`, () =>
      prisma.notificationLog.upsert({
        where: { id: n.id },
        update: {
          type: n.type,
          to: n.to,
          subject: n.subject,
          body: n.body,
          status: n.status,
          result: n.result,
          error: n.error,
        },
        create: {
          id: n.id,
          type: n.type,
          to: n.to,
          subject: n.subject,
          body: n.body,
          status: n.status,
          result: n.result,
          error: n.error,
          sentAt: n.sentAt ? new Date(n.sentAt) : new Date(),
        },
      })
    );
  }

  console.log("\n🚀 Migrating historical data from JSON files...");
  
  // Data files
  const students = JSON.parse(await fs.readFile(path.join(DATA_DIR, "academy-students.json"), "utf-8"));
  const regs = JSON.parse(await fs.readFile(path.join(DATA_DIR, "academy-registrations.json"), "utf-8"));
  const payments = JSON.parse(await fs.readFile(path.join(DATA_DIR, "academy-payments.json"), "utf-8"));

  // Migrate Students
  for (const s of students) {
    await prisma.student.upsert({
      where: { studentCode: s.studentCode },
      update: {
        fullName: s.fullName,
        email: s.email,
        phone: s.phone,
        programSlug: s.programSlug,
        status: s.status,
        paymentStatus: s.paymentStatus,
        createdAt: new Date(s.createdAt),
      },
      create: {
        id: s.id,
        studentCode: s.studentCode,
        fullName: s.fullName,
        email: s.email,
        phone: s.phone,
        programSlug: s.programSlug,
        status: s.status,
        paymentStatus: s.paymentStatus,
        createdAt: new Date(s.createdAt),
      },
    });
  }

  // Migrate Registrations
  for (const r of regs) {
    await prisma.registration.upsert({
      where: { id: r.id },
      update: {
        programSlug: r.programSlug,
        fullName: r.submittedData?.fullName || r.fullName || "Unknown",
        email: r.submittedData?.email || r.email || "Unknown",
        phone: r.submittedData?.phone || r.phone || "Unknown",
        status: r.status,
      },
      create: {
        id: r.id,
        programSlug: r.programSlug,
        fullName: r.submittedData?.fullName || r.fullName || "Unknown",
        email: r.submittedData?.email || r.email || "Unknown",
        phone: r.submittedData?.phone || r.phone || "Unknown",
        status: r.status,
      },
    });
  }

  // Migrate Payments
  for (const p of payments) {
    await prisma.payment.upsert({
      where: { id: p.id },
      update: {
        studentId: p.studentId,
        registrationId: p.registrationId,
        studentCode: p.studentCode,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        method: p.method || "manual",
      },
      create: {
        id: p.id,
        studentId: p.studentId || "unknown",
        registrationId: p.registrationId,
        studentCode: p.studentCode,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        method: p.method || "manual",
      },
    });
  }
  
  console.log("✅ Data migration complete!");
  const settings = (await readJson("settings.json")) || {};
  const maintenance = (await readJson("maintenance.json")) || {};
  await safeCreate("site settings singleton", () =>
    prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: {
        siteName: settings.siteName || "NEXUS",
        tagline: settings.tagline,
        contactEmail: settings.contactEmail,
        maintenanceMode: maintenance.enabled || false,
        maintenanceMessage: maintenance.message,
        maintenanceMessageFr: maintenance.messageFr,
        academyOverviewVideoUrl: settings.academyOverviewVideoUrl || "/videos/academy/overview.mp4",
        academyOverviewVideoPoster: settings.academyOverviewVideoPoster,
        metadata: settings,
      },
      create: {
        id: "singleton",
        siteName: settings.siteName || "NEXUS",
        tagline: settings.tagline,
        contactEmail: settings.contactEmail,
        maintenanceMode: maintenance.enabled || false,
        maintenanceMessage: maintenance.message,
        maintenanceMessageFr: maintenance.messageFr,
        academyOverviewVideoUrl: settings.academyOverviewVideoUrl || "/videos/academy/overview.mp4",
        academyOverviewVideoPoster: settings.academyOverviewVideoPoster,
        metadata: settings,
      },
    })
  );

  console.log("\n✅ Seed complete!");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
