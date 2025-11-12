"use client";

import * as React from "react";

type Region = "EU" | "UK" | "US";

const RegionContext = React.createContext<{
  region: Region;
  setRegion: (region: Region) => void;
}>({
  region: "EU",
  setRegion: () => {},
});

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [region, setRegion] = React.useState<Region>("EU");

  // Синхронизируем с localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem("selectedRegion");
    if (stored && (stored === "EU" || stored === "US" || stored === "UK")) {
      setRegion(stored as Region);
    }
  }, []);

  // Сохраняем в localStorage при изменении
  React.useEffect(() => {
    localStorage.setItem("selectedRegion", region);
  }, [region]);

  return (
    <RegionContext.Provider value={{ region, setRegion }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  return React.useContext(RegionContext);
}

