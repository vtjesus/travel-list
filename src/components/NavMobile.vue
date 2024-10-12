<script setup>
import { RouterLink, useRoute } from "vue-router";

const route = useRoute();

const isActive = (path) => {
  return route.path === path;
};
</script>

<template>
  <div
    class="fixed bottom-0 left-0 w-full h-14 bg-dark p-2 rounded-t-lg flex justify-around items-center"
  >
    <router-link
      :to="{ name: 'home' }"
      class="relative p-1 text-center nav-item"
      :class="{ active: isActive('/') }"
    >
      <font-awesome-icon
        icon="home"
        class="text-light text-4xl"
      ></font-awesome-icon>
    </router-link>
    <router-link
      :to="{ name: 'add' }"
      class="relative p-1 text-center nav-item"
      :class="{ active: isActive('/add') }"
    >
      <font-awesome-icon
        icon="plus"
        class="text-light text-4xl"
      ></font-awesome-icon>
    </router-link>
    <router-link
      :to="{ name: 'all' }"
      class="relative p-1 text-center nav-item"
      :class="{ active: isActive('/all') }"
    >
      <font-awesome-icon :icon="['fas', 'bars']" class="text-light text-4xl" />
    </router-link>
    <router-link
      :to="{ name: 'about' }"
      class="relative p-1 text-center nav-item"
      :class="{ active: isActive('/about') }"
    >
      <font-awesome-icon
        :icon="['fas', 'info']"
        class="text-light text-4xl"
      ></font-awesome-icon>
    </router-link>
  </div>
</template>

<style scoped>
.nav-item {
  transition: color 0.3s ease;
}
.nav-item.active {
  color: #ffc996;
}

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
