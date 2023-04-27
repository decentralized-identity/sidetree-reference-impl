
/**
 * Did Type Model
 */
export default interface DidTypeModel {
    /** The DID unique suffix. */
    didUniqueSuffix: string;
    /** The DID type. */
    didType: string;
    /** The transaction number of the transaction this DID was created in. */
    transactionNumber: number;
  }
