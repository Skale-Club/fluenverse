"use client";

import { useRouter } from "next/navigation";
import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import Link from "next/link";
import { PUBLIC_ASSETS } from "@/lib/public-assets";

type Locale = "pt" | "en";


type Props = {
  open: boolean;
  locale: Locale;
  onClose: () => void;
  gaEventNames: {
    modalOpen: string;
    surveySubmit: string;
  };
  fbEventNames: {
    modalOpen: string;
    surveySubmit: string;
  };
};

const STORAGE_KEY = "fluenverse_schedule_surveys";

type SurveyQuestion = {
  id: string;
  key: string;
  type: "text" | "email" | "tel" | "textarea" | "checkbox-group" | "radio";
  label_pt: string;
  label_en: string;
  placeholder_pt?: string;
  placeholder_en?: string;
  options_pt?: string[];
  options_en?: string[];
  required: boolean;
  order_index: number;
};

const DEFAULT_SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: "fallback-name",
    key: "name",
    type: "text",
    label_pt: "Qual seu nome completo?",
    label_en: "What is your full name?",
    placeholder_pt: "Seu nome",
    placeholder_en: "Your name",
    required: true,
    order_index: 0
  },
  {
    id: "fallback-email",
    key: "email",
    type: "email",
    label_pt: "Qual seu melhor e-mail?",
    label_en: "What is your best email?",
    placeholder_pt: "voce@email.com",
    placeholder_en: "you@email.com",
    required: true,
    order_index: 1
  },
  {
    id: "fallback-phone",
    key: "phone",
    type: "tel",
    label_pt: "Qual seu WhatsApp?",
    label_en: "What is your WhatsApp number?",
    placeholder_pt: "(11) 99999-9999",
    placeholder_en: "(000) 000-0000",
    required: true,
    order_index: 2
  },
  {
    id: "fallback-objective",
    key: "objective",
    type: "checkbox-group",
    label_pt: "Qual seu objetivo com o inglês?",
    label_en: "What is your goal with English?",
    options_pt: ["Conversação", "Trabalho", "Viagem", "Outro"],
    options_en: ["Conversation", "Work", "Travel", "Other"],
    required: true,
    order_index: 3
  },
  {
    id: "fallback-level",
    key: "level",
    type: "radio",
    label_pt: "Qual seu nível atual?",
    label_en: "What is your current level?",
    options_pt: ["Iniciante (A1–A2)", "Básico (A2–B1)", "Intermediário (B1–B2)", "Avançado (C1)", "Fluente (C2)"],
    options_en: ["Beginner (A1–A2)", "Basic (A2–B1)", "Intermediate (B1–B2)", "Advanced (C1)", "Fluent (C2)"],
    required: true,
    order_index: 4
  },
  {
    id: "fallback-difficulty",
    key: "difficulty",
    type: "checkbox-group",
    label_pt: "Maior dificuldade no idioma",
    label_en: "Biggest difficulty with English",
    options_pt: ["Pronúncia", "Gramática / Vocabulário", "Listening (entender nativos)", "Fluência / Travar na hora de falar"],
    options_en: ["Pronunciation", "Grammar / Vocabulary", "Listening (understanding natives)", "Fluency / Freezing when speaking"],
    required: false,
    order_index: 5
  },
  {
    id: "fallback-bestDay",
    key: "bestDay",
    type: "checkbox-group",
    label_pt: "Melhor dia da semana para sessões",
    label_en: "Best weekday for sessions",
    options_pt: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
    options_en: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    required: false,
    order_index: 6
  }
];

const COUNTRY_OPTIONS = [
  { code: "BR" as const, flag: PUBLIC_ASSETS.flags.br, label: "BR +55" },
  { code: "US" as const, flag: PUBLIC_ASSETS.flags.us, label: "US +1" },
  { code: "CA" as const, flag: PUBLIC_ASSETS.flags.ca, label: "CA +1" }
];

const copy = {
  pt: {
    title: "Agendar sessão",
    close: "Fechar",
    back: "Voltar",
    next: "Próximo",
    submit: "Enviar survey",
    sending: "Enviando...",
    required: "Preencha este campo para continuar.",
    invalidEmail: "Informe um e-mail válido.",
  },
  en: {
    title: "Schedule a session",
    close: "Close",
    back: "Back",
    next: "Next",
    submit: "Submit survey",
    sending: "Sending...",
    required: "Please fill this field to continue.",
    invalidEmail: "Please enter a valid email.",
  }
} as const;

export function ScheduleSurveyModal({ open, locale, onClose, gaEventNames, fbEventNames }: Props) {
  const router = useRouter();
  const t = copy[locale];
  const [questions, setQuestions] = useState<SurveyQuestion[] | null>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [data, setData] = useState<Record<string, any>>({});
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    if (open && !sessionId) {
      setSessionId(typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2));
    }
  }, [open, sessionId]);

  // Auto-save partial data as the user types
  useEffect(() => {
    if (!open || !sessionId || Object.keys(data).length === 0) return;

    // Don't save if it's sending the final submission
    if (sending) return;

    const timer = setTimeout(() => {
      fetch("/api/survey/partial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, sessionId, locale })
      }).catch(err => console.error("Error saving partial survey:", err));
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [data, sessionId, open, locale, sending]);

  useEffect(() => {
    if (!open) return;
    fetch("/api/survey-questions")
      .then(async (res) => {
        const payload = await res.json().catch(() => null);
        return { ok: res.ok, payload };
      })
      .then(resData => {
        if (resData.ok && Array.isArray(resData.payload) && resData.payload.length > 0) {
          const ordered = [...resData.payload].sort((a, b) => Number(a.order_index) - Number(b.order_index));
          setQuestions(ordered);
          setData(prev => {
             const next = { ...prev };
             ordered.forEach(q => {
                if (next[q.key] === undefined) {
                  next[q.key] = q.type === 'checkbox-group' ? [] : "";
                }
             });
             return next;
          });
          return;
        }

        setQuestions(DEFAULT_SURVEY_QUESTIONS);
      })
      .catch(err => {
        console.error("Error fetching survey questions:", err);
        setQuestions(DEFAULT_SURVEY_QUESTIONS);
      });
  }, [open]);

  const [phoneCountry, setPhoneCountry] = useState<'BR' | 'US' | 'CA'>(locale === 'pt' ? 'BR' : 'US');
  const [showCountries, setShowCountries] = useState(false);

  useEffect(() => {
    setPhoneCountry(locale === 'pt' ? 'BR' : 'US');
  }, [locale, open]);

  const formatPhoneNumber = (value: string, country: 'BR' | 'US' | 'CA') => {
    const digits = value.replace(/\D/g, "");
    if (country === 'BR') {
      if (digits.length <= 2) return digits;
      if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    } else {
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  // steps only stores key + validation logic — no JSX — to avoid re-creating elements on every keystroke
  const steps = useMemo(
    () => (questions ?? []).map(q => ({
      key: q.key,
      valid: (): boolean => {
        if (!q.required) return true;
        const val = data[q.key];
        if (q.type === 'checkbox-group') return Array.isArray(val) && val.length > 0;
        if (q.type === 'email') return /\S+@\S+\.\S+/.test(String(val || "").trim());
        if (q.type === 'tel') {
          const digits = String(val || "").replace(/\D/g, "");
          return digits.length >= 10;
        }
        return String(val || "").trim().length > 0;
      }
    })),
    [questions, data]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    trackEvent(gaEventNames.modalOpen, {
      form_name: "schedule_survey",
      language: locale,
      item_name: "schedule_session_modal"
    });

    trackEvent(fbEventNames.modalOpen, {
      form_name: "schedule_survey",
      language: locale
    });
  }, [locale, open, gaEventNames, fbEventNames]);


  useEffect(() => {
    if (open) {
      return;
    }

    setStep(0);
    setError("");
    setSending(false);
    setQuestions(null);
    // data and sessionId are intentionally preserved so the user
    // can reopen the modal and continue where they left off
  }, [open]);

  // Keep the fullscreen loader mounted during navigation so there's no glimpse of the page beneath
  if (!open) {
    if (sending) {
      return (
        <div className="survey-fullscreen-loader">
          <div className="survey-sending-spinner" />
          <p className="survey-sending-text">{t.sending}</p>
        </div>
      );
    }
    return null;
  }

  // Show spinner inside the modal shell while questions are loading
  if (!questions) {
    return (
      <div className="survey-overlay" role="dialog" aria-modal="true" aria-label={t.title} onClick={onClose}>
        <section className="survey-modal" onClick={(e) => e.stopPropagation()}>
          <header className="chat-header">
            <Link href="/" className="chat-header-brand">
              <img src={PUBLIC_ASSETS.logo} alt="Fluenverse" className="chat-header-logo" />
            </Link>
            <button type="button" className="chat-close" onClick={onClose} aria-label={t.close}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
              </svg>
            </button>
          </header>
          <div className="survey-loading">
            <div className="survey-sending-spinner" />
          </div>
        </section>
      </div>
    );
  }

  if (steps.length === 0) {
    return null;
  }

  const currentStep = steps[step];
  const currentQuestion = questions[step];
  const atLastStep = step === steps.length - 1;

  const handleClose = () => {
    setError("");
    onClose();
  };

  const validateCurrentStep = () => {
    if (!currentStep.valid()) {
      if (currentStep.key === "email" && data.email && !/\S+@\S+\.\S+/.test(data.email)) {
        setError(t.invalidEmail);
      } else {
        setError(t.required);
      }
      return false;
    }

    setError("");
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }
    setStep((value) => Math.min(value + 1, steps.length - 1));
  };

  const handleBack = () => {
    setError("");
    setStep((value) => Math.max(value - 1, 0));
  };

  const doSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }
    if (sending) {
      return;
    }

    let existing: Array<any & { createdAt: string; locale: Locale }> = [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        existing = JSON.parse(raw);
      } catch {
        existing = [];
      }
    }

    existing.push({
      ...data,
      locale,
      createdAt: new Date().toISOString()
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

    setSending(true);
    let redirected = false;

    try {
      const submissionData: Record<string, any> = { ...data, locale, sessionId };

      // Prepend country code to tel fields
      questions.forEach(q => {
        if (q.type === 'tel' && submissionData[q.key]) {
          const prefix = phoneCountry === 'BR' ? '+55 ' : '+1 ';
          if (!String(submissionData[q.key]).startsWith('+')) {
            submissionData[q.key] = prefix + submissionData[q.key];
          }
        }
      });

      const response = await fetch("/api/survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(submissionData)
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string; storedInternally?: boolean };

      if (!response.ok) {
        setError(payload.error || (locale === 'pt' ? "Não foi possível enviar o survey." : "Could not submit the survey."));
        return;
      }

      if (payload.storedInternally === false) {
        console.warn("Survey submitted through integrations, but internal lead storage failed.");
      }

      trackEvent(gaEventNames.surveySubmit, {
        form_name: "schedule_survey",
        language: locale,
        objective_count: Array.isArray(data.objective) ? data.objective.length : 0,
        has_phone: Boolean(String(data.phone || "").trim())
      });

      trackEvent(fbEventNames.surveySubmit, {
        form_name: "schedule_survey",
        language: locale
      });

      setError("");
      setData({});
      setSessionId("");
      onClose();
      redirected = true;
      router.push(`/thank-you?source=schedule_survey&lang=${locale}`);
    } catch {
      setError(locale === 'pt' ? "Erro de conexão ao enviar o survey." : "Connection error while submitting the survey.");
    } finally {
      if (!redirected) {
        setSending(false);
      }
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await doSubmit();
  };

  const handleFormKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== "Enter") return;

    const target = event.target as HTMLElement;
    const tag = target.tagName.toLowerCase();
    const isTextarea = tag === "textarea";
    const isLabel = tag === "label";

    // Shift+Enter in textarea: allow newline
    if (isTextarea && event.shiftKey) return;

    // Labels handle their own Enter/Space for toggling — don't interfere
    if (isLabel) return;

    event.preventDefault();

    if (atLastStep) {
      doSubmit();
    } else {
      handleNext();
    }
  };

  // Render the current question's field inline (not inside useMemo) to prevent input glitches
  const q = currentQuestion;
  const label = locale === 'pt' ? q.label_pt : q.label_en;
  const placeholder = locale === 'pt' ? q.placeholder_pt : q.placeholder_en;
  const options = locale === 'pt' ? q.options_pt : q.options_en;

  return (
    <>
    {sending && (
      <div className="survey-fullscreen-loader">
        <div className="survey-sending-spinner" />
        <p className="survey-sending-text">{t.sending}</p>
      </div>
    )}
    <div className="survey-overlay" role="dialog" aria-modal="true" aria-label={t.title} onClick={handleClose}>
      <section className="survey-modal" onClick={(event) => event.stopPropagation()}>
        <header className="chat-header">
          <Link href="/" className="chat-header-brand">
            <img src={PUBLIC_ASSETS.logo} alt="Fluenverse" className="chat-header-logo" />
          </Link>
          <button type="button" className="chat-close" onClick={handleClose} aria-label={t.close}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
            </svg>
          </button>
        </header>


        <div className="survey-content">
          <form className="chat-settings-form" onSubmit={handleSubmit} onKeyDown={handleFormKeyDown}>
            <div className="field chat-settings-span">
              <label className="field-label">{label}</label>

              {q.type === 'textarea' ? (
                <textarea
                  rows={4}
                  value={data[q.key] || ""}
                  onChange={(e) => setData(curr => ({ ...curr, [q.key]: e.target.value }))}
                  placeholder={placeholder}
                />
              ) : (q.type === 'checkbox-group' || q.type === 'radio') ? (
                <div className="survey-check-grid">
                  {options?.map((option) => {
                    const isChecked = q.type === 'checkbox-group'
                      ? (Array.isArray(data[q.key]) ? data[q.key].includes(option) : false)
                      : data[q.key] === option;
                    const toggle = () => setData((current) => {
                      if (q.type === 'radio') {
                        return { ...current, [q.key]: current[q.key] === option ? "" : option };
                      }
                      const currentList = Array.isArray(current[q.key]) ? current[q.key] : [];
                      return {
                        ...current,
                        [q.key]: currentList.includes(option)
                          ? currentList.filter((o: string) => o !== option)
                          : [...currentList, option]
                      };
                    });
                    return (
                      <label
                        key={option}
                        className={`survey-check-option${isChecked ? " checked" : ""}`}
                        onClick={(e) => { e.preventDefault(); toggle(); }}
                        onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); } }}
                        tabIndex={0}
                      >
                        <span>{option}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          tabIndex={-1}
                          aria-hidden="true"
                        />
                      </label>
                    );
                  })}
                </div>
              ) : q.type === 'tel' ? (
                <div className="tel-input-wrapper">
                  <div className="custom-country-selector">
                    <button
                      type="button"
                      className="country-trigger"
                      onClick={() => setShowCountries(!showCountries)}
                    >
                      <img src={COUNTRY_OPTIONS.find(c => c.code === phoneCountry)?.flag} alt="" className="country-flag-img" />
                      <span>{COUNTRY_OPTIONS.find(c => c.code === phoneCountry)?.label}</span>
                      <svg
                        width="10"
                        height="6"
                        viewBox="0 0 10 6"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          marginLeft: 'auto',
                          transition: 'transform 0.2s ease',
                          transform: showCountries ? 'rotate(180deg)' : 'rotate(0deg)',
                          opacity: 0.7
                        }}
                      >
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    {showCountries && (
                      <div className="country-popover">
                        {COUNTRY_OPTIONS.map(opt => (
                          <button
                            key={opt.code}
                            type="button"
                            className={`country-option ${phoneCountry === opt.code ? 'active' : ''}`}
                            onClick={() => {
                              setPhoneCountry(opt.code);
                              setShowCountries(false);
                              const raw = String(data[q.key] || "").replace(/\D/g, "");
                              setData(curr => ({ ...curr, [q.key]: formatPhoneNumber(raw, opt.code) }));
                            }}
                          >
                            <img src={opt.flag} alt="" />
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="tel"
                    value={data[q.key] || ""}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value, phoneCountry);
                      setData(curr => ({ ...curr, [q.key]: formatted }));
                    }}
                    placeholder={phoneCountry === 'BR' ? "(11) 99999-9999" : "(000) 000-0000"}
                    onFocus={() => { if(showCountries) setShowCountries(false); }}
                  />
                </div>
              ) : (
                <input
                  type={q.type}
                  value={data[q.key] || ""}
                  onChange={(e) => setData(curr => ({ ...curr, [q.key]: e.target.value }))}
                  placeholder={placeholder}
                />
              )}

              {/* Special case for objective "Other" / "Outro" to keep existing UX */}
              {q.key === 'objective' && (data[q.key]?.includes('Other') || data[q.key]?.includes('Outro')) && (
                 <div style={{ marginTop: '0.8rem' }}>
                   <input
                     type="text"
                     value={data.objectiveOther || ""}
                     onChange={(e) => setData(curr => ({ ...curr, objectiveOther: e.target.value }))}
                     placeholder={locale === 'pt' ? "Descreva seu objetivo" : "Describe your goal"}
                   />
                 </div>
              )}
            </div>

            {error ? <p className="chat-error">{error}</p> : null}

            <div className="survey-actions chat-settings-span">
              <button type="button" className="secondary-button" onClick={handleBack} disabled={step === 0}>
                {t.back}
              </button>
              {atLastStep ? (
                <button
                  key="submit-btn"
                  type="submit"
                  className={`primary-button${sending ? " btn-loading" : ""}`}
                  disabled={sending}
                >
                  {sending ? <span className="btn-spinner" /> : t.submit}
                </button>
              ) : (
                <button
                  key="next-btn"
                  type="button"
                  className="primary-button"
                  onClick={handleNext}
                  disabled={sending}
                >
                  {t.next}
                </button>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
    </>
  );
}
