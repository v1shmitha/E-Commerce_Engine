"use client"

import { ReactNode } from "react"
import { StoreContext } from "@/engine/hooks/useStore"
import { storeConfig, StoreConfig } from "@/config/stores/clothing.config"

export function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <StoreContext.Provider value={storeConfig}>
      {children}
    </StoreContext.Provider>
  )
}