import { createContext, useContext } from "react";

export const DisabilityContext = createContext(null);

export function useDisability() {
  const context = useContext(DisabilityContext);
  if (!context) throw new Error("useDisability must be used inside <DisabilityProvider>");
  return context;
}
