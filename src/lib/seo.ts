const SITE = "AÏDA";

/** Builds a route head() payload with unique title + social tags. */
export function pageHead(title: string, description: string) {
  const fullTitle = title === SITE ? `${SITE} — L'intelligence au service de l'élevage africain` : `${title} · ${SITE}`;
  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: description },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
