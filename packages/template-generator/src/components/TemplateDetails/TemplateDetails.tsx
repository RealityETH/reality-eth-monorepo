import React, { useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { realityETHConfig } from "@reality.eth/contracts";
import { Loader } from "../Loader/Loader";
import { useChainId } from "../../hooks/useChainId";
import { getNetworkLabel } from "../../helpers/network";
import {
  getRealityETHContract,
  getRealityETHVersion,
} from "../../helpers/reality-eth-contract";
import { useProvider } from "../../hooks/useProvider";
import { BigNumber } from "ethers";
import { TemplateData } from "../TemplateBuilder/TemplateBuilder";
import { TemplateBuilderForm } from "../TemplateBuilder/TemplateBuilderForm/TemplateBuilderForm";

interface TemplateDetailsParams {
  id: string;
  chainId: string;
  token: string;
}

export function TemplateDetails() {
  const history = useHistory();
  const provider = useProvider();
  const currentChainId = useChainId();
  const [template, setTemplate] = useState<TemplateData>();

  const { id, token, chainId: _chainId } = useParams<TemplateDetailsParams>();
  const chainId = parseInt(_chainId);

  const isCorrectChain = chainId === currentChainId;

  const realityInstance = useMemo(() => {
    try {
      return realityETHConfig(chainId, token, getRealityETHVersion());
    } catch (err) {
      return undefined;
    }
  }, [chainId, token]);

  useEffect(() => {
    if (isNaN(parseInt(id)) || !realityInstance) {
      history.replace("/");
    }
  }, [history, id, realityInstance]);

  useEffect(() => {
    if (isCorrectChain && realityInstance) {
      const contract = getRealityETHContract(realityInstance.address, provider);
      const filters = contract.filters.LogNewTemplate(BigNumber.from(id));
      contract
        .queryFilter(filters)
        .then((events) => {
          if (!events.length) {
            history.replace("/");
            return;
          }
          let { question_text } = events[0].args as any;
          question_text = question_text.replace(
            '"outcomes": [%s]',
            '"outcomes": ["%s"]'
          ); // Special Case for Default Cases
          const template = JSON.parse(question_text) as TemplateData;
          setTemplate(template);
        })
        .catch(() => history.replace("/"));
    }
  }, [
    id,
    history,
    chainId,
    provider,
    currentChainId,
    isCorrectChain,
    realityInstance,
  ]);

  if (!isCorrectChain) {
    const networkLabel = getNetworkLabel(chainId).toLowerCase();
    return (
      <Loader
        text={`Please change your current network to the ${networkLabel}`}
      />
    );
  }

  if (template) {
    return <TemplateBuilderForm id={parseInt(id)} template={template} />;
  }

  return <Loader />;
}
