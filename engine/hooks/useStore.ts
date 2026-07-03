"use client"

import { createContext, useContext } from "react"
import { storeConfig, StoreConfig } from "@/config/stores/clothing.config"

export const StoreContext = createContext<StoreConfig>(storeConfig)

export function useStore() {
  return useContext(StoreContext)
}