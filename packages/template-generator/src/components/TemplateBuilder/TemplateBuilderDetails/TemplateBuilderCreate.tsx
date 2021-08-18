import React from "react";
import "./TemplateBuilderCreate.css";
import { Box } from "../../commons/Box/Box";
import { Spinner } from "../../commons/Spinner/Spinner";
import { TemplateData } from "../TemplateBuilder";

interface TemplateBuilderCreateProps {
  template: TemplateData;

  onClose(): void;
}

export function TemplateBuilderCreate({
  template,
  onClose,
}: TemplateBuilderCreateProps) {
  return (
    <Box title="Creating Template...">
      <div className="center-container">
        <div className="loader-container">
          <Spinner />
        </div>
      </div>
    </Box>
  );
}
