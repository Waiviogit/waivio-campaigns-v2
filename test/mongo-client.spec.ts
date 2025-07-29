import { MongoTestHelper } from './helpers/mongo-test-helper';
import * as mongoose from 'mongoose';

describe('MongoTestHelper', () => {
  beforeAll(async () => {
    await MongoTestHelper.setupTestEnvironment();
  });

  afterAll(async () => {
    await MongoTestHelper.teardownTestEnvironment();
  });

  beforeEach(async () => {
    await MongoTestHelper.clearDatabase();
  });

  it('should connect to the test database', () => {
    expect(mongoose.connection.name).toBe('waivio-test');
    expect(mongoose.connection.readyState).toBe(1); // connected
  });

  it('should insert and find a document', async () => {
    const TestSchema = new mongoose.Schema({ name: String });
    const TestModel = mongoose.model('Test', TestSchema);

    await TestModel.create({ name: 'testdoc' });
    const found = await TestModel.findOne({ name: 'testdoc' });
    expect(found).not.toBeNull();
    expect(found!.name).toBe('testdoc');
  });

  it('should clear all collections between tests', async () => {
    const TestSchema = new mongoose.Schema({ name: String });
    const TestModel = mongoose.model('Test2', TestSchema);

    // Should be empty due to beforeEach
    const count = await TestModel.countDocuments();
    expect(count).toBe(0);
  });
}); 