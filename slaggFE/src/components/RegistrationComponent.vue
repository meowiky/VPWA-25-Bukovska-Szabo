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
import { mapMutations } from 'vuex';

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
    ...mapMutations('all', ['toggleIsUserLoggedIn']),
    onSubmit() {
      this.errorMessage = '';

      if (!this.formData.username || !this.formData.email || !this.formData.password) {
        this.errorMessage = 'Please fill in all fields';
        return;
      }

      console.log('Registering...', this.formData);
      this.toggleIsUserLoggedIn();
      this.$router.push('/chat');
      // TODO:: Call registration API

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
