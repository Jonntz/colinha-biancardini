"use client";

import { useState, type ChangeEvent, type KeyboardEvent, type SyntheticEvent } from "react";
import { exportIgnoreProps } from "@/lib/export/ignore";
import { DigitBox, type DigitTone } from "./DigitBox";

const NON_DIGITS = /\D/g;

interface NumberInputProps {
  id: string;
  /** Nome acessível do campo. */
  label: string;
  value: string;
  length: number;
  tone: DigitTone;
  disabled?: boolean;
  describedBy?: string;
  onValueChange?: (value: string) => void;
  /** Chamado quando o último dígito é digitado. */
  onComplete?: () => void;
  /** Enter / "Próximo" no teclado virtual. */
  onEnter?: () => void;
}

function moveCaretToEnd(event: SyntheticEvent<HTMLInputElement>) {
  const input = event.currentTarget;
  const end = input.value.length;
  if (input.selectionStart !== end || input.selectionEnd !== end) input.setSelectionRange(end, end);
}

/**
 * Campo numérico segmentado, estilo urna. Um único <input> invisível cobre as caixas:
 * teclado numérico nativo, colar, apagar e leitores de tela funcionam; as caixas só desenham os dígitos.
 */
export function NumberInput({
  id,
  label,
  value,
  length,
  tone,
  disabled = false,
  describedBy,
  onValueChange,
  onComplete,
  onEnter,
}: NumberInputProps) {
  const [focused, setFocused] = useState(false);
  const activeIndex = focused && !disabled ? Math.min(value.length, length - 1) : -1;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value.replace(NON_DIGITS, "").slice(0, length);
    onValueChange?.(next);
    if (next.length === length && value.length < length) onComplete?.();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    onEnter?.();
  }

  return (
    <div className="relative flex shrink-0 gap-10">
      {Array.from({ length }, (_, index) => (
        <DigitBox key={index} tone={tone} digit={value[index]} active={index === activeIndex} />
      ))}
      <input
        {...exportIgnoreProps}
        id={id}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        enterKeyHint="next"
        maxLength={length}
        value={value}
        disabled={disabled}
        aria-label={label}
        aria-describedby={describedBy}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={(event) => {
          setFocused(true);
          moveCaretToEnd(event);
        }}
        onBlur={() => setFocused(false)}
        onSelect={moveCaretToEnd}
        className="absolute inset-0 h-full w-full cursor-text appearance-none bg-transparent text-[16px] text-transparent caret-transparent opacity-0 outline-none [-webkit-tap-highlight-color:transparent] disabled:cursor-default"
      />
    </div>
  );
}
