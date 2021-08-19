import React, { useState } from "react";
import { Box } from "../commons/Box/Box";
import "./TemplateBuilder.css";
import { Option, Select } from "../commons/Select/Select";
import { InstanceField } from "../forms/InstanceForm/InstanceField";
import { Button } from "../commons/Button/Button";
import {
  Language,
  LanguageField,
} from "../commons/LanguageField/LanguageField";
import { base_ids } from "@reality.eth/contracts/config/templates.json";
import { TemplateForm } from "../forms/TemplateForm/TemplateForm";
import { TextBlock } from "../commons/TextBlock/TextBlock";
import { isAddress } from "ethers/lib/utils";
import { TemplateBuilderCreate } from "./TemplateBuilderCreate/TemplateBuilderCreate";

export type TemplateType = "custom" | "daoModule";
const templateTypeOptions: Option<TemplateType>[] = [
  { label: "Custom", value: "custom" },
  { label: "DAO Module", value: "daoModule" },
];

export type Type = keyof typeof base_ids;

export interface TemplateData {
  type: Type;
  title: string;
  category: string;
  lang: Language;
}

export const TemplateBuilder = () => {
  const [create, setCreate] = useState(false);
  const [instance, setInstance] = useState<string>(
    "0xa4dA771Bbd6e93bB8e714Fe97b388fe88eec8288"
  );
  const [language, setLanguage] = useState<Language>("en");
  const [templateId, setTemplateId] = useState<number>();
  const [templateData, setTemplateData] = useState<TemplateData>();
  const [templateType, setTemplateType] = useState<TemplateType>("custom");

  const handleFormData = (data: Omit<TemplateData, "lang">) => {
    setTemplateData({ lang: language, ...data });
  };
  const handleClose = () => {
    setCreate(false);
    setTemplateData(undefined);
  };
  const handleCreation = (templateId: number) => {
    setTemplateType("custom");
    setTemplateId(templateId);
  };
  const handleSubmit = () => {
    if (!instance || !isAddress(instance) || !templateData) {
      return;
    }
    setCreate(true);
  };

  if (instance && templateData && create && !templateId) {
    return (
      <TemplateBuilderCreate
        instance={instance}
        template={templateData}
        onClose={handleClose}
        onCreate={handleCreation}
      />
    );
  }

  const disabled = templateId !== undefined;
  const title = disabled ? `Template: ${templateId}` : "Template Builder";

  return (
    <Box title={title}>
      <div className="template-builder-content">
        <InstanceField
          disabled={disabled}
          value={instance}
          onChange={(address) => setInstance(address)}
        />
        <Select
          disabled={disabled}
          label="Template Type"
          value={templateType}
          onChange={(type) => setTemplateType(type)}
          options={templateTypeOptions}
          className="input-space"
        />

        <LanguageField
          disabled={disabled}
          value={language}
          onChange={setLanguage}
          className="input-space"
        />

        <TemplateForm
          disabled={disabled}
          type={templateType}
          value={templateData}
          onChange={handleFormData}
        />

        {templateData ? (
          <TextBlock className="input-space">
            {JSON.stringify({ ...templateData }, undefined, 4)}
          </TextBlock>
        ) : null}

        {disabled ? null : (
          <Button onClick={handleSubmit} className="input-space">
            Create Template
          </Button>
        )}
      </div>
    </Box>
  );
};
