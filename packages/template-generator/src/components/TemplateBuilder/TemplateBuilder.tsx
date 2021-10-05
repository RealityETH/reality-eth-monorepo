import React, { useState } from "react";
import { Language } from "../commons/LanguageField/LanguageField";
import { base_ids } from "@reality.eth/contracts/config/templates.json";
import { TemplateBuilderCreate } from "./TemplateBuilderCreate/TemplateBuilderCreate";
import {
  TemplateBuilderForm,
  TemplateBuilderFormFields,
} from "./TemplateBuilderForm/TemplateBuilderForm";
import { validateTemplateData } from "../../helpers/validation";
import { useParams } from "react-router-dom";

export type TemplateType = "custom" | "reality";
export const TEMPLATE_TYPES: TemplateType[] = ["custom", "reality"];

export type Type = keyof typeof base_ids;

export interface TemplateData {
  type: Type;
  title: string;
  category: string;
  lang: Language;

  decimals?: number;
  outcomes?: string[];
}

function isTemplateType(type: string): type is TemplateType {
  return TEMPLATE_TYPES.includes(type as TemplateType);
}

export const TemplateBuilder = () => {
  const { type: selectedType } = useParams<{ type: string }>();

  const [create, setCreate] = useState(false);
  const [instance, setInstance] = useState<string>();
  const [language, setLanguage] = useState<Language>("en");
  const [templateId, setTemplateId] = useState<number>();
  const [templateData, setTemplateData] = useState<TemplateData>();
  const [templateType, setTemplateType] = useState<TemplateType>(() => {
    if (selectedType && isTemplateType(selectedType)) return selectedType;
    return "custom";
  });

  const handleFormData = (data?: Omit<TemplateData, "lang">) => {
    if (!data) {
      setTemplateData(undefined);
      return;
    }
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
    if (!validateTemplateData(instance, templateData)) {
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
