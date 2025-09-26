// Storage utilities for better error handling
export class StorageManager {
  private static instance: StorageManager
  private isAvailable = false

  private constructor() {
    this.checkAvailability()
  }

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager()
    }
    return StorageManager.instance
  }

  private checkAvailability(): void {
    try {
      const testKey = "__storage_test__"
      localStorage.setItem(testKey, "test")
      localStorage.removeItem(testKey)
      this.isAvailable = true
    } catch {
      this.isAvailable = false
    }
  }

  isStorageAvailable(): boolean {
    return this.isAvailable
  }

  safeGetItem(key: string): string | null {
    if (!this.isAvailable) return null
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.warn(`Failed to get item ${key}:`, error)
      return null
    }
  }

  safeSetItem(key: string, value: string): boolean {
    if (!this.isAvailable) return false
    try {
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      console.warn(`Failed to set item ${key}:`, error)
      return false
    }
  }

  safeRemoveItem(key: string): boolean {
    if (!this.isAvailable) return false
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn(`Failed to remove item ${key}:`, error)
      return false
    }
  }

  getStorageInfo(): { available: boolean; usage?: number; quota?: number } {
    const info: { available: boolean; usage?: number; quota?: number } = {
      available: this.isAvailable,
    }

    if (this.isAvailable && "storage" in navigator && "estimate" in navigator.storage) {
      navigator.storage.estimate().then((estimate) => {
        info.usage = estimate.usage
        info.quota = estimate.quota
      })
    }

    return info
  }
}

export const storage = StorageManager.getInstance()
