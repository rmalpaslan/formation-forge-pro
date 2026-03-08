import { useState } from 'react';

interface BulletInputProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function BulletInput({ label, value, onChange, placeholder = 'Yazın ve yeni madde için Enter\'a basın...' }: BulletInputProps) {
  const items = value.length > 0 ? value : [''];

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const newItems = [...items];
      newItems.splice(index + 1, 0, '');
      onChange(newItems);
      setTimeout(() => {
        const inputs = document.querySelectorAll(`[data-bullet-group="${label}"]`);
        (inputs[index + 1] as HTMLTextAreaElement)?.focus();
      }, 0);
    }
    if (e.key === 'Backspace' && items[index] === '' && items.length > 1) {
      e.preventDefault();
      const newItems = items.filter((_, i) => i !== index);
      onChange(newItems);
    }
  };

  const handleChange = (index: number, val: string) => {
    const newItems = [...items];
    newItems[index] = val;
    onChange(newItems);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-primary text-xs mt-2">•</span>
            <textarea
              data-bullet-group={label}
              className="flex-1 bg-secondary border-none rounded px-2 py-1.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground resize-none overflow-hidden break-words whitespace-pre-wrap"
              value={item}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onInput={(e) => {
                const el = e.target as HTMLTextAreaElement;
                el.style.height = 'auto';
                el.style.height = el.scrollHeight + 'px';
              }}
              rows={1}
              placeholder={placeholder}
              style={{ minHeight: '32px' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
