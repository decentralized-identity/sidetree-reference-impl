import DidTypeModel from '../models/DidTypeModel';

/**
 * An abstraction of a complete store did types.
 */
export default interface IDidTypeStore {
  /**
   * Inserts or replaces the didtype for a given did.
   * @param DidTypeModel the did unique suffix and did type
   */
  insert (didTypes: DidTypeModel[]): Promise<void>;

  /**
   * Gets all did unique suffix of the given DID type
   * @param didType the type of the did
   */
  get (didType: string): Promise<string[]>;

  /**
   * Deletes all did type entries with transaction number greater than the provided parameter.
   */
  delete (transactionNumber?: number): Promise<void>;
}
