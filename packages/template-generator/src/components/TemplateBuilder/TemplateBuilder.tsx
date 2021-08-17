import React, { useState } from "react";
import { Box } from "../Box/Box";
import "./TemplateBuilder.css";
import { Select } from "../Select/Select";
import { InstanceField } from "../forms/InstanceForm/InstanceField";
import { Button } from "../Button/Button";
import { Language, LanguageField } from "../LanguageField/LanguageField";
import { base_ids } from "@reality.eth/contracts/config/templates.json";
import { TemplateForm } from "../forms/TemplateForm/TemplateForm";
import { TextBlock } from "../TextBlock/TextBlock";

export type TemplateType = "custom" | "daoModule";
const templateTypeOptions: { value: TemplateType; label: string }[] = [
  { label: "Custom", value: "custom" },
  { label: "DAO Module", value: "daoModule" },
];

export type Type = keyof typeof base_ids;

export interface TemplateData {
  type: Type;
  title: string;
  category: string;
}

export const TemplateBuilder = () => {
  const [instance, setInstance] = useState<string>();
  const [templateType, setTemplateType] = useState<TemplateType>("custom");
  const [language, setLanguage] = useState<Language>("en");
  const [templateData, setTemplateData] = useState<TemplateData>();

  const handleFormData = (data: TemplateData) => {
    setTemplateData(data);
  };

  return (
    <Box title="Template Builder">
      <div className="template-builder-content">
        <InstanceField
          value={instance}
          onChange={(address) => setInstance(address)}
        />
        <Select
          label="Template Type"
          value={templateType}
          onChange={(type) => setTemplateType(type)}
          options={templateTypeOptions}
          className="input-space"
        />

        <LanguageField
          value={language}
          onChange={setLanguage}
          className="input-space"
        />

        <TemplateForm type={templateType} onChange={handleFormData} />

        {templateData ? (
          <TextBlock className="input-space">
            {JSON.stringify(templateData, undefined, 4)}
          </TextBlock>
        ) : null}

        <Button className="input-space">Create Template</Button>
      </div>
    </Box>
  );
};
