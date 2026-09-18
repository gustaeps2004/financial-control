export class BusinessException extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = BusinessException.name;
  }
}
