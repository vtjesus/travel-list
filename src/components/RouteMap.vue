<script setup>
import { onMounted, watch, ref } from "vue";
import L from "leaflet";
import PrimaryBtn from "./PrimaryBtn.vue";
import { useIconsStore } from "../stores/icons"; // Import the icons store
// Props
const props = defineProps({
  stops: Array,
  hotel: Object,
});

let map;
const iconsStore = useIconsStore(); // Initialize the icons store

// create a polyline from an array of LatLng points
const latlngs = [];

// Example for stop marker

const initializeMap = () => {
  if (props.hotel === null) {
    map = L.map("map", {
      center: [props.stops[0].latitude, props.stops[0].longitude], //@1stStop
      zoom: 11,
    });
    latlngs.push([props.stops[0].latitude, props.stops[0].longitude]);
  } else {
    map = L.map("map", {
      center: [props.hotel.latitude, props.hotel.longitude], //@hotel
      zoom: 12,
    });
    latlngs.push([props.hotel.latitude, props.hotel.longitude]);
  }
  if (props.hotel) {
    L.marker([props.hotel.latitude, props.hotel.longitude], {
      icon: iconsStore.getHotelIcon,
    })
      .addTo(map)
      .bindPopup(`<b>${props.hotel.name}</b>`);
  }
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);
  // To ensure map renders correctly
  map.invalidateSize();
  props.stops.forEach((stop) => {
    L.marker([stop.latitude, stop.longitude], { icon: iconsStore.getStopIcon })
      .addTo(map)
      .bindPopup(`<b>${stop.title}</b>`);
    latlngs.push([stop.latitude, stop.longitude]);
  });
  let polyline = L.polyline(latlngs, { color: "#583D72" }).addTo(map);
  map.fitBounds(polyline.getBounds());
};

onMounted(() => {
  //tripsStore.loadTrips();
  initializeMap();
});
</script>

<template>
  <div
    class="modal-overlay fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50"
  >
    <div
      class="modal-container rounded-lg relative"
      style="width: 80%; height: 80%"
    >
      <div id="map" class="map-container w-full h-full"></div>
    </div>
    <PrimaryBtn
      class="close-button absolute top-2 right-2 font-body text-xl"
      @click="$emit('close')"
      >X</PrimaryBtn
    >
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
