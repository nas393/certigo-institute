export interface PresetTopic { topic: string; category: string; level?: string; }

export const PRESET_TOPICS: PresetTopic[] = [
  // Tech & Code
  { topic: "JavaScript Fundamentals", category: "Code" },
  { topic: "TypeScript for React Developers", category: "Code" },
  { topic: "React Hooks in Depth", category: "Code" },
  { topic: "Next.js 15 Essentials", category: "Code" },
  { topic: "Python Basics", category: "Code" },
  { topic: "SQL for Analysts", category: "Code" },
  { topic: "Git & GitHub Workflow", category: "Code" },
  { topic: "REST API Design", category: "Code" },
  { topic: "Docker for Beginners", category: "Code" },
  { topic: "AWS Cloud Practitioner", category: "Code" },
  // AI & Data
  { topic: "Prompt Engineering", category: "AI" },
  { topic: "Intro to Machine Learning", category: "AI" },
  { topic: "Building with LLMs", category: "AI" },
  { topic: "Data Visualization with Charts", category: "AI" },
  { topic: "Excel Power User", category: "AI" },
  { topic: "Statistics for Data Science", category: "AI" },
  { topic: "Pandas & NumPy Crash Course", category: "AI" },
  // Design
  { topic: "Figma for Product Designers", category: "Design" },
  { topic: "UI Design Principles", category: "Design" },
  { topic: "UX Research Methods", category: "Design" },
  { topic: "Typography Fundamentals", category: "Design" },
  { topic: "Color Theory for the Web", category: "Design" },
  { topic: "Design Systems 101", category: "Design" },
  { topic: "Brand Identity Basics", category: "Design" },
  // Marketing
  { topic: "SEO Fundamentals", category: "Marketing" },
  { topic: "Google Analytics 4", category: "Marketing" },
  { topic: "Content Marketing Strategy", category: "Marketing" },
  { topic: "Email Marketing Mastery", category: "Marketing" },
  { topic: "Social Media Strategy", category: "Marketing" },
  { topic: "Copywriting that Converts", category: "Marketing" },
  { topic: "Performance Ads on Meta", category: "Marketing" },
  // Business
  { topic: "Project Management Essentials", category: "Business" },
  { topic: "Agile & Scrum", category: "Business" },
  { topic: "Negotiation Skills", category: "Business" },
  { topic: "Public Speaking", category: "Business" },
  { topic: "Personal Finance 101", category: "Business" },
  { topic: "Startup Fundraising Basics", category: "Business" },
  { topic: "Product Management Foundations", category: "Business" },
  { topic: "Leadership for New Managers", category: "Business" },
  // Languages
  { topic: "Business English Writing", category: "Language" },
  { topic: "Spanish for Travelers", category: "Language" },
  { topic: "French A1 Basics", category: "Language" },
  // Lifestyle
  { topic: "Mindfulness & Meditation", category: "Lifestyle" },
  { topic: "Time Management", category: "Lifestyle" },
  { topic: "Nutrition Fundamentals", category: "Lifestyle" },
  { topic: "Strength Training Basics", category: "Lifestyle" },
  { topic: "Sleep Science", category: "Lifestyle" },
  // Creative
  { topic: "Photography Composition", category: "Creative" },
  { topic: "Video Editing with CapCut", category: "Creative" },
  { topic: "Music Theory Basics", category: "Creative" },
  { topic: "Creative Writing Workshop", category: "Creative" },
];
