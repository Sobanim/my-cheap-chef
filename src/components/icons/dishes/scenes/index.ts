/*
 * One scene per `category:method` pair. File and export names follow
 * <Category><Method>Scene so the pair a scene belongs to is obvious from the name.
 * Pairs not listed here fall back to the category default — see DishScene.tsx.
 *
 * Scenes sharing a vessel build on a chassis from ../parts (OvenFrame, PotFrame,
 * PanFrame) so the same cookware can't drift between them.
 */
export { MeatPanScene } from "./MeatPanScene";
export { MeatOvenScene } from "./MeatOvenScene";
export { MeatPotScene } from "./MeatPotScene";
export { PastaPanScene } from "./PastaPanScene";
export { PastaOvenScene } from "./PastaOvenScene";
export { PastaPotScene } from "./PastaPotScene";
export { SoupPotScene } from "./SoupPotScene";
export { VeggiePanScene } from "./VeggiePanScene";
export { VeggieOvenScene } from "./VeggieOvenScene";
export { VeggiePotScene } from "./VeggiePotScene";
export { VeggieRawScene } from "./VeggieRawScene";
export { DessertPanScene } from "./DessertPanScene";
export { DessertOvenScene } from "./DessertOvenScene";
export { DessertRawScene } from "./DessertRawScene";
