import React, { HTMLProps, useEffect, useState } from "react";
import "./Select.css";
import classNames from "classnames";

export type Option<T> = { label: string; value: T };
export interface SelectProps<T>
  extends Omit<HTMLProps<HTMLDivElement>, "value" | "onChange"> {
  label: string;
  value?: T;
  onChange: (value: T) => void;
  containerProps?: React.HTMLProps<HTMLDivElement>;
  labelProps?: Omit<React.HTMLProps<HTMLLabelElement>, "htmlFor">;
  options: Option<T>[];
}

export function Select<T>({
  label,
  value,
  options,
  onChange,
  className,
  disabled,
  ...props
}: SelectProps<T>) {
  const [index, setIndex] = useState(() =>
    options.findIndex((option) => option.value === value)
  );

  useEffect(() => {
    const _index = options.findIndex((option) => option.value === value);
    if (index !== _index && value) {
      setIndex(_index);
      onChange(value);
    }
  }, [index, onChange, options, value]);

  const handleSelect = (index: string) => {
    const i = parseInt(index);
    const { value } = options[i];
    setIndex(i);
    onChange(value);
  };

  const getLabel = (index: number) => {
    const option = options[index];
    if (!option) return value;
    return option.label;
  };

  return (
    <div
      {...props}
      className={classNames(
        "custom-select-container",
        { "select-disabled": disabled },
        className
      )}
    >
      <span
        className={classNames("custom-select-label", {
          "custom-select-selected": value,
        })}
      >
        {label}: {value ? getLabel(index) : null}
      </span>
      <select
        disabled={disabled}
        className="custom-select"
        value={index}
        onChange={(e) => handleSelect(e.target.value)}
      >
        {options.map((option, index) => (
          <option key={index} value={index}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
