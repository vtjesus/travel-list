<script setup>
import PrimaryBtn from "./PrimaryBtn.vue";
import SecondaryBtn from "./SecondaryBtn.vue";

import { useTripsStore } from "../stores/trips";

const tripsStore = useTripsStore();
const props = defineProps({
  tripId: {
    type: Number,
    required: true,
  },
  dayIndex: {
    type: Number,
    required: false,
  },
  itemId: {
    type: Number,
  },
  flag: {
    type: String,
  },
  name: {
    type: String,
  },
});

const emit = defineEmits(["close"]);

// onMounted(() => {
//   console.log(props);
// });

const deleteItem = async () => {
  if (props.flag === "stop") {
    await tripsStore.deleteStopFromTrip(
      props.tripId,
      props.dayIndex,
      props.itemId
    );
    emit("close");
  } else if (props.flag === "risto") {
    await tripsStore.deleteRestaurantFromTrip(props.tripId, props.itemId);
    emit("close");
  } else if (props.flag === "hotel") {
    await tripsStore.deleteHotelFromTrip(props.tripId, props.itemId);
    emit("close");
  } else {
    console.log("nope");
  }
};
</script>

<template>
  <!-- DELETE MODAL -->
  <div
    class="modal mx-auto w-80 mt-20 bg-white shadow-lg p-2 md:p-10 rounded-lg absolute top-14 md:top-1/3 left-1/2 z-20 md:w-2/4"
  >
    <h2 class="font-heading text-dark xl:text-3xl">
      Are you sure to DELETE this
      <span class="text-accent uppercase">{{ props.flag }}</span> with name
      {{ props.name }}?
    </h2>
    <div class="flex justify-end gap-1 mt-3">
      <PrimaryBtn @click="deleteItem()">Delete</PrimaryBtn>
      <SecondaryBtn @click="$emit('close')">Cancel</SecondaryBtn>
    </div>
  </div>
</template>

<style scoped></style>
