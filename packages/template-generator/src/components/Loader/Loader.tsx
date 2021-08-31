import React from "react";
import "./Loader.css";
import { Spinner } from "../commons/Spinner/Spinner";
import { Box, BoxProps } from "../commons/Box/Box";

interface LoaderProps {
  title?: BoxProps["title"];
  text?: string;
}

export const Loader = ({ title, text }: LoaderProps) => {
  return (
    <Box title={title}>
      <div className="center-container">
        <div className="loader-container">
          <Spinner />
          <span>{text}</span>
        </div>
      </div>
    </Box>
  );
};
