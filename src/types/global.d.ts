export interface ValidationResult {
  isValid: boolean;
  exists: boolean | null;
  isChecking: boolean;
  errors: string[];
  suggestions: string[];
}