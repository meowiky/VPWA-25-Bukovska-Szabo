<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="https://i.imgur.com/u7bezXG.png" alt="Slagg" @click="goIndex">
          </q-avatar>
          Slagg
        </q-toolbar-title>

        <q-btn dense flat round label="Login" @click="goLogin" class="loginBtn" />
        <q-btn dense flat round label="Register" @click="goRegister" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>
import {defineComponent} from 'vue';
import {useRouter} from 'vue-router';

export default defineComponent({
  setup() {
    const router = useRouter();

    function goRegister() {
      router.push('/signin/register');
    }

    function goLogin() {
      router.push('/signin/login');
    }

    function goIndex() {
      router.push('/');
    }

    return {
      goRegister,
      goLogin,
      goIndex
    }
  }
})

</script>

<style scoped>
  .loginBtn {
    margin-left: 10px;
    margin-right: 10px;
  }
</style>
