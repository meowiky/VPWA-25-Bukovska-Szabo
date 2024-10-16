<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <q-avatar>
            <img src="https://i.imgur.com/u7bezXG.png">
          </q-avatar>
          Slagg
        </q-toolbar-title>

        <q-btn dense flat round icon="logout" @click="toggleRightDrawer" />
        <q-btn dense flat round icon="logout" @click="logout" />
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <q-list>
        <q-item-label header>Channels</q-item-label>

        <q-item clickable v-for="channel in userChannels" :key="channel.name">
          <q-item-section>
            <q-item-label>{{ channel.name }}</q-item-label>
            <q-item-label caption>
              {{ channel.isPrivate ? 'Private' : 'Public' }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn dense flat icon="exit_to_app" @click="leaveChannel(channel.name)" />

            <q-btn
              dense
              flat
              v-if="channel.admin === currentUser.nickName"
              icon="delete"
              color="negative"
              @click="deleteChannel(channel.name)"
            />
          </q-item-section>
        </q-item>

        <q-item clickable @click="openCreateChannelDialog">
          <q-item-section avatar>
            <q-icon name="add" />
          </q-item-section>
          <q-item-section>Create New Channel</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-drawer show-if-above v-model="rightDrawerOpen" side="right" bordered>
      <q-list>
        <q-item-label header>Channel Members</q-item-label>

        <q-item v-for="member in currentChannelMembers" :key="member.nickName">
          <q-item-section>
            <q-item-label>{{ member.nickName }}</q-item-label>
            <q-item-label caption>
              {{ member.nickName === currentChannelAdmin ? 'Admin' : 'Member' }}
            </q-item-label>
          </q-item-section>

          <!-- Admin-specific functionality for kicking members -->
          <q-item-section side v-if="member.nickName !== currentChannelAdmin">
            <!-- If current user is admin, allow direct kick -->
            <q-btn dense flat icon="delete" color="negative" v-if="isAdmin" @click="kickMember(member.nickName)" />
            <!-- Regular members can request to kick another member -->
            <q-btn dense flat icon="delete" color="warning" v-else @click="requestKick(member.nickName)" />
            <q-badge v-if="kickRequests[member.nickName]" color="orange">{{ kickRequests[member.nickName].length }} / 3</q-badge>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-dialog v-model="createChannelDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Create New Channel</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="newChannelName" label="Channel Name" />
          <q-toggle v-model="isPrivate" label="Private Channel" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="createChannelDialog = false" />
          <q-btn flat label="Create" color="primary" @click="createChannel" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';

export default {
  setup() {
    const store = useStore();
    const leftDrawerOpen = ref(false);
    const rightDrawerOpen = ref(false);
    const createChannelDialog = ref(false);
    const newChannelName = ref('');
    const isPrivate = ref(false);

    const currentUser = computed(() => store.state.user);
    const userChannels = computed(() => store.state.channels.channels);

    const currentChannelMembers = computed(() => store.state.channels.currentChannelMembers);
    const currentChannelAdmin = computed(() => store.state.channels.currentChannelAdmin);
    const isAdmin = computed(() => currentUser.value.nickName === currentChannelAdmin.value);

    const kickRequests = ref({});

    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    };

    const toggleRightDrawer = () => {
      rightDrawerOpen.value = !rightDrawerOpen.value;
    };

    const openCreateChannelDialog = () => {
      createChannelDialog.value = true;
    };

    const createChannel = () => {
      console.log('Creating channel:', newChannelName.value, isPrivate.value);
      store.dispatch('channels/createChannel', {
        channelName: newChannelName.value,
        isPrivate: isPrivate.value,
        admin: currentUser.value.nickName
      });
      createChannelDialog.value = false;
      newChannelName.value = '';
      isPrivate.value = false;
    };

    const leaveChannel = (channelName) => {
      store.dispatch('channels/leaveChannel', {
        channelName,
        memberNick: currentUser.value.nickName
      });
    };

    const deleteChannel = (channelName) => {
      store.dispatch('channels/deleteChannel', channelName);
    };

    const kickMember = (memberNick) => {
      store.dispatch('channels/kickMember', { channelName: currentChannel.value, memberNick });
    };

    const requestKick = (memberNick) => {
      if (!kickRequests.value[memberNick]) {
        kickRequests.value[memberNick] = [];
      }

      if (!kickRequests.value[memberNick].includes(currentUser.value.nickName)) {
        kickRequests.value[memberNick].push(currentUser.value.nickName);

        if (kickRequests.value[memberNick].length >= 3) {
          kickMember(memberNick);
          delete kickRequests.value[memberNick];
        }
      }
    };

    const logout = () => {
      store.dispatch('user/logout');
      this.$router.push('/login');
    };

    return {
      leftDrawerOpen,
      rightDrawerOpen,
      toggleLeftDrawer,
      toggleRightDrawer,
      currentUser,
      userChannels,
      currentChannelMembers,
      currentChannelAdmin,
      isAdmin,
      kickRequests,
      createChannelDialog,
      newChannelName,
      isPrivate,
      openCreateChannelDialog,
      createChannel,
      leaveChannel,
      deleteChannel,
      kickMember,
      requestKick,
      logout
    };
  }
};
</script>

<style scoped>
</style>
