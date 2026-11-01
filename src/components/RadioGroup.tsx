import { useId, type ReactNode } from 'react';

interface Option<T extends string> {
  readonly value: T;
  readonly label: string;
}

interface Props<T extends string> {
  readonly legend: ReactNode;
  readonly name: string;
  readonly options: readonly Option<T>[];
  readonly value: T | null;
  readonly onChange: (value: T) => void;
  readonly hint?: string;
  /** Compact inline layout, used for Yes/No rows. */
  readonly inline?: boolean;
}

/** Native radio buttons in a fieldset: arrow keys move between options. */
export function RadioGroup<T extends string>({ legend, name, options, value, onChange, hint, inline = false }: Props<T>) {
  const hintId = useId();
  return (
    <fieldset className={inline ? 'radio-group radio-group-inline' : 'radio-group'} aria-describedby={hint ? hintId : undefined}>
      <legend>{legend}</legend>
      {hint && (
        <p className="hint" id={hintId}>
          {hint}
        </p>
      )}
      <div className="radio-options">
        {options.map((option) => (
          <label key={option.value} className="radio-option">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => {
                onChange(option.value);
              }}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
