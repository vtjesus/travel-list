<script setup>
import { useRoute } from "vue-router";
import { computed, onMounted, ref, watch } from "vue";
import { useTripsStore } from "../stores/trips";
import AddStopModal from "../components/AddStopModal.vue";
import PrimaryBtn from "../components/PrimaryBtn.vue";
import DayCard from "../components/DayCard.vue";
import RouteMap from "../components/RouteMap.vue";
import DeleteModal from "../components/DeleteModal.vue";
import moment from "moment";
import { updateStopVisitedStatus } from "../utils/idbUtils";

const route = useRoute();
const tripsStore = useTripsStore();
const tripId = computed(() => route.params.id);

const trip = computed(() =>
  tripsStore.allTrips.find((trip) => trip.id === parseInt(tripId.value))
);
let isModal = ref(false);
const selectedDayStops = ref([]);
const selectedHotel = ref(null);
let isNoteModal = ref(false);
let note = ref("");
let hasValidStops = false;
const canShowMap = ref(false);
const isStopModal = ref(false);
const isDeleteModal = ref(false);
const currentDayIndex = ref(null);
const currentIndex = ref(null);
const currentName = ref("");
let stopF = "stop";
let hotelF = "hotel";
let ristoF = "risto";
let flag = "";

// Function to toggle visited status of stops and save to indexedDB
const checkVisited = (stop, tripId, dayIndex, stopIndex) => {
  stop.visited = !stop.visited;
  tripId = Number(tripId);

  updateStopVisitedStatus(tripId, stopIndex, dayIndex, stop.visited);
};

const openMap = (day) => {
  if (!canShowMap.value) return;

  selectedDayStops.value = day.stops.map((stop) => ({
    title: stop.title,
    latitude: stop.latitude,
    longitude: stop.longitude,
  }));

  if (trip.value.hotels && trip.value.hotels.length > 0) {
    const dayDate = moment(day.date);

    selectedHotel.value = trip.value.hotels.find((hotel) => {
      const checkInDate = moment(hotel.checkIn);
      const checkOutDate = moment(hotel.checkOut);
      return dayDate.isBetween(checkInDate, checkOutDate, "days", "[]");
    });
  } else {
    selectedHotel.value = null;
  }
  isModal.value = true;
};

watch(
  () => isNoteModal.value,
  (newVal) => {
    if (newVal && trip.value) {
      note.value = trip.value.notes || "";
    }
  }
);

const submitNote = (id, n) => {
  id = Number(id);
  tripsStore.updateTripNotes(id, n);
  isNoteModal.value = false;
};

const getImageSrc = (img) => {
  if (img.startsWith("data:image")) {
    return img;
  }

  return `/images/${img}`;
};

const disableMap = (trip) => {
  // If trip or days data is not available, disable the map
  if (!trip || !trip.days) {
    canShowMap.value = false;
    return;
  }

  // Loop through each day in the trip
  trip.days.forEach((day) => {
    // If there are stops, check for valid latitude and longitude
    if (day.stops.length > 0) {
      hasValidStops = true;

      day.stops.forEach((stop) => {
        if (stop.latitude && stop.longitude) {
          hasValidStops = true; // Found at least one valid stop
        }
      });
    }
  });

  // Set canShowMap to true if there is at least one valid stop, otherwise false
  canShowMap.value = hasValidStops;
};
const openAddStops = (i, f) => {
  currentDayIndex.value = i;
  //console.log(currentDayIndex.value);
  isStopModal.value = true;
  flag = f;
};

const closeAddStop = () => {
  isStopModal.value = false;
  currentDayIndex.value = null;
};

const openDeleteModal = (di, i, f, n) => {
  isDeleteModal.value = true;

  currentDayIndex.value = di;

  currentIndex.value = i;
  currentName.value = n;
  flag = f;
};

const closeDeleteModal = () => {
  isDeleteModal.value = false;
  currentDayIndex.value = null;
  currentIndex.value = null;
  currentName.value = "";
};

onMounted(() => {
  tripsStore.loadTrips();
  watch(
    () => trip.value,
    (newTrip) => {
      if (newTrip) {
        disableMap(newTrip);
      }
    },
    { immediate: true } // Call the watcher immediately upon mounting
  );
});
</script>

<template class="relative">
  <div
    class="bg-light rounded-t-lg mt-14 md:mt-20 p-3 main-container md:text-lg lg:px-10 relative"
    :class="{ 'overflow-hidden': isDeleteModal || isStopModal || isNoteModal }"
  >
    <div class="relative" v-if="trip">
      <div
        v-if="isDeleteModal || isStopModal || isNoteModal"
        class="top-0 bottom-0 bg-black bg-opacity-50 fixed z-10 left-0 right-0"
      ></div>
      <div class="lg:flex">
        <div class="flex flex-col md:flex-row md:w-10/11">
          <div
            class="lg:flex text-xs md:p-3 pt-1 text-dark font-body md:w-full md:gap-2"
          >
            <div class="md:w-1/2 md:order-2">
              <h1
                class="text-accent text-xl font-semibold font-heading md:text-4xl"
              >
                {{ trip.title }}
              </h1>
              <p class="md:text-xl">
                <span v-if="trip.endDate"> From:</span> <span v-else>On:</span>
                {{ trip.startDate }}
              </p>
              <p class="md:text-xl" v-if="trip.endDate">
                To: {{ trip.endDate }}
              </p>
            </div>
            <figure
              class="w-64 md:w-1/2 lg:w-full rounded-md overflow-hidden md:order-1"
            >
              <img
                v-if="trip.cover"
                class="w-full"
                :src="getImageSrc(trip.cover)"
                :alt="trip.title"
              />
              <img
                v-else
                class="w-full"
                src="/images/default_pic.jpg"
                :alt="trip.title"
              />
            </figure>
          </div>
        </div>

        <div class="lg:w-1/2">
          <div class="py-1 md:w-full">
            <p class="text-dark font-body text-sm md:text-2xl">
              <strong>Description:</strong> {{ trip.description }}
            </p>
            <div
              v-if="trip.notes"
              class="text-dark font-body text-sm mt-2 flex justify-between items-start md:text-2xl"
            >
              <p>
                <strong>Notes:</strong> <br />
                {{ trip.notes }}
              </p>
              <PrimaryBtn @click="isNoteModal = true" class="text-xl"
                ><i class="fa-solid fa-pencil"></i>
              </PrimaryBtn>
            </div>
            <!-- If No notes -->
            <p class="text-dark font-body md:text-2xl mt-2" v-else>
              <strong>Add Notes: </strong>
              <PrimaryBtn
                @click="isNoteModal = true"
                class="text-xl md:text-2xl ms-2 md:w-12 aspect-square"
                ><i class="fa-solid fa-pencil"></i
              ></PrimaryBtn>
            </p>
          </div>
        </div>
      </div>

      <!-- Stops -->
      <h2
        class="font-heading text-dark font-bold md:text-2xl mt-2"
        v-if="trip.days"
      >
        Stops:
      </h2>
      <div
        class="mt-2 md:flex md:flex-col md:start md:gap-2 md:mt-4"
        v-for="(day, dayIndex) in trip.days"
        :key="dayIndex"
      >
        <div class="flex justify-between md:justify-start md:gap-4">
          <h1 class="font-heading text-dark text-lg md:text-3xl">
            Day {{ dayIndex + 1 }}
          </h1>
          <div v-if="day.stops.length > 0" @click="openMap(day)">
            <font-awesome-icon
              :class="{
                'bg-primary rounded-md p-2 md:p-4 text-xl md:text-2xl text-light self-start cursor-pointer hover:bg-dark ':
                  canShowMap,
                'opacity-50 pointer-events-none': !canShowMap,
              }"
              :icon="['fas', 'map-location-dot']"
            />
          </div>
        </div>
        <div class="md:flex md:flex-col md:gap-2 md:w-2/3">
          <h3 class="font-heading text-dark md:text-xl">date:{{ day.date }}</h3>
          <PrimaryBtn class="self-start" @click="openAddStops(dayIndex, stopF)"
            >Add Stop</PrimaryBtn
          >
        </div>
        <div class="md:flex md:items-stretch md:flex-wrap">
          <div
            class="w-full flex shadow-xl rounded-md overflow-hidden justify-between md:w-1/2 lg:w-1/3 relative"
            v-for="(stop, stopIndex) in day.stops"
            :key="stopIndex"
          >
            <DayCard class="relative" :modal="isDeleteModal">
              <template v-slot:header>
                <svg
                  @click="checkVisited(stop, tripId, stopIndex, dayIndex)"
                  id="visited-icon"
                  :class="{ active: stop.visited }"
                  class=""
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path
                    d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"
                  />
                </svg>

                <svg
                  class="fill-dark"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path
                    d="M240.1 4.2c9.8-5.6 21.9-5.6 31.8 0l171.8 98.1L448 104l0 .9 47.9 27.4c12.6 7.2 18.8 22 15.1 36s-16.4 23.8-30.9 23.8L32 192c-14.5 0-27.2-9.8-30.9-23.8s2.5-28.8 15.1-36L64 104.9l0-.9 4.4-1.6L240.1 4.2zM64 224l64 0 0 192 40 0 0-192 64 0 0 192 48 0 0-192 64 0 0 192 40 0 0-192 64 0 0 196.3c.6 .3 1.2 .7 1.8 1.1l48 32c11.7 7.8 17 22.4 12.9 35.9S494.1 512 480 512L32 512c-14.1 0-26.5-9.2-30.6-22.7s1.1-28.1 12.9-35.9l48-32c.6-.4 1.2-.7 1.8-1.1L64 224z"
                  />
                </svg>
              </template>
              <template v-slot:body>
                <div class="p-2 font-body text-dark">
                  <h3 class="font-heading text-accent text-sm md:text-2xl">
                    {{ stop.title }}
                  </h3>
                  <p class="text-dark font-body text-xs md:text-xl">
                    {{ stop.description }}
                  </p>
                  <p
                    v-if="stop.notes"
                    class="text-dark font-body text-xs mt-1 md:text-lg"
                  >
                    <strong>Notes:</strong>
                    {{ stop.notes }}
                  </p>
                </div>
              </template>
            </DayCard>

            <div class="flex items-start md:absolute md:top-1 md:right-1">
              <PrimaryBtn
                @click="openDeleteModal(dayIndex, stopIndex, stopF, stop.title)"
                class="felx justify-center items-center p-2 m-2 md:w-10 md:text-2xl bin"
                ><i class="fa-solid fa-trash-can"></i
              ></PrimaryBtn>
            </div>
          </div>
        </div>
      </div>
      <!-- Hotels and Ristos -->
      <h2
        class="font-heading text-dark pt-2 font-bold my-2"
        v-if="trip.endDate"
      >
        Stays:
      </h2>
      <div v-if="trip.endDate">
        <PrimaryBtn @click="openAddStops(_, hotelF)">Add Stay</PrimaryBtn>
      </div>
      <div class="mt-2 md:flex md:flex-wrap">
        <div
          class="w-full flex shadow-xl rounded-md overflow-hidden justify-between md:w-1/2 lg:w-1/3 relative"
          v-for="(hotel, hotelIndex) in trip.hotels"
          :key="hotelIndex"
        >
          <DayCard class="relative" v-if="trip.hotels">
            <template v-slot:header
              ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path
                  d="M0 32C0 14.3 14.3 0 32 0L480 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l0 384c17.7 0 32 14.3 32 32s-14.3 32-32 32l-176 0 0-48c0-26.5-21.5-48-48-48s-48 21.5-48 48l0 48L32 512c-17.7 0-32-14.3-32-32s14.3-32 32-32L32 64C14.3 64 0 49.7 0 32zm96 80l0 32c0 8.8 7.2 16 16 16l32 0c8.8 0 16-7.2 16-16l0-32c0-8.8-7.2-16-16-16l-32 0c-8.8 0-16 7.2-16 16zM240 96c-8.8 0-16 7.2-16 16l0 32c0 8.8 7.2 16 16 16l32 0c8.8 0 16-7.2 16-16l0-32c0-8.8-7.2-16-16-16l-32 0zm112 16l0 32c0 8.8 7.2 16 16 16l32 0c8.8 0 16-7.2 16-16l0-32c0-8.8-7.2-16-16-16l-32 0c-8.8 0-16 7.2-16 16zM112 192c-8.8 0-16 7.2-16 16l0 32c0 8.8 7.2 16 16 16l32 0c8.8 0 16-7.2 16-16l0-32c0-8.8-7.2-16-16-16l-32 0zm112 16l0 32c0 8.8 7.2 16 16 16l32 0c8.8 0 16-7.2 16-16l0-32c0-8.8-7.2-16-16-16l-32 0c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16l0 32c0 8.8 7.2 16 16 16l32 0c8.8 0 16-7.2 16-16l0-32c0-8.8-7.2-16-16-16l-32 0zM328 384c13.3 0 24.3-10.9 21-23.8c-10.6-41.5-48.2-72.2-93-72.2s-82.5 30.7-93 72.2c-3.3 12.8 7.8 23.8 21 23.8l144 0z"
                />
              </svg>
            </template>
            <template v-slot:body>
              <div class="font-body text-dark p-2">
                <h3 class="font-heading text-accent text-lg md:text-2xl">
                  {{ hotel.name }}
                </h3>
                <p class="text-xs md:text-lg">
                  <i class="fa-solid fa-map-pin"></i> {{ hotel.address }}
                </p>
                <p class="text-xs md:text-lg">
                  Check-In Date: {{ hotel.checkIn }}
                </p>
                <p class="text-xs md:text-lg">
                  Check-Out Date: {{ hotel.checkOut }}
                </p>
              </div>
            </template>
          </DayCard>
          <div
            class="flex items-center self-start md:absolute md:top-1 md:right-1"
          >
            <PrimaryBtn
              v-if="trip.hotels"
              @click="openDeleteModal(_, hotelIndex, hotelF, hotel.name)"
              class="felx justify-center items-center p-2 m-2 md:w-10 md:text-2xl bin"
              ><i class="fa-solid fa-trash-can"></i
            ></PrimaryBtn>
          </div>
        </div>
      </div>
      <!-- RESTAURANT SECTION -->
      <h2 class="font-heading text-dark pt-3 md:my-3 font-bold md:font-xl">
        Eats:
      </h2>
      <div>
        <PrimaryBtn @click="openAddStops(_, ristoF)">Add risto</PrimaryBtn>
      </div>
      <div class="mt-2 md:flex md:items-center md:flex-wrap">
        <div
          class="w-full flex shadow-xl rounded-md overflow-hidden justify-between md:w-1/2 lg:w-1/3 md:relative"
          v-for="(risto, ristoIndex) in trip.restaurants"
          :key="ristoIndex"
        >
          <DayCard class="md:w-full" v-if="trip.restaurants">
            <template v-slot:header>
              <svg
                class="cursor-pointer"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path
                  d="M416 0C400 0 288 32 288 176l0 112c0 35.3 28.7 64 64 64l32 0 0 128c0 17.7 14.3 32 32 32s32-14.3 32-32l0-128 0-112 0-208c0-17.7-14.3-32-32-32zM64 16C64 7.8 57.9 1 49.7 .1S34.2 4.6 32.4 12.5L2.1 148.8C.7 155.1 0 161.5 0 167.9c0 45.9 35.1 83.6 80 87.7L80 480c0 17.7 14.3 32 32 32s32-14.3 32-32l0-224.4c44.9-4.1 80-41.8 80-87.7c0-6.4-.7-12.8-2.1-19.1L191.6 12.5c-1.8-8-9.3-13.3-17.4-12.4S160 7.8 160 16l0 134.2c0 5.4-4.4 9.8-9.8 9.8c-5.1 0-9.3-3.9-9.8-9L127.9 14.6C127.2 6.3 120.3 0 112 0s-15.2 6.3-15.9 14.6L83.7 151c-.5 5.1-4.7 9-9.8 9c-5.4 0-9.8-4.4-9.8-9.8L64 16zm48.3 152l-.3 0-.3 0 .3-.7 .3 .7z"
                />
              </svg>
            </template>
            <template v-slot:body>
              <div class="ps-2 font-body text-dark p-2">
                <h3 class="font-heading text-accent text-lg md:text-2xl">
                  {{ risto.name }}
                </h3>
                <p class="text-xs md:text-lg">
                  <i class="fa-solid fa-map-pin"></i> {{ risto.address }}
                </p>
                <p class="text-xs md:text-lg">
                  <i class="fa-solid fa-plate-wheat"></i> {{ risto.type }}
                </p>
              </div>
            </template>
          </DayCard>
          <div
            class="flex justify-end items-start md:absolute md:top-1 md:right-1"
          >
            <PrimaryBtn
              v-if="trip.hotels"
              @click="openDeleteModal(_, ristoIndex, ristoF, risto.name)"
              class="felx justify-center items-center p-2 m-2 md:w-10 md:text-2xl bin"
              ><i class="fa-solid fa-trash-can"></i
            ></PrimaryBtn>
          </div>
        </div>
      </div>
    </div>

    <RouteMap
      v-if="isModal"
      :stops="selectedDayStops"
      :hotel="selectedHotel"
      @close="isModal = false"
      class="z-50"
    />
  </div>
  <!-- DELETE MODAL -->
  <DeleteModal
    v-if="isDeleteModal"
    @close="closeDeleteModal"
    :tripId="trip.id"
    :dayIndex="currentDayIndex"
    :itemId="currentIndex"
    :flag="flag"
    :name="currentName"
  />
  <!-- ADD STOP MODAL -->
  <AddStopModal
    class="z-10"
    v-if="isStopModal"
    @close="closeAddStop"
    :trip-id="trip.id"
    :day-index="currentDayIndex"
    :flag="flag"
  />
  <!-- NOTE MODAL -->
  <div
    v-if="isNoteModal"
    class="modal rounded-lg w-80 bg-white flex flex-col align-center p-3 md:w-10/12 absolute top-14 md:top-1/4 left-1/2 z-20"
  >
    <h3 class="flex justify-between p-2 font-heading text-dark md:text-3xl">
      Add Note
      <PrimaryBtn
        class="close-button font-body text-xl"
        @click="isNoteModal = false"
        >X</PrimaryBtn
      >
    </h3>
    <textarea
      v-model="note"
      class="w-full border-2 border-gray-300 rounded-md font-body p-2 md:text-xl"
      cols="20"
      rows="10"
      :placeholder="trip.notes !== undefined ? '' : 'trip notes here'"
      >{{ trip.notes }}</textarea
    >
    <div>
      <PrimaryBtn
        class="mt-2 focus:outline-none focus:border-dark"
        @click="submitNote(tripId, note)"
        >Submit Note</PrimaryBtn
      >
    </div>
  </div>
</template>

<style scoped>
svg {
  fill: #583d72;
  width: 55px;
  margin: 0 auto;
}
#visited-icon {
  width: 25px;
  fill: gray;
  position: absolute;
  top: 0.2rem;
  left: 0.2rem;
}
#visited-icon:hover {
  transform: scale(1.2);
}
.active {
  fill: #ff8474 !important;
}
@media only screen and (min-width: 768px) {
  .bin {
    aspect-ratio: 1;
    padding: 0;
    width: 3rem;
  }
}
</style>
