export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://saas-78hi.onrender.com";

type ApiFetchConfig = {
  throwOnError?: boolean;
};

export type ApiFetchResult<T> = {
  res: Response;
  data: T | null;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function buildUrl(path: string) {
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

async function readResponseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) return error.message || fallback;
  if (error instanceof Error) return error.message || fallback;
  return fallback;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  config: ApiFetchConfig = {}
): Promise<ApiFetchResult<T>> {
  const headers = new Headers(options.headers);
  if (options.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(buildUrl(path), {
    ...options,
    headers,
  });
  const data = (await readResponseBody(res)) as T | null;

  if (!res.ok && config.throwOnError !== false) {
    const message =
      data && typeof data === "object" && "message" in data
        ? Array.isArray((data as { message: unknown }).message)
          ? (data as { message: unknown[] }).message.join(", ")
          : String((data as { message: unknown }).message)
        : typeof data === "string"
          ? data
          : `Request failed with status ${res.status}`;

    throw new ApiError(message, res.status, data);
  }

  return { res, data };
}
