import { ShadcnComponents } from "./shadcn_components";
import { Next14Settings } from "./next14_settings";

export const Next14ShadcnSSRFiles = () => {
  return [...Next14Settings(), ...ShadcnComponents()];
};
