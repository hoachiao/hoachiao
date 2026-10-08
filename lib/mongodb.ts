import { MongoClient, Db } from 'mongodb';

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('Please add your Mongo URI to .env.local');
  }

  const trimmedUri = uri.trim();

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(trimmedUri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    return globalWithMongo._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    if (!client) {
      client = new MongoClient(trimmedUri, options);
    }
    if (!clientPromise) {
      clientPromise = client.connect();
    }
    return clientPromise;
  }
}

export async function getDatabase(): Promise<Db> {
  const client = await getClientPromise();
  const dbName = process.env.MONGODB_DB || 'projects';
  return client.db(dbName);
}

