import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const currencies = [
  { value: '€', label: '€ EUR' },
  { value: '$', label: '$ USD' },
  { value: '£', label: '£ GBP' },
  { value: '₺', label: '₺ TRY' },
];

function formatNumber(val: string): string {
  const digits = val.replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function parseDisplayValue(combined: string): { currency: string; amount: string } {
  for (const c of currencies) {
    if (combined.startsWith(c.value)) {
      return { currency: c.value, amount: combined.slice(c.value.length).trim() };
    }
  }
  return { currency: '€', amount: combined };
}

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CurrencyInput({ value, onChange, placeholder }: CurrencyInputProps) {
  const parsed = parseDisplayValue(value);
  const [currency, setCurrency] = useState(parsed.currency || '€');
  const [amount, setAmount] = useState(parsed.amount || '');

  const handleAmountChange = (raw: string) => {
    const formatted = formatNumber(raw);
    setAmount(formatted);
    onChange(formatted ? `${currency}${formatted}` : '');
  };

  const handleCurrencyChange = (c: string) => {
    setCurrency(c);
    if (amount) onChange(`${c}${amount}`);
  };

  return (
    <div className="flex gap-2">
      <Select value={currency} onValueChange={handleCurrencyChange}>
        <SelectTrigger className="w-24 shrink-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {currencies.map(c => (
            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        placeholder={placeholder || '1.000.000'}
        value={amount}
        onChange={(e) => handleAmountChange(e.target.value)}
        className="flex-1"
      />
    </div>
  );
}
