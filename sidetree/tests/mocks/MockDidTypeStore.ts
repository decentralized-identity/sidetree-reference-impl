
import DidTypeModel from '../../lib/core/models/DidTypeModel';
import IDidTypeStore from '../../lib/core/interfaces/IDidTypeStore';

/**
 * A simple in-memory implementation of did type store.
 */
export default class MockDidTypeStore implements IDidTypeStore {
  private didTypesMockDB: DidTypeModel[] = [];

  public async insert (didTypes : DidTypeModel[]): Promise<void> {
    for (const didType of didTypes) {
      this.didTypesMockDB.push(didType);
    }
  }

  public async get (didTypeInput: string): Promise<string[]> {
    const results: string[] = [];
    for (const didType of this.didTypesMockDB) {
      if (didType.didType === didTypeInput) {
        results.push(didType.didUniqueSuffix);
      }
    }
    return Promise.resolve(results);
  }

  public async delete (): Promise<void> {
    this.didTypesMockDB = [];
  }
}
