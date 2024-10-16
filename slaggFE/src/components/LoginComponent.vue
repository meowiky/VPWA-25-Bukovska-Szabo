<template>
  <q-form @submit.prevent="onSubmit" ref="form">
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
    <q-btn label="Login" type="submit" color="primary" />
    <q-banner v-if="errorMessage" color="negative">{{ errorMessage }}</q-banner>
  </q-form>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'LoginForm',
  setup() {
    const formData = ref({
      email: '',
      password: ''
    });
    const errorMessage = ref('');

    const onSubmit = async () => {
      errorMessage.value = '';

      if (!formData.value.email || !formData.value.password) {
        errorMessage.value = 'Please fill in all fields';
        return;
      }

      try {
        // TODO:: Populate loggedUser



        // const response = await axios.post('/api/login', formData.value);
        // console.log('Login successful:', response.data);
      } catch (error) {
        console.error('Login error:', error);
        errorMessage.value = 'Login failed. Please try again.';
      }
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
