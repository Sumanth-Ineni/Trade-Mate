import { Firestore } from '@google-cloud/firestore';

// Create a new client
const db = new Firestore();

// Export the client to be used elsewhere
export default db;