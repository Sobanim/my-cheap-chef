import type { JsonLdObject } from "@/lib/structuredData";

type JsonLdProps = {
  data: JsonLdObject | JsonLdObject[];
};

/**
 * Serializes structured data for embedding in HTML.
 *
 * Recipe text is written by a model, so it is treated as untrusted: `<` is
 * escaped so that a stray `</script>` in a title or step cannot close the tag
 * and inject markup.
 */
const serialize = (data: JsonLdProps["data"]): string => JSON.stringify(data).replace(/</g, "\\u003c");

/**
 * Embeds schema.org JSON-LD in the page. Renders nothing visible — crawlers
 * read it straight from the HTML.
 */
export const JsonLd = ({ data }: Readonly<JsonLdProps>) => {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialize(data) }} />;
};
