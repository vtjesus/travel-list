<script setup>
import PrimaryBtn from "./PrimaryBtn.vue";
import SecondaryBtn from "./SecondaryBtn.vue";
import { useTripsStore } from "../stores/trips";
import { RouterLink } from "vue-router";
import LocationsMap from "./LocationsMap.vue";
import { ref, onMounted } from "vue";
const tripsStore = useTripsStore();
// Get image source utility function
const getImageSrc = (img) => {
  if (img.startsWith("data:image")) {
    return img;
  }
  // Otherwise, return the image from the public folder
  return `/images/${img}`;
};

// Define props to receive the trip object
const props = defineProps({
  trip: Object,
});

// Local state
let isModal = ref(false);
let isDeleteModal = ref(false);
const isDisabled = ref(false);
const screenWidth = window.screen.width;
const isSmScreen = screenWidth < 640;

const controlStopExistence = () => {
  // Check if all stops arrays in the days array are empty
  //The every() method returns true only if all elements in the array satisfy the condition.
  const allStopsEmpty = props.trip.days.every((day) => day.stops.length === 0);

  // Disable the button if all stops are empty
  isDisabled.value = allStopsEmpty;
};
// Trigger controlStopExistence on mount
onMounted(() => {
  controlStopExistence();
});
</script>
<template>
  <div
    class="trip-card md:max-w-md mx-auto shadow-lg mt-3 rounded-lg overflow-hidden realtive"
  >
    <div class="md:flex md:flex-col md:jusify-between relative">
      <div class="card-header">
        <figure class="h-80">
          <img
            class="h-full object-cover w-full"
            v-if="trip.cover !== ''"
            :src="getImageSrc(trip.cover)"
            :alt="trip.title"
          />
          <img v-else src="/images/default_pic.jpg" :alt="trip.title" />
        </figure>
      </div>
      <div
        v-if="isDeleteModal"
        class="top-0 bottom-0 bg-black bg-opacity-50 absolute w-full z-20"
      ></div>
      <!-- DELETE TRIP MODAL -->
      <div
        v-if="isDeleteModal && !isSmScreen"
        class="modal mx-auto mt-20 bg-white shadow-lg p-3 rounded-lg w-80 top-1/3 left-1/2 absolute z-50"
      >
        <h2 class="font-heading text-dark text-xl">
          Are you sure to DELETE this
          <span class="text-accent uppercase">{{ props.trip.title }} </span>
          trip?
        </h2>
        <div class="flex justify-end gap-1 mt-3">
          <PrimaryBtn @click="tripsStore.deleteTripFromDB(trip.id)"
            >Delete</PrimaryBtn
          >
          <SecondaryBtn @click="isDeleteModal = false">Cancel</SecondaryBtn>
        </div>
      </div>
      <div class="card-body p-2 relative">
        <div class="flex justify-between">
          <div class="text-sm mb-2">
            <h2 class="text-primary font-heading text-xl md:text-3xl">
              {{ trip.title }}
            </h2>

            <span class="font-body text-dark md:text-xl"
              >From: {{ trip.startDate }} </span
            ><br />
            <span v-if="trip.endDate" class="font-body md:text-xl">
              To: {{ trip.endDate }}</span
            >
          </div>
          <div
            @click="isModal = true"
            :class="{
              'bg-primary rounded-md p-2 text-xl  text-light self-start cursor-pointer hover:bg-dark':
                !isDisabled,
              'opacity-50 pointer-events-none': isDisabled,
            }"
          >
            <font-awesome-icon :icon="['fas', 'map-location-dot']" />
          </div>
        </div>

        <p class="text-sm md:text-2xl font-body leading-5">
          {{ trip.description }}
        </p>
      </div>
      <div class="card-footer p-3 flex flex-col gap-1">
        <PrimaryBtn class="w-full">
          <router-link :to="{ name: 'TripDetails', params: { id: trip.id } }">
            View Details
          </router-link>
        </PrimaryBtn>
        <SecondaryBtn @click="isDeleteModal = true">Delete Trip</SecondaryBtn>
      </div>
    </div>
  </div>
  <LocationsMap v-if="isModal" @close="isModal = false" :id="trip.id" />
  <!-- DELETE TRIP MODAL FOR SM -->
  <div
    v-if="isDeleteModal && isSmScreen"
    class="modal mx-auto mt-20 bg-white shadow-lg p-3 rounded-lg w-80 top-1/3 left-1/2 absolute z-50"
  >
    <h2 class="font-heading text-dark text-xl">
      Are you sure to DELETE this
      <span class="text-accent uppercase">{{ props.trip.title }} </span>
      trip?
    </h2>
    <div class="flex justify-end gap-1 mt-3">
      <PrimaryBtn @click="tripsStore.deleteTripFromDB(trip.id)"
        >Delete</PrimaryBtn
      >
      <SecondaryBtn @click="isDeleteModal = false">Cancel</SecondaryBtn>
    </div>
  </div>
</template>
<style scoped>
.modal {
  transform: translateX(-50%);
}
</style>
