import DialogueSlide from './DialogueSlide';
import { PUBLIC_ASSETS } from "@/lib/public-assets";

type BulletItem = string | { text: string; href: string };

type Plan = {
  sessions: string;
  price: string;
  detail: string;
};

type Section = {
  title: string;
  intro?: string;
  subtitle?: string;
  bullets?: BulletItem[];
  note?: string;
  layout?: 'globe' | 'pricing' | 'single';
  theme?: string;
  plans?: Plan[];
  price?: string;
  description?: string;
  label?: string;
};

const sections: Section[] = [
  {
    title: "Por Dentro Da Fluenverse",
    layout: "globe",
    theme: "glow-left",
    bullets: [
      "As sessões são ajustadas de acordo com a realidade pessoal de cada um (os temas poderão remeter situações da vida real).",
      "As sessões consistem em 15-30 min de interação livre no inicio, e o restante do tempo se divide entre praticas guiadas pelo instrutor.",
      "Foco em aprimoramento da sua pronúncia através de conversações",
      { text: "As sessões acontecem virtualmente via Google Meets", href: "https://meet.google.com" }
    ]
  },
  {
    title: "O Que Oferecemos",
    theme: "aurora-right",
    intro: "A partir da primeira sessão, você poderá compartilhar o que você sente que precisa desenvolver (os cenários poderão remeter situações da vida real).",
    subtitle: "Durante as sessões você poderá:",
    bullets: [
      "Praticar o inglês em conversações livres",
      "Revisar o vocabulário utilizado na conversação",
      "Tirar duvidas de inglês do dia a dia",
      "Praticar cenários (role-plays)",
      "Sessões Personalizadas (ex., simulação de entrevistas, atendimento, discurso)",
      "Avaliação oral de inglês: 1x por mês"
    ]
  },
  {
    title: "Para Quem São Nossas Sessões",
    theme: "aurora-top",
    bullets: [
      "NÍVEL: Falante Básico (A2) e Falante Independente (B1)"
    ],
    note: "IMPORTANTE: Na FluenVerse não se oferece aulas de gramática de Inglês. Todas as sessões se baseiam na prática (falada) da língua inglesa de forma livre e através de cenários."
  },
  {
    title: "Como Funcionam Nossas Sessões",
    theme: "glow-left",
    intro: "Veja o fluxo típico de uma sessão e como você evolui a cada semana.",
    subtitle: "Estrutura básica:",
    bullets: [
      "Aquecimento curto para destravar a fala",
      "Conversação guiada em torno do seu objetivo semanal",
      "Feedback imediato de pronúncia e fluência",
      "Recap com vocabulário chave e próximos passos",
      { text: "Encontros via Google Meets", href: "https://meet.google.com" }
    ],
    note: "Adaptamos duração e intensidade conforme sua agenda."
  }
];

const pricingSection: Section = {
  title: "Pacotes Mensais",
  layout: "pricing",
  theme: "pricing",
  plans: [
    { sessions: "4 SESSÕES", price: "$250", detail: "1x na semana por apenas $62 cada sessão." },
    { sessions: "8 SESSÕES", price: "$440", detail: "2x na semana por apenas $55 cada sessão." },
    { sessions: "12 SESSÕES", price: "$600", detail: "3x na semana por apenas $50 cada sessão." }
  ]
};

const singleSessionSection: Section = {
  title: "Sessão Única",
  layout: "single",
  theme: "pricing",
  price: "$80",
  label: "1 SESSÃO",
  description: "Se você não está disposto a pagar o pacote mensal e quer apenas uma sessão única, cada sessão custa $80"
};

function renderBullet(item: BulletItem) {
  if (typeof item === 'string') return item;
  const before = item.text.slice(0, item.text.lastIndexOf('Google Meets'));
  return <>{before}<a href={item.href} target="_blank" rel="noopener noreferrer">Google Meets</a></>;
}

export default function PresentationPage() {
  return (
    <main className="presentation">
      <header className="presentation__topbar">
        <img src={PUBLIC_ASSETS.logo} alt="Fluenverse" className="presentation__topbar-logo" />
      </header>

      <section className="presentation__slide presentation__slide--hero">
        <div className="presentation__slide-body">
          <div className="presentation__frame presentation__frame--hero">
            <img
              src={PUBLIC_ASSETS.presentationIntro}
              alt="Fluenverse presentation intro"
              className="presentation__hero-logo"
            />
          </div>
        </div>
      </section>

      {sections.map(section => (
        <section
          className={`presentation__slide presentation__slide--dark${section.layout === 'globe' ? ' presentation__slide--globe' : ''}${section.layout === 'pricing' ? ' presentation__slide--pricing' : ''}`}
          data-theme={section.theme}
          key={section.title}
        >
          <div className="presentation__slide-body">
            {section.layout === 'globe' ? (
              <div className="presentation__frame presentation__frame--dark presentation__frame--globe">
                <hr className="presentation__rule" />
                <div className="presentation__globe-cols">
                  <div className="presentation__globe-text">
                    <h2>{section.title}</h2>
                    {section.bullets && (
                      <ul>
                        {section.bullets.map((item, i) => (
                          <li key={i}>{renderBullet(item)}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="presentation__globe-icon" aria-hidden="true">
                    <img src={PUBLIC_ASSETS.earthAtNight} alt="" />
                  </div>
                </div>
                <hr className="presentation__rule" />
              </div>
            ) : (
              <div className="presentation__frame presentation__frame--dark">
                <hr className="presentation__rule" />
                <div className="presentation__frame-content">
                  <h2>{section.title}</h2>
                  {section.intro ? <p className="presentation__intro">{section.intro}</p> : null}
                  {section.subtitle ? <p className="presentation__subtitle">{section.subtitle}</p> : null}
                  {section.bullets && (
                    <ul>
                      {section.bullets.map((item, i) => (
                        <li key={i}>{renderBullet(item)}</li>
                      ))}
                    </ul>
                  )}
                  {section.note ? <p className="presentation__note">{section.note}</p> : null}
                </div>
                <hr className="presentation__rule" />
              </div>
            )}
          </div>
        </section>
      ))}

      <DialogueSlide theme="aurora-right" />

      <section
        className="presentation__slide presentation__slide--dark presentation__slide--pricing"
        data-theme={pricingSection.theme}
      >
        <div className="presentation__slide-body">
          <div className="presentation__frame presentation__frame--dark presentation__frame--pricing">
            <div className="presentation__pricing-header">
              <h2 className="presentation__pricing-title">{pricingSection.title}</h2>
              <div className="presentation__pricing-line" aria-hidden="true" />
            </div>
            <div className="presentation__pricing-grid">
              {pricingSection.plans?.map(plan => (
                <div className="presentation__pricing-card" key={plan.sessions}>
                  <p className="presentation__pricing-sessions">{plan.sessions}</p>
                  <p className="presentation__pricing-price">{plan.price}</p>
                  <p className="presentation__pricing-detail">{plan.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className="presentation__slide presentation__slide--dark"
        data-theme={singleSessionSection.theme}
      >
        <div className="presentation__slide-body">
          <div className="presentation__frame presentation__frame--dark presentation__frame--single">
            <div className="presentation__single-card">
              <div className="presentation__single-left">
                <p className="presentation__single-heading">{singleSessionSection.title}</p>
                <p className="presentation__single-price">{singleSessionSection.price}</p>
              </div>
              <div className="presentation__single-right">
                <p className="presentation__single-label">{singleSessionSection.label}</p>
                <p className="presentation__single-description">{singleSessionSection.description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
