import { ethers } from "ethers";

const REALITY_ETH_ABI_CONTRACT = [
  "event LogNewTemplate(uint256 indexed template_id, address indexed user, string question_text)",
  "function createTemplate(string content) returns (uint256)",
];

export function getRealityETHContract(
  address: string,
  signer: ethers.Signer | ethers.providers.Provider
) {
  return new ethers.Contract(address, REALITY_ETH_ABI_CONTRACT, signer);
}

export function getRealityETHVersion() {
  return "3.0";
}
