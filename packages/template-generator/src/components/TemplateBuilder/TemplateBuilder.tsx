import React, { useState } from "react";
import { Language } from "../commons/LanguageField/LanguageField";
import { base_ids } from "@reality.eth/contracts/config/templates.json";
import { isAddress } from "ethers/lib/utils";
import { TemplateBuilderCreate } from "./TemplateBuilderCreate/TemplateBuilderCreate";
import {
  TemplateBuilderForm,
  TemplateBuilderFormFields,
} from "./TemplateBuilderForm/TemplateBuilderForm";

export type TemplateType = "custom" | "daoModule";

export type Type = keyof typeof base_ids;

export interface TemplateData {
  type: Type;
  title: string;
  category: string;
  lang: Language;

  decimals?: number;
  outcomes?: string[];
}

export const TemplateBuilder = () => {
  const [create, setCreate] = useState(false);
  const [instance, setInstance] = useState<string>();
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

  const handleChange = (field: TemplateBuilderFormFields, value: any) => {
    switch (field) {
      case "instance":
        setInstance(value);
        break;
      case "type":
        setTemplateType(value);
        setTemplateData(undefined);
        break;
      case "language":
        setLanguage(value);
        if (templateData) {
          const template = { ...templateData };
          template.lang = value; // Avoid changing fields order.
          setTemplateData(template);
        }
        break;
      case "template":
        handleFormData(value);
        break;
      default:
        console.error("unexpected field");
        break;
    }
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

  return (
    <TemplateBuilderForm
      id={templateId}
      lang={language}
      type={templateType}
      instance={instance}
      template={templateData}
      onSubmit={handleSubmit}
      onChange={handleChange}
    />
  );
};
