import * as mongoose from 'mongoose';
import { configService } from '../../src/common/config';

export class MongoTestHelper {
  static async setupTestEnvironment(): Promise<typeof mongoose> {
    const uri = configService.getMongoWaivioConnectionString();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any);
    return mongoose;
  }

  static async teardownTestEnvironment(): Promise<void> {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    }
  }

  static async clearDatabase(): Promise<void> {
    if (mongoose.connection.readyState === 1) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
    }
  }

  static getConnection() {
    return mongoose.connection;
  }
}
