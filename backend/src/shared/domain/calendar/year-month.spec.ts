import { YearMonth, dayOfIsoDate } from './year-month';

describe('YearMonth', () => {
  it('parses and formats "YYYY-MM"', () => {
    expect(YearMonth.parse('2026-09').toString()).toBe('2026-09');
  });

  it.each(['2026-13', '2026-00', '26-09', '2026-9', 'foo'])(
    'rejects "%s"',
    (value) => {
      expect(() => YearMonth.parse(value)).toThrow(RangeError);
      expect(YearMonth.isValid(value)).toBe(false);
    },
  );

  it('normalizes month overflow in both directions', () => {
    expect(YearMonth.of(2026, 13).toString()).toBe('2027-01');
    expect(YearMonth.of(2026, 0).toString()).toBe('2025-12');
    expect(YearMonth.parse('2026-11').plus(3).toString()).toBe('2027-02');
    expect(YearMonth.parse('2026-01').plus(-1).toString()).toBe('2025-12');
  });

  it('reads the month of an ISO date', () => {
    expect(YearMonth.fromIsoDate('2026-09-30').toString()).toBe('2026-09');
  });

  it('compares months', () => {
    const september = YearMonth.parse('2026-09');
    const october = YearMonth.parse('2026-10');

    expect(september.isBefore(october)).toBe(true);
    expect(october.isAfter(september)).toBe(true);
    expect(september.equals(YearMonth.of(2026, 9))).toBe(true);
    expect(september.monthsUntil(YearMonth.parse('2027-01'))).toBe(4);
  });

  it('clamps days to the length of the month', () => {
    expect(YearMonth.parse('2026-02').dateOn(31)).toBe('2026-02-28');
    expect(YearMonth.parse('2028-02').dateOn(31)).toBe('2028-02-29');
    expect(YearMonth.parse('2026-04').dateOn(0)).toBe('2026-04-01');
    expect(YearMonth.parse('2026-04').lastDay()).toBe('2026-04-30');
  });

  it('lists an inclusive range of months', () => {
    const months = YearMonth.range(
      YearMonth.parse('2026-11'),
      YearMonth.parse('2027-02'),
    ).map(String);

    expect(months).toEqual(['2026-11', '2026-12', '2027-01', '2027-02']);
  });

  it('serializes to "YYYY-MM" in JSON', () => {
    expect(JSON.stringify({ month: YearMonth.parse('2026-10') })).toBe(
      '{"month":"2026-10"}',
    );
  });
});

describe('dayOfIsoDate', () => {
  it('reads the day of an ISO date', () => {
    expect(dayOfIsoDate('2026-09-09')).toBe(9);
  });
});
