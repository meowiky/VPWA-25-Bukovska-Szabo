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
import { defineComponent } from 'vue';
import {mapActions, mapMutations} from 'vuex';

export default defineComponent({
  name: 'LoginForm',

  data() {
    return {
      formData: {
        email: '',
        password: ''
      },
      errorMessage: ''
    };
  },

  computed: {

  },

  methods: {
    ...mapMutations('all', ['toggleIsUserLoggedIn']),
    ...mapActions('all', ['login']),
    async onSubmit() {
      this.errorMessage = '';

      if (!this.formData.email || !this.formData.password) {
        this.errorMessage = 'Please fill in all fields';
        return;
      }

      try {
        const success = await this.login(this.formData);
        if (success) {
          this.toggleIsUserLoggedIn(); // Call the mutation to update user login state
          this.$router.push('/chat'); // Navigate to the chat page

          console.log(success); // TODO:: Remove debug log

        } else {
          this.errorMessage = 'Login failed. Please check your credentials.';
        }
      } catch (error) {
        console.error('Login error:', error);
        this.errorMessage = 'Login failed. Please try again.';
      }
    }
  }
});
</script>

<style scoped>
</style>
