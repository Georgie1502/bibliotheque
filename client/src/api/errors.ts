import { AxiosError } from "axios";

/**
 * Classe de base pour toutes les erreurs API.
 * Ne remonte jamais de stack trace brute en production.
 */
export class ApiError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    // Nécessaire pour que instanceof fonctionne correctement avec les sous-classes
    Object.setPrototypeOf(this, new.target.prototype);
    // Suppression de la stack trace en production pour éviter les fuites d'info
    if (import.meta.env.PROD) {
      this.stack = undefined;
    }
  }
}

/** Pas de réponse du serveur — réseau injoignable ou timeout */
export class NetworkError extends ApiError {
  constructor(message = "Impossible de contacter le serveur") {
    super(message, "NETWORK_ERROR", 0);
  }
}

/** 401 — token absent, expiré ou invalide */
export class AuthError extends ApiError {
  constructor(message = "Authentification requise") {
    super(message, "AUTH_ERROR", 401);
  }
}

/** 403 — authentifié mais pas autorisé */
export class ForbiddenError extends ApiError {
  constructor(message = "Accès refusé") {
    super(message, "FORBIDDEN", 403);
  }
}

/** 404 — ressource introuvable */
export class NotFoundError extends ApiError {
  constructor(message = "Ressource introuvable") {
    super(message, "NOT_FOUND", 404);
  }
}

/** 409 — conflit (ex : email ou ISBN déjà utilisé) */
export class ConflictError extends ApiError {
  constructor(message = "Conflit de données", details?: unknown) {
    super(message, "CONFLICT", 409, details);
  }
}

/** 400 / 422 — validation échouée */
export class ValidationError extends ApiError {
  constructor(message = "Données invalides", details?: unknown) {
    super(message, "VALIDATION_ERROR", 422, details);
  }
}

/** 5xx — erreur interne du serveur */
export class ServerError extends ApiError {
  constructor(message = "Erreur serveur interne") {
    super(message, "SERVER_ERROR", 500);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extrait un message lisible depuis la réponse FastAPI. */
function extractDetail(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const d = data as Record<string, unknown>;

  if (typeof d.detail === "string") return d.detail;

  // FastAPI renvoie parfois detail sous forme de tableau pour les erreurs 422
  if (Array.isArray(d.detail) && d.detail.length > 0) {
    const first = d.detail[0] as Record<string, unknown> | null;
    if (typeof first?.msg === "string") return first.msg;
  }

  return undefined;
}

/**
 * Convertit une AxiosError en ApiError typée.
 * Exportée pour être testable en isolation.
 */
export function parseAxiosError(error: AxiosError): ApiError {
  if (!error.response) {
    return new NetworkError();
  }

  const { status, data } = error.response;
  const message = extractDetail(data) ?? "Une erreur s'est produite";

  if (status === 400) return new ValidationError(message, data);
  if (status === 401) return new AuthError(message);
  if (status === 403) return new ForbiddenError(message);
  if (status === 404) return new NotFoundError(message);
  if (status === 409) return new ConflictError(message, data);
  if (status === 422) {
    const details = (data as { detail?: unknown } | null)?.detail ?? data;
    return new ValidationError(message, details);
  }
  if (status >= 500) return new ServerError(message);

  return new ApiError(message, `HTTP_${status}`, status, data);
}
