import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "fr" | "es" | "pt" | "ar";

const dict: Record<Lang, Record<string, string>> = {
  en: {
    "nav.home": "Home", "nav.dashboard": "Dashboard", "nav.verify": "Verify",
    "nav.signin": "Sign in", "nav.signout": "Sign out", "nav.pricing": "Pricing",
    "cta.generate": "Generate your first course & certificate",
    "cta.viewdemo": "View demo certificate",
    "tag": "From knowledge to verified proof — instantly.",
  },
  fr: {
    "nav.home": "Accueil", "nav.dashboard": "Tableau", "nav.verify": "Vérifier",
    "nav.signin": "Connexion", "nav.signout": "Déconnexion", "nav.pricing": "Tarifs",
    "cta.generate": "Générez votre premier cours & certificat",
    "cta.viewdemo": "Voir un certificat de démo",
    "tag": "Du savoir à la preuve vérifiée — instantanément.",
  },
  es: {
    "nav.home": "Inicio", "nav.dashboard": "Panel", "nav.verify": "Verificar",
    "nav.signin": "Entrar", "nav.signout": "Salir", "nav.pricing": "Precios",
    "cta.generate": "Genera tu primer curso y certificado",
    "cta.viewdemo": "Ver certificado demo",
    "tag": "Del conocimiento a la prueba verificada — al instante.",
  },
  ar: {
    "nav.home": "الرئيسية", "nav.dashboard": "لوحة", "nav.verify": "تحقّق",
    "nav.signin": "دخول", "nav.signout": "خروج", "nav.pricing": "الأسعار",
    "cta.generate": "أنشئ أول دورة وشهادة لك",
    "cta.viewdemo": "عرض شهادة تجريبية",
    "tag": "من المعرفة إلى دليل موثّق — فورًا.",
  },
  pt: {
    "nav.home": "Início", "nav.dashboard": "Painel", "nav.verify": "Verificar",
    "nav.signin": "Entrar", "nav.signout": "Sair", "nav.pricing": "Preços",
    "cta.generate": "Crie seu primeiro curso e certificado",
    "cta.viewdemo": "Ver certificado demo",
    "tag": "Do conhecimento à prova verificada — instantaneamente.",
  },
};

interface I18nCtx { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string; dir: "ltr" | "rtl"; }
const Ctx = createContext<I18nCtx>({ lang: "en", setLang: () => {}, t: (k) => k, dir: "ltr" });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = (localStorage.getItem("kredo.lang") as Lang) || "en";
    setLangState(saved);
  }, []);
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("kredo.lang", l);
  };
  const t = (k: string) => dict[lang]?.[k] ?? dict.en[k] ?? k;
  const dir = lang === "ar" ? "rtl" : "ltr";
  return <Ctx.Provider value={{ lang, setLang, t, dir }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
