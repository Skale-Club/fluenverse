"use client";

import { useEffect, useMemo, useState } from "react";
import { ImageUploadField } from "./image-upload-field";
import { PUBLIC_ASSETS } from "@/lib/public-assets";

const defaultTemplate = {
  home: {
    pt: {
      hero: {
        kicker: "Aprenda na prática...",
        title: "Sessões Conversacionais Dedicadas Ao Seu Progresso!",
        copy: "Se você quer melhorar sua pronúncia no inglês e ganhar confiança para se comunicar melhor, você está no lugar certo.",
        ctaText: "Agende uma Sessão",
        image: PUBLIC_ASSETS.heroPeople
      },
      highlights: {
        title: "O Que Você Encontra Na Fluenverse?",
        intro: "Na nossa seção de conversação em inglês online, você pratica de forma dinâmica, interativa e com foco total na fluência real.",
        items: [
          { title: "Aprendizado No Seu Ritmo", description: "Participe das sessões nos horários que melhor se encaixam na sua rotina." },
          { title: "Formato da Sessão", description: "Encontros ao vivo e individuais, conduzidos por especialistas em conversação." },
          { title: "Resultados Mensuráveis", description: "Receba feedback imediato e acompanhe sua evolução na fala e na compreensão." }
        ]
      },
      about: {
        title: "Por Trás da Fluenverse",
        paragraphs: [
          "As sessões de conversação foram desenhadas por Leila Vala e são totalmente adaptáveis à necessidade de cada pessoa.",
          "As sessões abrangem desde prática de vocabulário e simulações de situações reais até o ajuste de sons específicos. Além disso, a gente registra a sua fala todo mês para compararmos os resultados e você sentir a diferença no seu inglês.",
          "Entre sua jornada entre os Estados Unidos e o Brasil, com mais de 10 anos de experiência Leila desenvolveu não apenas fluência no inglês, mas também um olhar multicultural que enriquece as sessão.",
          "Atuando na área de educação, Leila se dedica a ajudar pessoas a ganharem confiança pra falar inglês através das sessões.",
          "Na **Fluenverse** cada sessão é uma oportunidade real de colocar o inglês em prática."
        ],
        quote: "Errar faz parte do processo. O importante é falar, praticar e perceber sua evolução a cada sessão.",
        ctaText: "Agende uma Sessão",
        image: PUBLIC_ASSETS.leila
      },
      stories: {
        title: "Da Insegurança à Confiança",
        intro: "Cada pessoa tem sua própria história com o inglês: alguns já entendem bem, outros começam do zero, mas todos compartilham o mesmo desafio de se comunicar com segurança. Nossas sessões de conversação foram criadas justamente para isso, ajudar cada aluno a destravar e evoluir no seu ritmo. Veja como quem já passou por aqui descreve essa experiência.",
        items: [
          { name: "José E. Pereira", text: "Já fiz muitas aulas de inglês em empresas e escolas, mas nunca tive o resultado que eu queria. Depois que comecei a ter aulas com a Leila tudo mudou. A dinâmica dela é ótima, as aulas são focadas em conversação e eu consigo treinar e praticar de verdade.", image: PUBLIC_ASSETS.testimonial1 },
          { name: "Mariana Alves", text: "Minha maior dificuldade era falar sob pressão. Sinto que consigo me expressar melhor sem travar tanto.", image: PUBLIC_ASSETS.testimonial2 }
        ]
      },
      footer: "Fluenverse - All Rights Reserved"
    },
    en: {
      hero: {
        kicker: "Learn by doing...",
        title: "Conversation sessions focused on your progress!",
        copy: "If you want to improve your English pronunciation and gain confidence to communicate better, you are in the right place.",
        ctaText: "Schedule a Session",
        image: PUBLIC_ASSETS.heroPeople
      },
      highlights: {
        title: "What You Find at Fluenverse?",
        intro: "In our online English conversation sessions, you practice in a dynamic and interactive way with total focus on real fluency.",
        items: [
          { title: "Learning at Your Pace", description: "Join sessions at the times that best fit your routine." },
          { title: "Session Format", description: "Live one-on-one meetings led by conversation specialists." },
          { title: "Measurable Results", description: "Receive immediate feedback and track your progress." }
        ]
      },
      about: {
        title: "Behind Fluenverse",
        paragraphs: [
          "The conversation sessions were designed by Leila Vala and are fully adaptable to each person's needs.",
          "Sessions cover vocabulary practice, real-life simulations, and targeted sound adjustments. We also record your speech every month so you can compare results and feel the difference in your English.",
          "Across her journey between the United States and Brazil, with more than 10 years of experience, Leila developed not only English fluency but also a multicultural perspective that enriches each session.",
          "Working in education, Leila is dedicated to helping people build confidence to speak English through guided sessions.",
          "At Fluenverse, every session is a real opportunity to put English into practice."
        ],
        quote: "Mistakes are part of the process. What matters is speaking, practicing, and noticing your progress in every session.",
        ctaText: "Schedule a Session",
        image: PUBLIC_ASSETS.leila
      },
      stories: {
        title: "From Insecurity to Confidence",
        intro: "Each person has their own story with English: some already understand a lot, others are starting from zero, but everyone shares the same challenge of communicating with confidence. Our conversation sessions were created for exactly that, helping each learner unlock and improve at their own pace. See how people who have already been here describe this experience.",
        items: [
          { name: "José E. Pereira", text: "Lessons are conversation-focused, and I can truly train and practice.", image: PUBLIC_ASSETS.testimonial1 },
          { name: "Mariana Alves", text: "I feel I can express myself better without freezing so much.", image: PUBLIC_ASSETS.testimonial2 }
        ]
      },
      footer: "Fluenverse - All Rights Reserved"
    }
  },
  config: {
    languageSwitcherStyle: "default",
    flagPt: PUBLIC_ASSETS.flags.br,
    flagEn: PUBLIC_ASSETS.flags.us
  },
  fonts: {
    hero: { kicker: "Inter", title: "Inter", copy: "Inter", cta: "Inter" },
    highlights: { title: "Inter", intro: "Inter", itemTitle: "Inter", itemDescription: "Inter" },
    about: { title: "Inter", paragraphs: "Inter", quote: "Inter", cta: "Inter" },
    stories: { title: "Inter", intro: "Inter", name: "Inter", text: "Inter" },
    footer: { text: "Inter" }
  },
  favicons: {
    favicon: PUBLIC_ASSETS.favicon,
    appleTouchIcon: PUBLIC_ASSETS.favicon,
    icon32: PUBLIC_ASSETS.favicon,
    icon16: PUBLIC_ASSETS.favicon
  }
};

type Status = "idle" | "ok" | "error";

export function AdminLpSettings() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [locale, setLocale] = useState<"pt" | "en">("pt");
  const [section, setSection] = useState<"hero" | "highlights" | "about" | "stories" | "footer" | "config" | "fonts" | "favicons">("hero");

  const [content, setContent] = useState<any>(defaultTemplate);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/admin/landing-page", { cache: "no-store" });
        if (response.ok) {
          const parsed = await response.json();
          if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
            setContent((prev: any) => ({ ...prev, ...parsed }));
          }
        }
      } finally {
        setLoaded(true);
      }
    }
    load();
  }, []);

  const updateField = (path: string[], value: any) => {
    setContent((prev: any) => {
      const next = { ...prev };
      let current = next;
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
        current[path[i]] = { ...current[path[i]] };
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return next;
    });
  };

  const save = async (scope?: "hero" | "highlights" | "about" | "stories" | "footer" | "config" | "fonts" | "favicons") => {
    setSaving(true);
    setStatus("idle");
    setMessage(scope ? `Salvando seção ${scope}...` : "Salvando...");

    try {
      let dataToSave = content;

      // Se houver um escopo, buscamos a versão mais recente do banco para preservar outras seções
      if (scope) {
        const getResponse = await fetch("/api/admin/landing-page", { cache: "no-store" });
        if (getResponse.ok) {
          const latest = await getResponse.json();
          if (scope === "config") {
            dataToSave = { ...latest, config: content.config };
          } else if (scope === "fonts") {
            dataToSave = { ...latest, fonts: content.fonts };
          } else if (scope === "favicons") {
            dataToSave = { ...latest, favicons: content.favicons };
          } else {
            // Seções de conteúdo (home[locale][section])
            const updatedHome = { ...(latest.home || { pt: {}, en: {} }) };
            if (!updatedHome[locale]) updatedHome[locale] = {};
            updatedHome[locale] = {
              ...updatedHome[locale],
              [scope]: content.home[locale][scope]
            };
            dataToSave = { ...latest, home: updatedHome };
          }
        }
      }

      const response = await fetch("/api/admin/landing-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave)
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.error("Save failure:", { status: response.status, data });
        setStatus("error");
        setMessage(data.error || "Erro ao salvar no servidor.");
        return;
      }

      setStatus("ok");
      setMessage(`Seção ${scope || "da Landing Page"} salva com sucesso!`);
      
      // Sincroniza o estado local com o que foi salvo
      if (scope) {
        setContent(dataToSave);
      }

      setTimeout(() => { setMessage(""); setStatus("idle"); }, 3000);
    } catch (err: any) {
      console.error("Fetch Exception:", err);
      setStatus("error");
      setMessage("Falha de conexão: " + (err.message || "Erro desconhecido"));
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return <div className="integrations-loading">Carregando conteúdo...</div>;

  const t = content.home[locale];

  return (
    <div className="new-integrations-container">
      <header className="integrations-header">
        <h1>Landing Page</h1>
        <p>Personalize as seções da sua página inicial</p>
      </header>

      <div className="admin-tabs-v2">
        <div className="locale-tabs">
          <button className={locale === "pt" ? "active" : ""} onClick={() => setLocale("pt")}>Português</button>
          <button className={locale === "en" ? "active" : ""} onClick={() => setLocale("en")}>English</button>
        </div>

        <div className="section-tabs">
          <button className={section === "hero" ? "active" : ""} onClick={() => setSection("hero")}>Hero</button>
          <button className={section === "highlights" ? "active" : ""} onClick={() => setSection("highlights")}>Diferenciais</button>
          <button className={section === "about" ? "active" : ""} onClick={() => setSection("about")}>Sobre (Leila)</button>
          <button className={section === "stories" ? "active" : ""} onClick={() => setSection("stories")}>Depoimentos</button>
          <button className={section === "footer" ? "active" : ""} onClick={() => setSection("footer")}>Rodapé</button>
          <button className={section === "fonts" ? "active" : ""} onClick={() => setSection("fonts")}>Fontes 🎨</button>
          <button className={section === "favicons" ? "active" : ""} onClick={() => setSection("favicons")}>Favicons ✨</button>
          <button className={section === "config" ? "active" : ""} onClick={() => setSection("config")}>Configurações</button>
        </div>
      </div>

      <div className="integration-card-v2">
        {section === "hero" && (
          <div className="edit-section">
            <div className="section-header-v2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              <h3>Hero Section</h3>
            </div>

            <div className="grid-form">
              <div className="left-col">
                <div className="field-group-v2">
                  <label>Hero Kicker</label>
                  <input type="text" value={t.hero.kicker} onChange={e => updateField(["home", locale, "hero", "kicker"], e.target.value)} />
                </div>
                <div className="field-group-v2">
                  <label>Hero Title</label>
                  <input type="text" value={t.hero.title} onChange={e => updateField(["home", locale, "hero", "title"], e.target.value)} />
                </div>
                <div className="field-group-v2">
                  <label>Hero Subtitle / Copy</label>
                  <textarea value={t.hero.copy} onChange={e => updateField(["home", locale, "hero", "copy"], e.target.value)} />
                </div>
                <div className="field-group-v2">
                  <label>CTA Button Text</label>
                  <input type="text" value={t.hero.ctaText} onChange={e => updateField(["home", locale, "hero", "ctaText"], e.target.value)} />
                </div>
              </div>
              <div className="right-col">
                <ImageUploadField 
                  label="Hero Image" 
                  value={t.hero.image} 
                  onChange={v => updateField(["home", locale, "hero", "image"], v)} 
                />
              </div>
            </div>
            <div className="card-actions-v2">
              <button className="btn-save mega" onClick={() => save("hero")} disabled={saving}>
                {saving ? "Salvando..." : `Salvar Seção Hero (${locale === "pt" ? "BR" : "EN"})`}
              </button>
            </div>
          </div>
        )}

        {section === "highlights" && (
          <div className="edit-section">
            <div className="section-header-v2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
              <h3>Diferenciais (Highlights)</h3>
            </div>

            <div className="field-group-v2">
              <label>Seção Heading</label>
              <input type="text" value={t.highlights.title} onChange={e => updateField(["home", locale, "highlights", "title"], e.target.value)} />
            </div>
            <div className="field-group-v2">
              <label>Seção Intro</label>
              <textarea value={t.highlights.intro} onChange={e => updateField(["home", locale, "highlights", "intro"], e.target.value)} />
            </div>

            <div className="list-editor">
              <label>Cartões de Diferenciais (Máximo 3 recomendados)</label>
              {t.highlights.items.map((item: any, idx: number) => (
                <div key={idx} className="list-item-card">
                  <div className="item-header">
                    <span>Item #{idx + 1}</span>
                    <button className="btn-remove" onClick={() => {
                      const items = [...t.highlights.items];
                      items.splice(idx, 1);
                      updateField(["home", locale, "highlights", "items"], items);
                    }}>Remover</button>
                  </div>
                  <div className="field-group-v2">
                    <label>Título</label>
                    <input type="text" value={item.title} onChange={e => {
                      const items = [...t.highlights.items];
                      items[idx] = { ...items[idx], title: e.target.value };
                      updateField(["home", locale, "highlights", "items"], items);
                    }} />
                  </div>
                  <div className="field-group-v2">
                    <label>Descrição</label>
                    <textarea value={item.description} onChange={e => {
                      const items = [...t.highlights.items];
                      items[idx] = { ...items[idx], description: e.target.value };
                      updateField(["home", locale, "highlights", "items"], items);
                    }} />
                  </div>
                </div>
              ))}
              <button className="btn-add-more" onClick={() => {
                updateField(["home", locale, "highlights", "items"], [...t.highlights.items, { title: "Novo Item", description: "" }]);
              }}>+ Adicionar Diferencial</button>
            </div>
            <div className="card-actions-v2">
              <button className="btn-save mega" onClick={() => save("highlights")} disabled={saving}>
                {saving ? "Salvando..." : `Salvar Diferenciais (${locale === "pt" ? "BR" : "EN"})`}
              </button>
            </div>
          </div>
        )}

        {section === "about" && (
          <div className="edit-section">
            <div className="section-header-v2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              <h3>Sobre Leila Vala</h3>
            </div>

            <div className="grid-form">
              <div className="left-col">
                <div className="field-group-v2">
                  <label>Título</label>
                  <input type="text" value={t.about.title} onChange={e => updateField(["home", locale, "about", "title"], e.target.value)} />
                </div>
                <div className="field-group-v2">
                  <label>Parágrafos (Um por linha)</label>
                  <textarea style={{ minHeight: "150px" }} value={t.about.paragraphs.join("\n")} onChange={e => updateField(["home", locale, "about", "paragraphs"], e.target.value.split("\n"))} />
                </div>
                <div className="field-group-v2">
                  <label>Frase de Destaque (Quote)</label>
                  <textarea value={t.about.quote} onChange={e => updateField(["home", locale, "about", "quote"], e.target.value)} />
                </div>
                <div className="field-group-v2">
                  <label>Botão Action Text</label>
                  <input type="text" value={t.about.ctaText} onChange={e => updateField(["home", locale, "about", "ctaText"], e.target.value)} />
                </div>
              </div>
              <div className="right-col">
                <ImageUploadField 
                  label="Foto Leila" 
                  value={t.about.image} 
                  onChange={v => updateField(["home", locale, "about", "image"], v)} 
                  circular 
                />
              </div>
            </div>
            <div className="card-actions-v2">
              <button className="btn-save mega" onClick={() => save("about")} disabled={saving}>
                {saving ? "Salvando..." : `Salvar Seção Sobre (${locale === "pt" ? "BR" : "EN"})`}
              </button>
            </div>
          </div>
        )}

        {section === "stories" && (
          <div className="edit-section">
            <div className="section-header-v2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              <h3>Depoimentos (Stories)</h3>
            </div>

            <div className="field-group-v2">
              <label>Heding Depoimentos</label>
              <input type="text" value={t.stories.title} onChange={e => updateField(["home", locale, "stories", "title"], e.target.value)} />
            </div>
            <div className="field-group-v2">
              <label>Intro Depoimentos</label>
              <textarea value={t.stories.intro} onChange={e => updateField(["home", locale, "stories", "intro"], e.target.value)} />
            </div>

            <div className="list-editor">
              {t.stories.items.map((item: any, idx: number) => (
                <div key={idx} className="list-item-card">
                  <div className="item-header">
                    <span>Depoimento #{idx + 1}</span>
                    <button className="btn-remove" onClick={() => {
                      const items = [...t.stories.items];
                      items.splice(idx, 1);
                      updateField(["home", locale, "stories", "items"], items);
                    }}>Remover</button>
                  </div>
                  <div className="grid-form stack-mobile">
                    <div className="left-col">
                      <div className="field-group-v2">
                        <label>Nome do Aluno</label>
                        <input type="text" value={item.name} onChange={e => {
                          const items = [...t.stories.items];
                          items[idx] = { ...items[idx], name: e.target.value };
                          updateField(["home", locale, "stories", "items"], items);
                        }} />
                      </div>
                      <div className="field-group-v2">
                        <label>Texto do Depoimento</label>
                        <textarea value={item.text} onChange={e => {
                          const items = [...t.stories.items];
                          items[idx] = { ...items[idx], text: e.target.value };
                          updateField(["home", locale, "stories", "items"], items);
                        }} />
                      </div>
                    </div>
                    <div className="right-col" style={{ flex: "0 0 120px" }}>
                      <ImageUploadField 
                        label="Avatar Aluno" 
                        value={item.image} 
                        onChange={v => {
                          const items = [...t.stories.items];
                          items[idx] = { ...items[idx], image: v };
                          updateField(["home", locale, "stories", "items"], items);
                        }} 
                        circular 
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button className="btn-add-more" onClick={() => {
                updateField(["home", locale, "stories", "items"], [...t.stories.items, { name: "Nome Silva", text: "", image: PUBLIC_ASSETS.testimonial1 }]);
              }}>+ Adicionar Depoimento</button>
            </div>
            <div className="card-actions-v2">
              <button className="btn-save mega" onClick={() => save("stories")} disabled={saving}>
                {saving ? "Salvando..." : `Salvar Depoimentos (${locale === "pt" ? "BR" : "EN"})`}
              </button>
            </div>
          </div>
        )}

        {section === "footer" && (
          <div className="edit-section">
            <div className="section-header-v2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
              <h3>Rodapé (Footer)</h3>
            </div>
            <div className="field-group-v2">
              <label>Mensagem de Copyright</label>
              <input type="text" value={t.footer} onChange={e => updateField(["home", locale, "footer"], e.target.value)} />
            </div>
            <div className="card-actions-v2">
              <button className="btn-save mega" onClick={() => save("footer")} disabled={saving}>
                {saving ? "Salvando..." : `Salvar Rodapé (${locale === "pt" ? "BR" : "EN"})`}
              </button>
            </div>
          </div>
        )}

        {section === "fonts" && (
          <div className="edit-section">
            <div className="section-header-v2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3M9 20h6M12 4v16" /></svg>
              <h3>Tipografia da Landing Page</h3>
            </div>
            <p className="section-desc-lp">Escolha fontes diferentes para cada parte da sua página para criar uma identidade única.</p>

            <div className="fonts-grid-editor">
              {/* HERO FONTS */}
              <div className="font-category-card">
                <h4>Hero Section</h4>
                <div className="font-fields">
                  <FontSelector label="Kicker (Texto Pequeno)" value={content.fonts?.hero?.kicker} onChange={v => updateField(["fonts", "hero", "kicker"], v)} />
                  <FontSelector label="Título Principal" value={content.fonts?.hero?.title} onChange={v => updateField(["fonts", "hero", "title"], v)} />
                  <FontSelector label="Subtítulo / Copy" value={content.fonts?.hero?.copy} onChange={v => updateField(["fonts", "hero", "copy"], v)} />
                  <FontSelector label="Texto do Botão (CTA)" value={content.fonts?.hero?.cta} onChange={v => updateField(["fonts", "hero", "cta"], v)} />
                </div>
              </div>

              {/* HIGHLIGHTS FONTS */}
              <div className="font-category-card">
                <h4>Diferenciais</h4>
                <div className="font-fields">
                  <FontSelector label="Título da Seção" value={content.fonts?.highlights?.title} onChange={v => updateField(["fonts", "highlights", "title"], v)} />
                  <FontSelector label="Introdução" value={content.fonts?.highlights?.intro} onChange={v => updateField(["fonts", "highlights", "intro"], v)} />
                  <FontSelector label="Título do Card" value={content.fonts?.highlights?.itemTitle} onChange={v => updateField(["fonts", "highlights", "itemTitle"], v)} />
                  <FontSelector label="Descrição do Card" value={content.fonts?.highlights?.itemDescription} onChange={v => updateField(["fonts", "highlights", "itemDescription"], v)} />
                </div>
              </div>

              {/* ABOUT FONTS */}
              <div className="font-category-card">
                <h4>Sobre Leila</h4>
                <div className="font-fields">
                  <FontSelector label="Título Seção" value={content.fonts?.about?.title} onChange={v => updateField(["fonts", "about", "title"], v)} />
                  <FontSelector label="Parágrafos" value={content.fonts?.about?.paragraphs} onChange={v => updateField(["fonts", "about", "paragraphs"], v)} />
                  <FontSelector label="Citação (Quote)" value={content.fonts?.about?.quote} onChange={v => updateField(["fonts", "about", "quote"], v)} />
                  <FontSelector label="Texto do Botão" value={content.fonts?.about?.cta} onChange={v => updateField(["fonts", "about", "cta"], v)} />
                </div>
              </div>

              {/* STORIES FONTS */}
              <div className="font-category-card">
                <h4>Depoimentos</h4>
                <div className="font-fields">
                  <FontSelector label="Título Depoimentos" value={content.fonts?.stories?.title} onChange={v => updateField(["fonts", "stories", "title"], v)} />
                  <FontSelector label="Intro Depoimentos" value={content.fonts?.stories?.intro} onChange={v => updateField(["fonts", "stories", "intro"], v)} />
                  <FontSelector label="Nome do Aluno" value={content.fonts?.stories?.name} onChange={v => updateField(["fonts", "stories", "name"], v)} />
                  <FontSelector label="Texto do Depoimento" value={content.fonts?.stories?.text} onChange={v => updateField(["fonts", "stories", "text"], v)} />
                </div>
              </div>

              {/* FOOTER FONTS */}
              <div className="font-category-card">
                <h4>Rodapé</h4>
                <div className="font-fields">
                  <FontSelector label="Copyright / Contatos" value={content.fonts?.footer?.text} onChange={v => updateField(["fonts", "footer", "text"], v)} />
                </div>
              </div>
            </div>

            <div className="card-actions-v2">
              <button className="btn-save mega" onClick={() => save("fonts")} disabled={saving}>
                {saving ? "Salvando..." : "Salvar Estilos de Fontes"}
              </button>
            </div>
          </div>
        )}

        {section === "favicons" && (
          <div className="edit-section">
            <div className="section-header-v2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              <h3>Gerenciamento de Favicons</h3>
            </div>
            <p className="section-desc-lp">Configure os ícones que aparecem na aba do navegador e nos dispositivos móveis.</p>

            <div className="grid-form">
              <div className="left-col">
                <ImageUploadField 
                  label="Favicon Principal (.ico ou .png)" 
                  value={content.favicons?.favicon} 
                  onChange={v => updateField(["favicons", "favicon"], v)} 
                  square
                />
                <ImageUploadField 
                  label="Apple Touch Icon (180x180)" 
                  value={content.favicons?.appleTouchIcon} 
                  onChange={v => updateField(["favicons", "appleTouchIcon"], v)} 
                  square
                />
              </div>
              <div className="right-col">
                <ImageUploadField 
                  label="PNG Icon 32x32" 
                  value={content.favicons?.icon32} 
                  onChange={v => updateField(["favicons", "icon32"], v)} 
                  square
                />
                <ImageUploadField 
                  label="PNG Icon 16x16" 
                  value={content.favicons?.icon16} 
                  onChange={v => updateField(["favicons", "icon16"], v)} 
                  square
                />
              </div>
            </div>

            <div className="card-actions-v2">
              <button className="btn-save mega" onClick={() => save("favicons")} disabled={saving}>
                {saving ? "Salvando..." : "Salvar Favicons"}
              </button>
            </div>
          </div>
        )}

        {section === "config" && (
          <div className="edit-section">
            <div className="section-header-v2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
              <h3>Configurações Gerais</h3>
            </div>
            <div className="field-group-v2">
              <label>Estilo do Seletor de Idiomas</label>
              <div className="radio-group-lp">
                <label className={`radio-option ${content.config?.languageSwitcherStyle === "default" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="switcherStyle"
                    value="default"
                    checked={content.config?.languageSwitcherStyle === "default"}
                    onChange={() => updateField(["config", "languageSwitcherStyle"], "default")}
                  />
                  <div className="radio-content">
                    <span className="title">Bandeiras Laterais (Atual)</span>
                    <span className="desc">Exibe as bandeiras uma ao lado da outra no topo.</span>
                  </div>
                </label>
                <label className={`radio-option ${content.config?.languageSwitcherStyle === "list" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="switcherStyle"
                    value="list"
                    checked={content.config?.languageSwitcherStyle === "list"}
                    onChange={() => updateField(["config", "languageSwitcherStyle"], "list")}
                  />
                  <div className="radio-content">
                    <span className="title">Lista / Dropdown</span>
                    <span className="desc">Exibe uma lista de idiomas como no exemplo solicitado.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid-form">
              <ImageUploadField 
                label="Bandeira Português (Upload ou URL)" 
                value={content.config?.flagPt} 
                onChange={v => updateField(["config", "flagPt"], v)} 
                placeholder="/flag-br.svg" 
              />
              <ImageUploadField 
                label="Bandeira Inglês (Upload ou URL)" 
                value={content.config?.flagEn} 
                onChange={v => updateField(["config", "flagEn"], v)} 
                placeholder="/flag-us.svg" 
              />
            </div>
            <div className="card-actions-v2">
              <button className="btn-save mega" onClick={() => save("config")} disabled={saving}>
                {saving ? "Salvando..." : "Salvar Configurações Gerais"}
              </button>
            </div>
          </div>
        )}

        {message && <div className={`status-msg ${status}`}>{message}</div>}
      </div>

      <style jsx>{`
                .new-integrations-container { max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; padding-bottom: 3rem; }
                .integrations-header h1 { font-size: 1.75rem; font-weight: 700; color: #111827; margin: 0; }
                .integrations-header p { color: #6b7280; margin-top: 0.35rem; }

                .admin-tabs-v2 { display: flex; flex-direction: column; gap: 1rem; margin-top: 0.5rem; }
                .locale-tabs { display: flex; gap: 0.5rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem; }
                .locale-tabs button { padding: 0.6rem 1.25rem; border: none; background: transparent; color: #64748b; font-weight: 700; cursor: pointer; border-radius: 6px; transition: all 0.2s; }
                .locale-tabs button.active { background: #3b82f6; color: #fff; }

                .section-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; }
                .section-tabs button { padding: 0.5rem 1rem; border: 1px solid #e2e8f0; background: #fff; color: #475569; font-weight: 600; cursor: pointer; border-radius: 8px; font-size: 0.88rem; transition: all 0.2s; }
                .section-tabs button:hover { border-color: #3b82f6; color: #3b82f6; }
                .section-tabs button.active { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }

                .integration-card-v2 { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 20px -5px rgba(0,0,0,0.05); }
                .section-header-v2 { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
                .section-header-v2 h3 { margin: 0; font-size: 1.25rem; font-weight: 800; }

                .grid-form { display: grid; grid-template-columns: 1.5fr 1fr; gap: 2.5rem; }
                .grid-form.stack-mobile { }
                .field-group-v2 { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
                .field-group-v2 label { font-size: 0.85rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.025em; }
                .field-group-v2 input, .field-group-v2 textarea { padding: 0.8rem 1rem; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 0.95rem; color: #1e293b; transition: all 0.2s; }
                .field-group-v2 input:focus, .field-group-v2 textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
                .field-group-v2 textarea { min-height: 100px; resize: vertical; }

                .image-preview-lp { margin-top: 1rem; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; background: #f8fafc; aspect-ratio: 16/9; display: flex; align-items: center; justify-content: center; }
                .image-preview-lp img { max-width: 100%; max-height: 100%; object-fit: cover; }
                .image-preview-lp.circular { aspect-ratio: 1/1; border-radius: 50%; max-width: 250px; }

                .list-editor { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }
                .list-editor > label { font-size: 0.9rem; font-weight: 800; color: #1e293b; margin-bottom: 0.5rem; padding-top: 1rem; }
                .list-item-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; position: relative; }
                .item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px dashed #cbd5e1; padding-bottom: 0.5rem; }
                .item-header span { font-weight: 800; font-size: 0.85rem; color: #64748b; }
                .btn-remove { background: transparent; border: none; color: #ef4444; font-weight: 700; cursor: pointer; font-size: 0.82rem; }
                .btn-remove:hover { text-decoration: underline; }
                .btn-add-more { background: #fff; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 1rem; font-weight: 700; color: #64748b; cursor: pointer; transition: all 0.2s; }
                .btn-add-more:hover { border-color: #3b82f6; color: #3b82f6; background: #f0f7ff; }

                .avatar-preview-lp { width: 60px; height: 60px; border-radius: 50%; overflow: hidden; border: 2px solid #e2e8f0; margin-top: 0.5rem; }
                .avatar-preview-lp img { width: 100%; height: 100%; object-fit: cover; }

                .card-actions-v2 { margin-top: 2rem; border-top: 1px solid #f1f5f9; padding-top: 1.5rem; }
                .btn-save.mega { width: 100%; padding: 1rem; background: #1e293b; color: #fff; border: none; border-radius: 12px; font-weight: 800; font-size: 1rem; cursor: pointer; transition: all 0.2s; }
                .btn-save.mega:hover { background: #0f172a; transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
                .btn-save.mega:disabled { opacity: 0.6; cursor: wait; }

                .status-msg { margin-top: 1rem; padding: 1rem; border-radius: 10px; font-weight: 600; font-size: 0.92rem; text-align: center; }
                .status-msg.ok { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
                .status-msg.error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

                .radio-group-lp { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 0.5rem; }
                .radio-option { border: 2px solid #e2e8f0; border-radius: 12px; padding: 1rem; cursor: pointer; display: flex; align-items: flex-start; gap: 1rem; transition: all 0.2s; }
                .radio-option:hover { border-color: #3b82f6; background: #f8faff; }
                .radio-option.selected { border-color: #3b82f6; background: #eff6ff; }
                .radio-option input { margin-top: 0.25rem; }
                .radio-content { display: flex; flex-direction: column; }
                .radio-content .title { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
                .radio-content .desc { font-size: 0.82rem; color: #64748b; margin-top: 0.2rem; }

                .flag-preview-admin { margin-top: 0.5rem; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: #1e293b; border-radius: 8px; padding: 4px; }
                .flag-preview-admin img { max-width: 100%; max-height: 100%; object-fit: contain; }

                @media (max-width: 768px) {
                    .grid-form { grid-template-columns: 1fr; }
                    .section-tabs { gap: 0.25rem; }
                    .fonts-grid-editor { grid-template-columns: 1fr; }
                }

                .section-desc-lp { color: #64748b; margin-top: -1.5rem; margin-bottom: 2rem; font-size: 0.95rem; }
                .fonts-grid-editor { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                .font-category-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; }
                .font-category-card h4 { margin-top: 0; margin-bottom: 1.25rem; color: #1e293b; font-size: 1rem; font-weight: 800; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; }
                .font-fields { display: flex; flex-direction: column; gap: 1rem; }

                .font-selector-v2 { display: flex; flex-direction: column; gap: 0.35rem; }
                .font-selector-v2 label { font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
                .font-selector-v2 select { padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem; background: #fff; color: #1e293b; }
                .font-preview-snippet { font-size: 0.85rem; margin-top: 0.25rem; color: #3b82f6; font-weight: 500; }
            `}</style>
    </div>
  );
}

function FontSelector({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  const fonts = [
    "Inter", "Roboto", "Poppins", "Montserrat", "Outfit", "Space Grotesk", 
    "Open Sans", "Lato", "Plus Jakarta Sans", "Manrope", "Sora",
    "Playfair Display", "Lora", "Merriweather", 
    "Ubuntu", "Caveat", "Pacifico", "Dancing Script"
  ];

  return (
    <div className="font-selector-v2">
      <label>{label}</label>
      <select value={value || "Inter"} onChange={e => onChange(e.target.value)}>
        {fonts.sort().map(f => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>
      <div className="font-preview-snippet" style={{ fontFamily: value || "Inter" }}>
        The quick brown fox jumps over the lazy dog
      </div>
    </div>
  );
}
