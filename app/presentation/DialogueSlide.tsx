'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { conversationAsset } from "@/lib/public-assets";

const messages: { speaker: 'Anna' | 'Tom' | null; src: string }[] = [
  { speaker: null,   src: conversationAsset(1)  },
  { speaker: 'Anna', src: conversationAsset(2)  },
  { speaker: 'Tom',  src: conversationAsset(3)  },
  { speaker: 'Anna', src: conversationAsset(4)  },
  { speaker: 'Tom',  src: conversationAsset(5)  },
  { speaker: 'Anna', src: conversationAsset(6)  },
  { speaker: 'Tom',  src: conversationAsset(7)  },
  { speaker: 'Anna', src: conversationAsset(8)  },
  { speaker: 'Tom',  src: conversationAsset(9)  },
  { speaker: 'Anna', src: conversationAsset(10) },
  { speaker: 'Tom',  src: conversationAsset(11) },
];

const total = messages.length - 1;

export default function DialogueSlide({ theme }: { theme?: string }) {
  const [step, setStep] = useState(0);
  const [prevStep, setPrevStep] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const navigate = useCallback((delta: number) => {
    setStep(current => {
      const nextStep = Math.min(Math.max(current + delta, 0), total);
      if (nextStep !== current) setPrevStep(current);
      return nextStep;
    });
  }, []);

  const next = useCallback(() => navigate(1), [navigate]);
  const prev = useCallback(() => navigate(-1), [navigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      if (rect.top >= window.innerHeight || rect.bottom <= 0) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  return (
    <section
      ref={sectionRef}
      className="presentation__slide presentation__slide--dark"
      data-theme={theme}
    >
      <div className="presentation__slide-body presentation__slide-body--dialogue">

        {/* Title + nav above the frame */}
        <div className="presentation__dialogue-top">
          <hr className="presentation__rule" />
          <div className="presentation__dialogue-header">
            <h2>Teste Conversacional</h2>
            <div className="presentation__carousel-nav">
              <button onClick={prev} aria-label="Anterior" disabled={step === 0}>&lt;</button>
              <span>{step} / {total}</span>
              <button onClick={next} aria-label="Próximo" disabled={step === total}>&gt;</button>
            </div>
          </div>
        </div>

        {/* Frame = full-bleed image only */}
        <div className="presentation__frame presentation__frame--dark presentation__frame--flush">
          <div
            className="presentation__dialogue-img-bubble"
            onClick={next}
            style={{ cursor: step < total ? 'pointer' : 'default' }}
          >
            {prevStep !== null && (
              <img
                src={messages[prevStep].src}
                alt=""
                className="presentation__dialogue-img-under"
              />
            )}
            <img
              key={step}
              src={messages[step].src}
              alt={messages[step].speaker ?? 'intro'}
              className="presentation__dialogue-img-over"
              onAnimationEnd={() => setPrevStep(null)}
            />
            {step === 0 && (
              <p className="presentation__dialogue-hint">Clique para iniciar →</p>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
