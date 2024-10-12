<script setup>
import { RouterLink, useRoute } from "vue-router";

const route = useRoute();

const isActive = (path) => {
  return route.path === path;
};
</script>

<template>
  <div class="flex items-center w-4/5 gap-x-52">
    <router-link
      :to="{ name: 'home' }"
      class="relative p-1 text-center nav-item"
      :class="{ active: isActive('/') }"
    >
      <font-awesome-icon
        icon="home"
        class="text-dark text-2xl icon"
      ></font-awesome-icon>
      <span class="text-dark text-2xl"> Home</span>
    </router-link>
    <router-link
      :to="{ name: 'add' }"
      class="relative p-1 text-center nav-item"
      :class="{ active: isActive('/add') }"
    >
      <font-awesome-icon
        icon="plus"
        class="text-dark text-2xl icon"
      ></font-awesome-icon
      ><span class="text-dark text-2xl"> Add Trip</span>
    </router-link>
    <router-link
      :to="{ name: 'all' }"
      class="relative p-1 text-center nav-item"
      :class="{ active: isActive('/all') }"
    >
      <font-awesome-icon :icon="['fas', 'bars']" class="text-dark text-2xl" />
      <span class="text-dark text-2xl icon"> All Trip List</span>
    </router-link>
    <router-link
      :to="{ name: 'about' }"
      class="relative p-1 text-center nav-item"
      :class="{ active: isActive('/about') }"
    >
      <font-awesome-icon
        :icon="['fas', 'info']"
        class="text-dark text-2xl"
      ></font-awesome-icon>
      <span class="text-dark text-2xl icon"> About</span>
    </router-link>
  </div>
</template>

<style scoped>
.nav-item {
  transition: color 0.3s ease;
  display: flex;
  gap: 10px;
  align-items: baseline;
}
.nav-item.active {
  color: #ffc996;
}

/* .nav-item.active span,
.nav-item.active .icon {
  color: #ffc996;
} */

.nav-item::before {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 10%;
  height: 3px;
  background-color: #ffc996;
  transform: translateX(-50%);
  transition: all 0.3s ease;
}

.nav-item.active::before {
  width: 100%;
}
</style>
