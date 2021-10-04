import React, { useCallback } from "react";
import { Box } from "../../commons/Box/Box";
import "./TemplateBuilderForm.css";
import { Option, Select } from "../../commons/Select/Select";
import { InstanceField } from "../../forms/InstanceForm/InstanceField";
import { Button } from "../../commons/Button/Button";
import {
  Language,
  LanguageField,
} from "../../commons/LanguageField/LanguageField";
import { TemplateForm } from "../../forms/TemplateForm/TemplateForm";
import { TextBlock } from "../../commons/TextBlock/TextBlock";
import { TemplateData, TemplateType } from "../TemplateBuilder";
import { validateTemplateData } from "../../../helpers/validation";

export type TemplateBuilderFormFields =
  | "instance"
  | "language"
  | "type"
  | "template";

const templateTypeOptions: Option<TemplateType>[] = [
  { label: "Custom", value: "custom" },
  { label: "Zodiac Reality Module", value: "reality" },
];

interface TemplateBuilderFormProps {
  id?: number;
  lang?: Language;
  instance?: string;
  template?: TemplateData;
  type?: TemplateType;

  onChange?(field: TemplateBuilderFormFields, value: any): void;
  onSubmit?(): void;
}

export const TemplateBuilderForm = ({
  id,
  lang,
  type = "custom",
  instance,
  template,
  onChange,
  onSubmit,
}: TemplateBuilderFormProps) => {
  const disabled = id !== undefined;
  const title = disabled ? `Template: ${id}` : "Template Builder";
  const isValid = validateTemplateData(instance, template);

  const handleChange = useCallback(
    (field: TemplateBuilderFormFields) => (value: any) => {
      if (onChange) onChange(field, value);
    },
    [onChange]
  );

  return (
    <Box title={title}>
      <div className="template-builder-content">
        <InstanceField
          disabled={disabled}
          value={instance}
          onChange={handleChange("instance")}
        />
        <Select
          disabled={disabled}
          label="Template Type"
          value={type}
          onChange={handleChange("type")}
          options={templateTypeOptions}
          className="input-space"
        />

        <LanguageField
          disabled={disabled}
          value={lang || template?.lang}
          onChange={handleChange("language")}
          className="input-space"
        />

        <TemplateForm
          disabled={disabled}
          type={type}
          template={template}
          onChange={handleChange("template")}
        />

        {template && isValid ? (
          <TextBlock className="input-space">
            {JSON.stringify(template, undefined, 4)}
          </TextBlock>
        ) : null}

        {disabled ? null : (
          <Button
            disabled={!isValid}
            onClick={onSubmit}
            className="input-space"
          >
            Create Template
          </Button>
        )}
      </div>
    </Box>
  );
};
