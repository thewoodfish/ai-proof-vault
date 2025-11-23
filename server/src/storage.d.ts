import { Synapse } from '@filoz/synapse-sdk';
/**
 * Store JSON proof on Filecoin using the Synapse SDK
 */
declare function storeOnFilecoin(proofObj: object, network: string): Promise<string>;
/**
 * One-time payment setup
 */
declare function setupPayments(synapse: Synapse, depositAmount?: number): Promise<void>;
/**
 * Retrieve proof from Filecoin
 */
declare function retrieveFromFilecoin(pieceCid: string, network: string): Promise<object>;
export { storeOnFilecoin, setupPayments, retrieveFromFilecoin, };
//# sourceMappingURL=storage.d.ts.map