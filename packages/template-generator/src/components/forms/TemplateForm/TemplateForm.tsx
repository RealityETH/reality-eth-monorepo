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
  template?: TemplateData;
  onChange(form?: Omit<TemplateData, "lang">): void;
}

export function TemplateForm(props: TemplateFormProps) {
  if (props.type === "reality") return <DaoModuleTemplateForm {...props} />;

  return <CustomTemplateForm {...props} />;
}
