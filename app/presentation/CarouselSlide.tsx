'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type CarouselSlideProps = {
  title: string;
  images: { src: string; caption?: string }[];
  theme?: string;
};

export default function CarouselSlide({ title, images, theme }: CarouselSlideProps) {
  const [index, setIndex] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);

  const prev = useCallback(
    () => setIndex(i => (i - 1 + images.length) % images.length),
    [images.length]
  );
  const next = useCallback(
    () => setIndex(i => (i + 1) % images.length),
    [images.length]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!sectionRef.current) return;
      const container = sectionRef.current.closest('.presentation');
      if (!container) return;
      // Only handle keys when this slide is roughly in view
      const rect = sectionRef.current.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

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
  }, [images.length, next, prev]);

  return (
    <section
      ref={sectionRef}
      className="presentation__slide presentation__slide--dark"
      data-theme={theme}
    >
      <div className="presentation__slide-body">
        <div className="presentation__frame presentation__frame--dark">
          <hr className="presentation__rule" />
          <div className="presentation__carousel">
            <div className="presentation__carousel-header">
              <h2>{title}</h2>
              <div className="presentation__carousel-nav">
                <button onClick={prev} aria-label="Anterior">&lt;</button>
                <span>{index + 1} / {images.length}</span>
                <button onClick={next} aria-label="Próximo">&gt;</button>
              </div>
            </div>
            <div
              className="presentation__carousel-stage"
              onClick={e => {
                const { left, width } = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                e.clientX - left < width / 2 ? prev() : next();
              }}
              style={{ cursor: 'pointer' }}
            >
              <img
                key={index}
                src={images[index].src}
                alt={images[index].caption ?? ''}
                className="presentation__carousel-img"
              />
              {images[index].caption && (
                <p className="presentation__carousel-caption">{images[index].caption}</p>
              )}
            </div>
          </div>
          <hr className="presentation__rule" />
        </div>
      </div>
    </section>
  );
}
