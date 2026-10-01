export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    // What went wrong, as a stable identifier the interface can translate:
    // the API's own (e.g. CARD_NOT_FOUND), or NETWORK_ERROR when no answer
    // came back at all.
    public readonly code: string | null = null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
