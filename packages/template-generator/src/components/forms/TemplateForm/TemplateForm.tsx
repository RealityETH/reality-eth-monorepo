import React from "react";
import {
  TemplateData,
  TemplateType,
} from "../../TemplateBuilder/TemplateBuilder";
import { DaoModuleTemplateForm } from "../DaoModuleTemplateForm/DaoModuleTemplateForm";
import { CustomTemplateForm } from "../CustomTemplateForm/CustomTemplateForm";

export interface TemplateFormProps {
  disabled?: boolean;
  type: TemplateType;
  value?: TemplateData;
  onChange(form: Omit<TemplateData, "lang">): void;
}

export function TemplateForm(props: TemplateFormProps) {
  if (props.type === "daoModule") return <DaoModuleTemplateForm {...props} />;

  return <CustomTemplateForm {...props} />;
}
