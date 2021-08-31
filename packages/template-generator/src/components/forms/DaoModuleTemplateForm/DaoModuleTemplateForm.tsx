import React, { useState } from "react";
import { Input } from "../../commons/Input/Input";
import { TemplateFormProps } from "../TemplateForm/TemplateForm";
import { validateName } from "@ensdomains/ui/src/utils/index";

function getTitleForDaoModuleTemplate(ens: string) {
  return (
    "Did the Snapshot proposal with the id %s in the " +
    `${ens} space pass the execution of the array of Module transactions ` +
    "that have the hash 0x%s and does it meet the requirements of the document " +
    `referenced in the dao requirements record at ${ens}? The hash is ` +
    "the keccak of the concatenation of the individual EIP-712 hashes of " +
    "the Module transactions. If this question was asked before the corresponding " +
    "Snapshot proposal was resolved, it should ALWAYS be resolved to INVALID!"
  );
}

function validate(value: string) {
  try {
    return validateName(value).length;
  } catch (err) {
    return false;
  }
}

export const DaoModuleTemplateForm = ({
  onChange,
  disabled,
}: TemplateFormProps) => {
  const [ENS, setENS] = useState<string>("");
  const [error, setError] = useState(false);

  const handleENSChange = (value: string) => {
    setENS(value);
    if (!value) {
      onChange(undefined);
      setError(false);
      return;
    }
    if (!validate(value)) {
      onChange(undefined);
      setError(true);
      return;
    }
    setError(false);
    onChange({
      type: "bool",
      category: "DAO proposal",
      title: getTitleForDaoModuleTemplate(value.trim()),
    });
  };

  return (
    <Input
      disabled={disabled}
      value={ENS}
      error={error ? "Invalid ENS" : ""}
      className={"input-space"}
      placeholder="ENS Name"
      onChange={(event) => handleENSChange(event.currentTarget.value)}
    />
  );
};
