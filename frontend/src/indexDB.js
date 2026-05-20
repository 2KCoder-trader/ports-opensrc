import { openDB } from 'idb';

const DB_NAME = "MyAppDB";
const STORE_NAME = "globalStore"; // Single object store for all data

// Initialize the database
const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME); // No keyPath, acts as a key-value store
      }
    },
  });
};

// Store or replace data
export const storeData = async (store_name, data) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  await store.put(data, store_name); // Store or replace entire Map
  await tx.done;
};

// Retrieve data as a Map
export const getData = async (store_name) => {
  const db = await initDB();
  return (await db.get(STORE_NAME, store_name)) || {}; // Return empty object if not found
};

// Delete all data
export const deleteData = async () => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  await tx.objectStore(STORE_NAME).clear();
  await tx.done;
};
