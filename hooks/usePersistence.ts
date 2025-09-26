"use client"

import { useCallback } from "react"
import { storage } from "@/lib/storage"

const STORAGE_KEY = "chatgpt-clone-data"
const BACKUP_KEY = "chatgpt-clone-backup"

export function usePersistence() {
  const loadData = useCallback(() => {
    try {
      const savedData = storage.safeGetItem(STORAGE_KEY)
      if (savedData) {
        return JSON.parse(savedData)
      }
    } catch (error) {
      console.warn("Failed to load data:", error)
    }
    return null
  }, [])

  const saveData = useCallback((data: any) => {
    try {
      const dataToSave = {
        ...data,
        timestamp: new Date().toISOString(),
      }
      storage.safeSetItem(STORAGE_KEY, JSON.stringify(dataToSave))
    } catch (error) {
      console.warn("Failed to save data:", error)
    }
  }, [])

  const recoverFromBackup = useCallback(() => {
    try {
      const backupData = storage.safeGetItem(BACKUP_KEY)
      if (backupData) {
        return JSON.parse(backupData)
      }
    } catch (error) {
      console.warn("Failed to recover backup:", error)
    }
    return null
  }, [])

  const clearAllData = useCallback(() => {
    try {
      storage.safeRemoveItem(STORAGE_KEY)
      storage.safeRemoveItem(BACKUP_KEY)
      window.location.reload()
    } catch (error) {
      console.warn("Failed to clear data:", error)
    }
  }, [])

  return {
    loadData,
    saveData,
    recoverFromBackup,
    clearAllData,
  }
}
