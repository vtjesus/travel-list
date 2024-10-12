<script setup></script>

<template class="font-body">
  <div class="flex flex-col text-dark font-body mt-2">
    <figure class="thumb flex justify-center item-center">
      <slot name="header"> </slot>
    </figure>
    <slot name="body"> </slot>
  </div>
</template>

<style scoped></style>
