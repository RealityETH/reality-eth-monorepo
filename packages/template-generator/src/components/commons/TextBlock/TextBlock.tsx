import React from "react";
import "./TextBlock.css";
import classNames from "classnames";
import { HTMLProps } from "react";

type TextBlockProps = HTMLProps<HTMLDivElement>;

export function TextBlock({ className, ...props }: TextBlockProps) {
  return <div className={classNames("text-block", className)} {...props} />;
}
