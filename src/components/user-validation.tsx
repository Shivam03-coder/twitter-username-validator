import React, { useState, useEffect } from "react";
import {
  Check,
  X,
  AlertCircle,
  Twitter,
  Copy,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Link,
} from "lucide-react";
import {
  validateTwitterUsername,
  checkUsernameAvailability,
} from "@/utils/twitter-validation";
import type { ValidationResult } from "@/types/global";

export default function UsernameValidator() {
  const [username, setUsername] = useState("");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setIsTyping(true);
    const timer = setTimeout(async () => {
      if (username.trim()) {
        const basicValidation = validateTwitterUsername(username);
        setValidation({
          ...basicValidation,
          exists: null,
          isChecking: basicValidation.isValid,
        });

        if (basicValidation.isValid) {
          try {
            const exists = await checkUsernameAvailability(username);
            setValidation((prev) =>
              prev
                ? {
                    ...prev,
                    exists,
                    isChecking: false,
                  }
                : null,
            );
          } catch (error) {
            setValidation((prev) =>
              prev
                ? {
                    ...prev,
                    exists: null,
                    isChecking: false,
                    errors: [
                      ...prev.errors,
                      "Unable to check availability - please try again",
                    ],
                  }
                : null,
            );
          }
        }
      } else {
        setValidation(null);
      }
      setIsTyping(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleCopySuggestion = (suggestion: string) => {
    setUsername(suggestion);
    navigator.clipboard.writeText(suggestion);
  };

  const getStatusIcon = () => {
    if (isTyping || validation?.isChecking) {
      return (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      );
    }
    if (!validation) return null;
    if (!validation.isValid) return <X className="h-5 w-5 text-red-500" />;
    if (validation.exists === true)
      return <XCircle className="h-5 w-5 text-red-500" />;
    if (validation.exists === false)
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <Check className="h-5 w-5 text-blue-500" />;
  };

  const getStatusColor = () => {
    if (isTyping || validation?.isChecking)
      return "border-blue-300 focus:border-blue-500";
    if (!validation) return "border-gray-300 focus:border-blue-500";
    if (!validation.isValid) return "border-red-300 focus:border-red-500";
    if (validation.exists === true)
      return "border-red-300 focus:border-red-500";
    if (validation.exists === false)
      return "border-green-300 focus:border-green-500";
    return "border-blue-300 focus:border-blue-500";
  };

  const getAvailabilityStatus = () => {
    if (!validation || !validation.isValid) return null;
    if (validation.isChecking)
      return {
        text: "Checking availability...",
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
      };
    if (validation.exists === true)
      return {
        text: "Username is taken",
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
      };
    if (validation.exists === false)
      return {
        text: "Username is available!",
        color: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-200",
      };
    return {
      text: "Unable to check availability",
      color: "text-gray-600",
      bg: "bg-gray-50",
      border: "border-gray-200",
    };
  };

  const availabilityStatus = getAvailabilityStatus();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 shadow-lg">
            <Twitter className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Twitter Username Checker
          </h1>
          <p className="text-gray-600">
            Check if your desired username is valid and available
          </p>
        </div>

        {/* Input Section */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <span className="text-lg font-medium text-gray-500">@</span>
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className={`w-full rounded-xl border-2 py-4 pr-12 pl-8 text-lg transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:outline-none ${getStatusColor()}`}
              maxLength={16}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              {getStatusIcon()}
            </div>
          </div>

          {/* Character count */}
          <div className="mt-2 text-right">
            <span
              className={`text-sm ${username.length > 15 ? "text-red-500" : "text-gray-500"}`}
            >
              {username.replace(/^@/, "").length}/15
            </span>
          </div>
        </div>

        {/* Validation Results */}
        {validation && (
          <div className="space-y-4">
            {/* Availability Status */}
            {availabilityStatus && (
              <div
                className={`rounded-2xl border-2 p-6 transition-all duration-300 ${availabilityStatus.bg} ${availabilityStatus.border}`}
              >
                <div className="flex items-center space-x-3">
                  {validation.isChecking ? (
                    <Clock className="h-6 w-6 text-blue-600" />
                  ) : validation.exists === false ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : validation.exists === true ? (
                    <XCircle className="h-6 w-6 text-red-600" />
                  ) : (
                    <Search className="h-6 w-6 text-gray-600" />
                  )}
                  <div>
                    <h3 className={`font-semibold ${availabilityStatus.color}`}>
                      {availabilityStatus.text}
                    </h3>
                    <p
                      className={`text-sm ${availabilityStatus.color} opacity-80`}
                    >
                      {validation.isChecking
                        ? "Please wait while we verify availability..."
                        : validation.exists === false
                          ? "This username is free to use!"
                          : validation.exists === true
                            ? "Try a different username"
                            : "Check manually on Twitter"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center space-x-2">
                  <Link size={19} className="text-blue-400" />
                  <a
                    href={`https://twitter.com/${username.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    @{username.replace(/^@/, "")}
                  </a>
                </div>
              </div>
            )}

            {/* Format Validation Status */}
            {validation.isValid && (
              <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-6 transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <Check className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800">
                      Format is valid!
                    </h3>
                    <p className="text-sm text-green-600">
                      Username meets all Twitter requirements
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Errors */}
            {validation.errors.length > 0 && (
              <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <h4 className="font-semibold text-red-800">Issues to fix:</h4>
                </div>
                <ul className="space-y-2">
                  {validation.errors.map((error, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                      <span className="text-red-700">{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {validation.suggestions.length > 0 && (
              <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-lg">
                <h4 className="mb-4 font-semibold text-blue-800">
                  Suggestions:
                </h4>
                <div className="space-y-2">
                  {validation.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleCopySuggestion(suggestion)}
                      className="group flex w-full items-center justify-between rounded-lg bg-blue-50 p-3 transition-colors duration-200 hover:bg-blue-100"
                    >
                      <span className="font-medium text-blue-800">
                        @{suggestion}
                      </span>
                      <Copy className="h-4 w-4 text-blue-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
