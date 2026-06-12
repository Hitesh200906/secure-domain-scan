export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="relative pt-32 sm:pt-40 pb-12 sm:pb-16 overflow-hidden">
      <div className="absolute inset-0 hero-gradient -z-10" />
      <div className="absolute inset-0 grid-bg opacity-40 -z-10" />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
        {eyebrow && (
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {eyebrow}
          </div>
        )}
        <h1 className="mt-5 text-3xl sm:text-6xl font-semibold tracking-[-0.04em] text-gradient">
          {title}
        </h1>
        {description && (
          <p className="mt-4 sm:mt-5 text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
