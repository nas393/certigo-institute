// Localized strings for the new Chapter I–IX accordion and the
// Chapter IX Global Certification Catalog grid. Kept separate so the main
// i18n.tsx dictionary stays readable.

import type { Lang } from "@/lib/i18n";

export interface ChapterStrings {
  chapter1: string; chapter2: string; chapter3: string; chapter4: string;
  chapter5: string; chapter6: string; chapter7: string; chapter8: string; chapter9: string;
  chapter1_title: string; chapter2_title: string; chapter3_title: string;
  chapter4_title: string; chapter5_title: string; chapter6_title: string;
  chapter7_title: string; chapter8_title: string; chapter9_title: string;
}

export interface CatalogStrings {
  eyebrow: string;
  title: string;
  subtitle: string;
  start: string;
  competencies: string;
  quizReady: string;
  cert: Record<string, string>; // course code -> localized title
}

const CHAPTER_LABELS: Record<Lang, ChapterStrings> = {
  en: {
    chapter1: "Chapter I", chapter2: "Chapter II", chapter3: "Chapter III",
    chapter4: "Chapter IV", chapter5: "Chapter V", chapter6: "Chapter VI",
    chapter7: "Chapter VII", chapter8: "Chapter VIII", chapter9: "Chapter IX",
    chapter1_title: "The trust gap in modern hiring",
    chapter2_title: "How CERTIGO. works",
    chapter3_title: "One platform, three surfaces",
    chapter4_title: "Built for three audiences",
    chapter5_title: "Pricing that scales",
    chapter6_title: "Security & compliance",
    chapter7_title: "Use case in production",
    chapter8_title: "Common course syllabuses",
    chapter9_title: "Global Certification Catalog",
  },
  fr: {
    chapter1: "Chapitre I", chapter2: "Chapitre II", chapter3: "Chapitre III",
    chapter4: "Chapitre IV", chapter5: "Chapitre V", chapter6: "Chapitre VI",
    chapter7: "Chapitre VII", chapter8: "Chapitre VIII", chapter9: "Chapitre IX",
    chapter1_title: "La crise de confiance du recrutement moderne",
    chapter2_title: "Comment fonctionne CERTIGO.",
    chapter3_title: "Une plateforme, trois interfaces",
    chapter4_title: "Conçu pour trois publics",
    chapter5_title: "Une tarification qui s'adapte",
    chapter6_title: "Sécurité et conformité",
    chapter7_title: "Cas d'usage en production",
    chapter8_title: "Syllabus des cours phares",
    chapter9_title: "Catalogue mondial de certifications",
  },
  es: {
    chapter1: "Capítulo I", chapter2: "Capítulo II", chapter3: "Capítulo III",
    chapter4: "Capítulo IV", chapter5: "Capítulo V", chapter6: "Capítulo VI",
    chapter7: "Capítulo VII", chapter8: "Capítulo VIII", chapter9: "Capítulo IX",
    chapter1_title: "La brecha de confianza en la contratación moderna",
    chapter2_title: "Cómo funciona CERTIGO.",
    chapter3_title: "Una plataforma, tres superficies",
    chapter4_title: "Pensado para tres audiencias",
    chapter5_title: "Precios que escalan",
    chapter6_title: "Seguridad y cumplimiento",
    chapter7_title: "Caso de uso en producción",
    chapter8_title: "Programas de los cursos comunes",
    chapter9_title: "Catálogo global de certificaciones",
  },
  pt: {
    chapter1: "Capítulo I", chapter2: "Capítulo II", chapter3: "Capítulo III",
    chapter4: "Capítulo IV", chapter5: "Capítulo V", chapter6: "Capítulo VI",
    chapter7: "Capítulo VII", chapter8: "Capítulo VIII", chapter9: "Capítulo IX",
    chapter1_title: "A lacuna de confiança no recrutamento moderno",
    chapter2_title: "Como funciona o CERTIGO.",
    chapter3_title: "Uma plataforma, três interfaces",
    chapter4_title: "Construído para três públicos",
    chapter5_title: "Preços que escalam",
    chapter6_title: "Segurança e conformidade",
    chapter7_title: "Caso de uso em produção",
    chapter8_title: "Ementas dos cursos principais",
    chapter9_title: "Catálogo global de certificações",
  },
  ar: {
    chapter1: "الفصل الأول", chapter2: "الفصل الثاني", chapter3: "الفصل الثالث",
    chapter4: "الفصل الرابع", chapter5: "الفصل الخامس", chapter6: "الفصل السادس",
    chapter7: "الفصل السابع", chapter8: "الفصل الثامن", chapter9: "الفصل التاسع",
    chapter1_title: "فجوة الثقة في التوظيف الحديث",
    chapter2_title: "كيف تعمل CERTIGO.",
    chapter3_title: "منصة واحدة، ثلاث واجهات",
    chapter4_title: "مصمَّمة لثلاث فئات",
    chapter5_title: "تسعير قابل للتوسع",
    chapter6_title: "الأمان والامتثال",
    chapter7_title: "حالة استخدام في الإنتاج",
    chapter8_title: "مناهج الدورات الشائعة",
    chapter9_title: "كتالوج الشهادات العالمي",
  },
};

const CATALOG: Record<Lang, CatalogStrings> = {
  en: {
    eyebrow: "Global Certification Catalog",
    title: "Ten flagship certifications. Audit-grade. Globally portable.",
    subtitle: "Every CERTIGO. certification is competency-mapped, examinable and instantly verifiable on the public registry.",
    start: "Start Certification",
    competencies: "Passed competencies",
    quizReady: "Quiz ready",
    cert: {
      "PM-101": "Project Management",
      "MK-110": "Marketing Foundations",
      "LD-200": "Leadership",
      "SC-310": "Supply Chain & Logistics Management",
      "DT-410": "Digital Transformation Strategy",
      "HR-220": "Human Resources & Talent Strategy",
      "RC-330": "Risk Management & Global Compliance",
      "FN-240": "Financial Intelligence for Managers",
      "OE-340": "Operational Excellence & Lean Six Sigma",
      "CS-350": "Data Privacy & Cybersecurity Governance",
    },
  },
  fr: {
    eyebrow: "Catalogue mondial de certifications",
    title: "Dix certifications phares. Niveau audit. Portables dans le monde entier.",
    subtitle: "Chaque certification CERTIGO. est cartographiée par compétences, examinable et vérifiable instantanément sur le registre public.",
    start: "Démarrer la certification",
    competencies: "Compétences validées",
    quizReady: "Quiz prêt",
    cert: {
      "PM-101": "Gestion de projet",
      "MK-110": "Fondamentaux du marketing",
      "LD-200": "Leadership",
      "SC-310": "Supply chain et logistique",
      "DT-410": "Stratégie de transformation digitale",
      "HR-220": "Ressources humaines et stratégie talents",
      "RC-330": "Gestion des risques et conformité",
      "FN-240": "Intelligence financière pour managers",
      "OE-340": "Excellence opérationnelle et Lean Six Sigma",
      "CS-350": "Confidentialité des données et cybersécurité",
    },
  },
  es: {
    eyebrow: "Catálogo global de certificaciones",
    title: "Diez certificaciones insignia. Calidad de auditoría. Portátiles a nivel global.",
    subtitle: "Cada certificación CERTIGO. está mapeada por competencias, es examinable y verificable al instante en el registro público.",
    start: "Iniciar certificación",
    competencies: "Competencias superadas",
    quizReady: "Examen listo",
    cert: {
      "PM-101": "Gestión de proyectos",
      "MK-110": "Fundamentos de marketing",
      "LD-200": "Liderazgo",
      "SC-310": "Cadena de suministro y logística",
      "DT-410": "Estrategia de transformación digital",
      "HR-220": "Recursos humanos y estrategia de talento",
      "RC-330": "Gestión de riesgos y cumplimiento global",
      "FN-240": "Inteligencia financiera para directivos",
      "OE-340": "Excelencia operativa y Lean Six Sigma",
      "CS-350": "Privacidad de datos y ciberseguridad",
    },
  },
  pt: {
    eyebrow: "Catálogo global de certificações",
    title: "Dez certificações principais. Nível de auditoria. Portáveis globalmente.",
    subtitle: "Cada certificação CERTIGO. é mapeada por competências, examinável e verificável instantaneamente no registro público.",
    start: "Iniciar certificação",
    competencies: "Competências aprovadas",
    quizReady: "Quiz pronto",
    cert: {
      "PM-101": "Gestão de projetos",
      "MK-110": "Fundamentos de marketing",
      "LD-200": "Liderança",
      "SC-310": "Cadeia de suprimentos e logística",
      "DT-410": "Estratégia de transformação digital",
      "HR-220": "Recursos humanos e estratégia de talentos",
      "RC-330": "Gestão de riscos e conformidade global",
      "FN-240": "Inteligência financeira para gestores",
      "OE-340": "Excelência operacional e Lean Six Sigma",
      "CS-350": "Privacidade de dados e cibersegurança",
    },
  },
  ar: {
    eyebrow: "كتالوج الشهادات العالمي",
    title: "عشر شهادات رائدة. بمستوى تدقيق. قابلة للحمل عالميًا.",
    subtitle: "كل شهادة من CERTIGO. مرتبطة بكفاءات قابلة للاختبار والتحقق الفوري عبر السجل العام.",
    start: "ابدأ الشهادة",
    competencies: "الكفاءات المُجتازة",
    quizReady: "الاختبار جاهز",
    cert: {
      "PM-101": "إدارة المشاريع",
      "MK-110": "أساسيات التسويق",
      "LD-200": "القيادة",
      "SC-310": "إدارة سلسلة التوريد واللوجستيات",
      "DT-410": "استراتيجية التحول الرقمي",
      "HR-220": "الموارد البشرية واستراتيجية المواهب",
      "RC-330": "إدارة المخاطر والامتثال العالمي",
      "FN-240": "الذكاء المالي للمديرين",
      "OE-340": "التميز التشغيلي و Lean Six Sigma",
      "CS-350": "خصوصية البيانات وحوكمة الأمن السيبراني",
    },
  },
};

export function chapters(lang: Lang): ChapterStrings {
  return CHAPTER_LABELS[lang] ?? CHAPTER_LABELS.en;
}

export function catalog(lang: Lang): CatalogStrings {
  return CATALOG[lang] ?? CATALOG.en;
}
