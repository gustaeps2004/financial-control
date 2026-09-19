export class SessionResponseDto {
  constructor(
    public readonly token: string,
    public readonly expiresAt: Date,
  ) {}
}
