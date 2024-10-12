// stores/icons.js
import { defineStore } from "pinia";
import L from "leaflet";

export const useIconsStore = defineStore("icons", {
  state: () => ({
    // Example stop marker icon
    stopIcon: L.divIcon({
      html: '<i class="fas fa-map-marker-alt" style="color: #FF8474; font-size: 24px;"></i>',
      className: "custom-marker",
      iconSize: [30, 42],
      iconAnchor: [15, 42],
      popupAnchor: [0, -42],
    }),
    // Example restaurant marker icon
    restaurantIcon: L.divIcon({
      html: '<i class="fas fa-utensils" style="color: #9F5F80; font-size: 24px;"></i>',
      className: "custom-marker",
      iconSize: [30, 42],
      iconAnchor: [15, 42],
      popupAnchor: [0, -42],
    }),
    // Example hotel marker icon
    hotelIcon: L.divIcon({
      html: '<i class="fas fa-hotel" style="color: #583D72; font-size: 24px;"></i>',
      className: "custom-marker",
      iconSize: [30, 42],
      iconAnchor: [15, 42],
      popupAnchor: [0, -42],
    }),
  }),

  getters: {
    getStopIcon: (state) => state.stopIcon,
    getRestaurantIcon: (state) => state.restaurantIcon,
    getHotelIcon: (state) => state.hotelIcon,
  },
});
