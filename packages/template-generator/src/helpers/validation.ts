import { TemplateData } from "../components/TemplateBuilder/TemplateBuilder";
import { isAddress } from "ethers/lib/utils";
import { getTypes } from "../components/forms/CustomTemplateForm/CustomTemplateForm";

export function validateTemplateData(
  instance?: string,
  template?: TemplateData
): boolean {
  if (
    !(
      instance &&
      isAddress(instance) &&
      template &&
      template.type &&
      template.category &&
      template.title
    )
  )
    return false;

  const { isInt, isSelect } = getTypes(template.type);

  if (isInt) {
    return !!(template?.decimals && !isNaN(template.decimals));
  }

  if (isSelect) {
    return !!template?.outcomes?.length;
  }

  return true;
}
