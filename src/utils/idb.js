import { openDB } from "idb";
import tripsData from "../data/trips.json";

const DB_NAME = "tripDB";
const DB_VERSION = 1;
const STORE_NAME = "trips";

// Open the IndexedDB database
export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    },
  });
};

// Insert data into the store
export const insertTrips = async (trips) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  // Add all trips to the store
  trips.forEach(async (trip) => {
    await store.put(trip);
  });

  await tx.done;
};

// Fetch all trips from the store
export const getTrips = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

export const deleteTrip = async (tripId) => {
  const db = await initDB(); // Initialize the database
  const tx = db.transaction(STORE_NAME, "readwrite"); // Open a transaction
  const store = tx.objectStore(STORE_NAME); // Get the object store

  await store.delete(tripId); // Delete the trip by its ID

  await tx.done; // Ensure the transaction is complete
};

export const loadTripsIntoIndexedDB = async () => {
  const storedTrips = await getTrips();

  if (storedTrips.length === 0) {
    // No trips found, populate from JSON
    await insertTrips(tripsData.trips);
    console.log("Trips data inserted into IndexedDB");
  } else {
    console.log("Trips data already exists in IndexedDB");
  }
};

loadTripsIntoIndexedDB();
