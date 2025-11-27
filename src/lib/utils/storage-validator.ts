/**
 * Storage Validator
 * 
 * Validates and cleans localStorage on app initialization
 * to prevent stuck states from corrupted data.
 */

/**
 * Validates the auth storage in localStorage
 * Returns true if valid, false if invalid/corrupted
 */
export function validateAuthStorage(): boolean {
  if (typeof window === "undefined") {
    return true; // SSR - can't validate
  }

  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) {
      return true; // No storage is valid
    }

    // Try to parse it
    const parsed = JSON.parse(authStorage);
    
    // Validate structure
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid storage structure");
    }

    if (!parsed.state || typeof parsed.state !== "object") {
      throw new Error("Invalid state structure");
    }

    // If there's a token, validate it's a string
    if (parsed.state.token && typeof parsed.state.token !== "string") {
      throw new Error("Invalid token type");
    }

    // If there's a user, validate it's an object
    if (parsed.state.user && typeof parsed.state.user !== "object") {
      throw new Error("Invalid user type");
    }

    return true;
  } catch (error) {
    console.error("Auth storage validation failed:", error);
    return false;
  }
}

/**
 * Clears corrupted auth storage
 */
export function clearAuthStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem("auth-storage");
    console.info("Cleared auth storage");
  } catch (error) {
    console.error("Failed to clear auth storage:", error);
  }
}

/**
 * Validates and cleans localStorage on app initialization
 * Call this early in the app lifecycle
 */
export function initializeStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  const isValid = validateAuthStorage();
  
  if (!isValid) {
    console.warn("Detected corrupted auth storage, clearing...");
    clearAuthStorage();
  }
}

