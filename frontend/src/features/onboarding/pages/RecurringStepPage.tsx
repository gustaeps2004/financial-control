import { useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";
import { Card } from "@/shared/ui/Card";
import { Tag } from "@/shared/ui/Tag";
import { Table, TableBody, TableHead, TableRow, Td, Th } from "@/shared/ui/Table";
import { formatMoney, parseMoneyInput } from "@/shared/lib/money";
import { useFinanceData } from "@/features/finance-data/context/FinanceDataContext";
import { MONTH_NAMES_FULL } from "@/features/finance-data/lib/selectors";

export function RecurringStepPage() {
  const {
    categories,
    cards,
    recurring,
    addRecurring,
    removeRecurring,
    updateCard,
  } = useFinanceData();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [day, setDay] = useState("");
  const [amount, setAmount] = useState("");

  const monthName = MONTH_NAMES_FULL[new Date().getMonth()];
  const totalCarried = cards.reduce((sum, c) => sum + c.opening, 0);
  const recurringTotal = recurring.reduce((sum, r) => sum + r.amount, 0);

  function commitRecurring() {
    const trimmed = name.trim();
    if (!trimmed) return;
    addRecurring({
      name: trimmed,
      cat: categories[0] ?? "Other",
      day: day || "01",
      amount: parseMoneyInput(amount),
    });
    setName("");
    setDay("");
    setAmount("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      commitRecurring();
    }
  }

  return (
    <div>
      <h2 className="mb-2">What repeats every month?</h2>
      <p className="mb-6.5 max-w-[520px] text-[14px] text-ink/55 text-pretty">
        Fixed charges post automatically. Set what each card is carrying today so your
        first month starts from the truth.
      </p>

      <div className="grid items-start gap-8 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
        <div>
          <h5 className="mb-2.5">Recurring monthly expenses</h5>
          <div className="mb-3.5">
            <Table>
              <TableHead>
                <Th>Name</Th>
                <Th>Category</Th>
                <Th>Day</Th>
                <Th className="text-right">Amount</Th>
                <Th />
              </TableHead>
              <TableBody>
                {recurring.map((item) => (
                  <TableRow key={item.id}>
                    <Td>{item.name}</Td>
                    <Td>
                      <Tag>{item.cat}</Tag>
                    </Td>
                    <Td className="text-ink/55">{item.day}</Td>
                    <Td className="text-right tabular-nums">{formatMoney(item.amount)}</Td>
                    <Td className="w-px text-right">
                      <Button variant="ghost" onClick={() => removeRecurring(item.id)}>
                        ×
                      </Button>
                    </Td>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <Field label="Name" className="flex-[2_1_120px]">
              <Input
                placeholder="Academia"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </Field>
            <Field label="Day" className="flex-[0_1_72px]">
              <Input
                placeholder="10"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </Field>
            <Field label="Amount" className="flex-[0_1_110px]">
              <Input
                placeholder="R$ 0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </Field>
            <Button variant="secondary" className="flex-none" onClick={commitRecurring}>
              Add
            </Button>
          </div>
        </div>

        <div>
          <h5 className="mb-2.5">Opening card balances</h5>
          <div className="flex flex-col gap-2.5">
            {cards.map((card) => (
              <Card key={card.id} className="gap-2.5">
                <div className="flex items-center gap-2.5">
                  <span
                    className="grid h-[21px] w-8 flex-none place-items-center rounded text-[8px] font-semibold"
                    style={{ background: card.swatch }}
                  >
                    {card.mark}
                  </span>
                  <span className="min-w-0 flex-1 text-[13px]">{card.nick}</span>
                  <span className="text-[12px] text-ink/55">•••• {card.last4}</span>
                </div>
                <Field label={`Balance carried into ${monthName}`}>
                  <Input
                    value={formatMoney(card.opening)}
                    onChange={(e) =>
                      updateCard(card.id, { opening: parseMoneyInput(e.target.value) })
                    }
                  />
                </Field>
              </Card>
            ))}
            <Card className="gap-1.5">
              <div className="flex justify-between text-[13px]">
                <span className="text-ink/55">Total carried</span>
                <span className="tabular-nums">{formatMoney(totalCarried)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-ink/55">Recurring each month</span>
                <span className="tabular-nums">{formatMoney(recurringTotal)}</span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="mt-7.5 flex gap-2">
        <Button variant="primary" onClick={() => navigate("/app/dashboard")}>
          Finish setup
        </Button>
        <Button variant="secondary" onClick={() => navigate("/setup/cards")}>
          Back
        </Button>
      </div>
    </div>
  );
}
