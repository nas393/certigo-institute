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
    "nav.pricing": "Pricing",
    "nav.hr": "For HR",
    "nav.contact": "Contact",
    "nav.learning": "My learning",
    "nav.dashboard": "Dashboard",
    "nav.profile": "Profile",
    "nav.admin": "Admin",
    "auth.signIn": "Sign in",
    "auth.signOut": "Sign out",
    "auth.start": "Start free trial",
    "lang.label": "Language",
    "lang.menu": "Choose language",

    "home.eyebrow": "For professionals",
    "home.h1a": "Your next credential,",
    "home.h1b": "issued in",
    "home.h1c": "10 minutes",
    "home.sub": "One short quiz. One QR-verified certificate. One click to LinkedIn. No bulk, no admin, no waiting.",
    "home.what": "What do you do?",
    "home.recommended": "Recommended for you",
    "home.startNow": "Start in 10 minutes",
    "home.browse": "or browse the full catalog →",
    "home.s1t": "Pick a certification",
    "home.s1d": "Career-relevant tracks. Each one is short and to the point.",
    "home.s2t": "Pass one quiz",
    "home.s2d": "Eight questions. Pass at 70%. Your answers are stored.",
    "home.s3t": "Share to LinkedIn",
    "home.s3d": "The Add to Profile button is pre-filled with your verified credential metadata.",
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
    "nav.pricing": "Tarifs",
    "nav.hr": "Pour les RH",
    "nav.contact": "Contact",
    "nav.learning": "Mes formations",
    "nav.dashboard": "Tableau de bord",
    "nav.profile": "Profil",
    "nav.admin": "Administration",
    "auth.signIn": "Se connecter",
    "auth.signOut": "Se déconnecter",
    "auth.start": "Commencer gratuitement",
    "lang.label": "Langue",
    "lang.menu": "Choisir la langue",

    "home.eyebrow": "Pour les professionnels",
    "home.h1a": "Votre prochaine certification,",
    "home.h1b": "délivrée en",
    "home.h1c": "10 minutes",
    "home.sub": "Un court examen. Un certificat vérifié par QR. Un clic vers LinkedIn. Sans volume, sans administration, sans attente.",
    "home.what": "Quel est votre métier ?",
    "home.recommended": "Recommandé pour vous",
    "home.startNow": "Commencer en 10 minutes",
    "home.browse": "ou parcourir tout le catalogue →",
    "home.s1t": "Choisissez une certification",
    "home.s1d": "Des parcours utiles à votre carrière. Courts et précis.",
    "home.s2t": "Réussissez un examen",
    "home.s2d": "Huit questions. Réussite à 70 %. Vos réponses sont conservées.",
    "home.s3t": "Partagez sur LinkedIn",
    "home.s3d": "Le bouton « Ajouter au profil » est pré-rempli avec les données de votre certification vérifiée.",
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
    "nav.pricing": "Precios",
    "nav.hr": "Para RR. HH.",
    "nav.contact": "Contacto",
    "nav.learning": "Mi formación",
    "nav.dashboard": "Panel",
    "nav.profile": "Perfil",
    "nav.admin": "Administración",
    "auth.signIn": "Iniciar sesión",
    "auth.signOut": "Cerrar sesión",
    "auth.start": "Empezar gratis",
    "lang.label": "Idioma",
    "lang.menu": "Elegir idioma",

    "home.eyebrow": "Para profesionales",
    "home.h1a": "Tu próxima credencial,",
    "home.h1b": "emitida en",
    "home.h1c": "10 minutos",
    "home.sub": "Un examen breve. Un certificado verificado por QR. Un clic hacia LinkedIn. Sin volumen, sin trámites, sin esperas.",
    "home.what": "¿A qué te dedicas?",
    "home.recommended": "Recomendado para ti",
    "home.startNow": "Empezar en 10 minutos",
    "home.browse": "o explorar todo el catálogo →",
    "home.s1t": "Elige una certificación",
    "home.s1d": "Itinerarios útiles para tu carrera. Breves y directos.",
    "home.s2t": "Aprueba un examen",
    "home.s2d": "Ocho preguntas. Se aprueba con el 70 %. Tus respuestas quedan guardadas.",
    "home.s3t": "Comparte en LinkedIn",
    "home.s3d": "El botón «Añadir al perfil» se rellena con los datos de tu credencial verificada.",
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
    "nav.pricing": "Preços",
    "nav.hr": "Para RH",
    "nav.contact": "Contacto",
    "nav.learning": "A minha formação",
    "nav.dashboard": "Painel",
    "nav.profile": "Perfil",
    "nav.admin": "Administração",
    "auth.signIn": "Entrar",
    "auth.signOut": "Sair",
    "auth.start": "Começar gratuitamente",
    "lang.label": "Idioma",
    "lang.menu": "Escolher idioma",

    "home.eyebrow": "Para profissionais",
    "home.h1a": "A sua próxima credencial,",
    "home.h1b": "emitida em",
    "home.h1c": "10 minutos",
    "home.sub": "Um exame curto. Um certificado verificado por QR. Um clique para o LinkedIn. Sem volume, sem burocracia, sem esperas.",
    "home.what": "O que faz?",
    "home.recommended": "Recomendado para você",
    "home.startNow": "Começar em 10 minutos",
    "home.browse": "ou ver todo o catálogo →",
    "home.s1t": "Escolha uma certificação",
    "home.s1d": "Percursos relevantes para a carreira. Curtos e objetivos.",
    "home.s2t": "Passe num exame",
    "home.s2d": "Oito perguntas. Aprovação com 70%. As suas respostas são guardadas.",
    "home.s3t": "Partilhe no LinkedIn",
    "home.s3d": "O botão «Adicionar ao perfil» é pré-preenchido com os dados da sua credencial verificada.",
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
    "nav.pricing": "الأسعار",
    "nav.hr": "للموارد البشرية",
    "nav.contact": "اتصل بنا",
    "nav.learning": "تعلّمي",
    "nav.dashboard": "لوحة التحكم",
    "nav.profile": "الملف الشخصي",
    "nav.admin": "الإدارة",
    "auth.signIn": "تسجيل الدخول",
    "auth.signOut": "تسجيل الخروج",
    "auth.start": "ابدأ مجانًا",
    "lang.label": "اللغة",
    "lang.menu": "اختر اللغة",

    "home.eyebrow": "للمهنيين",
    "home.h1a": "شهادتك القادمة،",
    "home.h1b": "تُصدر في",
    "home.h1c": "١٠ دقائق",
    "home.sub": "اختبار قصير واحد. شهادة موثّقة برمز QR. نقرة واحدة إلى LinkedIn. بلا إجراءات ولا انتظار.",
    "home.what": "ما هو مجال عملك؟",
    "home.recommended": "مُقترح لك",
    "home.startNow": "ابدأ في ١٠ دقائق",
    "home.browse": "أو استعرض جميع الدورات →",
    "home.s1t": "اختر شهادة",
    "home.s1d": "مسارات مرتبطة بمسارك المهني، قصيرة ومباشرة.",
    "home.s2t": "انجح في اختبار واحد",
    "home.s2d": "ثمانية أسئلة. النجاح عند ٧٠٪. يتم حفظ إجاباتك.",
    "home.s3t": "شارك على LinkedIn",
    "home.s3d": "زر «إضافة إلى الملف الشخصي» مُهيَّأ مسبقًا ببيانات شهادتك الموثّقة.",
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
