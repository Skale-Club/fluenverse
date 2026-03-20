type SectionProps = {
  title: string;
  children: React.ReactNode;
};

export function Section({ title, children }: SectionProps) {
  return (
    <section className="section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
