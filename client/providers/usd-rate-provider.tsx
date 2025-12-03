"use client";

import { createContext, useContext } from "react";

const UsdRateContext = createContext<string>("12800");

export function UsdRateProvider({ 
  children, 
  rate 
}: { 
  children: React.ReactNode; 
  rate: string;
}) {
  return (
    <UsdRateContext.Provider value={rate}>
      {children}
    </UsdRateContext.Provider>
  );
}

export function useUsdRate() {
  return useContext(UsdRateContext);
}









