"use client";
/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent
} from "react";
import { ChatWidget } from "@/components/chat-widget";
import { ScheduleSurveyModal } from "@/components/schedule-survey-modal";
import { trackEvent } from "@/lib/analytics";
import { PUBLIC_ASSETS, assetUrl } from "@/lib/public-assets";
import { mergeContentWithOverrides } from "@/lib/site-content";

type Locale = "pt" | "en";

const content = {
  pt: {
    headerAria: "Ações do cabeçalho",
    home: "HOME",
    login: "Login",
    kicker: "Aprenda na prática...",
    title: "Sessões Conversacionais Dedicadas Ao Seu Progresso!",
    copy: "Se você quer melhorar sua pronúncia no inglês e ganhar confiança para se comunicar melhor, você está no lugar certo.",
    start: "Agende uma Sessão",
    whatYouFindTitle: "O Que Você Encontra Na Fluenverse?",
    whatYouFindIntro:
      "Na nossa seção de conversação em inglês online, você pratica de forma dinâmica, interativa e com foco total na fluência real.",
    highlights: [
      {
        title: "Aprendizado No Seu Ritmo",
        description:
          "Participe das sessões nos horários que melhor se encaixam na sua rotina. Flexibilidade para manter a prática consistente sem pressão."
      },
      {
        title: "Formato da Sessão",
        description:
          "Encontros ao vivo e individuais, conduzidos por especialistas em conversação, com práticas guiadas para você falar inglês do início ao fim."
      },
      {
        title: "Resultados Mensuráveis",
        description:
          "Receba feedback imediato e acompanhe sua evolução na fala e na compreensão. Veja seu inglês ganhar fluidez a cada semana."
      }
    ],
    behindTitle: "Por Trás da Fluenverse",
    behindParagraphs: [
      "As sessões de conversação foram desenhadas por Leila Vala e são totalmente adaptáveis à necessidade de cada pessoa.",
      "As sessões abrangem desde prática de vocabulário e simulações de situações reais até o ajuste de sons específicos. Além disso, a gente registra a sua fala todo mês para compararmos os resultados e você sentir a diferença no seu inglês.",
      "Entre sua jornada entre os Estados Unidos e o Brasil, com mais de 10 anos de experiência Leila desenvolveu não apenas fluência no inglês, mas também um olhar multicultural que enriquece as sessão.",
      "Atuando na área de educação, Leila se dedica a ajudar pessoas a ganharem confiança pra falar inglês através das sessões.",
      "Na **Fluenverse** cada sessão é uma oportunidade real de colocar o inglês em prática."
    ],
    behindQuote:
      "Errar faz parte do processo. O importante é falar, praticar e perceber sua evolução a cada sessão.",
    behindCta: "Agende uma Sessão",
    photoAria: "Espaço para foto",
    photoLabel: "Foto",
    storiesTitle: "Da Insegurança à Confiança",
    storiesIntro:
      "Cada pessoa tem sua própria história com o inglês: alguns já entendem bem, outros começam do zero, mas todos compartilham o mesmo desafio de se comunicar com segurança. Nossas sessões de conversação foram criadas justamente para isso, ajudar cada aluno a destravar e evoluir no seu ritmo. Veja como quem já passou por aqui descreve essa experiência.",
    stories: [
      {
        name: "José E. Pereira",
        text:
          "Já fiz muitas aulas de inglês em empresas e escolas, mas nunca tive o resultado que eu queria. Depois que comecei a ter aulas com a Leila tudo mudou. A dinâmica dela é ótima, as aulas são focadas em conversação e eu consigo treinar e praticar de verdade."
      },
      {
        name: "Mariana Alves",
        text:
          "Minha maior dificuldade era falar sob pressão. Sinto que consigo me expressar melhor sem travar tanto."
      }
    ],
    footer: "Fluenverse - All Rights Reserved | info@fluenverse.com"
  },
  en: {
    headerAria: "Header actions",
    home: "HOME",
    login: "Login",
    kicker: "Learn by doing...",
    title: "Conversation sessions focused on your progress!",
    copy: "If you want to improve your English pronunciation and gain confidence to communicate better, you are in the right place.",
    start: "Schedule a Session",
    whatYouFindTitle: "What You Find at Fluenverse?",
    whatYouFindIntro:
      "In our online English conversation sessions, you practice in a dynamic and interactive way with total focus on real fluency.",
    highlights: [
      {
        title: "Learning at Your Pace",
        description:
          "Join sessions at the times that best fit your routine. Flexibility to keep your practice consistent without pressure."
      },
      {
        title: "Session Format",
        description:
          "Live one-on-one meetings led by conversation specialists, with guided practice so you speak English from start to finish."
      },
      {
        title: "Measurable Results",
        description:
          "Receive immediate feedback and track your progress in speaking and comprehension. Watch your English gain fluency each week."
      }
    ],
    behindTitle: "Behind Fluenverse",
    behindParagraphs: [
      "The conversation sessions were designed by Leila Vala and are fully adaptable to each person's needs.",
      "Sessions cover vocabulary practice, real-life simulations, and targeted sound adjustments. We also record your speech every month so you can compare results and feel the difference in your English.",
      "Across her journey between the United States and Brazil, with more than 10 years of experience, Leila developed not only English fluency but also a multicultural perspective that enriches each session.",
      "Working in education, Leila is dedicated to helping people build confidence to speak English through guided sessions.",
      "At Fluenverse, every session is a real opportunity to put English into practice."
    ],
    behindQuote:
      "Mistakes are part of the process. What matters is speaking, practicing, and noticing your progress in every session. Leila Vala",
    behindCta: "Schedule a Session",
    photoAria: "Photo placeholder",
    photoLabel: "Photo",
    storiesTitle: "From Insecurity to Confidence",
    storiesIntro:
      "Each person has their own story with English: some already understand a lot, others are starting from zero, but everyone shares the same challenge of communicating with confidence. Our conversation sessions were created for exactly that, helping each learner unlock and improve at their own pace. See how people who have already been here describe this experience.",
    stories: [
      {
        name: "José E. Pereira",
        text:
          "I have taken many English classes in companies and schools, but I never got the results I wanted. After I started classes with Leila, everything changed. Her teaching dynamic is great, lessons are conversation-focused, and I can truly train and practice."
      },
      {
        name: "Mariana Alves",
        text:
          "My biggest difficulty was speaking under pressure. I feel I can express myself better without freezing so much."
      }
    ],
    footer: "Fluenverse - All Rights Reserved | info@fluenverse.com"
  }
} as const;

type HomePageProps = {
  contentOverride?: Record<string, unknown>;
};

export default function HomePage({ contentOverride }: HomePageProps) {
  const [locale, setLocale] = useState<Locale>("pt");
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [initials, setInitials] = useState("");
  const [config, setConfig] = useState<Record<string, string>>({});
  const [lpConfig, setLpConfig] = useState<any>({ languageSwitcherStyle: "default" });
  const [fonts, setFonts] = useState<any>(null);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);
  const glowPosRef = useRef<{ x: string; y: string }>({ x: "50%", y: "50%" });
  const [shootingStars, setShootingStars] = useState<
    { id: number; x: number; y: number; len: number; angle: number }[]
  >([]);
  const shootingIdRef = useRef(0);
  const resolvedContent = useMemo(
    () => mergeContentWithOverrides(content, contentOverride?.home || (contentOverride?.pt ? contentOverride : {})),
    [contentOverride]
  );

  useEffect(() => {
    if (contentOverride?.config) {
      setLpConfig((contentOverride as any).config);
    }
    if (contentOverride?.fonts) {
      setFonts((contentOverride as any).fonts);
    }
  }, [contentOverride]);

  // Merge legacy config keys with the new structured content
  const t = useMemo(() => {
    const base = resolvedContent[locale];
    // Dynamic overlay from the structured JSON
    const override = (contentOverride as any)?.home?.[locale] || {};

    return {
      ...base,
      kicker: override.hero?.kicker || config[`LP_HERO_KICKER_${locale.toUpperCase()}`] || base.kicker,
      title: override.hero?.title || config[`LP_HERO_TITLE_${locale.toUpperCase()}`] || base.title,
      copy: override.hero?.copy || config[`LP_HERO_COPY_${locale.toUpperCase()}`] || base.copy,
      start: override.hero?.ctaText || config[`LP_HERO_CTA_${locale.toUpperCase()}`] || base.start,
      heroImage: assetUrl(override.hero?.image || PUBLIC_ASSETS.heroPeople),

      whatYouFindTitle: override.highlights?.title || base.whatYouFindTitle,
      whatYouFindIntro: override.highlights?.intro || base.whatYouFindIntro,
      highlights: override.highlights?.items || base.highlights,

      behindTitle: override.about?.title || config[`LP_ABOUT_TITLE_${locale.toUpperCase()}`] || base.behindTitle,
      behindQuote: override.about?.quote || config[`LP_ABOUT_QUOTE_${locale.toUpperCase()}`] || base.behindQuote,
      behindCta: override.about?.ctaText || config[`LP_ABOUT_CTA_${locale.toUpperCase()}`] || base.behindCta,
      behindParagraphs: override.about?.paragraphs || base.behindParagraphs,
      aboutImage: assetUrl(override.about?.image || PUBLIC_ASSETS.leila),

      storiesTitle: override.stories?.title || base.storiesTitle,
      storiesIntro: override.stories?.intro || base.storiesIntro,
      stories: (override.stories?.items || base.stories).map((s: any, i: number) => ({
        ...s,
        // Fallback for missing avatar in legacy data
        image: assetUrl(s.image || `/testimonial-${i + 1}.jpg`)
      })),

      footer: override.footer || base.footer
    };
  }, [locale, resolvedContent, contentOverride, config]);

  useEffect(() => {
    if (document.cookie.includes("fluenverse_admin_auth=1")) {
      setIsLogged(true);
      const match = document.cookie.match(/fluenverse_user_initials=([^;]+)/);
      if (match) setInitials(decodeURIComponent(match[1]));
    }

    // Fetch public tracking configuration
    fetch("/api/config/public")
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(() => { });

    const params = new URLSearchParams(window.location.search);
    const shouldOpenSurvey = params.get("openSurvey");
    const lang = params.get("lang");

    if (lang === "pt" || lang === "en") {
      setLocale(lang);
    }

    if (shouldOpenSurvey === "1" || shouldOpenSurvey === "true") {
      setSurveyOpen(true);
    }
  }, []);

  useEffect(() => {
    const spawn = () => {
      const el = heroRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const edgeOffset = rect.width * 0.25;

      const presets = [
        // gentle left -> right, slight upward
        () => ({
          x: -edgeOffset,
          y: rect.height * (0.15 + Math.random() * 0.45),
          angle: 2 + Math.random() * 14 // 2–16 deg
        }),
        // left -> right, moderate upward
        () => ({
          x: -edgeOffset,
          y: rect.height * (0.35 + Math.random() * 0.4),
          angle: 18 + Math.random() * 14 // 18–32 deg
        }),
        // bottom-left -> upper-right
        () => ({
          x: rect.width * (0.02 + Math.random() * 0.12),
          y: rect.height + edgeOffset * 0.6,
          angle: 26 + Math.random() * 14 // 26–40 deg
        }),
        // right -> left, slight upward
        () => ({
          x: rect.width + edgeOffset,
          y: rect.height * (0.2 + Math.random() * 0.5),
          angle: 155 + Math.random() * 18 // 155–173 deg
        }),
        // right -> left, moderate upward
        () => ({
          x: rect.width + edgeOffset,
          y: rect.height * (0.45 + Math.random() * 0.35),
          angle: 170 + Math.random() * 18 // 170–188 deg (still drifting up-ish)
        })
      ];

      const pick = presets[Math.floor(Math.random() * presets.length)]();
      const { x, y, angle } = pick;
      const angleDeg = angle;
      const angleRad = (angleDeg * Math.PI) / 180;
      const length = rect.width * 2.4;
      const id = shootingIdRef.current++;
      setShootingStars(prev => [...prev.slice(-6), { id, x, y, len: length, angle }]);
      window.setTimeout(() => {
        setShootingStars(prev => prev.filter(s => s.id !== id));
      }, 4200);
    };

    // initial slight delay to avoid flashing on load
    const first = window.setTimeout(spawn, 1200);
    const interval = window.setInterval(spawn, 9000);

    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
    };
  }, []);

  const handleHeroMouseMove = (e: ReactMouseEvent<HTMLElement>) => {
    const target = heroRef.current;
    if (!target) return;

    // track previous position for trailing glow
    target.style.setProperty("--glow-prev-x", glowPosRef.current.x);
    target.style.setProperty("--glow-prev-y", glowPosRef.current.y);

    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xpx = `${x}px`;
    const ypx = `${y}px`;

    target.style.setProperty("--glow-x", xpx);
    target.style.setProperty("--glow-y", ypx);
    glowPosRef.current = { x: xpx, y: ypx };

    target.style.setProperty("--glow-opacity", "0.5");
    target.style.setProperty("--glow-prev-opacity", "0.35");
  };

  const handleHeroMouseLeave = () => {
    const target = heroRef.current;
    if (!target) return;
    target.style.setProperty("--glow-opacity", "0.35");
    target.style.setProperty("--glow-prev-opacity", "0.2");
  };

  const openSurvey = (ctaLocation: string) => {
    const eventGa = config.EVENT_HERO_CTA_GA || "select_promotion";
    const eventFb = config.EVENT_HERO_CTA_FB || "Contact";

    try {
      trackEvent(eventGa, {
        cta_location: ctaLocation,
        language: locale,
        promotion_name: "schedule_session"
      });

      trackEvent(eventFb, {
        cta_location: ctaLocation,
        language: locale
      });
    } catch (error) {
      console.error("Falha ao registrar evento de CTA:", error);
    } finally {
      setSurveyOpen(true);
    }
  };

  // Prepara o carregamento dinâmico de fontes
  const fontStyles = useMemo(() => {
    if (!fonts) return null;
    const uniqueFonts = new Set<string>();

    // Coleta todas as fontes usadas
    Object.values(fonts).forEach((section: any) => {
      if (!section || typeof section !== "object") return;
      Object.values(section).forEach((font: any) => {
        if (typeof font === "string") uniqueFonts.add(font);
      });
    });

    if (uniqueFonts.size === 0) return null;

    const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${Array.from(uniqueFonts)
      .map(f => f.replace(/ /g, "+") + ":wght@400;500;600;700;800")
      .join("&family=")}&display=swap`;

    const css = [
      `@import url('${googleFontsUrl}');`,
      `.hero-kicker { font-family: '${fonts.hero?.kicker}', sans-serif; }`,
      `.hero h1 { font-family: '${fonts.hero?.title}', sans-serif; }`,
      `.hero-copy { font-family: '${fonts.hero?.copy}', sans-serif; }`,
      `.hero-primary-button { font-family: '${fonts.hero?.cta}', sans-serif; }`,
      `.highlights h2 { font-family: '${fonts.highlights?.title}', sans-serif; }`,
      `.highlights-intro { font-family: '${fonts.highlights?.intro}', sans-serif; }`,
      `.highlight-card h3 { font-family: '${fonts.highlights?.itemTitle}', sans-serif; }`,
      `.highlight-card p { font-family: '${fonts.highlights?.itemDescription}', sans-serif; }`,
      `.behind h2 { font-family: '${fonts.about?.title}', sans-serif; }`,
      `.behind-copy p { font-family: '${fonts.about?.paragraphs}', sans-serif; }`,
      `.behind-quote { font-family: '${fonts.about?.quote}', serif; }`,
      `.stories h2 { font-family: '${fonts.stories?.title}', sans-serif; }`,
      `.stories-intro-col p { font-family: '${fonts.stories?.intro}', sans-serif; }`,
      `.story-name { font-family: '${fonts.stories?.name}', sans-serif; }`,
      `.story-text { font-family: '${fonts.stories?.text}', sans-serif; }`,
      `.footer-copyright, .footer-contact span { font-family: '${fonts.footer?.text}', sans-serif; }`
    ].join("\n");

    return (
      <style key="dynamic-fonts">{css}</style>
    );
  }, [fonts]);

  return (
    <div className="landing-shell">
      {fontStyles}
      <header className="site-header">
        <div className="brand-wrap">
          <Link href="/" className="brand-link">
            <img src={PUBLIC_ASSETS.logo} alt="Logo Fluenverse" className="site-logo" />
          </Link>
        </div>
        <nav className="header-actions" aria-label={t.headerAria}>
          {lpConfig.languageSwitcherStyle === "list" ? (
            <div className="language-dropdown-v2">
              <button
                type="button"
                className="lang-trigger"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                aria-expanded={langMenuOpen}
              >
                <img
                  src={assetUrl(locale === "pt" ? (lpConfig.flagPt || PUBLIC_ASSETS.flags.br) : (lpConfig.flagEn || PUBLIC_ASSETS.flags.us))}
                  alt=""
                  className="current-flag"
                />
                <svg
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`chevron ${langMenuOpen ? "open" : ""}`}
                >
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              {langMenuOpen && (
                <div className="lang-menu-popover">
                  <button
                    className={`lang-option-row ${locale === "pt" ? "active" : ""}`}
                    onClick={() => { setLocale("pt"); setLangMenuOpen(false); }}
                  >
                    <img src={assetUrl(lpConfig.flagPt || PUBLIC_ASSETS.flags.br)} alt="" />
                    <span>Português</span>
                  </button>
                  <button
                    className={`lang-option-row ${locale === "en" ? "active" : ""}`}
                    onClick={() => { setLocale("en"); setLangMenuOpen(false); }}
                  >
                    <img src={assetUrl(lpConfig.flagEn || PUBLIC_ASSETS.flags.us)} alt="" />
                    <span>English</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="language-switch" role="group" aria-label="Language switch">
              <button
                type="button"
                className={`lang-button ${locale === "pt" ? "active" : ""}`}
                onClick={() => setLocale("pt")}
                aria-pressed={locale === "pt"}
                aria-label="Mudar para português"
              >
                <img src={assetUrl(lpConfig.flagPt || PUBLIC_ASSETS.flags.br)} alt="" className="lang-flag" aria-hidden="true" />
              </button>
              <button
                type="button"
                className={`lang-button ${locale === "en" ? "active" : ""}`}
                onClick={() => setLocale("en")}
                aria-pressed={locale === "en"}
                aria-label="Switch to English"
              >
                <img src={assetUrl(lpConfig.flagEn || PUBLIC_ASSETS.flags.us)} alt="" className="lang-flag" aria-hidden="true" />
              </button>
            </div>
          )}
          <button type="button" onClick={() => openSurvey("header_contact")} className="contact-nav-button">
            {locale === "pt" ? "Contato" : "Contact"} &rsaquo;
          </button>
          {isLogged ? (
            <Link href="/admin/workspace" className="user-initials-circle" title={locale === "pt" ? "Ir para o Painel" : "Go to Dashboard"}>
              {initials || "A"}
            </Link>
          ) : null}
        </nav>
      </header>

      <main>
        <section
          className="hero"
          ref={heroRef}
          onMouseMove={handleHeroMouseMove}
          onMouseLeave={handleHeroMouseLeave}
          aria-labelledby="hero-title"
        >
          <div className="hero-shooting-stars" aria-hidden="true">
            {shootingStars.map(star => (
              <span
                key={star.id}
                className="hero-shooting-star"
                style={
                  {
                    "--x": `${star.x}px`,
                    "--y": `${star.y}px`,
                    "--len": `${star.len}px`,
                    "--angle": `${star.angle}deg`
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
          <div className="hero-content">
            <p className="hero-kicker">{t.kicker}</p>
            <h1 id="hero-title">{t.title}</h1>
            <p className="hero-copy">{t.copy}</p>
            <div className="hero-cta">
              <button type="button" className="hero-primary-button" onClick={() => openSurvey("hero")}>
                {t.start} &rsaquo;
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <img src={t.heroImage} alt={locale === "pt" ? "Alunos praticando conversação em inglês na Fluenverse" : "Students practicing English conversation at Fluenverse"} className="hero-people" />
          </div>
        </section>

        <section className="highlights" aria-labelledby="highlights-title">
          <h2 id="highlights-title">{t.whatYouFindTitle}</h2>
          <p className="highlights-intro">{t.whatYouFindIntro}</p>
          <div className="highlights-grid">
            {t.highlights.map((item: any, i: number) => (
              <article className="highlight-card" key={item.title}>
                <div className="highlight-icon">
                  {i === 0 && (
                    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
                      <circle cx="17" cy="16" r="9" stroke="#5b47d6" strokeWidth="2" />
                      <path d="M8 34c0-5 4-8 9-8s9 3 9 8" stroke="#5b47d6" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="30" cy="10" r="5" stroke="#5b47d6" strokeWidth="1.5" fill="white" />
                      <circle cx="30" cy="10" r="2" fill="#5b47d6" />
                      <path d="M30 4v2M30 14v2M24 10h2M34 10h2" stroke="#5b47d6" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                  {i === 1 && (
                    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
                      <rect x="5" y="3" width="22" height="28" rx="3" stroke="#5b47d6" strokeWidth="2" />
                      <line x1="10" y1="10" x2="22" y2="10" stroke="#5b47d6" strokeWidth="2" strokeLinecap="round" />
                      <line x1="10" y1="16" x2="22" y2="16" stroke="#5b47d6" strokeWidth="2" strokeLinecap="round" />
                      <line x1="10" y1="22" x2="16" y2="22" stroke="#5b47d6" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="29" cy="30" r="6" stroke="#5b47d6" strokeWidth="2" fill="white" />
                      <line x1="33" y1="34" x2="37" y2="38" stroke="#5b47d6" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                  {i === 2 && (
                    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
                      <circle cx="20" cy="12" r="5" stroke="#5b47d6" strokeWidth="2" />
                      <path d="M11 32c0-5 4-8 9-8s9 3 9 8" stroke="#5b47d6" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="7" cy="14" r="4" stroke="#5b47d6" strokeWidth="1.5" />
                      <path d="M1 30c0-4 3-6 6-6" stroke="#5b47d6" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="33" cy="14" r="4" stroke="#5b47d6" strokeWidth="1.5" />
                      <path d="M39 30c0-4-3-6-6-6" stroke="#5b47d6" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="behind" aria-labelledby="behind-title">
          <div className="behind-layout">
            <div className="behind-media">
              <img src={t.aboutImage} alt="Leila Vala" className="behind-photo-img" />
              <blockquote className="behind-quote">
                &ldquo;{t.behindQuote}&rdquo; &ndash; <span className="quote-author">Leila Vala</span>
              </blockquote>
            </div>
            <div className="behind-copy">
              <h2 id="behind-title">{t.behindTitle}</h2>
              {t.behindParagraphs.map((paragraph: string, idx: number) => {
                if (paragraph.includes("**Fluenverse**")) {
                  const parts = paragraph.split("**Fluenverse**");
                  return (
                    <p key={idx}>
                      {parts[0]}<strong>Fluenverse</strong>{parts[1]}
                    </p>
                  );
                }
                return <p key={idx}>{paragraph}</p>;
              })}
              <button type="button" className="hero-primary-button" onClick={() => openSurvey("about_section")}>
                {t.behindCta} &rsaquo;
              </button>
            </div>
          </div>
        </section>

        <section className="stories" aria-labelledby="stories-title">
          <div className="stories-layout">
            <div className="stories-intro-col">
              <h2 id="stories-title">{t.storiesTitle}</h2>
              <p>{t.storiesIntro}</p>
            </div>
            <div className="stories-cards-col">
              {t.stories.map((story: any, i: number) => (
                <article className="story-card" key={story.name}>
                  <div className="story-avatar">
                    <img src={story.image} alt={story.name} />
                  </div>
                  <p className="story-name">{story.name}</p>
                  <div className="story-stars" aria-label={locale === "pt" ? "5 estrelas" : "5 stars"}>★★★★★</div>
                  <p className="story-text">{story.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer id="footer" className="site-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <Link href="/">
              <img src={PUBLIC_ASSETS.logo} alt="Fluenverse" className="footer-logo" />
            </Link>
          </div>

          <p className="footer-copyright">© {new Date().getFullYear()} {t.footer.replace(/\b2025\b/g, "").replace(/^\s*-\s*/, "").trim()}</p>

          <div className="footer-links">
            <Link href="/politica-de-privacidade">{locale === "pt" ? "Privacidade" : "Privacy"}</Link>
            <Link href="/termos-de-uso">{locale === "pt" ? "Termos" : "Terms"}</Link>
          </div>

          <div className="footer-contact">
            <a href="mailto:info@fluenverse.com" className="email-icon-btn" aria-label="Enviar e-mail">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </a>
            <a href="mailto:info@fluenverse.com" className="email-text-link">info@fluenverse.com</a>
          </div>

          <div className="footer-socials">
            <a href="https://facebook.com/fluenverse" className="social-icon" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.14H7.06v4.61h2.44V23.5h5V12.07h3.7z" />
              </svg>
            </a>
            <a href="https://www.instagram.com/fluenverse/" className="social-icon" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.247 2.242 1.308 3.607.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.061 1.365-.333 2.632-1.308 3.607-.975.976-2.242 1.248-3.607 1.309-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.365-.061-2.632-.333-3.607-1.308-.976-.975-1.248-2.242-1.309-3.607-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.061-1.365.333-2.632 1.308-3.607.975-.975 2.242-1.247 3.607-1.308 1.266-.058 1.646-.07 4.85-.07zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.778 6.98 6.978 1.28.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.668-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
      <ChatWidget />
      <ScheduleSurveyModal
        open={surveyOpen}
        locale={locale}
        onClose={() => setSurveyOpen(false)}
        gaEventNames={{
          modalOpen: config.EVENT_MODAL_OPEN_GA || "view_item",
          surveySubmit: config.EVENT_SURVEY_SUBMIT_GA || "survey_submit"
        }}
        fbEventNames={{
          modalOpen: config.EVENT_MODAL_OPEN_FB || "ViewContent",
          surveySubmit: config.EVENT_SURVEY_SUBMIT_FB || "Lead"
        }}
      />
    </div>
  );
}
