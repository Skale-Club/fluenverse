"use client";

import { useEffect, useState } from "react";
import { ImageUploadField } from "./image-upload-field";

interface ProviderConfig {
    loading: boolean;
    saving: boolean;
    status: "idle" | "ok" | "error";
    message: string;
}

export function AdminSeoSettings() {
    const [loaded, setLoaded] = useState(false);
    const [seo, setSeo] = useState({
        title: "",
        description: "",
        keywords: "",
        author: "",
        ogSiteName: "",
        ogType: "website",
        ogImage: "",
        robotsIndex: "true",
        robotsFollow: "true",
        twitterCard: "summary_large_image",
        twitterSite: "",
        twitterCreator: "",
        googleSiteVerification: "",
        facebookAppId: ""
    });
    const [seoStatus, setSeoStatus] = useState<ProviderConfig>({ loading: false, saving: false, status: "idle", message: "" });

    useEffect(() => {
        async function fetchConfig() {
            try {
                const response = await fetch("/api/admin/config");
                if (response.ok) {
                    const config = await response.json();
                    setSeo({
                        title: config.SEO_TITLE || "",
                        description: config.SEO_DESCRIPTION || "",
                        keywords: config.SEO_KEYWORDS || "",
                        author: config.SEO_AUTHOR || "",
                        ogSiteName: config.OG_SITE_NAME || "",
                        ogType: config.OG_TYPE || "website",
                        ogImage: config.OG_IMAGE_URL || "",
                        robotsIndex: config.SEO_ROBOTS_INDEX || "true",
                        robotsFollow: config.SEO_ROBOTS_FOLLOW || "true",
                        twitterCard: config.SEO_TWITTER_CARD || "summary_large_image",
                        twitterSite: config.SEO_TWITTER_SITE || "",
                        twitterCreator: config.SEO_TWITTER_CREATOR || "",
                        googleSiteVerification: config.SEO_GOOGLE_SITE_VERIFICATION || "",
                        facebookAppId: config.FACEBOOK_APP_ID || ""
                    });
                }
            } catch (err) {
                console.error("Erro ao carregar configuracoes:", err);
            }
            setLoaded(true);
        }
        fetchConfig();
    }, []);

    const saveConfig = async (pairs: Record<string, string>, setStatus: any) => {
        setStatus((prev: any) => ({ ...prev, saving: true, status: "idle", message: "Salvando..." }));
        try {
            const response = await fetch("/api/admin/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(pairs),
            });
            if (response.ok) {
                setStatus({ saving: false, status: "ok", message: "Configurações salvas com sucesso!" });
                setTimeout(() => setStatus((p: any) => ({ ...p, status: "idle", message: "" })), 4000);
            } else {
                setStatus({ saving: false, status: "error", message: "Erro ao salvar no servidor." });
            }
        } catch (err) {
            setStatus({ saving: false, status: "error", message: "Falha na conexão." });
        }
    };

    if (!loaded) return <div className="integrations-loading">Carregando configurações...</div>;

    return (
        <div className="new-integrations-container">
            <header className="integrations-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>SEO Settings</h1>
                        <p>Optimize your site for search engines and social media</p>
                    </div>
                    <button className="btn-save" onClick={() => saveConfig({
                        SEO_TITLE: seo.title,
                        SEO_DESCRIPTION: seo.description,
                        SEO_KEYWORDS: seo.keywords,
                        SEO_AUTHOR: seo.author,
                        OG_SITE_NAME: seo.ogSiteName,
                        OG_TYPE: seo.ogType,
                        OG_IMAGE_URL: seo.ogImage,
                        SEO_ROBOTS_INDEX: seo.robotsIndex,
                        SEO_ROBOTS_FOLLOW: seo.robotsFollow,
                        SEO_TWITTER_CARD: seo.twitterCard,
                        SEO_TWITTER_SITE: seo.twitterSite,
                        SEO_TWITTER_CREATOR: seo.twitterCreator,
                        SEO_GOOGLE_SITE_VERIFICATION: seo.googleSiteVerification,
                        FACEBOOK_APP_ID: seo.facebookAppId
                    }, setSeoStatus)} disabled={seoStatus.saving}>
                        {seoStatus.saving ? "Saving..." : "Save All Changes"}
                    </button>
                </div>
            </header>

            {seoStatus.message && (
                <div className={`status-msg ${seoStatus.status}`}>
                    {seoStatus.status === "ok" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>}
                    <span>{seoStatus.message}</span>
                </div>
            )}

            <div className="seo-blocks-grid">
                {/* BLOC 1: SEO BÁSICO */}
                <div className="integration-card-v2">
                    <div className="section-title">
                        <div className="icon-box" style={{ background: "#4f46e5", width: '32px', height: '32px', marginRight: '12px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                            </svg>
                        </div>
                        SEO Básico
                    </div>

                    <div className="field-grid">
                        <div className="field-group-v2 full-width">
                            <label>Site Name / Publisher</label>
                            <input type="text" value={seo.ogSiteName} onChange={e => setSeo(p => ({ ...p, ogSiteName: e.target.value }))} placeholder="Fluenverse" />
                        </div>

                        <div className="field-group-v2 full-width">
                            <label>Page Title</label>
                            <input type="text" value={seo.title} onChange={e => setSeo(p => ({ ...p, title: e.target.value }))} placeholder="Fluenverse | Your Language Journey" />
                            <p className="help-text">50-60 characters recommended</p>
                        </div>

                        <div className="field-group-v2 full-width">
                            <label>Meta Description</label>
                            <textarea
                                value={seo.description}
                                onChange={e => setSeo(p => ({ ...p, description: e.target.value }))}
                                placeholder="Professional language learning services..."
                                className="styled-textarea"
                            />
                            <p className="help-text">150-160 characters recommended</p>
                        </div>

                        <div className="field-group-v2 full-width">
                            <label>Keywords</label>
                            <input type="text" value={seo.keywords} onChange={e => setSeo(p => ({ ...p, keywords: e.target.value }))} placeholder="inglês, conversação, fluência" />
                        </div>

                        <div className="field-group-v2">
                            <label>Index Page</label>
                            <select value={seo.robotsIndex} onChange={e => setSeo(p => ({ ...p, robotsIndex: e.target.value }))}>
                                <option value="true">Allow (Index)</option>
                                <option value="false">Disallow (NoIndex)</option>
                            </select>
                        </div>

                        <div className="field-group-v2">
                            <label>Follow Links</label>
                            <select value={seo.robotsFollow} onChange={e => setSeo(p => ({ ...p, robotsFollow: e.target.value }))}>
                                <option value="true">Allow (Follow)</option>
                                <option value="false">Disallow (NoFollow)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* BLOC 2: OPEN GRAPH */}
                <div className="integration-card-v2">
                    <div className="section-title">
                        <div className="icon-box" style={{ background: "#0ea5e9", width: '32px', height: '32px', marginRight: '12px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
                            </svg>
                        </div>
                        Open Graph (Facebook/LinkedIn)
                    </div>

                    <div className="field-grid">
                        <div className="field-group-v2">
                            <label>Content Type</label>
                            <select value={seo.ogType} onChange={e => setSeo(p => ({ ...p, ogType: e.target.value }))}>
                                <option value="website">Website</option>
                                <option value="article">Article</option>
                                <option value="profile">Profile</option>
                            </select>
                        </div>

                        <div className="field-group-v2">
                            <label>Facebook App ID</label>
                            <input type="text" value={seo.facebookAppId} onChange={e => setSeo(p => ({ ...p, facebookAppId: e.target.value }))} placeholder="1234567890" />
                        </div>

                        <div className="field-group-v2 full-width">
                            <ImageUploadField 
                                label="Social Share Image" 
                                value={seo.ogImage} 
                                onChange={v => setSeo(p => ({ ...p, ogImage: v }))} 
                            />
                            <p className="help-text">1200×630px recommended</p>
                        </div>
                    </div>
                </div>

                {/* BLOC 3: TWITTER CARD */}
                <div className="integration-card-v2">
                    <div className="section-title">
                        <div className="icon-box" style={{ background: "#000", width: '32px', height: '32px', marginRight: '12px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                            </svg>
                        </div>
                        Twitter Card
                    </div>

                    <div className="field-grid">
                        <div className="field-group-v2">
                            <label>Card Type</label>
                            <select value={seo.twitterCard} onChange={e => setSeo(p => ({ ...p, twitterCard: e.target.value }))}>
                                <option value="summary">Summary</option>
                                <option value="summary_large_image">Large Image</option>
                                <option value="app">App</option>
                            </select>
                        </div>

                        <div className="field-group-v2">
                            <label>Twitter Site</label>
                            <input type="text" value={seo.twitterSite} onChange={e => setSeo(p => ({ ...p, twitterSite: e.target.value }))} placeholder="@fluenverse" />
                        </div>

                        <div className="field-group-v2">
                            <label>Twitter Creator</label>
                            <input type="text" value={seo.twitterCreator} onChange={e => setSeo(p => ({ ...p, twitterCreator: e.target.value }))} placeholder="@username" />
                        </div>
                    </div>
                </div>

                {/* BLOC 4: VERIFICATION */}
                <div className="integration-card-v2">
                    <div className="section-title">
                        <div className="icon-box" style={{ background: "#10b981", width: '32px', height: '32px', marginRight: '12px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                            </svg>
                        </div>
                        Verificações
                    </div>

                    <div className="field-grid">
                        <div className="field-group-v2">
                            <label>Google Site Verification</label>
                            <input type="text" value={seo.googleSiteVerification} onChange={e => setSeo(p => ({ ...p, googleSiteVerification: e.target.value }))} placeholder="google-site-verification-code" />
                        </div>

                        <div className="field-group-v2">
                            <label>Author Name</label>
                            <input type="text" value={seo.author} onChange={e => setSeo(p => ({ ...p, author: e.target.value }))} placeholder="Fluenverse Team" />
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .new-integrations-container {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding-bottom: 4rem;
        }

        .integrations-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .integrations-header p {
          color: #6b7280;
          margin-top: 0.35rem;
        }

        .seo-blocks-grid {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .integration-card-v2 {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .icon-box {
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }

        .section-title {
          display: flex;
          align-items: center;
          font-size: 1.1rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .field-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .field-group-v2 {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .field-group-v2.full-width {
          grid-column: span 2;
        }

        .field-group-v2 label {
          font-size: 0.88rem;
          font-weight: 600;
          color: #475569;
        }

        .field-group-v2 input, .field-group-v2 select {
          padding: 0.65rem 0.8rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.95rem;
          color: #1e293b;
          width: 100%;
          transition: all 0.2s;
        }

        .styled-textarea {
          padding: 0.65rem 0.8rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.95rem;
          color: #1e293b;
          width: 100%;
          min-height: 80px;
          resize: vertical;
          font-family: inherit;
        }

        .field-group-v2 input:focus, .field-group-v2 select:focus, .styled-textarea:focus {
          outline: none;
          border-color: #4f46e5;
          ring: 2px solid rgba(79, 70, 229, 0.1);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .help-text {
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .btn-save {
          background: #4f46e5;
          color: #fff;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-save:hover { background: #4338ca; }
        .btn-save:disabled { opacity: 0.6; cursor: wait; }

        .status-msg {
          padding: 1rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-weight: 600;
        }

        .status-msg.ok { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
        .status-msg.error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

        @media (max-width: 768px) {
          .field-grid { grid-template-columns: 1fr; }
          .field-group-v2.full-width { grid-column: span 1; }
        }
      `}</style>
        </div>
    );
}
