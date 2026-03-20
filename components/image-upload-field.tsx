"use client";

import { useState, useRef } from "react";
import { assetUrl } from "@/lib/public-assets";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  circular?: boolean;
  square?: boolean;
  placeholder?: string;
}

export function ImageUploadField({ label, value, onChange, circular, square, placeholder }: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro no upload");
      }

      onChange(data.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="field-group-v2">
      <label>{label}</label>
      
      <div className={`compact-image-uploader ${circular ? "circular" : ""} ${square ? "square" : ""}`}>
        <div className="preview-container">
          <img
            src={assetUrl(value)}
            alt="Preview"
            onError={(e: any) => {
              e.target.src = "https://via.placeholder.com/300x200?text=Sem+Imagem";
            }}
          />
          
          <button
            type="button"
            className="upload-overlay-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Mudar imagem"
          >
            {uploading ? (
              <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="31.4 31.4" /></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            )}
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: "none" }}
        />
      </div>



      {error && <span className="upload-error">{error}</span>}

      <style jsx>{`
        .compact-image-uploader {
          width: fit-content;
          margin-bottom: 0.5rem;
        }
        .preview-container {
          position: relative;
          width: 160px;
          height: 84px; /* 1.9 aspect ratio approx for OG */
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid #e2e8f0;
          background: #fff;
          transition: all 0.2s;
        }
        .compact-image-uploader.square .preview-container {
          width: 100px;
          height: 100px;
        }
        .compact-image-uploader.circular .preview-container {
          width: 100px;
          height: 100px;
          border-radius: 50%;
        }
        .preview-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .preview-container:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }
        .upload-overlay-btn {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          border: none;
          cursor: pointer;
          opacity: 0;
          transition: all 0.2s;
        }
        .preview-container:hover .upload-overlay-btn {
          opacity: 1;
        }
        .upload-overlay-btn:disabled {
          opacity: 1;
          background: rgba(0, 0, 0, 0.6);
          cursor: wait;
        }

        .upload-error {
          font-size: 0.75rem;
          color: #ef4444;
          margin-top: 0.25rem;
          font-weight: 600;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
