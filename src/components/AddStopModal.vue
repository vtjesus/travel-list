<script setup>
import PrimaryBtn from "../components/PrimaryBtn.vue";
import {
  reactive,
  ref,
  watch,
  toRaw,
  defineEmits,
  computed,
  onMounted,
} from "vue";
import { useTripsStore } from "../stores/trips";

import axios from "axios";
import { debounce } from "lodash-es";
import moment from "moment";
const tripsStore = useTripsStore();
const address = ref("");
const suggestions = ref([]);
const errMsg = ref("");
const isSelected = ref(false);
const props = defineProps({
  tripId: {
    type: Number,
    required: true,
  },
  dayIndex: {
    type: Number,
    required: true,
  },
  flag: {
    type: String,
  },
});
const trip = tripsStore.allTrips.find((trip) => trip.id === props.tripId);
const emit = defineEmits(["close"]);
const newStop = reactive([
  {
    title: "",
    description: "",
    latitude: null,
    longitude: null,
    notes: "",
  },
]);

const newHotel = reactive([
  {
    name: "",
    address: address.value,
    checkIn: "",
    checkOut: "",
    latitude: null,
    longitude: null,
  },
]);

const newRisto = reactive([
  {
    name: "",
    address: address.value,
    type: "",
    latitude: null,
    longitude: null,
  },
]);

const validateDates = (date1, date2) => {
  errMsg.value = "";
  date1 = moment(date1).format("YYYY-MM-DD");
  date2 = moment(date2).format("YYYY-MM-DD");
  const startDate = moment(trip.startDate).format("YYYY-MM-DD");

  let dateExists;
  if (trip.hotels) {
    trip.hotels.forEach((hotel) => {
      // console.log(date1 == hotel.checkIn);
      let isPeriod = false;
      let date = moment(hotel.checkOut)
        .subtract(1, "days")
        .format("YYYY-MM-DD");

      if (
        moment(date1).isBetween(hotel.checkIn, date) ||
        moment(date2).isBetween(hotel.checkIn, hotel.checkOut)
      ) {
        isPeriod = true;
      }

      //if date exist
      if (date1 == hotel.checkIn || date2 == hotel.checkOut || isPeriod) {
        dateExists = true;
      } else {
        dateExists = false;
      }
    });
  }

  if (
    (moment(date1).isAfter(moment(startDate)) ||
      moment(date1).isSame(startDate)) &&
    !dateExists &&
    moment(date1).isBefore(date2)
  ) {
    return true;
  } else {
    if (dateExists) {
      errMsg.value =
        "Hotel already booked for this period select an other date or delete a previous accomodation";
    } else {
      if (!moment(date1).isBefore(date2)) {
        errMsg.value =
          "The check-out date can Not be earlier than check-in date";
      } else {
        errMsg.value =
          "The check-in date can Not be before than the trip starts";
      }
    }
  }
};

const fetchCoordinates = async () => {
  if (!address.value || isSelected.value == true) {
    return;
  }

  try {
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        address.value
      )}.json`,
      {
        params: {
          access_token: import.meta.env.VITE_API_KEY_MP,
          autocomplete: true,
          limit: 5,
        },
      }
    );
    if (response.data.features && response.data.features.length > 0) {
      // console.log(response.data.features);
      suggestions.value = response.data.features;
      console.log(suggestions.value);
    } else {
      console.error("No coordinates found for the given address");
    }
    //   const [longitude, latitude] =
    //     response.data.features[0].geometry.coordinates;
    //   //console.log(longitude, latitude);
    //   //  Create a new object to trigger reactivity

    //   console.log("Longitude:", longitude, "Latitude:", latitude);
  } catch (error) {
    console.error("Error fetching coordinates:", error);
  }
};

const debouncedFetchCoordinates = debounce(fetchCoordinates, 500);

watch(
  () => address.value,
  () => {
    debouncedFetchCoordinates();
  }
);

watch(
  () => newStop,
  (newValue) => {
    console.log("newStop updated:", newValue);
  },
  { deep: true } // Ensure deep watching of the object
);

watch(
  () => newHotel,
  (newValue) => {
    console.log("newHotel updated:", newValue);
  },
  { deep: true } // Ensure deep watching of the object
);

watch(
  () => newRisto,
  (newValue) => {
    console.log("newRisto updated:", newValue);
  },
  { deep: true } // Ensure deep watching of the object
);

const selectAddress = (i) => {
  const [longitude, latitude] = suggestions.value[i].geometry.coordinates;
  // console.log("Longitude:", longitude, "Latitude:", latitude);

  if (props.flag === "stop") {
    const updatedStop = {
      ...newStop, // Copy existing data
      latitude,
      longitude,
    };
    suggestions.value = [];
    // Update the singleStop reactive object
    newStop.title = updatedStop.title;
    newStop.description = updatedStop.description;
    newStop.latitude = updatedStop.latitude;
    newStop.longitude = updatedStop.longitude;
  } else if (props.flag === "hotel") {
    isSelected.value = true;
    address.value = suggestions.value[i].place_name;
    const updatedHotel = {
      ...newHotel, // Copy existing data
      latitude,
      longitude,
    };

    suggestions.value = [];

    newHotel.name = updatedHotel.name;
    newHotel.address = address.value;
    newHotel.checkIn = updatedHotel.checkIn;
    newHotel.checkOut = updatedHotel.checkOut;
    newHotel.latitude = updatedHotel.latitude;
    newHotel.longitude = updatedHotel.longitude;
  } else if (props.flag === "risto") {
    isSelected.value = true;
    address.value = suggestions.value[i].place_name;
    const updatedRisto = {
      ...newRisto, // Copy existing data
      latitude,
      longitude,
    };
    suggestions.value = [];
    // Update the singleStop reactive object
    newRisto.name = updatedRisto.name;
    newRisto.address = address.value;

    newRisto.latitude = updatedRisto.latitude;
    newRisto.longitude = updatedRisto.longitude;
  }
};

const saveItem = async () => {
  if (props.flag === "stop") {
    const stop = toRaw(newStop); // Convert to a plain object
    await tripsStore.addStopToTrip(props.tripId, props.dayIndex, stop);
    emit("close");
  } else if (props.flag === "hotel") {
    //console.log(newHotel);
    validateDates(newHotel.checkIn, newHotel.checkOut);
    if (!validateDates) {
      return;
    } else if (errMsg.value == "") {
      const hotel = toRaw(newHotel);
      //console.log(hotel);
      await tripsStore.addHotelToTrip(props.tripId, hotel);
      emit("close");
    }
  } else if (props.flag === "risto") {
    const risto = toRaw(newRisto);
    await tripsStore.addRestaurantToTrip(props.tripId, risto);
    emit("close");
  }
};

onMounted(() => {
  tripsStore.loadTrips();
  //console.log(trip);
});
</script>

<template>
  <form
    class="w-80 modal md:w-1/2 absolute top-0 left-1/2"
    @submit.prevent="saveItem"
  >
    <div
      v-if="errMsg !== ''"
      class="errs z-10 absolute top-1/2 w-96 p-5 bg-white text-accent"
    >
      <div
        class="p-2 md:p-5 flex mx-auto mt-20 bg-white shadow-lg rounded-lg overflow-hidden md:text-lg"
      >
        <p>{{ errMsg }}</p>
        <PrimaryBtn
          class="close-button font-body text-xl self-end"
          @click="errMsg = ''"
          >X</PrimaryBtn
        >
      </div>
    </div>
    <div
      class="p-2 md:p-5 mx-auto mt-20 bg-white shadow-lg rounded-lg overflow-hidden md:text-lg"
    >
      <h3 class="flex justify-between font-heading text-dark mt-1 md:text-2xl">
        Add {{ props.flag }} to the trip:
        <PrimaryBtn
          class="close-button font-body text-xl"
          @click="$emit('close')"
          >X</PrimaryBtn
        >
      </h3>

      <div class="mb-4" v-if="props.flag === 'stop'">
        <label class="block text-dark font-body mb-2" for="name"> </label>
        <input
          v-model="newStop.title"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-dark leading-tight focus:outline-none focus:shadow-outline"
          id="name"
          type="text"
          placeholder="City and Stop Name here"
          required
          maxlength="258"
        />
      </div>
      <div class="mb-4" v-if="props.flag === 'hotel'">
        <label class="block text-dark font-body mb-2 capitalize" for="name">
          {{ props.flag }} Name
        </label>
        <input
          v-model="newHotel.name"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-dark leading-tight focus:outline-none focus:shadow-outline"
          id="name"
          type="text"
          placeholder="Name of the Hotel here"
          required
          maxlength="258"
        />
      </div>
      <div class="mb-4" v-if="props.flag === 'risto'">
        <label class="block text-dark font-body mb-2 capitalize" for="name">
          Restaurant Name
        </label>
        <input
          v-model="newRisto.name"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-dark leading-tight focus:outline-none focus:shadow-outline"
          id="name"
          type="text"
          placeholder="Name of the Restaurant here"
          required
          maxlength="258"
        />
      </div>

      <div class="mb-4">
        <label class="block text-dark font-body mb-2" for="name">
          Location
        </label>
        <input
          v-model="address"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-dark leading-tight focus:outline-none focus:shadow-outline"
          id="name"
          type="text"
          :placeholder="
            props.flag === 'stop'
              ? 'Location name city full address here'
              : 'Full Address'
          "
          required
        />
        <ul
          v-if="suggestions.length > 0"
          class="absolute z-10 w-full bg-white shadow-md border rounded mt-1"
        >
          <li
            v-for="(suggestion, index) in suggestions"
            :key="index"
            class="p-2 hover:bg-gray-200 cursor-pointer text-xs"
            @click="selectAddress(index)"
          >
            {{ suggestion.place_name }}
          </li>
        </ul>
      </div>
      <div v-if="props.flag == 'stop'" class="mb-4">
        <label class="block text-dark font-body mb-2" for="message">
          Description
        </label>
        <textarea
          v-model="newStop.description"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-dark leading-tight focus:outline-none focus:shadow-outline"
          id="message"
          rows="4"
          placeholder="Description of the stop"
          required
          maxlength="5000"
        ></textarea>
      </div>
      <div v-if="props.flag === 'hotel'">
        <div class="mb-4">
          <label class="block text-dark font-body mb-2" for="date">
            Check-in Date
          </label>
          <input
            v-model="newHotel.checkIn"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-dark leading-tight focus:outline-none focus:shadow-outline"
            id="starDate"
            type="date"
            placeholder="Select a check-in date"
            required
          />
        </div>

        <div class="mb-4">
          <label class="block text-dark font-body mb-2" for="date">
            Check-out Date
          </label>
          <input
            v-model="newHotel.checkOut"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-dark leading-tight focus:outline-none focus:shadow-outline"
            id="starDate"
            type="date"
            placeholder="Select a check-in date"
            required
          />
        </div>
      </div>
      <div class="mb-4" v-if="props.flag === 'risto'">
        <label class="block text-dark font-body mb-2 capitalize" for="type">
          Type of the restaurant
        </label>
        <input
          v-model="newRisto.type"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-dark leading-tight focus:outline-none focus:shadow-outline"
          id="type"
          type="text"
          placeholder="Italian or Chinese"
          maxlength="124"
        />
      </div>

      <PrimaryBtn type="submit" class="capitalize">
        Save {{ props.flag }}
      </PrimaryBtn>
    </div>
  </form>
</template>

<style scoped></style>
