import { initDB } from "./idb";

// Function to update the 'visited' field for a specific stop within a trip
export const updateStopVisitedStatus = async (
  tripId,
  dayIndex,
  stopIndex,
  visitedStatus
) => {
  const db = await initDB();
  const tx = db.transaction("trips", "readwrite");
  const store = tx.objectStore("trips");

  // Retrieve the specific trip by ID
  const trip = await store.get(tripId);

  if (trip) {
    // Check if the specified day and stop exist
    if (
      trip.days &&
      trip.days[dayIndex] &&
      trip.days[dayIndex].stops &&
      trip.days[dayIndex].stops[stopIndex]
    ) {
      // Modify the 'visited' field of the specific stop
      trip.days[dayIndex].stops[stopIndex].visited = visitedStatus;

      // Store the updated trip back in the store
      await store.put(trip);
      // console.log(
      //   `Stop with index ${stopIndex} in day ${dayIndex} of trip with ID ${tripId} updated successfully.`
      // );
    } else {
      console.error(
        `Specified day or stop not found in trip with ID ${tripId}.`
      );
    }
  } else {
    console.error(`Trip with ID ${tripId} not found.`);
  }

  await tx.done;
};

export const updateTripNotes = async (tripId, notes) => {
  const db = await initDB();
  const tx = db.transaction("trips", "readwrite");
  const store = tx.objectStore("trips");

  // Retrieve the specific trip by ID
  const trip = await store.get(tripId);

  if (trip) {
    // Modify the 'notes' field
    trip.notes = notes;

    // Store the updated trip back in the store
    await store.put(trip);
    // console.log(`Trip with ID ${tripId} notes updated successfully.`);
  } else {
    console.error(`Trip with ID ${tripId} not found.`);
  }

  await tx.done;
};

// Function to add a new stop to a specific day within a trip
export const addStop = async (tripId, dayIndex, stop) => {
  const db = await initDB();
  const tx = db.transaction("trips", "readwrite");
  const store = tx.objectStore("trips");

  // Retrieve the specific trip by ID
  const trip = await store.get(tripId);

  if (trip) {
    // Ensure the day exists
    if (!trip.days || !trip.days[dayIndex]) {
      console.error(
        `Day with index ${dayIndex} not found in trip with ID ${tripId}.`
      );
      return;
    }

    // Initialize stops array if it doesn't exist
    if (!trip.days[dayIndex].stops) {
      trip.days[dayIndex].stops = [];
    }

    // Add the new stop to the day's stops
    trip.days[dayIndex].stops.push(stop);

    // Store the updated trip back in the store
    await store.put(trip);
    console.log(
      `Stop added successfully to day ${dayIndex} of trip with ID ${tripId}.`
    );
  } else {
    console.error(`Trip with ID ${tripId} not found.`);
  }

  await tx.done;
};

export const deleteStop = async (tripId, dayIndex, stop) => {
  const db = await initDB();
  const tx = db.transaction("trips", "readwrite");
  const store = tx.objectStore("trips");

  // Retrieve the specific trip by ID
  const trip = await store.get(tripId);

  if (trip) {
    // Ensure the day and stop exist

    if (
      trip.days &&
      trip.days[dayIndex] &&
      trip.days[dayIndex].stops &&
      trip.days[dayIndex].stops[stop]
    ) {
      // Remove the stop from the stops array
      trip.days[dayIndex].stops.splice(stop, 1);

      // Store the updated trip back in the store
      await store.put(trip);
      console.log(
        `Stop with index ${stop} deleted from day ${dayIndex} of trip with ID ${tripId}.`
      );
    } else {
      console.error(
        `Day or stop with the given index not found in trip with ID ${tripId}.`
      );
    }
  } else {
    console.error(`Trip with ID ${tripId} not found.`);
  }

  await tx.done;
};

export const addHotel = async (tripId, hotel) => {
  const db = await initDB();
  const tx = db.transaction("trips", "readwrite");
  const store = tx.objectStore("trips");

  // Retrieve the specific trip by ID
  const trip = await store.get(tripId);

  if (trip) {
    // Initialize hotels array if it doesn't exist
    if (!trip.hotels) {
      trip.hotels = [];
    }

    // Add the new hotel to the day's hotels
    trip.hotels.push(hotel);

    // Store the updated trip back in the store
    await store.put(trip);
    console.log(`Hotel added successfully to trip with ID ${tripId}.`);
  } else {
    console.error(`Trip with ID ${tripId} not found.`);
  }

  await tx.done;
};
///////////////////////////DELETE HOTEL//////////////////////////////////////
export const deleteHotel = async (tripId, hotelIndex) => {
  const db = await initDB();
  const tx = db.transaction("trips", "readwrite");
  const store = tx.objectStore("trips");

  // Retrieve the specific trip by ID
  const trip = await store.get(tripId);

  if (trip) {
    // Ensure the day and hotel exist
    if (trip.hotels[hotelIndex]) {
      // Remove the hotel from the hotels array
      trip.hotels.splice(hotelIndex, 1);

      // Store the updated trip back in the store
      await store.put(trip);
      console.log(
        `Hotel with index ${hotelIndex} deleted from trip with ID ${tripId}.`
      );
    } else {
      console.error(
        `Day or hotel with the given index not found in trip with ID ${tripId}.`
      );
    }
  } else {
    console.error(`Trip with ID ${tripId} not found.`);
  }

  await tx.done;
};
///////ADD RISTO////////////////////////
export const addRestaurant = async (tripId, restaurant) => {
  const db = await initDB();
  const tx = db.transaction("trips", "readwrite");
  const store = tx.objectStore("trips");

  // Retrieve the specific trip by ID
  const trip = await store.get(tripId);

  if (trip) {
    // Initialize restaurants array if it doesn't exist
    if (!trip.restaurants) {
      trip.restaurants = [];
    }

    // Add the new restaurant to the day's restaurants
    trip.restaurants.push(restaurant);

    // Store the updated trip back in the store
    await store.put(trip);
    console.log(`Restaurant added successfully to trip with ID ${tripId}.`);
  } else {
    console.error(`Trip with ID ${tripId} not found.`);
  }

  await tx.done;
};
//////////////////////DELETE RISTO////////////////
export const deleteRestaurant = async (tripId, restaurantIndex) => {
  const db = await initDB();
  const tx = db.transaction("trips", "readwrite");
  const store = tx.objectStore("trips");

  // Retrieve the specific trip by ID
  const trip = await store.get(tripId);

  if (trip) {
    // Ensure the day and restaurant exist
    if (trip.restaurants[restaurantIndex]) {
      // Remove the restaurant from the restaurants array
      trip.restaurants.splice(restaurantIndex, 1);

      // Store the updated trip back in the store
      await store.put(trip);
      console.log(
        `Restaurant with index ${restaurantIndex} deleted from trip with ID ${tripId}.`
      );
    } else {
      console.error(
        `Day or restaurant with the given index not found in trip with ID ${tripId}.`
      );
    }
  } else {
    console.error(`Trip with ID ${tripId} not found.`);
  }

  await tx.done;
};
