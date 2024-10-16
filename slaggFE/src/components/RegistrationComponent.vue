<template>
  <q-form @submit.prevent="onSubmit" ref="form">
    <q-input
      filled
      v-model="formData.username"
      label="Username"
      :rules="[val => !!val || 'Username is required']"
    />
    <q-input
      filled
      v-model="formData.email"
      label="Email"
      :rules="[val => !!val || 'Email is required', val => /.+@.+\..+/.test(val) || 'Email must be valid']"
    />
    <q-input
      filled
      v-model="formData.password"
      label="Password"
      type="password"
      :rules="[val => !!val || 'Password is required']"
    />
    <q-btn label="Register" type="submit" color="primary" />
    <q-banner v-if="errorMessage" color="negative">{{ errorMessage }}</q-banner>
  </q-form>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'RegisterForm',
  setup() {
    const formData = ref({
      username: '',
      email: '',
      password: ''
    });
    const errorMessage = ref('');

    const onSubmit = () => {
      errorMessage.value = '';

      if (!formData.value.username || !formData.value.email || !formData.value.password) {
        errorMessage.value = 'Please fill in all fields';
        return;
      }

      console.log('Registering...', formData.value);

      // TODO:: Call registration API

      formData.value = {
        username: '',
        email: '',
        password: ''
      };
    };

    return {
      formData,
      errorMessage,
      onSubmit
    };
  }
});
</script>

<style scoped>
</style>
