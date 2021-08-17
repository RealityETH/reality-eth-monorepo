import React, { useState } from "react";
import { Option, Select } from "../../Select/Select";
import { Textarea } from "../../Textarea/Textarea";
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

export const CustomTemplateForm = ({ onChange }: TemplateFormProps) => {
  const [type, setType] = useState<Type>("bool");
  const [category, setCategory] = useState(categories[0]);
  const [title, setTitle] = useState("");

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
        label="Category"
        value={category}
        onChange={handleCategoryChange}
        options={categoryOptions}
        className="input-space"
      />
      <Select
        label="Type"
        value={type}
        onChange={handleTypeChange}
        options={typeOptions}
        className="input-space"
      />

      <Textarea
        value={title}
        rows={5}
        className="input-space"
        placeholder="Did the Olympian with the name %s win gold?"
        onChange={(evt) => handleTitleChange(evt.currentTarget.value)}
      />
    </>
  );
};
