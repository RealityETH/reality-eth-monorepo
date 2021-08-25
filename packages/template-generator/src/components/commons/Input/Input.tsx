import React from "react";
import "./Input.css";
import classNames from "classnames";

interface InputProps extends React.HTMLProps<HTMLInputElement> {
  error?: string;
}

export const Input = ({
  className,
  disabled,
  label,
  error,
  ...props
}: InputProps) => {
  const input = (
    <div
      className={classNames(
        "custom-input",
        { "custom-input-disabled": disabled, "input-error": error },
        className
      )}
    >
      {label ? <span>{label}:</span> : null}
      <input type="text" disabled={disabled} {...props} />
    </div>
  );

  if (error)
    return (
      <>
        {input}
        <span className="custom-input-error-text">{error}</span>
      </>
    );

  return input;
};
