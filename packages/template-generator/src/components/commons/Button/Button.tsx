import React from "react";
import "./Button.css";
import classNames from "classnames";

type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export const Button = ({ className, ...props }: ButtonProps) => {
  return <button className={classNames("custom-btn", className)} {...props} />;
};
