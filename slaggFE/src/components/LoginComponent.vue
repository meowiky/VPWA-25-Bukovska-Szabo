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
import { useUserStore } from 'src/stores/user';

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
    async onSubmit() {
      const userStore = useUserStore();
      this.errorMessage = '';

      if (!this.formData.email || !this.formData.password) {
        this.errorMessage = 'Please fill in all fields';
        return;
      }

      try {
        const success = await userStore.login(this.formData.email, this.formData.password);
        if (success) {
          this.$router.push('/chat');

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
