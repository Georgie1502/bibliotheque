import { ApiError } from "../api/errors";
import { ToastContextType } from "../types/toast";

/**
 * Handles API errors and displays them as toasts
 * Adapts the toast type based on the HTTP status code
 */
export const handleApiError = (
  error: unknown,
  toast: ToastContextType,
  defaultMessage = "Une erreur s'est produite",
) => {
  if (error instanceof ApiError) {
    const getMessage = () => {
      if (error.message && error.message !== defaultMessage) {
        return error.message;
      }
      return defaultMessage;
    };

    const getToastType = () => {
      if (error.statusCode === 401 || error.statusCode === 403) {
        return "error" as const;
      }
      if (error.statusCode === 404 || error.statusCode === 409) {
        return "warning" as const;
      }
      if (error.statusCode >= 500) {
        return "error" as const;
      }
      if (error.statusCode >= 400) {
        return "warning" as const;
      }
      return "info" as const;
    };

    toast.addToast(getMessage(), getToastType(), 5000);
  } else {
    toast.addToast(defaultMessage, "error", 5000);
  }
};

/**
 * Extract user-friendly error message from API response
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Une erreur inattendue s'est produite";
};
