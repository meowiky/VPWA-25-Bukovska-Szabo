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
import { defineComponent } from 'vue';
import {mapActions} from 'vuex';

export default defineComponent({
  name: 'RegisterForm',

  data() {
    return {
      formData: {
        username: '',
        email: '',
        password: ''
      },
      errorMessage: ''
    };
  },

  computed: {

  },

  methods: {
    ...mapActions('all', ['register']),
    async onSubmit() {
      this.errorMessage = '';

      if (!this.formData.username || !this.formData.email || !this.formData.password) {
        this.errorMessage = 'Please fill in all fields';
        return;
      }
      try {
        const success = await this.register(this.formData);
        if (success) {
          this.$router.push('/chat');

        } else {
          this.errorMessage = 'Registration failed.';
        }
      } catch (error) {
        console.error('register error:', error);
        this.errorMessage = 'Registration failed.';
      }
      this.$router.push('/chat');

      this.formData = {
        username: '',
        email: '',
        password: ''
      };
    }
  }
});
</script>

<style scoped>
</style>
