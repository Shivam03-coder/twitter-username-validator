import type { ValidationResult } from "@/types/global";

export function validateTwitterUsername(
  username: string,
): Omit<ValidationResult, "exists" | "isChecking"> {
  const errors: string[] = [];
  const suggestions: string[] = [];
  const cleanUsername = username.replace(/^@/, "");

  if (!cleanUsername) {
    errors.push("Username cannot be empty");
    return { isValid: false, errors, suggestions };
  }

  if (cleanUsername.length > 15) {
    errors.push("Username must be 15 characters or less");
    suggestions.push(`Try shortening to: ${cleanUsername.substring(0, 15)}`);
  }

  const validCharPattern = /^[a-zA-Z0-9_]+$/;
  if (!validCharPattern.test(cleanUsername)) {
    errors.push("Username can only contain letters, numbers, and underscores");
    const cleanedSuggestion = cleanUsername.replace(/[^a-zA-Z0-9_]/g, "");
    if (cleanedSuggestion) {
      suggestions.push(`Try: ${cleanedSuggestion}`);
    }
  }

  // Check if starts with number (not allowed)
  if (/^\d/.test(cleanUsername)) {
    errors.push("Username cannot start with a number");
    suggestions.push(`Try: user${cleanUsername}`);
  }

  // Check for consecutive underscores
  if (cleanUsername.includes("__")) {
    errors.push("Username cannot contain consecutive underscores");
    suggestions.push(`Try: ${cleanUsername.replace(/_+/g, "_")}`);
  }

  // Check if starts or ends with underscore
  if (cleanUsername.startsWith("_") || cleanUsername.endsWith("_")) {
    errors.push("Username cannot start or end with an underscore");
    const trimmed = cleanUsername.replace(/^_+|_+$/g, "");
    if (trimmed) {
      suggestions.push(`Try: ${trimmed}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    suggestions: suggestions.slice(0, 3),
  };
}

export async function checkUsernameAvailability(
  username: string,
): Promise<[string, boolean]> {
  const cleanUsername = username.replace(/^@/, "");

  try {
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_BEARER_TOKEN as string}`,
      },
    };

    const response = await fetch(
      `https://api.twitter.com/2/users/by/username/${cleanUsername}`,
      options,
    );

    const data = await response.json();

    if (data.data) {
      return ["taken", false];
    }

    if (
      data.errors &&
      data.errors.some((error: any) => error.title === "Not Found Error")
    ) {
      return ["available", true];
    }

    return ["unknown", false];
  } catch (error) {
    console.error("Error checking username availability:", error);
    return ["error", false];
  }
}
