import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const LANGS = [
  { code: "en", label: "English", native: "English", dir: "ltr" },
  { code: "fr", label: "French", native: "Français", dir: "ltr" },
  { code: "es", label: "Spanish", native: "Español", dir: "ltr" },
  { code: "pt", label: "Portuguese", native: "Português", dir: "ltr" },
  { code: "ar", label: "Arabic", native: "العربية", dir: "rtl" },
] as const;

export type LangCode = (typeof LANGS)[number]["code"];

export const LOCALES: Record<LangCode, string> = {
  en: "en-GB",
  fr: "fr-FR",
  es: "es-ES",
  pt: "pt-PT",
  ar: "ar",
};

/** UI strings. English is the source of truth; the rest are professional translations. */
const DICT: Record<LangCode, Record<string, string>> = {
  en: {
    "nav.catalog": "Catalog",
    "nav.shop": "Shop",
    "nav.pricing": "Pricing",
    "nav.about": "How we assess",
    "nav.hr": "For HR",
    "nav.contact": "Contact",
    "nav.learning": "My learning",
    "nav.dashboard": "Dashboard",
    "nav.profile": "Profile",
    "nav.admin": "Admin",
    "auth.signIn": "Sign in",
    "auth.signOut": "Sign out",
    "auth.start": "Browse courses",
    "lang.label": "Language",
    "lang.menu": "Choose language",

    "home.eyebrow": "Professional certificates",
    "home.h1a": "Prove what",
    "home.h1b": "you can",
    "home.h1c": "do",
    "home.sub": "Learn the essentials for free, pass a real exam, and get a certificate employers can verify in seconds.",
    "home.what": "What do you do?",
    "home.recommended": "Recommended for you",
    "home.startNow": "See the course",
    "home.browse": "or browse the full catalog →",
    "home.s1t": "Learn for free",
    "home.s1d": "Practical lessons written for working professionals. Read them at your own pace.",
    "home.s2t": "Pass a real exam",
    "home.s2d": "Questions drawn at random from a larger bank and graded on our servers. Retakes included.",
    "home.s3t": "Share a verifiable certificate",
    "home.s3d": "Every certificate has a unique number and QR code. Employers check it in seconds.",
    "role.pm": "Product Manager",
    "role.eng": "Engineer",
    "role.design": "Designer",
    "role.data": "Data / AI",

    "catalog.eyebrow": "Catalog",
    "catalog.h1": "Pick a certification.",
    "catalog.sub": "Each track is one short quiz away from a verified credential you can share to LinkedIn.",
    "catalog.start": "Start",

    "course.back": "← catalog",
    "course.edit": "Edit course",
    "course.price": "Price",
    "course.perCredential": "per credential",
    "course.questions": "questions",
    "course.toPass": "to pass",
    "course.verifiable": "verifiable credential",
    "course.enroll": "Enroll in this course",
    "course.enrollSignIn": "Sign in to enroll",
    "course.enrolled": "Enrolled",
    "course.startExam": "Start the exam",
    "course.startSignIn": "Sign in to start",
    "course.openLearning": "open my learning →",
    "course.translating": "Translating this course…",
    "course.translated": "Translated automatically. English remains the official record.",

    "cert.issued": "Certificate issued",
    "cert.congrats": "Congratulations.",
    "cert.score": "Score",
    "cert.digital": "Digital badge",
    "cert.print": "Official print",
    "cert.download": "Download PDF",
    "cert.generating": "Generating…",
    "cert.bilingualNote": "Your PDF includes the official English certificate plus a copy in {lang}.",
    "cert.publicPage": "Public certificate page →",
    "cert.verifyUrl": "Verify URL →",
  },
  fr: {
    "nav.catalog": "Catalogue",
    "nav.shop": "Boutique",
    "nav.pricing": "Tarifs",
    "nav.about": "Notre méthode",
    "nav.hr": "Pour les RH",
    "nav.contact": "Contact",
    "nav.learning": "Mes formations",
    "nav.dashboard": "Tableau de bord",
    "nav.profile": "Profil",
    "nav.admin": "Administration",
    "auth.signIn": "Se connecter",
    "auth.signOut": "Se déconnecter",
    "auth.start": "Voir les cours",
    "lang.label": "Langue",
    "lang.menu": "Choisir la langue",

    "home.eyebrow": "Certificats professionnels",
    "home.h1a": "Prouvez ce que",
    "home.h1b": "vous savez",
    "home.h1c": "faire",
    "home.sub": "Apprenez l'essentiel gratuitement, réussissez un vrai examen et obtenez un certificat vérifiable en quelques secondes.",
    "home.what": "Quel est votre métier ?",
    "home.recommended": "Recommandé pour vous",
    "home.startNow": "Voir le cours",
    "home.browse": "ou parcourir tout le catalogue →",
    "home.s1t": "Apprenez gratuitement",
    "home.s1d": "Des leçons pratiques pour les professionnels, à votre rythme.",
    "home.s2t": "Réussissez un vrai examen",
    "home.s2d": "Questions tirées au hasard d'une banque plus large et corrigées sur nos serveurs. Reprises incluses.",
    "home.s3t": "Partagez un certificat vérifiable",
    "home.s3d": "Chaque certificat a un numéro unique et un QR code. Les employeurs le vérifient en quelques secondes.",
    "role.pm": "Chef de produit",
    "role.eng": "Ingénieur",
    "role.design": "Designer",
    "role.data": "Données / IA",

    "catalog.eyebrow": "Catalogue",
    "catalog.h1": "Choisissez une certification.",
    "catalog.sub": "Chaque parcours mène, en un court examen, à une certification vérifiée partageable sur LinkedIn.",
    "catalog.start": "Commencer",

    "course.back": "← catalogue",
    "course.edit": "Modifier le cours",
    "course.price": "Prix",
    "course.perCredential": "par certification",
    "course.questions": "questions",
    "course.toPass": "pour réussir",
    "course.verifiable": "certification vérifiable",
    "course.enroll": "S'inscrire à ce cours",
    "course.enrollSignIn": "Connectez-vous pour vous inscrire",
    "course.enrolled": "Inscrit",
    "course.startExam": "Commencer l'examen",
    "course.startSignIn": "Connectez-vous pour commencer",
    "course.openLearning": "ouvrir mes formations →",
    "course.translating": "Traduction du cours en cours…",
    "course.translated": "Traduction automatique. L'anglais reste la version officielle.",

    "cert.issued": "Certificat délivré",
    "cert.congrats": "Félicitations.",
    "cert.score": "Score",
    "cert.digital": "Badge numérique",
    "cert.print": "Impression officielle",
    "cert.download": "Télécharger le PDF",
    "cert.generating": "Génération…",
    "cert.bilingualNote": "Votre PDF contient le certificat officiel en anglais et une copie en {lang}.",
    "cert.publicPage": "Page publique du certificat →",
    "cert.verifyUrl": "Lien de vérification →",
  },
  es: {
    "nav.catalog": "Catálogo",
    "nav.shop": "Tienda",
    "nav.pricing": "Precios",
    "nav.about": "Cómo evaluamos",
    "nav.hr": "Para RR. HH.",
    "nav.contact": "Contacto",
    "nav.learning": "Mi formación",
    "nav.dashboard": "Panel",
    "nav.profile": "Perfil",
    "nav.admin": "Administración",
    "auth.signIn": "Iniciar sesión",
    "auth.signOut": "Cerrar sesión",
    "auth.start": "Ver cursos",
    "lang.label": "Idioma",
    "lang.menu": "Elegir idioma",

    "home.eyebrow": "Certificados profesionales",
    "home.h1a": "Demuestra lo que",
    "home.h1b": "sabes",
    "home.h1c": "hacer",
    "home.sub": "Aprende lo esencial gratis, aprueba un examen real y obtén un certificado que las empresas verifican en segundos.",
    "home.what": "¿A qué te dedicas?",
    "home.recommended": "Recomendado para ti",
    "home.startNow": "Ver el curso",
    "home.browse": "o explorar todo el catálogo →",
    "home.s1t": "Aprende gratis",
    "home.s1d": "Lecciones prácticas para profesionales, a tu ritmo.",
    "home.s2t": "Aprueba un examen real",
    "home.s2d": "Preguntas elegidas al azar de un banco más amplio y corregidas en nuestros servidores. Reintentos incluidos.",
    "home.s3t": "Comparte un certificado verificable",
    "home.s3d": "Cada certificado tiene un número único y un código QR. Las empresas lo verifican en segundos.",
    "role.pm": "Gerente de producto",
    "role.eng": "Ingeniero",
    "role.design": "Diseñador",
    "role.data": "Datos / IA",

    "catalog.eyebrow": "Catálogo",
    "catalog.h1": "Elige una certificación.",
    "catalog.sub": "Cada itinerario está a un examen breve de una credencial verificada que puedes compartir en LinkedIn.",
    "catalog.start": "Empezar",

    "course.back": "← catálogo",
    "course.edit": "Editar curso",
    "course.price": "Precio",
    "course.perCredential": "por credencial",
    "course.questions": "preguntas",
    "course.toPass": "para aprobar",
    "course.verifiable": "credencial verificable",
    "course.enroll": "Inscribirme en este curso",
    "course.enrollSignIn": "Inicia sesión para inscribirte",
    "course.enrolled": "Inscrito",
    "course.startExam": "Comenzar el examen",
    "course.startSignIn": "Inicia sesión para comenzar",
    "course.openLearning": "abrir mi formación →",
    "course.translating": "Traduciendo este curso…",
    "course.translated": "Traducción automática. El inglés sigue siendo el registro oficial.",

    "cert.issued": "Certificado emitido",
    "cert.congrats": "Enhorabuena.",
    "cert.score": "Puntuación",
    "cert.digital": "Insignia digital",
    "cert.print": "Impresión oficial",
    "cert.download": "Descargar PDF",
    "cert.generating": "Generando…",
    "cert.bilingualNote": "Tu PDF incluye el certificado oficial en inglés y una copia en {lang}.",
    "cert.publicPage": "Página pública del certificado →",
    "cert.verifyUrl": "Enlace de verificación →",
  },
  pt: {
    "nav.catalog": "Catálogo",
    "nav.shop": "Loja",
    "nav.pricing": "Preços",
    "nav.about": "Como avaliamos",
    "nav.hr": "Para RH",
    "nav.contact": "Contacto",
    "nav.learning": "A minha formação",
    "nav.dashboard": "Painel",
    "nav.profile": "Perfil",
    "nav.admin": "Administração",
    "auth.signIn": "Entrar",
    "auth.signOut": "Sair",
    "auth.start": "Ver cursos",
    "lang.label": "Idioma",
    "lang.menu": "Escolher idioma",

    "home.eyebrow": "Certificados profissionais",
    "home.h1a": "Prove o que",
    "home.h1b": "sabe",
    "home.h1c": "fazer",
    "home.sub": "Aprenda o essencial gratuitamente, passe num exame a sério e receba um certificado que os empregadores verificam em segundos.",
    "home.what": "O que faz?",
    "home.recommended": "Recomendado para você",
    "home.startNow": "Ver o curso",
    "home.browse": "ou ver todo o catálogo →",
    "home.s1t": "Aprenda gratuitamente",
    "home.s1d": "Lições práticas para profissionais, ao seu ritmo.",
    "home.s2t": "Passe num exame a sério",
    "home.s2d": "Perguntas sorteadas de um banco maior e corrigidas nos nossos servidores. Repetições incluídas.",
    "home.s3t": "Partilhe um certificado verificável",
    "home.s3d": "Cada certificado tem um número único e um código QR. Os empregadores verificam-no em segundos.",
    "role.pm": "Gestor de produto",
    "role.eng": "Engenheiro",
    "role.design": "Designer",
    "role.data": "Dados / IA",

    "catalog.eyebrow": "Catálogo",
    "catalog.h1": "Escolha uma certificação.",
    "catalog.sub": "Cada percurso está a um exame curto de uma credencial verificada que pode partilhar no LinkedIn.",
    "catalog.start": "Começar",

    "course.back": "← catálogo",
    "course.edit": "Editar curso",
    "course.price": "Preço",
    "course.perCredential": "por credencial",
    "course.questions": "perguntas",
    "course.toPass": "para passar",
    "course.verifiable": "credencial verificável",
    "course.enroll": "Inscrever-me neste curso",
    "course.enrollSignIn": "Entre para se inscrever",
    "course.enrolled": "Inscrito",
    "course.startExam": "Iniciar o exame",
    "course.startSignIn": "Entre para iniciar",
    "course.openLearning": "abrir a minha formação →",
    "course.translating": "A traduzir este curso…",
    "course.translated": "Tradução automática. O inglês continua a ser o registo oficial.",

    "cert.issued": "Certificado emitido",
    "cert.congrats": "Parabéns.",
    "cert.score": "Pontuação",
    "cert.digital": "Insígnia digital",
    "cert.print": "Impressão oficial",
    "cert.download": "Descarregar PDF",
    "cert.generating": "A gerar…",
    "cert.bilingualNote": "O seu PDF inclui o certificado oficial em inglês e uma cópia em {lang}.",
    "cert.publicPage": "Página pública do certificado →",
    "cert.verifyUrl": "Ligação de verificação →",
  },
  ar: {
    "nav.catalog": "الدورات",
    "nav.shop": "المتجر",
    "nav.pricing": "الأسعار",
    "nav.about": "كيف نقيّم",
    "nav.hr": "للموارد البشرية",
    "nav.contact": "اتصل بنا",
    "nav.learning": "تعلّمي",
    "nav.dashboard": "لوحة التحكم",
    "nav.profile": "الملف الشخصي",
    "nav.admin": "الإدارة",
    "auth.signIn": "تسجيل الدخول",
    "auth.signOut": "تسجيل الخروج",
    "auth.start": "تصفّح الدورات",
    "lang.label": "اللغة",
    "lang.menu": "اختر اللغة",

    "home.eyebrow": "شهادات مهنية",
    "home.h1a": "أثبت ما",
    "home.h1b": "تستطيع",
    "home.h1c": "فعله",
    "home.sub": "تعلّم الأساسيات مجانًا، واجتز امتحانًا حقيقيًا، واحصل على شهادة يتحقق منها أصحاب العمل في ثوانٍ.",
    "home.what": "ما هو مجال عملك؟",
    "home.recommended": "مُقترح لك",
    "home.startNow": "عرض الدورة",
    "home.browse": "أو استعرض جميع الدورات →",
    "home.s1t": "تعلّم مجانًا",
    "home.s1d": "دروس عملية للمهنيين، بالسرعة التي تناسبك.",
    "home.s2t": "اجتز امتحانًا حقيقيًا",
    "home.s2d": "أسئلة مختارة عشوائيًا من بنك أكبر وتُصحَّح على خوادمنا. إعادة المحاولة مشمولة.",
    "home.s3t": "شارك شهادة قابلة للتحقق",
    "home.s3d": "لكل شهادة رقم فريد ورمز QR. يتحقق منها أصحاب العمل في ثوانٍ.",
    "role.pm": "مدير منتج",
    "role.eng": "مهندس",
    "role.design": "مصمم",
    "role.data": "البيانات / الذكاء الاصطناعي",

    "catalog.eyebrow": "الدورات",
    "catalog.h1": "اختر شهادة.",
    "catalog.sub": "كل مسار يفصلك عنه اختبار قصير للحصول على شهادة موثّقة تشاركها على LinkedIn.",
    "catalog.start": "ابدأ",

    "course.back": "← الدورات",
    "course.edit": "تعديل الدورة",
    "course.price": "السعر",
    "course.perCredential": "لكل شهادة",
    "course.questions": "أسئلة",
    "course.toPass": "للنجاح",
    "course.verifiable": "شهادة قابلة للتحقق",
    "course.enroll": "التسجيل في هذه الدورة",
    "course.enrollSignIn": "سجّل الدخول للتسجيل",
    "course.enrolled": "مُسجَّل",
    "course.startExam": "ابدأ الاختبار",
    "course.startSignIn": "سجّل الدخول للبدء",
    "course.openLearning": "افتح تعلّمي →",
    "course.translating": "جارٍ ترجمة هذه الدورة…",
    "course.translated": "ترجمة آلية. تبقى النسخة الإنجليزية هي السجل الرسمي.",

    "cert.issued": "تم إصدار الشهادة",
    "cert.congrats": "تهانينا.",
    "cert.score": "النتيجة",
    "cert.digital": "الشارة الرقمية",
    "cert.print": "النسخة الرسمية للطباعة",
    "cert.download": "تنزيل PDF",
    "cert.generating": "جارٍ الإنشاء…",
    "cert.bilingualNote": "يحتوي ملف PDF على الشهادة الرسمية بالإنجليزية ونسخة بـ{lang}.",
    "cert.publicPage": "الصفحة العامة للشهادة →",
    "cert.verifyUrl": "رابط التحقق →",
  },
};

const STORAGE_KEY = "certigo.lang";

interface Ctx {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  dir: "ltr" | "rtl";
  locale: string;
}

const I18nContext = createContext<Ctx | null>(null);

function isLang(v: unknown): v is LangCode {
  return typeof v === "string" && LANGS.some((l) => l.code === v);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  // Read the persisted choice after hydration so SSR output stays stable.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (isLang(saved)) setLangState(saved);
    } catch { /* storage unavailable */ }
  }, []);

  const dir = LANGS.find((l) => l.code === lang)?.dir === "rtl" ? "rtl" : "ltr";

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const value = useMemo<Ctx>(() => ({
    lang,
    dir,
    locale: LOCALES[lang],
    setLang: (l: LangCode) => {
      setLangState(l);
      try { localStorage.setItem(STORAGE_KEY, l); } catch { /* storage unavailable */ }
    },
    t: (key, vars) => {
      const raw = DICT[lang]?.[key] ?? DICT.en[key] ?? key;
      if (!vars) return raw;
      return Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, String(v)), raw);
    },
  }), [lang, dir]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (ctx) return ctx;
  // Safe fallback so components render outside the provider (tests, isolated stories).
  return {
    lang: "en",
    dir: "ltr",
    locale: LOCALES.en,
    setLang: () => {},
    t: (key, vars) => {
      const raw = DICT.en[key] ?? key;
      return vars ? Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, String(v)), raw) : raw;
    },
  };
}

export function languageName(code: LangCode): string {
  return LANGS.find((l) => l.code === code)?.native ?? code;
}
