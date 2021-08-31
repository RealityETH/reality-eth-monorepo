import React, { useCallback, useEffect, useRef, useState } from "react";
import "./TemplateBuilderCreate.css";
import { useSigner } from "../../../hooks/useSigner";
import { getRealityETHContract } from "../../../helpers/reality-eth-contract";
import { BigNumber, ethers } from "ethers";
import { Box } from "../../commons/Box/Box";
import { TemplateData } from "../TemplateBuilder";
import { Loader } from "../../Loader/Loader";

interface TemplateBuilderCreateProps {
  instance: string;
  template: TemplateData;

  onClose(): void;
  onCreate(templateId: number): void;
}

async function createTemplate(
  signer: ethers.Signer,
  realityETHInstance: string,
  template: TemplateData
) {
  const contract = getRealityETHContract(realityETHInstance, signer);

  const request = await contract.functions.createTemplate(
    JSON.stringify(template)
  );
  const receipt = await request.wait();

  const newTemplateEvent = receipt.events.find(
    (event: any) => event.event === "LogNewTemplate"
  );

  if (!newTemplateEvent) {
    throw new Error("Transaction did not fired the `LogNewTemplate` event.");
  }

  return newTemplateEvent.args[0] as BigNumber; // Template Id
}

export function TemplateBuilderCreate({
  instance,
  template,
  onClose,
  onCreate,
}: TemplateBuilderCreateProps) {
  const [error, setError] = useState(false);
  const loading = useRef(false);
  const { signer, connected, connect } = useSigner();

  const handleError = useCallback(() => {
    setError(true);
    setTimeout(onClose, 3000);
  }, [onClose]);

  useEffect(() => {
    if (!signer || !connected) {
      connect().catch(() => handleError());
      return;
    }

    if (!loading.current) {
      loading.current = true;
      createTemplate(signer, instance, template)
        .then((templateId) => onCreate(templateId.toNumber()))
        .catch(() => handleError());
    }
  }, [
    connect,
    connected,
    handleError,
    instance,
    loading,
    onCreate,
    signer,
    template,
  ]);

  if (error) {
    return (
      <Box title="Creating Template...">
        <div className="center-container">
          <h3 style={{ textAlign: "center" }}>Transaction Failed</h3>
        </div>
      </Box>
    );
  }

  return <Loader title="Creating Template..." text="Creating Template..." />;
}
