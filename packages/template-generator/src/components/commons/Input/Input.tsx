import React from "react";
import "./Input.css";
import classNames from "classnames";

export const Input = ({
  className,
  disabled,
  label,
  ...props
}: React.HTMLProps<HTMLInputElement>) => {
  return (
    <div
      className={classNames(
        "custom-input",
        { "custom-input-disabled": disabled },
        className
      )}
    >
      {label ? <span>{label}:</span> : null}
      <input type="text" disabled={disabled} {...props} />
    </div>
  );
};
