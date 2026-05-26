import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  hours: string;
  minutes: string;
  onHoursChange: (v: string) => void;
  onMinutesChange: (v: string) => void;
  idPrefix?: string;
  autoFocus?: boolean;
};

export function HoursMinutesInput({
  hours, minutes, onHoursChange, onMinutesChange, idPrefix = "hm", autoFocus,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-h`}>Horas</Label>
        <Input
          id={`${idPrefix}-h`}
          type="number"
          min="0"
          step="1"
          placeholder="0"
          value={hours}
          onChange={(e) => onHoursChange(e.target.value)}
          autoFocus={autoFocus}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-m`}>Minutos</Label>
        <Input
          id={`${idPrefix}-m`}
          type="number"
          min="0"
          max="59"
          step="1"
          placeholder="0"
          value={minutes}
          onChange={(e) => onMinutesChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export function toDecimalHours(hours: string, minutes: string): number {
  const h = parseInt(hours, 10) || 0;
  const m = parseInt(minutes, 10) || 0;
  if (m < 0 || m > 59) throw new Error("Minutos devem estar entre 0 e 59");
  const total = h + m / 60;
  if (total <= 0) throw new Error("Tempo gasto deve ser positivo");
  return parseFloat(total.toFixed(4));
}

export function fromDecimalHours(decimal: number): { h: number; m: number } {
  const total = Math.round(decimal * 60);
  return { h: Math.floor(total / 60), m: total % 60 };
}

export function formatHoursMinutes(decimal: number): string {
  const { h, m } = fromDecimalHours(decimal);
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}
