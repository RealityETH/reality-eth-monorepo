import React, { useEffect, useState } from "react";
import { Select } from "../../Select/Select";
import "./InstanceField.css";
import { Input } from "../../Input/Input";
import { chainTokenList, realityETHConfig } from "@reality.eth/contracts";

interface InstanceFieldProps {
  value?: string;
  onChange(address: string): void;
}

function getRealityETHInstances(chain_id: number) {
  const tokensDetails = chainTokenList(chain_id);
  const tokens = Object.keys(tokensDetails);
  return tokens.map((token) => ({ ...realityETHConfig(4, token), token }));
}

function shortAddress(address: string) {
  return address.substr(0, 8) + "..." + address.substr(-3);
}

export function InstanceField({ onChange, value }: InstanceFieldProps) {
  const options = getRealityETHInstances(4).map((instance) => ({
    label: `${instance.token} - ${shortAddress(instance.address)}`,
    value: instance.address,
  }));

  const [instance, setInstance] = useState(() => value || options[0].value);
  const [custom, setCustom] = useState(false);

  const handleChange = (_value: string) => {
    setInstance(_value);
    onChange(_value);
  };

  useEffect(() => {
    if (!value && instance) {
      onChange(instance);
    }
  }, [instance, onChange, value]);

  const handleCustomChange = (custom: boolean) => {
    setCustom(custom);
    if (!custom) {
      setInstance(options[0].value);
    }
  };

  if (custom) {
    return (
      <div className="instance-field">
        <Input
          value={value}
          placeholder="Reality.eth Instance Address (0x123...)"
          onChange={(event) => handleChange(event.currentTarget.value)}
        />
        <button
          onClick={() => handleCustomChange(false)}
          className="link-button custom-instance-button"
        >
          Use Default Instance
        </button>
      </div>
    );
  }

  return (
    <div className="instance-field">
      <Select
        label="Reality Instance"
        value={instance}
        onChange={(instance) => handleChange(instance)}
        options={options}
      />
      <button
        onClick={() => handleCustomChange(true)}
        className="link-button custom-instance-button"
      >
        Add Custom Instance
      </button>
    </div>
  );
}
