import { YearMonth } from '../../../../shared/domain/calendar/year-month';
import { RecurringTransaction } from './recurring-transaction.entity';

function recurring(
  startMonth: string,
  endMonth: string | null,
  dayOfMonth = 6,
): RecurringTransaction {
  return Object.assign(new RecurringTransaction(), {
    dayOfMonth,
    startMonth: YearMonth.parse(startMonth),
    endMonth: endMonth === null ? null : YearMonth.parse(endMonth),
  });
}

describe('RecurringTransaction', () => {
  describe('isActiveIn', () => {
    it('is active from its start month on when it has no end', () => {
      const internet = recurring('2026-09', null);

      expect(internet.isActiveIn(YearMonth.parse('2026-08'))).toBe(false);
      expect(internet.isActiveIn(YearMonth.parse('2026-09'))).toBe(true);
      expect(internet.isActiveIn(YearMonth.parse('2030-12'))).toBe(true);
    });

    it('stops after its end month, which is still included', () => {
      const financing = recurring('2026-09', '2026-11');

      expect(financing.isActiveIn(YearMonth.parse('2026-11'))).toBe(true);
      expect(financing.isActiveIn(YearMonth.parse('2026-12'))).toBe(false);
    });
  });

  describe('occurrenceDateIn', () => {
    it('falls on its day of the month', () => {
      expect(
        recurring('2026-09', null).occurrenceDateIn(YearMonth.parse('2026-10')),
      ).toBe('2026-10-06');
    });

    it('falls on the last day of months that are too short', () => {
      expect(
        recurring('2026-01', null, 31).occurrenceDateIn(
          YearMonth.parse('2026-02'),
        ),
      ).toBe('2026-02-28');
    });
  });
});
