import React, { useState } from "react";
import { Input } from "../../Input/Input";
import { TemplateFormProps } from "../TemplateForm/TemplateForm";

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

export const DaoModuleTemplateForm = ({ onChange }: TemplateFormProps) => {
  const [ENS, setENS] = useState("");

  const handleENSChange = (value: string) => {
    setENS(value);
    onChange({
      type: "bool",
      category: "DAO proposal",
      title: getTitleForDaoModuleTemplate(value),
    });
  };

  return (
    <Input
      value={ENS}
      className="input-space"
      placeholder="ENS Name"
      onChange={(event) => handleENSChange(event.currentTarget.value)}
    />
  );
};
