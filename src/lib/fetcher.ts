/**
 * Standard fetcher for SWR requests.
 * Throws an Error with response details when the HTTP status is not ok.
 */
export async function fetcher<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message =
      errorData.error || errorData.message || `HTTP error! Status: ${res.status}`;
    const error = new Error(message);
    (error as any).status = res.status;
    (error as any).info = errorData;
    throw error;
  }

  return res.json();
}
