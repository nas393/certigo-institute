/** Learning paths: ordered sequences of published courses (Foundation → Advanced). Slugs must exist in `certifications`. */
export interface LearningPath { slug: string; title: string; role: string; summary: string; courses: string[]; levels?: { title: string; courses: string[] }[] }

export const PATHS: LearningPath[] = [
  { slug: "commercial-leader", title: "Commercial Leader", role: "Sales & Key Accounts",
    summary: "From serving customers well to running a pipeline, managing key accounts and winning complex deals.",
    courses: ["customer-service-excellence", "sales-pipeline-operations", "sales-and-key-account-management", "enterprise-sales-meddic", "brand-positioning"] },
  { slug: "supply-chain-import", title: "Supply Chain & Import", role: "Procurement, logistics & planning",
    summary: "Buy, import, move, store and plan stock: the full chain for importers and distributors.",
    courses: ["supply-chain-fundamentals", "procurement-and-vendor-management", "import-logistics-and-incoterms", "logistics-and-freight", "inventory-and-warehousing", "demand-planning-sop"] },
  { slug: "finance-control", title: "Finance & Control", role: "Finance & accounting",
    summary: "Work with numbers, report under IFRS, handle Angolan tax and payroll, control risk and build models.",
    courses: ["excel-and-data-for-business", "ifrs-financial-reporting-essentials", "angola-taxation-and-payroll", "internal-audit-and-controls", "financial-modeling"] },
  { slug: "people-leader", title: "People Leader", role: "Supervisors & managers",
    summary: "Lead a team, manage performance, handle hard conversations, drive change and make better decisions.",
    courses: ["team-leadership-and-supervision", "people-management-fundamentals", "performance-management", "difficult-conversations", "change-management", "executive-decision-making"] },
  { slug: "data-operations", title: "Data & Operations", role: "Analysts & operations managers",
    summary: "Read data, analyse it in Excel and SQL, then use it to run projects and operations better.",
    courses: ["data-literacy", "excel-and-data-for-business", "data-analytics-with-sql", "project-management-essentials", "operations-excellence"] },
  { slug: "trading-markets", title: "Trading & Markets", role: "Trading & markets",
    summary: "Education only. Learn how markets, orders, risk, analysis and governance work, from basics to professional level. A certificate is an exam result, not a trading licence or a regulatory record.",
    courses: ["markets-and-orders-basics", "risk-and-position-sizing-basics", "technical-analysis-in-practice", "trade-planning-and-review", "derivatives-fundamentals", "trading-risk-governance-and-compliance"],
    levels: [
      { title: "Basic", courses: ["markets-and-orders-basics", "risk-and-position-sizing-basics"] },
      { title: "Intermediate", courses: ["technical-analysis-in-practice", "trade-planning-and-review"] },
      { title: "Professional", courses: ["derivatives-fundamentals", "trading-risk-governance-and-compliance"] },
    ] },
];
