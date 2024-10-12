<script setup>
import { onMounted, onUpdated, computed } from "vue";
import L from "leaflet";
import PrimaryBtn from "./PrimaryBtn.vue";
import { useTripsStore } from "../stores/trips";
import { useIconsStore } from "../stores/icons";

const tripsStore = useTripsStore();
const iconsStore = useIconsStore();

const props = defineProps({
  id: Number,
});
const trips = computed(() => tripsStore.allTrips);
const currTrip = computed(() =>
  trips.value.find((trip) => trip.id === props.id)
);

let map;
const getMarkers = () => {
  //console.log(trips.value);

  currTrip.value.days.forEach((day) => {
    day.stops.forEach((stop) => {
      L.marker([stop.latitude, stop.longitude], {
        icon: iconsStore.getStopIcon,
      })
        .addTo(map)
        .bindPopup(`<b>${stop.title}</b>`);
    });
  });
  if (currTrip.value.hotels) {
    currTrip.value.hotels.forEach((hotel) => {
      //console.log(hotel);
      L.marker([hotel.latitude, hotel.longitude], {
        icon: iconsStore.getHotelIcon,
      })
        .addTo(map)
        .bindPopup(`<b>${hotel.name}</b>`)
        .openPopup();
    });
  }
  if (currTrip.value.restaurants) {
    currTrip.value.restaurants.forEach((restaurant) => {
      L.marker([restaurant.latitude, restaurant.longitude], {
        icon: iconsStore.getRestaurantIcon,
      })
        .addTo(map)
        .bindPopup(`<b>${restaurant.name}</b>`);
    });
  }
};

const initializeMap = () => {
  map = L.map("map", {
    center: [
      currTrip.value.days[0].stops[0].latitude,
      currTrip.value.days[0].stops[0].longitude,
    ],
    zoom: 10,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);

  // To ensure map renders correctly
  map.invalidateSize();
  getMarkers();
};

onMounted(() => {
  tripsStore.loadTrips();
  initializeMap();
});

onUpdated(() => {
  if (map) {
    map.invalidateSize(); // Ensure map resizes correctly
  }
});
</script>

<template>
  <div
    class="modal-overlay fixed top-0 z-10 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50"
  >
    <div class="modal-container rounded-lg" style="width: 80%; height: 80%">
      <PrimaryBtn
        class="close-button absolute top-2 right-2 font-body text-xl"
        @click="$emit('close')"
        >X</PrimaryBtn
      >
      <div id="map" class="map-container w-full h-full"></div>
    </div>
  </div>
</template>

<style scoped>
.modal-container {
  width: 80%;
  height: 80%;
}

.map-container {
  width: 100%;
  height: 100%;
}
</style>
