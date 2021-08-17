import React from "react";
import "./Input.css";

export const Input = ({
  className,
  ...props
}: React.HTMLProps<HTMLInputElement>) => {
  return (
    <input type="text" {...props} className={`custom-input ${className}`} />
  );
};
