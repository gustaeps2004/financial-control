import { YearMonth } from '../../../../shared/domain/calendar/year-month';
import { Card } from './card.entity';

function card(closingDay: number, dueDay: number | null): Card {
  return Object.assign(new Card(), { closingDay, dueDay });
}

describe('Card', () => {
  describe('statementMonthFor', () => {
    // Mirrors the spreadsheet rule: closes on the 9th, paid on the 10th.
    const closesOnNinth = card(9, 10);

    it('keeps purchases up to the closing day on that month', () => {
      expect(closesOnNinth.statementMonthFor('2026-09-01').toString()).toBe(
        '2026-09',
      );
      expect(closesOnNinth.statementMonthFor('2026-09-09').toString()).toBe(
        '2026-09',
      );
    });

    it('rolls purchases after the closing day to the next statement', () => {
      expect(closesOnNinth.statementMonthFor('2026-09-10').toString()).toBe(
        '2026-10',
      );
      expect(closesOnNinth.statementMonthFor('2026-12-25').toString()).toBe(
        '2027-01',
      );
    });

    it('treats an unknown due day as due in the closing month', () => {
      expect(card(9, null).statementMonthFor('2026-09-10').toString()).toBe(
        '2026-10',
      );
    });

    it('pushes the statement a month ahead when it is due after the turn of the month', () => {
      const closesLateDueEarly = card(28, 5);

      expect(
        closesLateDueEarly.statementMonthFor('2026-09-28').toString(),
      ).toBe('2026-10');
      expect(
        closesLateDueEarly.statementMonthFor('2026-09-29').toString(),
      ).toBe('2026-11');
    });

    it('closes every day of a short month when the closing day does not exist in it', () => {
      expect(card(31, null).statementMonthFor('2026-02-28').toString()).toBe(
        '2026-02',
      );
    });
  });

  describe('closingDateOf / dueDateOf', () => {
    it('closes and is due in the statement month when due after closing', () => {
      const statement = YearMonth.parse('2026-10');

      expect(card(9, 10).closingDateOf(statement)).toBe('2026-10-09');
      expect(card(9, 10).dueDateOf(statement)).toBe('2026-10-10');
    });

    it('closes in the previous month when due before the closing day', () => {
      const statement = YearMonth.parse('2026-10');

      expect(card(28, 5).closingDateOf(statement)).toBe('2026-09-28');
      expect(card(28, 5).dueDateOf(statement)).toBe('2026-10-05');
    });

    it('clamps the closing date and has no due date when it is unknown', () => {
      const statement = YearMonth.parse('2026-02');

      expect(card(31, null).closingDateOf(statement)).toBe('2026-02-28');
      expect(card(31, null).dueDateOf(statement)).toBeNull();
    });
  });
});
