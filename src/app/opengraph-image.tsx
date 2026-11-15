import { OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE, renderOgImage } from "./_og/renderOgImage";

// The default link preview for every page that doesn't define its own.
export const alt = "My Cheap Chef — recepty z akciového letáku Lidl";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function OpenGraphImage() {
  return renderOgImage({
    eyebrow: "Každý týždeň nové recepty",
    title: "Čo variť z akciového letáku Lidl",
    subtitle: "Recepty zo zliav s cenou, úsporou a presným postupom",
  });
}
