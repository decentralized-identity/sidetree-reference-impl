import DidTypeModel from '../../lib/core/models/DidTypeModel';
import IDidTypeStore from '../../lib/core/interfaces/IDidTypeStore';
import { MongoClient } from 'mongodb';
import MongoDb from '../common/MongoDb';
import MongoDbDidTypeStore from '../../lib/core/MongoDbDidTypeStore';

const databaseName = 'sidetree-test';

async function createDidTypeStore (mongoDbConnectionString: string): Promise<IDidTypeStore> {
  const didTypeStore = new MongoDbDidTypeStore(mongoDbConnectionString, databaseName);
  await didTypeStore.initialize();
  return didTypeStore;
}

describe('MongoDbDidTypeStore', async () => {
  let didTypeStore: IDidTypeStore;
  const config = require('../json/config-test.json');
  const didType = '0001';
  beforeAll(async () => {
    await MongoDb.createInmemoryDb(config);
    didTypeStore = await createDidTypeStore(config.mongoDbConnectionString);
  });

  beforeEach(async () => {
    await didTypeStore.delete();
  });

  it('should create collection when initialize is called', async () => {
    // Make a new instance of didType store and initialize
    const databaseName = 'test-new-db';
    const emptyDidTypeStore = new MongoDbDidTypeStore(config.mongoDbConnectionString, databaseName);
    await emptyDidTypeStore.initialize();

    // Make connection to mongo db to verify collection exists
    const client = await MongoClient.connect(config.mongoDbConnectionString, { useNewUrlParser: true });
    const db = client.db(databaseName);
    const collections = await db.collections();
    const collectionNames = collections.map(collection => collection.collectionName);
    expect(collectionNames.includes(MongoDbDidTypeStore.collectionName)).toBeTruthy();

    // clean up
    await db.dropDatabase();
  });

  describe('insert()', () => {
    it('should be able to insert a didType successfully.', async () => {
      const didTypeInstance: DidTypeModel = {
        didUniqueSuffix: 'example-suffix',
        didType: didType,
        transactionNumber: 1234
      };
      await didTypeStore.insert([didTypeInstance]);
      let returnedDidTypes = await didTypeStore.get('baddidtype');
      expect(returnedDidTypes.length).toBe(0);

      returnedDidTypes = await didTypeStore.get(didType);
      expect(returnedDidTypes.length).toBe(1);
      expect(returnedDidTypes[0]).toBe('example-suffix');
    });

    it('should be able to delete didType with transaction number greater than the provided.', async () => {
      const didTypeInstanceOne: DidTypeModel = {
        didUniqueSuffix: 'example-suffix1',
        didType: didType,
        transactionNumber: 10
      };

      const didTypeInstanceTwo: DidTypeModel = {
        didUniqueSuffix: 'example-suffix2',
        didType: didType,
        transactionNumber: 20
      };

      await didTypeStore.insert([didTypeInstanceOne, didTypeInstanceTwo]);
      await didTypeStore.delete(15);

      const returnedDidTypes = await didTypeStore.get(didType);
      expect(returnedDidTypes.length).toBe(1);
      expect(returnedDidTypes[0]).toBe('example-suffix1');
    });
  });
});
