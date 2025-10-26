import fs from 'fs';
import path from 'path';
import db from './db.js'; // Assuming you set up db.js as above

// const dataFilePath = path.resolve('products.json');
const collectionName = 'trades'; // The name of your Firestore Collection

async function migrateData() {
    try {
        //const rawData = fs.readFileSync(dataFilePath, 'utf8');
        const items = [
            { id: '1', date: '2024-07-20', time: '09:30:05', ticker: 'AAPL', type: 'Buy', price: 150.50, quantity: 10 },
            { id: '2', date: '2024-07-20', time: '10:15:22', ticker: 'GOOGL', type:'Buy', price: 2800.00, quantity: 2 },
            { id: '3', date: '2024-07-21', time: '14:05:00', ticker: 'AAPL', type: 'Sell', price: 155.25, quantity: 10 },
            { id: '4', date: '2024-07-22', time: '11:00:00', ticker: 'TSLA', type: 'Buy', price: 650.00, quantity: 5 },
            { id: '5', date: '2024-07-23', time: '15:45:10', ticker: 'MSFT', type: 'Buy', price: 300.10, quantity: 8 },
            { id: '6', date: '2024-07-19', time: '09:45:10', ticker: 'NVDA', type: 'Buy', price: 125.10, quantity: 20 },
            { id: '7', date: '2024-07-18', time: '12:45:10', ticker: 'AMD', type: 'Sell', price: 162.40, quantity: 15 },
        ];;
        // const items = JSON.parse(rawData);

        console.log(`Starting migration of ${items.length} items to ${collectionName}...`);

        for (const item of items) {
            // Use the 'id' from your JSON data as the document ID in Firestore.
            // Firestore will create a new document if one doesn't exist.
            const docRef = db.collection(collectionName).doc(item.id);

            // Add the data to Firestore. The entire JSON object becomes the document.
            await docRef.set(item);
            console.log(`Successfully migrated document with ID: ${item.id}`);
        }

        console.log('Migration complete! 🎉');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrateData();