import Link from "next/link";

export type LegalSection = { heading: string; body: string[] };

export type LegalContent = {
  title: string;
  updated: string;
  sections: LegalSection[];
};

export default function LegalPage({
  fi,
  en,
}: {
  fi: LegalContent;
  en: LegalContent;
}) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10 text-[#293730]">
      <Link href="/" className="text-sm font-semibold text-[#315c4c] hover:underline">
        ← Little Closet
      </Link>
      {[en, fi].map((content) => (
        <article key={content.title} className="mt-8">
          <h1 className="text-2xl font-semibold">{content.title}</h1>
          <p className="mt-1 text-sm text-[#68746d]">{content.updated}</p>
          {content.sections.map((section) => (
            <section key={section.heading} className="mt-6">
              <h2 className="text-lg font-semibold">{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mt-2 text-sm leading-6 text-[#45534b]">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </article>
      ))}
    </main>
  );
}
