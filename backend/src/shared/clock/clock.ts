export abstract class Clock {
  /** Today's date (YYYY-MM-DD) in the app's time zone. */
  abstract today(): string;
}
