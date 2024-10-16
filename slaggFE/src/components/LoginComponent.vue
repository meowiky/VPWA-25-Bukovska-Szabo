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
import {mapGetters, mapMutations} from 'vuex';

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
    ...mapGetters('all', {
      isUserLoggedIn: 'isUserLoggedIn'
    }),
  },

  methods: {
    ...mapMutations('all', ['toggleIsUserLoggedIn']),
    async onSubmit() {
      this.errorMessage = '';

      if (!this.formData.email || !this.formData.password) {
        this.errorMessage = 'Please fill in all fields';
        return;
      }

      try {
        // TODO: Populate loggedUser based on API or other logic
        this.toggleIsUserLoggedIn();
        this.$router.push('/chat');
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
