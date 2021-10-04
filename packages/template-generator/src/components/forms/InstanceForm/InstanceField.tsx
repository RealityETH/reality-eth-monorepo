import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Select } from "../../commons/Select/Select";
import "./InstanceField.css";
import { Input } from "../../commons/Input/Input";
import { chainTokenList, realityETHConfig } from "@reality.eth/contracts";
import { useChainId } from "../../../hooks/useChainId";
import { getRealityETHVersion } from "../../../helpers/reality-eth-contract";

interface InstanceFieldProps {
  disabled?: boolean;
  value?: string;
  onChange(address: string): void;
}

function getRealityETHInstances(chain_id: number) {
  const tokensDetails = chainTokenList(chain_id);
  const tokens = Object.keys(tokensDetails);
  return tokens
    .map((token) => ({
      ...realityETHConfig(chain_id, token, getRealityETHVersion()),
      token,
    }))
    .filter((token) => token.address);
}

function shortAddress(address: string) {
  return address.substr(0, 8) + "..." + address.substr(-3);
}

export function InstanceField({
  onChange,
  value,
  disabled,
}: InstanceFieldProps) {
  const chainId = useChainId();

  const options = useMemo(() => {
    const instances = getRealityETHInstances(chainId || 1);
    return instances.map((instance) => ({
      label: `${instance.token} - ${shortAddress(instance.address)}`,
      value: instance.address,
    }));
  }, [chainId]);

  const [instance, setInstance] = useState(
    () => value || (options[0] && options[0].value)
  );
  const [custom, setCustom] = useState(false);

  const handleChange = useCallback(
    (_value: string) => {
      setInstance(_value);
      onChange(_value);
    },
    [onChange]
  );

  useEffect(() => {
    if (options.length) {
      const exists = options.some((option) => option.value === instance);
      if (!exists) setInstance(options[0].value);
    }
  }, [instance, options]);

  useEffect(() => {
    if (!value && instance) {
      onChange(instance);
    }
  }, [instance, onChange, value]);

  const handleCustomChange = (custom: boolean) => {
    setCustom(custom);
    if (!custom) {
      setInstance(options[0].value);
      onChange(options[0].value);
    }
  };

  if (custom) {
    return (
      <div className="instance-field">
        <Input
          disabled={disabled}
          label="Reality Instance"
          value={value}
          placeholder="Reality.eth Instance Address (0x123...)"
          onChange={(event) => handleChange(event.currentTarget.value)}
        />
        {disabled ? null : (
          <button
            onClick={() => handleCustomChange(false)}
            className="link-button custom-instance-button"
          >
            Use Default Instance
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="instance-field">
      <Select
        disabled={disabled}
        label="Reality Instance"
        value={instance}
        onChange={(instance) => handleChange(instance)}
        options={options}
      />
      {disabled ? null : (
        <button
          onClick={() => handleCustomChange(true)}
          className="link-button custom-instance-button"
        >
          Add Custom Instance
        </button>
      )}
    </div>
  );
}
