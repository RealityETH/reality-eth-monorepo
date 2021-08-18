import React, { useState } from "react";
import { Option, Select } from "../../commons/Select/Select";
import { Textarea } from "../../commons/Textarea/Textarea";
import { Type } from "../../TemplateBuilder/TemplateBuilder";
import { TemplateFormProps } from "../TemplateForm/TemplateForm";

const typeOptions: Option<Type>[] = [
  { value: "bool", label: "Bool" },
  { value: "uint", label: "Uint" },
  { value: "datetime", label: "Date/Time" },
  { value: "single-select", label: "Single Select" },
  { value: "multiple-select", label: "Multiple Select" },
];

const categories = ["Sports"];
const categoryOptions: Option<string>[] = categories.map((category) => ({
  label: category,
  value: category,
}));

export const CustomTemplateForm = ({
  onChange,
  disabled,
  value,
}: TemplateFormProps) => {
  const [type, setType] = useState<Type>(value?.type || "bool");
  const [category, setCategory] = useState(value?.category || categories[0]);
  const [title, setTitle] = useState(value?.title || "");

  const handleCategoryChange = (category: string) => {
    setCategory(category);
    onChange({ type, category, title });
  };

  const handleTypeChange = (type: Type) => {
    setType(type);
    onChange({ type, category, title });
  };

  const handleTitleChange = (title: string) => {
    setTitle(title);
    onChange({ type, category, title });
  };

  return (
    <>
      <Select
        disabled={disabled}
        label="Category"
        value={category}
        onChange={handleCategoryChange}
        options={categoryOptions}
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
