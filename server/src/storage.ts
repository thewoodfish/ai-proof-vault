import { Synapse, RPC_URLS } from '@filoz/synapse-sdk';
import { ethers } from 'ethers';
import dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY ?? "";

/**
 * Select correct RPC URL (MUST use HTTP when using privateKey)
 */
function getRpcURL(network: string) {
  if (network === "mainnet") {
    return RPC_URLS.mainnet.http;
  }
  return RPC_URLS.calibration.http;
}

/**
 * Store JSON proof on Filecoin using the Synapse SDK
 */
async function storeOnFilecoin(
  proofObj: object,
  network: string
): Promise<string> {

  const rpcURL = getRpcURL(network);

  const synapse = await Synapse.create({
    privateKey: PRIVATE_KEY,
    rpcURL,
  });

  try {
    const proofData = new TextEncoder().encode(
      JSON.stringify(proofObj, null, 2)
    );

    const uploadResult = await synapse.storage.upload(proofData);

    console.log(`✓ Uploaded to Filecoin! PieceCID: ${uploadResult.pieceCid}`);

    return uploadResult.pieceCid.toString();
  } finally {
    const rpcProvider = synapse.getProvider();
    if (rpcProvider?.destroy) {
      await rpcProvider.destroy();
    }
  }
}

/**
 * One-time payment setup
 */
async function setupPayments(
  synapse: Synapse,
  depositAmount: number = 100
): Promise<void> {

  const amount = ethers.parseUnits(depositAmount.toString(), 18);

  console.log(`Depositing ${depositAmount} USDFC...`);
  const depositTx = await synapse.payments.deposit(amount);
  await depositTx.wait();
  console.log("✓ Deposit complete");

  const warmStorageAddress = await synapse.getWarmStorageAddress();
  console.log("Approving Warm Storage service...");

  const approveTx = await synapse.payments.approveService(
    warmStorageAddress,
    ethers.parseUnits("1", 18),   // rate allowance
    ethers.parseUnits("10", 18),  // lockup allowance
    86400n                        // max lockup (epochs)
  );

  await approveTx.wait();
  console.log("✓ Service approved");
}

/**
 * Retrieve proof from Filecoin
 */
async function retrieveFromFilecoin(
  pieceCid: string,
  network: string
): Promise<object> {

  const rpcURL = getRpcURL(network);

  const synapse = await Synapse.create({
    privateKey: PRIVATE_KEY,
    rpcURL,
  });

  try {
    const data = await synapse.storage.download(pieceCid);
    return JSON.parse(new TextDecoder().decode(data));

  } finally {
    const rpcProvider = synapse.getProvider();
    if (rpcProvider?.destroy) {
      await rpcProvider.destroy();
    }
  }
}

export {
  storeOnFilecoin,
  setupPayments,
  retrieveFromFilecoin,
};
