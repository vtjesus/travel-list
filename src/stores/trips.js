import { defineStore } from "pinia";
import { getTrips, deleteTrip } from "../utils/idb";
import {
  updateTripNotes,
  addStop,
  deleteStop,
  addHotel,
  deleteHotel,
  addRestaurant,
  deleteRestaurant,
} from "../utils/idbUtils";

export const useTripsStore = defineStore("trips", {
  state: () => ({
    allTrips: [],
  }),
  actions: {
    async loadTrips() {
      this.allTrips = await getTrips(); // Load data from IndexedDB
    },
    updateTripNotes(tripId, note) {
      const trip = this.allTrips.find((trip) => trip.id === parseInt(tripId));
      if (trip) {
        trip.notes = note; // Update the note locally in the state
        updateTripNotes(tripId, note); // Persist the note to IndexedDB
      }
    },
    // Delete a trip from IndexedDB and update the local state
    async deleteTripFromDB(tripId) {
      await deleteTrip(tripId); // Delete the trip from IndexedDB

      // Remove the deleted trip from the local state
      this.allTrips = this.allTrips.filter((trip) => trip.id !== tripId);
      window.location.reload();
    },

    async addStopToTrip(tripId, dayIndex, stop) {
      const trip = this.allTrips.find((trip) => trip.id === parseInt(tripId));
      if (trip) {
        if (!trip.days || !trip.days[dayIndex]) {
          console.error(
            `Day with index ${dayIndex} not found in trip with ID ${tripId}.`
          );
          return;
        }

        // Add the stop to the specified day in the trip state
        if (!trip.days[dayIndex].stops) {
          trip.days[dayIndex].stops = [];
        }
        trip.days[dayIndex].stops.push(stop);

        // Persist the stop to IndexedDB
        await addStop(tripId, dayIndex, stop);
      } else {
        console.error(`Trip with ID ${tripId} not found.`);
      }
    },
    async deleteStopFromTrip(tripId, dayIndex, stopIndex) {
      const trip = this.allTrips.find((trip) => trip.id === parseInt(tripId));
      if (trip) {
        if (!trip.days || !trip.days[dayIndex]) {
          console.error(
            `Day with index ${dayIndex} not found in trip with ID ${tripId}.`
          );
          return;
        }

        // Check if the stop exists at the given stopIndex
        if (
          !trip.days[dayIndex].stops ||
          !trip.days[dayIndex].stops[stopIndex]
        ) {
          console.error(
            `Stop with index ${stopIndex} not found on day ${dayIndex} of trip with ID ${tripId}.`
          );
          return;
        }

        // Remove the stop from the local state
        trip.days[dayIndex].stops.splice(stopIndex, 1);

        // Persist the deletion to IndexedDB
        await deleteStop(tripId, dayIndex, stopIndex);
      } else {
        console.error(`Trip with ID ${tripId} not found.`);
      }
    },
    // Add a hotel to a trip both in local state and IndexedDB
    async addHotelToTrip(tripId, hotel) {
      const trip = this.allTrips.find((trip) => trip.id === parseInt(tripId));
      if (trip) {
        // Add the hotel to the specified day in the trip state
        if (!trip.hotels) {
          trip.hotels = [];
        }
        trip.hotels.push(hotel);

        // Persist the hotel to IndexedDB
        await addHotel(tripId, hotel);
      } else {
        console.error(`Trip with ID ${tripId} not found.`);
      }
    },

    // Delete a hotel from a trip both in local state and IndexedDB
    async deleteHotelFromTrip(tripId, hotelIndex) {
      const trip = this.allTrips.find((trip) => trip.id === parseInt(tripId));
      if (trip) {
        // Check if the hotel exists at the given hotelIndex
        if (!trip.hotels || !trip.hotels[hotelIndex]) {
          console.error(
            `Hotel with index ${hotelIndex} in trip with ID ${tripId}.`
          );
          return;
        }

        // Remove the hotel from the local state

        trip.hotels.splice(hotelIndex, 1);

        // Persist the deletion to IndexedDB
        await deleteHotel(tripId, hotelIndex);
      } else {
        console.error(`Trip with ID ${tripId} not found.`);
      }
    },

    // Add a restaurant to a trip both in local state and IndexedDB
    async addRestaurantToTrip(tripId, restaurant) {
      const trip = this.allTrips.find((trip) => trip.id === parseInt(tripId));
      if (trip) {
        // Add the restaurant to the specified day in the trip state
        if (!trip.restaurants) {
          trip.restaurants = [];
        }
        trip.restaurants.push(restaurant);

        // Persist the restaurant to IndexedDB
        await addRestaurant(tripId, restaurant);
      } else {
        console.error(`Trip with ID ${tripId} not found.`);
      }
    },

    // Delete a restaurant from a trip both in local state and IndexedDB
    async deleteRestaurantFromTrip(tripId, restaurantIndex) {
      const trip = this.allTrips.find((trip) => trip.id === parseInt(tripId));
      if (trip) {
        // Check if the restaurant exists at the given restaurantIndex

        if (!trip.restaurants || !trip.restaurants[restaurantIndex]) {
          console.error(
            `Restaurant with index ${restaurantIndex} not found in trip with ID ${tripId}.`
          );
          return;
        }

        // Remove the restaurant from the local state
        trip.restaurants.splice(restaurantIndex, 1);

        // Persist the deletion to IndexedDB
        await deleteRestaurant(tripId, restaurantIndex);
      } else {
        console.error(`Trip with ID ${tripId} not found.`);
      }
    },
  },
});
