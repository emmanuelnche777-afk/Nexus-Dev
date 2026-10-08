export type Module = {
  title: string;
  weeks: number;
  topics: string[];
  project?: string;
};

export type Instructor = {
  name: string;
  title: string;
  bio: string;
  imageUrl?: string;
};

export type Program = {
  slug: string;
  title: string;
  durationWeeks: number;
  targetAudience: string;
  certification: string;
  awards: string[];
  price: number;
  currency: "XAF";
  thumbnailUrl?: string;
  overviewVideoUrl?: string;
  curriculumModules: Module[];
  requirements: string[];
  instructors: Instructor[];
  highlights: string[];
  shortDescription: string;
  fullDescription: string;
  tools: string[];
};

export const PROGRAMS: Program[] = [
  {
    slug: "software-development",
    title: "Software Development",
    durationWeeks: 12,
    targetAudience: "Beginners to intermediate developers",
    certification: "NEXUS Software Development Certificate",
    awards: ["Best Project Award", "Top Performer Scholarship", "Industry Recognition Badge"],
    price: 20600,
    currency: "XAF",
    overviewVideoUrl: "/videos/academy/software-development-overview.mp4",
    thumbnailUrl: "/images/academy/software-development.svg",
    curriculumModules: [
      {
        title: "Foundations of Programming",
        weeks: 2,
        topics: [
          "Programming fundamentals",
          "Variables, data types, and control structures",
          "Functions and modular code",
          "Debugging and problem solving"
        ]
      },
      {
        title: "Frontend Development",
        weeks: 3,
        topics: [
          "HTML5, CSS3, and modern CSS",
          "JavaScript ES6+",
          "React fundamentals",
          "State management with hooks",
          "Component composition and reusability"
        ],
        project: "Build a responsive portfolio website"
      },
      {
        title: "Backend Development",
        weeks: 3,
        topics: [
          "Node.js and Express.js",
          "RESTful API design",
          "Database design with PostgreSQL",
          "Authentication and authorization",
          "Error handling and logging"
        ],
        project: "Build a REST API for a task management app"
      },
      {
        title: "Full Stack Integration",
        weeks: 2,
        topics: [
          "Connecting frontend to backend",
          "State management with React Query",
          "File uploads and media handling",
          "Deployment with Vercel and Railway"
        ],
        project: "Deploy a full-stack application"
      },
      {
        title: "Advanced Topics & Capstone",
        weeks: 2,
        topics: [
          "Testing (unit, integration, e2e)",
          "CI/CD pipelines with GitHub Actions",
          "Performance optimization",
          "Security best practices",
          "Capstone project development"
        ],
        project: "Build and deploy a complete SaaS application"
      }
    ],
    requirements: [
      "Basic computer literacy",
      "Access to a laptop (8GB RAM minimum)",
      "Stable internet connection",
      "Willingness to learn and commit 15-20 hours/week",
      "No prior programming experience required"
    ],
    instructors: [
      {
        name: "Emzie N.",
        title: "Chief Executive & Lead Instructor",
        bio: "Full-stack developer with 8+ years experience building scalable applications. Passionate about mentoring the next generation of African developers."
      },
      {
        name: "Lesley K.",
        title: "Senior Backend Engineer",
        bio: "Backend specialist with expertise in Node.js, Go, and cloud infrastructure. Has built systems handling millions of requests."
      }
    ],
    highlights: [
      "Hands-on project-based learning",
      "1-on-1 mentorship throughout the program",
      "Industry-recognized certificate with verification",
      "Portfolio of 3+ production-ready projects",
      "Job placement support and career guidance",
      "Access to NEXUS alumni network"
    ],
    shortDescription: "Master full-stack web development with React, Node.js, and modern tools. Build real projects, get mentored by industry experts, and launch your tech career.",
    fullDescription: "This 12-week intensive program takes you from zero to job-ready full-stack developer. You'll learn by building real applications, not just watching tutorials. Each week combines live coding sessions, hands-on labs, and mentored project work. By the end, you'll have a portfolio of production-ready applications and the confidence to tackle real-world engineering challenges.",
    tools: ["React", "Node.js", "TypeScript", "PostgreSQL", "Git", "GitHub Actions", "Vercel", "Tailwind CSS", "Express.js", "React Query"]
  },
  {
    slug: "ui-ux-design",
    title: "UI/UX Design",
    durationWeeks: 10,
    targetAudience: "Designers, creatives, and career switchers",
    certification: "NEXUS UI/UX Design Certificate",
    awards: ["Best Portfolio Award", "Design Excellence Scholarship", "Community Choice Award"],
    price: 20600,
    currency: "XAF",
    overviewVideoUrl: "/videos/academy/ui-ux-design-overview.mp4",
    thumbnailUrl: "/images/academy/ui-ux-design.svg",
    curriculumModules: [
      {
        title: "Design Fundamentals",
        weeks: 2,
        topics: [
          "Design principles and visual hierarchy",
          "Color theory and typography",
          "Layout and composition",
          "Design systems and consistency"
        ]
      },
      {
        title: "User Research & Strategy",
        weeks: 2,
        topics: [
          "User research methods",
          "Persona creation and user journeys",
          "Information architecture",
          "Usability testing fundamentals"
        ],
        project: "Complete user research report for a product concept"
      },
      {
        title: "UI Design & Prototyping",
        weeks: 3,
        topics: [
          "Figma mastery",
          "Design systems and component libraries",
          "Responsive design patterns",
          "Micro-interactions and animations",
          "Design handoff to developers"
        ],
        project: "Design a complete design system and high-fidelity prototype"
      },
      {
        title: "UX Engineering & Collaboration",
        weeks: 2,
        topics: [
          "Working with developers",
          "Design tokens and CSS variables",
          "Accessibility (WCAG) guidelines",
          "Design ops and workflow optimization"
        ],
        project: "Collaborate with developers to implement a design"
      },
      {
        title: "Portfolio & Career Preparation",
        weeks: 1,
        topics: [
          "Case study writing",
          "Portfolio presentation",
          "Interview preparation",
          "Freelancing and contract work"
        ],
        project: "Complete professional portfolio with 3 case studies"
      }
    ],
    requirements: [
      "Basic computer literacy",
      "Access to a laptop (8GB RAM minimum)",
      "Figma account (free tier works)",
      "Creative curiosity and attention to detail",
      "No prior design experience required"
    ],
    instructors: [
      {
        name: "Marie N.",
        title: "Lead Product Designer",
        bio: "Product designer with 6+ years at top African tech companies. Specializes in design systems and accessible design."
      },
      {
        name: "Jean-Pierre K.",
        title: "Senior UX Researcher",
        bio: "UX researcher with experience across fintech, healthtech, and edtech. Expert in qualitative and quantitative research methods."
      }
    ],
    highlights: [
      "Learn Figma from basics to advanced",
      "Build a professional portfolio with 3 case studies",
      "Real client project experience",
      "Industry-recognized certificate with verification",
      "Design mentorship from practicing professionals",
      "Access to design community and resources"
    ],
    shortDescription: "Master UI/UX design with Figma. Learn user research, design systems, prototyping, and build a portfolio that gets you hired. No design background needed.",
    fullDescription: "This 10-week program transforms creative thinkers into professional product designers. You'll master Figma, conduct real user research, build design systems, and create a portfolio that demonstrates your ability to solve real user problems. Learn from practicing designers at top African tech companies and graduate with a portfolio that stands out.",
    tools: ["Figma", "FigJam", "Maze", "Notion", "Miro", "Adobe XD", "Principle", "UserTesting", "Hotjar", "Zeplin"]
  },
  {
    slug: "graphic-design",
    title: "Graphic Design",
    durationWeeks: 8,
    targetAudience: "Creatives, marketers, and visual storytellers",
    certification: "NEXUS Graphic Design Certificate",
    awards: ["Best Visual Identity Award", "Creative Excellence Scholarship", "Brand Impact Award"],
    price: 20600,
    currency: "XAF",
    overviewVideoUrl: "/videos/academy/graphic-design-overview.mp4",
    thumbnailUrl: "/images/academy/graphic-design.svg",
    curriculumModules: [
      {
        title: "Design Foundations",
        weeks: 2,
        topics: [
          "Design principles and elements",
          "Color theory and psychology",
          "Typography fundamentals",
          "Composition and layout"
        ]
      },
      {
        title: "Brand Identity Design",
        weeks: 2,
        topics: [
          "Logo design and brand marks",
          "Visual identity systems",
          "Brand guidelines creation",
          "Stationery and collateral design"
        ],
        project: "Complete brand identity for a fictional company"
      },
      {
        title: "Digital & Print Design",
        weeks: 2,
        topics: [
          "Social media graphics",
          "Marketing materials (flyers, posters, brochures)",
          "Print production fundamentals",
          "Design for different formats and sizes"
        ],
        project: "Multi-channel marketing campaign design"
      },
      {
        title: "Advanced Tools & Portfolio",
        weeks: 2,
        topics: [
          "Advanced Photoshop techniques",
          "Illustrator for vector graphics",
          "After Effects for motion graphics basics",
          "Portfolio curation and presentation"
        ],
        project: "Professional portfolio with 5+ diverse projects"
      }
    ],
    requirements: [
      "Basic computer literacy",
      "Access to a laptop (8GB RAM minimum)",
      "Adobe Creative Cloud subscription (student discount available)",
      "Creative eye and attention to detail",
      "No prior design experience required"
    ],
    instructors: [
      {
        name: "Grace M.",
        title: "Senior Graphic Designer",
        bio: "Brand designer with 7+ years creating identities for African startups and SMEs. Expert in visual storytelling and brand strategy."
      }
    ],
    highlights: [
      "Master Adobe Creative Suite (Photoshop, Illustrator, After Effects)",
      "Build a professional portfolio with 5+ projects",
      "Real brand identity project experience",
      "Industry-recognized certificate with verification",
      "Learn from practicing brand designers",
      "Access to design assets and templates library"
    ],
    shortDescription: "Master graphic design with Adobe Creative Suite. Create stunning visual identities, marketing materials, and build a portfolio that showcases your creative talent.",
    fullDescription: "This 8-week program teaches you professional graphic design from the ground up. You'll master Photoshop, Illustrator, and After Effects while working on real-world projects like brand identities, marketing campaigns, and social media content. Graduate with a polished portfolio and the skills to work as a freelance designer or join a creative team.",
    tools: ["Photoshop", "Illustrator", "After Effects", "InDesign", "Premiere Pro", "Lightroom", "Canva", "Behance", "Adobe Fonts", "Adobe Stock"]
  },
  {
    slug: "ai-automation",
    title: "AI Automation",
    durationWeeks: 8,
    targetAudience: "Professionals looking to automate workflows, developers, and tech enthusiasts",
    certification: "NEXUS AI Automation Certificate",
    awards: ["Best Automation Project Award", "Innovation Scholarship", "Efficiency Champion Badge"],
    price: 20600,
    currency: "XAF",
    overviewVideoUrl: "/videos/academy/ai-automation-overview.mp4",
    thumbnailUrl: "/images/academy/ai-automation.svg",
    curriculumModules: [
      {
        title: "AI Fundamentals & Prompt Engineering",
        weeks: 2,
        topics: [
          "How LLMs work",
          "Prompt engineering techniques",
          "Chain-of-thought prompting",
          "Few-shot and zero-shot learning",
          "Evaluating AI outputs"
        ]
      },
      {
        title: "No-Code Automation with AI",
        weeks: 2,
        topics: [
          "Zapier and Make (Integromat) fundamentals",
          "Connecting apps with AI",
          "Building AI-powered workflows",
          "Error handling and monitoring"
        ],
        project: "Automate a complete business workflow"
      },
      {
        title: "Custom AI Agents & RAG",
        weeks: 2,
        topics: [
          "Building custom GPTs and assistants",
          "Retrieval-Augmented Generation (RAG)",
          "Vector databases and embeddings",
          "Function calling and tool use"
        ],
        project: "Build a custom AI assistant for a specific use case"
      },
      {
        title: "AI in Production & Capstone",
        weeks: 2,
        topics: [
          "Deploying AI applications",
          "Cost optimization and monitoring",
          "Security and privacy considerations",
          "Capstone project: end-to-end AI automation"
        ],
        project: "Deploy a production-ready AI automation solution"
      }
    ],
    requirements: [
      "Basic computer literacy",
      "Access to a laptop (8GB RAM minimum)",
      "Stable internet connection",
      "Curiosity about AI and automation",
      "No coding experience required (but helpful)"
    ],
    instructors: [
      {
        name: "David T.",
        title: "AI Engineer & Automation Specialist",
        bio: "AI engineer building production LLM applications. Has automated workflows saving companies 1000+ hours/month."
      }
    ],
    highlights: [
      "Master prompt engineering and AI tools",
      "Build no-code automations with Zapier/Make",
      "Create custom AI agents with RAG",
      "Deploy production-ready AI solutions",
      "Industry-recognized certificate with verification",
      "Learn from practicing AI engineers"
    ],
    shortDescription: "Master AI automation without coding. Learn prompt engineering, build no-code workflows with Zapier/Make, create custom AI agents, and automate real business processes.",
    fullDescription: "This 8-week program demystifies AI and teaches you to build practical automation solutions. You'll learn prompt engineering, create no-code workflows with Zapier and Make, build custom AI agents using RAG, and deploy production-ready automations. Perfect for professionals who want to 10x their productivity or developers adding AI to their toolkit.",
    tools: ["ChatGPT", "Claude", "Zapier", "Make", "Pinecone", "LangChain", "OpenAI API", "n8n", "Airtable", "Notion AI"]
  }
];

export function getProgramBySlug(slug: string): Program | undefined {
  return PROGRAMS.find(p => p.slug === slug);
}

export function getAllProgramSlugs(): string[] {
  return PROGRAMS.map(p => p.slug);
}