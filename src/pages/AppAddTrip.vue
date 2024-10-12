<script setup>
import PrimaryBtn from "../components/PrimaryBtn.vue";
import { reactive, ref, watch, toRaw, onMounted } from "vue";
import moment from "moment";
import { insertTrips } from "../utils/idb";

import { useImageStore } from "../stores/imageStore";
const imageStore = useImageStore();

const isSuccessMessage = ref(false);
const isOneDay = ref(false);
const successMessage = ref("");
const errMsg = ref("");
const now = moment().format("YYYY-MM-DD");
const datesArray = ref([]);
const isValidEndDate = ref(true);
const isValidStartDate = ref(null);
const daysToSign = reactive([]);
const newTrip = reactive({
  title: "",
  startDate: "",
  endDate: null,
  cover: "",
  description: "",
  days: daysToSign, // This will be populated with day objects
});

const calculateDays = (startDate, endDate) => {
  datesArray.value = [];

  if (isOneDay.value === true || !endDate) {
    datesArray.value.push(moment(startDate).format("YYYY-MM-DD"));
  } else if (startDate && endDate && isOneDay.value === false) {
    let currentDate = moment(startDate).format("YYYY-MM-DD");
    const formattedEndDate = moment(endDate).format("YYYY-MM-DD");

    datesArray.value.push(currentDate);

    while (currentDate !== formattedEndDate) {
      currentDate = moment(currentDate).add(1, "d").format("YYYY-MM-DD");
      datesArray.value.push(currentDate);
    }
  }

  // Populate `daysToSign` with day objects
  daysToSign.splice(0); // Clear the array first
  datesArray.value.forEach((date) => {
    daysToSign.push({
      date, // Set the date for the day
      stops: [], // Initialize with an empty stops array
    });
  });
};

// const createBase64Image = (file) => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       resolve(reader.result); // Base64 string
//     };
//     reader.onerror = reject;
//     reader.readAsDataURL(file);
//   });
// };

// const handleImage = async (e) => {
//   const selectedImage = e.target.files[0];
//   try {
//     const base64Image = await createBase64Image(selectedImage);
//     newTrip.cover = base64Image;
//   } catch (error) {
//     console.error("Error converting image to Base64:", error);
//   }
// };

const handleImage = async (e) => {
  const base64Image = await imageStore.handleImage(e); // Use the method from the store
  if (base64Image) {
    newTrip.cover = base64Image; // Set the base64 image to newTrip.cover
  }
};

watch(
  [() => newTrip.startDate, () => newTrip.endDate],
  ([startDate, endDate]) => {
    errMsg.value = "";
    isValidEndDate.value = true;
    if (isOneDay) {
      calculateDays(startDate, endDate); // Treat as a one-day trip
    } else {
      if (moment(newTrip.endDate).isAfter(newTrip.startDate)) {
        isValidEndDate.value = true;
        calculateDays(startDate, endDate); // Recalculate days when startDate or endDate changes
      } else {
        if (moment(endDate).isBefore(newTrip.startDate)) {
          isValidEndDate.value = false;
          errMsg.value = "End date can not before the start date";
        } else if (moment(newTrip.startDate).isBefore(now)) {
          errMsg.value = "Start date can not be erlier than today";
        }
      }
    }
  }
);

const validateStart = () => {
  errMsg.value = "";
  if (moment(newTrip.startDate).isAfter(now)) {
    isValidStartDate.value = true;
  } else {
    errMsg.value = "Trip start date can not be an earlier date than today!";
    isValidStartDate.value = false;
  }
};

const submitTrip = () => {
  errMsg.value = "";
  validateStart();
  //console.log("start:" + isValidStartDate.value);
  //console.log("end:" + isValidEndDate.value);

  if (
    isValidStartDate.value == true &&
    isValidEndDate.value == true &&
    newTrip.startDate !== newTrip.endDate
  ) {
    console.log(daysToSign);
    saveTrip();
  } else {
    if (moment(newTrip.endDate).isBefore(newTrip.startDate)) {
      errMsg.value = "Wrong End Date";
    }
    // console.log("nope");
  }
};

const saveTrip = async () => {
  try {
    const cleanDays = newTrip.days.map((day) => ({
      ...day,
      stops: day.stops.map((stop) => ({
        name: stop.name,
        description: stop.description,
        latitude: stop.latitude,
        longitude: stop.longitude,
        notes: stop.notes,
      })),
    }));

    const plainTrip = {
      title: newTrip.title,
      startDate: newTrip.startDate,
      endDate: newTrip.endDate,
      description: newTrip.description,
      days: cleanDays,
      cover: newTrip.cover,
    };

    await insertTrips([plainTrip]);
    isSuccessMessage.value = true;
    successMessage.value =
      "Trip saved successfully! To add stops and more, go to this newly created trip's details.";
    setTimeout(() => {
      window.location.reload(); // Refresh the page
    }, 2000);
  } catch (error) {
    console.error("Error saving trip:", error);
  }
};
</script>

<template>
  <div class="pb-20 rounded-xl overflow-hidden">
    <form
      @submit.prevent="submitTrip"
      class="max-w-md mx-auto mt-20 m bg-white shadow-lg rounded-lg overflow-auto"
    >
      <div
        class="md:text-2xl xs:text-lg rounded-t-md py-2 md:py-4 px-6 bg-accent text-white text-center font-heading uppercase"
      >
        Add a new trip
      </div>
      <div class="w-full text-accent text-center" v-if="errMsg !== ''">
        <h2>
          {{ errMsg }}
        </h2>
      </div>
      <div class="py-4 px-6">
        <div class="mb-4">
          <label class="block text-dark font-body mb-2" for="name">
            Title
          </label>
          <input
            v-model="newTrip.title"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-dark leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            placeholder="My holiday title"
            maxlength="256"
            required
          />
        </div>
        <div class="mb-5">
          <div class="flex items-center space-x-6">
            <div class="flex items-center">
              <input
                v-model="isOneDay"
                type="checkbox"
                name="checkbox"
                id="radioButton1"
                class="h-4 w-4"
              />
              <label
                for="radioButton1"
                class="pl-3 text-base font-body text-dark"
              >
                One day Trip
              </label>
            </div>
          </div>
        </div>
        <div class="mb-4">
          <label class="block text-dark font-body mb-2" for="date">
            Start Date
          </label>
          <input
            v-model="newTrip.startDate"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-dark leading-tight focus:outline-none focus:shadow-outline"
            id="starDate"
            type="date"
            placeholder="Select a date"
            required
          />
        </div>
        <div class="mb-4">
          <label class="block text-dark font-body mb-2" for="date">
            End Date
          </label>
          <input
            v-model="newTrip.endDate"
            :disabled="isOneDay"
            :class="
              isOneDay
                ? 'bg-slate-50 text-slate-500 border-slate-200 shadow-none'
                : ''
            "
            class="shadow appearance-none border rounded w-full py-2 px-3 text-dark leading-tight focus:outline-none focus:shadow-outline"
            id="endDate"
            type="date"
            placeholder="Select a date"
          />
        </div>
        <input
          @change="handleImage"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-dark leading-tight focus:outline-none focus:shadow-outline"
          type="file"
          accept="image/*"
        />

        <div class="mb-4">
          <label class="block text-dark font-body mb-2" for="message">
            Description
          </label>
          <textarea
            v-model="newTrip.description"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-dark leading-tight focus:outline-none focus:shadow-outline"
            id="message"
            rows="4"
            placeholder="Description of the journey goes here"
            maxlength="2048"
          ></textarea>
        </div>

        <div class="flex items-center justify-center mb-4">
          <PrimaryBtn type="submit"> Add Trip </PrimaryBtn>
        </div>
      </div>
    </form>
  </div>

  <div v-if="isSuccessMessage" class="w-full absolute top-10">
    <div
      class="p-2 max-w-md mx-auto mt-20 bg-white shadow-lg rounded-lg overflow-hidden"
    >
      <h2 class="text-body text-primary">{{ successMessage }}</h2>
    </div>
  </div>
</template>

<style scoped></style>
