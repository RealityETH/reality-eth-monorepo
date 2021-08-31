import React from "react";
import "./Box.css";

export interface BoxProps {
  title?: string;
}

export const Box: React.FC<BoxProps> = ({ title, children }) => {
  return (
    <div className="box">
      {title ? (
        <div className="box-title-container">
          <h3 className="box-title">{title}</h3>
        </div>
      ) : null}
      <div className="box-content">{children}</div>
    </div>
  );
};
