import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "fr" | "es" | "pt" | "ar";

const en = {
  "nav.home": "Home", "nav.dashboard": "Dashboard", "nav.verify": "Verify",
  "nav.profile": "Profile", "nav.settings": "Settings",
  "nav.signin": "Sign in", "nav.signout": "Sign out", "nav.pricing": "Pricing",
  "cta.generate": "Generate your first course & certificate",
  "cta.viewdemo": "View demo certificate",
  "cta.opendemo": "Open the public verify page",
  "cta.scanorvisit": "Scan or",
  "tag": "From knowledge to verified proof — instantly.",

  "hero.label": "Credential Infrastructure",
  "hero.title.a": "From knowledge to",
  "hero.title.b": "verified proof.",
  "hero.title.c": "Instantly.",
  "hero.sub": "CERTIGO. is the fastest way to create credentials employers can verify instantly. Type a skill — get a full course, a quiz, and a QR-verified certificate that lives forever in your account.",
  "hero.bullet.cc": "✓ No credit card",
  "hero.bullet.free": "✓ 1 free certificate",
  "hero.bullet.fast": "✓ Setup in 60 seconds",

  "trust.qr": "QR-verified", "trust.tamper": "Tamper-proof",
  "trust.employers": "Built for employers", "trust.global": "Global-ready",
  "trust.stat.certs": "Certificates", "trust.stat.countries": "Countries", "trust.stat.verifs": "Verifications",

  "how.label": "How it works",
  "how.title": "Four steps. One credential.",
  "how.s1.t": "Enter a skill", "how.s1.d": "Type any topic — from React to negotiation.",
  "how.s2.t": "AI builds a course", "how.s2.d": "Modules, lessons, and a quiz, generated instantly.",
  "how.s3.t": "Learn & pass", "how.s3.d": "Study at your pace. Pass with 70%+.",
  "how.s4.t": "Get verified", "how.s4.d": "Download a QR-verified PDF. Share anywhere.",

  "trust2.label": "Built to be trusted",
  "trust2.title": "Every certificate carries proof.",
  "trust2.body": "Each CERTIGO. certificate has a unique serial and a QR code linking to a public ledger page. Anyone — recruiters, schools, clients — can verify the credential in one scan, no login required.",
  "trust2.cta": "Open the public ledger",

  "who.label": "Who it's for",
  "who.1.t": "Job seekers", "who.1.d": "Prove what you know in industries that don't care about diplomas.",
  "who.2.t": "Coaches & creators", "who.2.d": "Issue branded certificates to students with one click.",
  "who.3.t": "Companies & HR", "who.3.d": "Onboard, train, and certify teams at scale.",

  "manifesto.label": "Why CERTIGO. exists",
  "manifesto.title.a": "Skills move faster than credentials.",
  "manifesto.title.b": "Until now.",
  "manifesto.body": "We believe proof of knowledge should be as fast as learning itself. CERTIGO. is the fastest way to create credentials employers can verify instantly — open, portable, and yours forever.",

  "share.1.t": "Share to LinkedIn", "share.1.d": "One click adds your verified credential to your profile.",
  "share.2.t": "Public profile", "share.2.d": "Get a certigo.app/u/yourname page with every credential you've earned.",
  "share.3.t": "Shareable links", "share.3.d": "Send a verify URL to recruiters. They scan, they trust.",

  "pricing.label": "Pricing", "pricing.title": "Simple. Honest.",
  "pricing.popular": "Most popular", "pricing.cta": "Get started",
  "pricing.starter.name": "Starter", "pricing.starter.price": "Free", "pricing.starter.desc": "1 watermarked certificate",
  "pricing.pro.name": "Pro", "pricing.pro.desc": "Unlimited credentials",
  "pricing.business.name": "Business", "pricing.business.desc": "Built for teams",

  "faq.label": "Questions, answered",
  "faq.title": "Everything you need to trust Certigo.",
  "faq.intro": "Built for recruiters, learners, and teams that need credentials they can actually verify. No vague badges, no walled gardens.",

  "about.label": "About CERTIGO.",
  "about.title": "Credentials built for the way the world actually hires.",
  "about.body1": "CERTIGO. was founded on a simple belief: proof of skill should travel as fast as skill itself. Diplomas take years. Job descriptions change in months. We built CERTIGO. so any learner, coach, or company can issue a credential that's instantly verifiable, beautifully designed, and owned forever by the person who earned it.",
  "about.body2": "Our platform is trusted by independent professionals, training providers, and HR teams across 38 countries — issuing tens of thousands of verified credentials every month.",
  "about.stat.issued": "Credentials issued",
  "about.stat.verifs": "Public verifications",
  "about.stat.countries": "Countries served",

  "value.1.t": "Tamper-proof by design", "value.1.d": "Each credential is cryptographically anchored at issue. No silent edits — ever.",
  "value.2.t": "Issued in seconds", "value.2.d": "From topic to verified PDF in under 60 seconds, on any device.",
  "value.3.t": "Globally portable", "value.3.d": "Public verify links work in any country, on any device, with no account required.",
  "value.4.t": "Built for teams", "value.4.d": "Bulk issuance, admin controls, and custom branding for coaches and HR teams.",

  "contact.label": "Get in touch", "contact.title": "Talk to a real human.",
  "contact.body": "Whether you're verifying a credential, exploring CERTIGO. for your team, or just want to say hello — we read every message and reply within one business day.",
  "contact.sales": "General & sales", "contact.support": "Support & verification",
  "contact.hq": "Headquarters", "contact.hq.value": "Remote-first · serving 38 countries",
  "contact.form.title": "Send us a message",
  "contact.form.name": "Name", "contact.form.name.ph": "Your full name",
  "contact.form.email": "Email", "contact.form.email.ph": "you@company.com",
  "contact.form.message": "Message", "contact.form.message.ph": "How can we help?",
  "contact.form.send": "Send message", "contact.form.reply": "We reply within 1 business day.",

  "final.label": "Start now",
  "final.title.a": "From knowledge to verified proof —",
  "final.title.b": "instantly.",
  "final.body": "Type a skill. We'll do the rest.",
  "final.placeholder": "e.g. Customer success fundamentals",
  "final.cta": "Generate",
  "final.foot": "No credit card · 1 free certificate",
  "footer.copy": "Verified credentials",

  "lang.label": "Language",
};

const dict: Record<Lang, Record<string, string>> = {
  en,
  fr: {
    ...en,
    "nav.home": "Accueil", "nav.dashboard": "Tableau", "nav.verify": "Vérifier",
    "nav.profile": "Profil", "nav.settings": "Paramètres",
    "nav.signin": "Connexion", "nav.signout": "Déconnexion", "nav.pricing": "Tarifs",
    "cta.generate": "Générez votre premier cours & certificat",
    "cta.viewdemo": "Voir un certificat de démo",
    "cta.opendemo": "Ouvrir la page de vérification publique",
    "cta.scanorvisit": "Scannez ou",
    "tag": "Du savoir à la preuve vérifiée — instantanément.",

    "hero.label": "Infrastructure de Certification",
    "hero.title.a": "Du savoir à la",
    "hero.title.b": "preuve vérifiée.",
    "hero.title.c": "Instantanément.",
    "hero.sub": "CERTIGO. est le moyen le plus rapide de créer des certificats que les employeurs peuvent vérifier en un instant. Tapez une compétence — obtenez un cours complet, un quiz et un certificat vérifié par QR.",
    "hero.bullet.cc": "✓ Sans carte bancaire",
    "hero.bullet.free": "✓ 1 certificat gratuit",
    "hero.bullet.fast": "✓ Configuration en 60 sec.",

    "trust.qr": "Vérifié par QR", "trust.tamper": "Inviolable",
    "trust.employers": "Conçu pour les employeurs", "trust.global": "Mondial",
    "trust.stat.certs": "Certificats", "trust.stat.countries": "Pays", "trust.stat.verifs": "Vérifications",

    "how.label": "Comment ça marche",
    "how.title": "Quatre étapes. Un certificat.",
    "how.s1.t": "Entrez une compétence", "how.s1.d": "Tapez n'importe quel sujet — de React à la négociation.",
    "how.s2.t": "L'IA crée un cours", "how.s2.d": "Modules, leçons et quiz générés instantanément.",
    "how.s3.t": "Apprenez & réussissez", "how.s3.d": "Étudiez à votre rythme. Réussissez avec 70%+.",
    "how.s4.t": "Soyez vérifié", "how.s4.d": "Téléchargez un PDF vérifié par QR. Partagez partout.",

    "trust2.label": "Conçu pour être fiable",
    "trust2.title": "Chaque certificat porte sa preuve.",
    "trust2.body": "Chaque certificat CERTIGO. possède un numéro de série unique et un QR code menant à une page de registre public. N'importe qui peut vérifier le certificat en un scan, sans connexion.",
    "trust2.cta": "Ouvrir le registre public",

    "who.label": "Pour qui",
    "who.1.t": "Chercheurs d'emploi", "who.1.d": "Prouvez ce que vous savez dans les secteurs qui se moquent des diplômes.",
    "who.2.t": "Coachs & créateurs", "who.2.d": "Délivrez des certificats brandés à vos élèves en un clic.",
    "who.3.t": "Entreprises & RH", "who.3.d": "Intégrez, formez et certifiez vos équipes à grande échelle.",

    "manifesto.label": "Pourquoi CERTIGO. existe",
    "manifesto.title.a": "Les compétences évoluent plus vite que les diplômes.",
    "manifesto.title.b": "Plus maintenant.",
    "manifesto.body": "Nous croyons que la preuve du savoir doit être aussi rapide que l'apprentissage lui-même. CERTIGO. est ouvert, portable et vous appartient pour toujours.",

    "share.1.t": "Partager sur LinkedIn", "share.1.d": "Un clic pour ajouter votre certificat vérifié à votre profil.",
    "share.2.t": "Profil public", "share.2.d": "Obtenez une page certigo.app/u/votrenom avec tous vos certificats.",
    "share.3.t": "Liens partageables", "share.3.d": "Envoyez un lien de vérification aux recruteurs. Ils scannent, ils font confiance.",

    "pricing.label": "Tarifs", "pricing.title": "Simple. Honnête.",
    "pricing.popular": "Le plus populaire", "pricing.cta": "Commencer",
    "pricing.starter.name": "Starter", "pricing.starter.price": "Gratuit", "pricing.starter.desc": "1 certificat avec filigrane",
    "pricing.pro.name": "Pro", "pricing.pro.desc": "Certificats illimités",
    "pricing.business.name": "Business", "pricing.business.desc": "Conçu pour les équipes",

    "faq.label": "Questions, réponses",
    "faq.title": "Tout ce qu'il faut pour faire confiance à Certigo.",
    "faq.intro": "Conçu pour les recruteurs, apprenants et équipes qui ont besoin de certificats vérifiables.",

    "about.label": "À propos de CERTIGO.",
    "about.title": "Des certificats conçus pour le monde du travail réel.",
    "about.body1": "CERTIGO. a été fondé sur une conviction simple : la preuve du savoir doit voyager aussi vite que le savoir lui-même.",
    "about.body2": "Notre plateforme est utilisée par des professionnels, formateurs et équipes RH dans 38 pays.",
    "about.stat.issued": "Certificats émis",
    "about.stat.verifs": "Vérifications publiques",
    "about.stat.countries": "Pays desservis",

    "value.1.t": "Inviolable par conception", "value.1.d": "Chaque certificat est ancré cryptographiquement à l'émission.",
    "value.2.t": "Émis en secondes", "value.2.d": "Du sujet au PDF vérifié en moins de 60 secondes.",
    "value.3.t": "Portable mondialement", "value.3.d": "Les liens de vérification publics fonctionnent partout, sans compte.",
    "value.4.t": "Conçu pour les équipes", "value.4.d": "Émission en masse, contrôles admin et personnalisation.",

    "contact.label": "Contactez-nous", "contact.title": "Parlez à un vrai humain.",
    "contact.body": "Que vous vérifiez un certificat ou exploriez CERTIGO. pour votre équipe, nous lisons chaque message.",
    "contact.sales": "Général & ventes", "contact.support": "Support & vérification",
    "contact.hq": "Siège", "contact.hq.value": "Distant — dans 38 pays",
    "contact.form.title": "Envoyez-nous un message",
    "contact.form.name": "Nom", "contact.form.name.ph": "Votre nom complet",
    "contact.form.email": "Email", "contact.form.email.ph": "vous@entreprise.com",
    "contact.form.message": "Message", "contact.form.message.ph": "Comment pouvons-nous aider ?",
    "contact.form.send": "Envoyer", "contact.form.reply": "Réponse sous 1 jour ouvré.",

    "final.label": "Commencez maintenant",
    "final.title.a": "Du savoir à la preuve vérifiée —",
    "final.title.b": "instantanément.",
    "final.body": "Tapez une compétence. On s'occupe du reste.",
    "final.placeholder": "ex. Fondamentaux du succès client",
    "final.cta": "Générer",
    "final.foot": "Sans carte · 1 certificat gratuit",
    "footer.copy": "Certificats vérifiés",
    "lang.label": "Langue",
  },
  es: {
    ...en,
    "nav.home": "Inicio", "nav.dashboard": "Panel", "nav.verify": "Verificar",
    "nav.profile": "Perfil", "nav.settings": "Ajustes",
    "nav.signin": "Entrar", "nav.signout": "Salir", "nav.pricing": "Precios",
    "cta.generate": "Genera tu primer curso y certificado",
    "cta.viewdemo": "Ver certificado demo",
    "cta.opendemo": "Abrir página pública de verificación",
    "cta.scanorvisit": "Escanea o",
    "tag": "Del conocimiento a la prueba verificada — al instante.",

    "hero.label": "Infraestructura de Credenciales",
    "hero.title.a": "Del conocimiento a la",
    "hero.title.b": "prueba verificada.",
    "hero.title.c": "Al instante.",
    "hero.sub": "CERTIGO. es la forma más rápida de crear credenciales que los empleadores pueden verificar al instante.",
    "hero.bullet.cc": "✓ Sin tarjeta",
    "hero.bullet.free": "✓ 1 certificado gratis",
    "hero.bullet.fast": "✓ Listo en 60 seg.",

    "trust.qr": "Verificado por QR", "trust.tamper": "A prueba de manipulación",
    "trust.employers": "Para empleadores", "trust.global": "Global",
    "trust.stat.certs": "Certificados", "trust.stat.countries": "Países", "trust.stat.verifs": "Verificaciones",

    "how.label": "Cómo funciona", "how.title": "Cuatro pasos. Una credencial.",
    "how.s1.t": "Ingresa una habilidad", "how.s1.d": "Escribe cualquier tema.",
    "how.s2.t": "La IA crea el curso", "how.s2.d": "Módulos, lecciones y quiz instantáneos.",
    "how.s3.t": "Aprende y aprueba", "how.s3.d": "Estudia a tu ritmo. Aprueba con 70%+.",
    "how.s4.t": "Verifícate", "how.s4.d": "Descarga un PDF verificado por QR.",

    "trust2.label": "Confianza por diseño",
    "trust2.title": "Cada certificado lleva su prueba.",
    "trust2.body": "Cada certificado CERTIGO. tiene un serial único y un QR a una página pública.",
    "trust2.cta": "Abrir registro público",

    "who.label": "Para quién",
    "who.1.t": "Buscadores de empleo", "who.1.d": "Demuestra lo que sabes.",
    "who.2.t": "Coaches y creadores", "who.2.d": "Emite certificados con un clic.",
    "who.3.t": "Empresas y RR.HH.", "who.3.d": "Capacita y certifica equipos a escala.",

    "manifesto.label": "Por qué existe CERTIGO.",
    "manifesto.title.a": "Las habilidades cambian más rápido que las credenciales.",
    "manifesto.title.b": "Hasta ahora.",
    "manifesto.body": "Creemos que la prueba del conocimiento debe ser tan rápida como aprenderlo.",

    "share.1.t": "Compartir en LinkedIn", "share.1.d": "Un clic añade tu credencial a tu perfil.",
    "share.2.t": "Perfil público", "share.2.d": "Obtén una página con todas tus credenciales.",
    "share.3.t": "Enlaces compartibles", "share.3.d": "Envía un enlace de verificación.",

    "pricing.label": "Precios", "pricing.title": "Simple. Honesto.",
    "pricing.popular": "Más popular", "pricing.cta": "Empezar",
    "pricing.starter.price": "Gratis", "pricing.starter.desc": "1 certificado con marca de agua",
    "pricing.pro.desc": "Credenciales ilimitadas",
    "pricing.business.desc": "Para equipos",

    "faq.label": "Preguntas, respondidas",
    "faq.title": "Todo lo que necesitas para confiar en Certigo.",
    "faq.intro": "Para reclutadores, estudiantes y equipos que necesitan credenciales verificables.",

    "about.label": "Acerca de CERTIGO.",
    "about.title": "Credenciales para cómo el mundo realmente contrata.",
    "about.body1": "CERTIGO. se fundó sobre una creencia simple: la prueba de habilidad debe viajar tan rápido como la habilidad misma.",
    "about.body2": "Nuestra plataforma es usada en 38 países.",
    "about.stat.issued": "Credenciales emitidas",
    "about.stat.verifs": "Verificaciones públicas",
    "about.stat.countries": "Países atendidos",

    "value.1.t": "A prueba de manipulación", "value.1.d": "Anclado criptográficamente al emitir.",
    "value.2.t": "Emitido en segundos", "value.2.d": "Del tema al PDF en menos de 60 seg.",
    "value.3.t": "Portable globalmente", "value.3.d": "Funciona en cualquier país, sin cuenta.",
    "value.4.t": "Para equipos", "value.4.d": "Emisión masiva y branding personalizado.",

    "contact.label": "Contáctanos", "contact.title": "Habla con un humano real.",
    "contact.body": "Leemos cada mensaje y respondemos en un día hábil.",
    "contact.sales": "General y ventas", "contact.support": "Soporte y verificación",
    "contact.hq": "Sede", "contact.hq.value": "Remoto · 38 países",
    "contact.form.title": "Envíanos un mensaje",
    "contact.form.name": "Nombre", "contact.form.name.ph": "Tu nombre completo",
    "contact.form.email": "Email", "contact.form.email.ph": "tu@empresa.com",
    "contact.form.message": "Mensaje", "contact.form.message.ph": "¿Cómo podemos ayudar?",
    "contact.form.send": "Enviar", "contact.form.reply": "Respondemos en 1 día hábil.",

    "final.label": "Comienza ahora",
    "final.title.a": "Del conocimiento a la prueba verificada —",
    "final.title.b": "al instante.",
    "final.body": "Escribe una habilidad. Nosotros nos ocupamos.",
    "final.placeholder": "ej. Fundamentos de éxito del cliente",
    "final.cta": "Generar",
    "final.foot": "Sin tarjeta · 1 certificado gratis",
    "footer.copy": "Credenciales verificadas",
    "lang.label": "Idioma",
  },
  pt: {
    ...en,
    "nav.home": "Início", "nav.dashboard": "Painel", "nav.verify": "Verificar",
    "nav.profile": "Perfil", "nav.settings": "Ajustes",
    "nav.signin": "Entrar", "nav.signout": "Sair", "nav.pricing": "Preços",
    "cta.generate": "Crie seu primeiro curso e certificado",
    "cta.viewdemo": "Ver certificado demo",
    "cta.opendemo": "Abrir página pública de verificação",
    "cta.scanorvisit": "Escaneie ou",
    "tag": "Do conhecimento à prova verificada — instantaneamente.",

    "hero.label": "Infraestrutura de Credenciais",
    "hero.title.a": "Do conhecimento à",
    "hero.title.b": "prova verificada.",
    "hero.title.c": "Instantaneamente.",
    "hero.sub": "CERTIGO. é a forma mais rápida de criar credenciais que empregadores podem verificar instantaneamente.",
    "hero.bullet.cc": "✓ Sem cartão", "hero.bullet.free": "✓ 1 certificado grátis", "hero.bullet.fast": "✓ Pronto em 60s",

    "trust.qr": "Verificado por QR", "trust.tamper": "À prova de adulteração",
    "trust.employers": "Para empregadores", "trust.global": "Global",
    "trust.stat.certs": "Certificados", "trust.stat.countries": "Países", "trust.stat.verifs": "Verificações",

    "how.label": "Como funciona", "how.title": "Quatro passos. Uma credencial.",
    "how.s1.t": "Insira uma habilidade", "how.s1.d": "Digite qualquer tema.",
    "how.s2.t": "IA cria o curso", "how.s2.d": "Módulos, lições e quiz instantâneos.",
    "how.s3.t": "Aprenda e passe", "how.s3.d": "Estude no seu ritmo. Passe com 70%+.",
    "how.s4.t": "Verifique-se", "how.s4.d": "Baixe um PDF verificado por QR.",

    "trust2.label": "Construído para confiança",
    "trust2.title": "Cada certificado carrega prova.",
    "trust2.body": "Cada certificado CERTIGO. tem serial único e QR para página pública.",
    "trust2.cta": "Abrir registro público",

    "who.label": "Para quem",
    "who.1.t": "Buscadores de emprego", "who.1.d": "Prove o que você sabe.",
    "who.2.t": "Coaches e criadores", "who.2.d": "Emita certificados com um clique.",
    "who.3.t": "Empresas e RH", "who.3.d": "Treine e certifique equipes em escala.",

    "manifesto.label": "Por que CERTIGO. existe",
    "manifesto.title.a": "Habilidades evoluem mais rápido que credenciais.",
    "manifesto.title.b": "Até agora.",
    "manifesto.body": "Acreditamos que a prova de conhecimento deve ser tão rápida quanto aprendê-lo.",

    "share.1.t": "Compartilhar no LinkedIn", "share.1.d": "Um clique adiciona ao seu perfil.",
    "share.2.t": "Perfil público", "share.2.d": "Obtenha uma página com todas as credenciais.",
    "share.3.t": "Links compartilháveis", "share.3.d": "Envie um link de verificação.",

    "pricing.label": "Preços", "pricing.title": "Simples. Honesto.",
    "pricing.popular": "Mais popular", "pricing.cta": "Começar",
    "pricing.starter.price": "Grátis", "pricing.starter.desc": "1 certificado com marca d'água",
    "pricing.pro.desc": "Credenciais ilimitadas", "pricing.business.desc": "Feito para equipes",

    "faq.label": "Perguntas, respondidas",
    "faq.title": "Tudo que você precisa para confiar no Certigo.",
    "faq.intro": "Para recrutadores, alunos e equipes que precisam de credenciais verificáveis.",

    "about.label": "Sobre CERTIGO.",
    "about.title": "Credenciais para como o mundo realmente contrata.",
    "about.body1": "CERTIGO. foi fundado numa crença simples: a prova de habilidade deve viajar tão rápido quanto a própria habilidade.",
    "about.body2": "Nossa plataforma é usada em 38 países.",
    "about.stat.issued": "Credenciais emitidas",
    "about.stat.verifs": "Verificações públicas",
    "about.stat.countries": "Países atendidos",

    "value.1.t": "À prova de adulteração", "value.1.d": "Ancorado criptograficamente na emissão.",
    "value.2.t": "Emitido em segundos", "value.2.d": "Do tema ao PDF em menos de 60s.",
    "value.3.t": "Portátil globalmente", "value.3.d": "Funciona em qualquer país, sem conta.",
    "value.4.t": "Para equipes", "value.4.d": "Emissão em massa e branding personalizado.",

    "contact.label": "Fale conosco", "contact.title": "Fale com um humano real.",
    "contact.body": "Lemos cada mensagem e respondemos em 1 dia útil.",
    "contact.sales": "Geral e vendas", "contact.support": "Suporte e verificação",
    "contact.hq": "Sede", "contact.hq.value": "Remoto · 38 países",
    "contact.form.title": "Envie uma mensagem",
    "contact.form.name": "Nome", "contact.form.name.ph": "Seu nome completo",
    "contact.form.email": "Email", "contact.form.email.ph": "voce@empresa.com",
    "contact.form.message": "Mensagem", "contact.form.message.ph": "Como podemos ajudar?",
    "contact.form.send": "Enviar", "contact.form.reply": "Respondemos em 1 dia útil.",

    "final.label": "Comece agora",
    "final.title.a": "Do conhecimento à prova verificada —",
    "final.title.b": "instantaneamente.",
    "final.body": "Digite uma habilidade. Cuidamos do resto.",
    "final.placeholder": "ex. Fundamentos de sucesso do cliente",
    "final.cta": "Gerar",
    "final.foot": "Sem cartão · 1 certificado grátis",
    "footer.copy": "Credenciais verificadas",
    "lang.label": "Idioma",
  },
  ar: {
    ...en,
    "nav.home": "الرئيسية", "nav.dashboard": "لوحة", "nav.verify": "تحقّق",
    "nav.profile": "الملف", "nav.settings": "الإعدادات",
    "nav.signin": "دخول", "nav.signout": "خروج", "nav.pricing": "الأسعار",
    "cta.generate": "أنشئ أول دورة وشهادة لك",
    "cta.viewdemo": "عرض شهادة تجريبية",
    "cta.opendemo": "فتح صفحة التحقق العامة",
    "cta.scanorvisit": "امسح أو",
    "tag": "من المعرفة إلى دليل موثّق — فورًا.",

    "hero.label": "بنية تحتية للشهادات",
    "hero.title.a": "من المعرفة إلى",
    "hero.title.b": "دليل موثّق.",
    "hero.title.c": "فورًا.",
    "hero.sub": "CERTIGO. هي أسرع طريقة لإنشاء شهادات يمكن لأصحاب العمل التحقق منها فورًا.",
    "hero.bullet.cc": "✓ بدون بطاقة", "hero.bullet.free": "✓ شهادة مجانية", "hero.bullet.fast": "✓ جاهز في 60 ثانية",

    "trust.qr": "موثّق بـ QR", "trust.tamper": "ضد التزوير",
    "trust.employers": "لأصحاب العمل", "trust.global": "عالمي",
    "trust.stat.certs": "شهادة", "trust.stat.countries": "دولة", "trust.stat.verifs": "تحقق",

    "how.label": "كيف يعمل", "how.title": "أربع خطوات. شهادة واحدة.",
    "how.s1.t": "أدخل مهارة", "how.s1.d": "اكتب أي موضوع.",
    "how.s2.t": "الذكاء يبني الدورة", "how.s2.d": "وحدات ودروس واختبار فوريًا.",
    "how.s3.t": "تعلّم واجتز", "how.s3.d": "ادرس بإيقاعك. اجتز بـ 70%+.",
    "how.s4.t": "احصل على التوثيق", "how.s4.d": "نزّل PDF موثّق بـ QR.",

    "trust2.label": "مبني على الثقة",
    "trust2.title": "كل شهادة تحمل دليلها.",
    "trust2.body": "كل شهادة CERTIGO. لها رقم فريد ورمز QR لصفحة عامة.",
    "trust2.cta": "افتح السجل العام",

    "who.label": "لمن",
    "who.1.t": "الباحثون عن عمل", "who.1.d": "أثبت ما تعرفه.",
    "who.2.t": "المدربون والمبدعون", "who.2.d": "أصدر شهادات بنقرة.",
    "who.3.t": "الشركات والموارد البشرية", "who.3.d": "درّب وثّق فرقك.",

    "manifesto.label": "لماذا CERTIGO.",
    "manifesto.title.a": "المهارات تتحرك أسرع من الشهادات.",
    "manifesto.title.b": "حتى الآن.",
    "manifesto.body": "نؤمن بأن إثبات المعرفة يجب أن يكون بسرعة التعلّم نفسه.",

    "share.1.t": "شارك على LinkedIn", "share.1.d": "نقرة واحدة تضيف الشهادة لملفك.",
    "share.2.t": "ملف عام", "share.2.d": "احصل على صفحة بكل شهاداتك.",
    "share.3.t": "روابط قابلة للمشاركة", "share.3.d": "أرسل رابط تحقق للمسؤولين.",

    "pricing.label": "الأسعار", "pricing.title": "بسيط. صادق.",
    "pricing.popular": "الأكثر طلبًا", "pricing.cta": "ابدأ",
    "pricing.starter.price": "مجاني", "pricing.starter.desc": "شهادة واحدة بعلامة مائية",
    "pricing.pro.desc": "شهادات غير محدودة", "pricing.business.desc": "للفرق",

    "faq.label": "أسئلة وأجوبة",
    "faq.title": "كل ما تحتاجه للثقة بـ Certigo.",
    "faq.intro": "للمسؤولين والمتعلمين والفرق الذين يحتاجون شهادات قابلة للتحقق.",

    "about.label": "عن CERTIGO.",
    "about.title": "شهادات لطريقة التوظيف الحقيقية في العالم.",
    "about.body1": "تأسست CERTIGO. على إيمان بسيط: إثبات المهارة يجب أن يسافر بسرعة المهارة نفسها.",
    "about.body2": "منصتنا تخدم 38 دولة.",
    "about.stat.issued": "شهادات مُصدَرة",
    "about.stat.verifs": "عمليات تحقق",
    "about.stat.countries": "دولة",

    "value.1.t": "ضد التزوير", "value.1.d": "مرتبط تشفيريًا عند الإصدار.",
    "value.2.t": "إصدار خلال ثوانٍ", "value.2.d": "من الموضوع للـ PDF في أقل من 60 ثانية.",
    "value.3.t": "محمول عالميًا", "value.3.d": "روابط التحقق تعمل في أي بلد بدون حساب.",
    "value.4.t": "للفرق", "value.4.d": "إصدار جماعي وعلامة مخصصة.",

    "contact.label": "تواصل", "contact.title": "تحدث مع إنسان حقيقي.",
    "contact.body": "نقرأ كل رسالة ونرد خلال يوم عمل.",
    "contact.sales": "عام ومبيعات", "contact.support": "دعم وتحقق",
    "contact.hq": "المقر", "contact.hq.value": "عن بُعد · 38 دولة",
    "contact.form.title": "أرسل رسالة",
    "contact.form.name": "الاسم", "contact.form.name.ph": "اسمك الكامل",
    "contact.form.email": "البريد", "contact.form.email.ph": "you@company.com",
    "contact.form.message": "الرسالة", "contact.form.message.ph": "كيف نساعد؟",
    "contact.form.send": "إرسال", "contact.form.reply": "نرد خلال يوم عمل.",

    "final.label": "ابدأ الآن",
    "final.title.a": "من المعرفة إلى دليل موثّق —",
    "final.title.b": "فورًا.",
    "final.body": "اكتب مهارة. سنتولى الباقي.",
    "final.placeholder": "مثال: أساسيات نجاح العميل",
    "final.cta": "أنشئ",
    "final.foot": "بدون بطاقة · شهادة مجانية",
    "footer.copy": "شهادات موثّقة",
    "lang.label": "اللغة",
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
