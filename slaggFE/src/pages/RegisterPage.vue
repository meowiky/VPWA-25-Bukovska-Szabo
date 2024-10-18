<script setup lang="ts">

import RegisterForm from 'components/RegistrationComponent.vue';

</script>

<template>
  <div class="outer-container">
    <div class="form-container">
      <RegisterForm />
    </div>
  </div>
</template>

<style scoped>
.outer-container {
  display: grid;
  place-items: center;
  height: 100vh;
}

.form-container {
  max-width: 400px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}
</style>

