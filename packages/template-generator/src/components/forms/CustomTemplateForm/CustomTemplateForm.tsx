import React, { useState } from "react";
import { Option, Select } from "../../commons/Select/Select";
import { Textarea } from "../../commons/Textarea/Textarea";
import { TemplateData, Type } from "../../TemplateBuilder/TemplateBuilder";
import { TemplateFormProps } from "../TemplateForm/TemplateForm";
import { Input } from "../../commons/Input/Input";

const typeOptions: Option<Type>[] = [
  { value: "bool", label: "Bool" },
  { value: "uint", label: "Uint" },
  { value: "datetime", label: "Date/Time" },
  { value: "single-select", label: "Single Select" },
  { value: "multiple-select", label: "Multiple Select" },
];

type PartialTemplateData = Omit<TemplateData, "lang">;

export function getTypes(type: string) {
  return {
    isSelect: type === "single-select" || type === "multiple-select",
    isInt: type === "uint",
  };
}

function parseOutcomes(value: string): string[] {
  return value.trim()
    ? value
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v)
    : [];
}

export const CustomTemplateForm = ({
  onChange,
  disabled,
  template,
}: TemplateFormProps) => {
  const [type, setType] = useState<Type>(template?.type || "bool");
  const [category, setCategory] = useState(template?.category || "");
  const [title, setTitle] = useState(template?.title || "");
  const [outcomes, setOutcomes] = useState<string>(
    template?.outcomes?.join(",") || ""
  );
  const [decimals, setDecimals] = useState<number>(template?.decimals || 18);

  const handleChange = (field: keyof PartialTemplateData, value: any) => {
    const _type = field === "type" ? value : type;
    const { isInt, isSelect } = getTypes(_type);

    const data: PartialTemplateData = {
      ...template,
      type,
      category,
      title,
      outcomes: isSelect ? parseOutcomes(outcomes) : undefined,
      decimals: isInt ? decimals : undefined,
      [field]: value,
    };
    onChange(data);
  };

  const handleCategoryChange = (category: string) => {
    setCategory(category);
    handleChange("category", category);
  };

  const handleTypeChange = (type: Type) => {
    setType(type);
    handleChange("type", type);
  };

  const handleTitleChange = (title: string) => {
    setTitle(title);
    handleChange("title", title);
  };

  const handleDecimalsChange = (value: string) => {
    const decimals = parseInt(value);
    if (isNaN(decimals)) return;
    setDecimals(decimals);
    handleChange("decimals", decimals);
  };

  const handleOutcomesChange = (value: string) => {
    setOutcomes(value);
    const _outcomes = parseOutcomes(value);
    handleChange("outcomes", _outcomes);
  };

  const { isInt, isSelect } = getTypes(type);

  return (
    <>
      <Input
        disabled={disabled}
        label="Category"
        value={category}
        onChange={(evt) => handleCategoryChange(evt.currentTarget.value)}
        className="input-space"
      />
      <Select
        disabled={disabled}
        label="Type"
        value={type}
        onChange={handleTypeChange}
        options={typeOptions}
        className="input-space"
      />

      {isInt ? (
        <Input
          disabled={disabled}
          label="Decimals"
          value={decimals}
          onChange={(evt) => handleDecimalsChange(evt.currentTarget.value)}
          className="input-space"
        />
      ) : null}
      {isSelect ? (
        <Input
          disabled={disabled}
          label="Outcomes"
          value={outcomes}
          onChange={(evt) => handleOutcomesChange(evt.currentTarget.value)}
          className="input-space"
        />
      ) : null}

      <Textarea
        disabled={disabled}
        value={title}
        rows={5}
        className="input-space"
        placeholder="Did the Olympian with the name %s win gold?"
        onChange={(evt) => handleTitleChange(evt.currentTarget.value)}
      />
    </>
  );
};
