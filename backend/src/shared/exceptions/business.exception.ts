export abstract class BusinessException extends Error {
  /**
   * @param code Stable, machine-readable identifier sent with the error
   * response (e.g. `CARD_NOT_FOUND`). Clients key their own — translated —
   * messages on it, so once published it must not change; `message` is the
   * English explanation for logs and developers.
   */
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = BusinessException.name;
  }
}
