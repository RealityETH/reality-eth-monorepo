import React from "react";
import "./Textarea.css";

export const Textarea = ({
  className,
  ...props
}: React.HTMLProps<HTMLTextAreaElement>) => {
  return <textarea {...props} className={`custom-textarea ${className}`} />;
};
