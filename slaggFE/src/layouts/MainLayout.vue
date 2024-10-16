<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <q-avatar>
            <img src="https://i.imgur.com/u7bezXG.png" alt="Slagg">
          </q-avatar>
          Slagg
        </q-toolbar-title>

        <q-btn dense flat round icon="menu" @click="toggleRightDrawer" />
<!--        <q-btn dense flat round icon="logout" @click="logout" />-->
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <q-list>
        <q-item-label header>Channels</q-item-label>

        <q-item clickable
                v-for="channel in loggedUser.channels"
                :key="channel.name"
                @click="selectChannel(channel)">
          <q-item-section>
            <q-item-label>{{ channel.name }}</q-item-label>
            <q-item-label caption>
              {{ channel.isPrivate ? 'Private' : 'Public' }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn dense flat icon="exit_to_app" @click="leaveChannelAction(channel)" />

            <q-btn
              dense
              flat
              v-if="channel.admin === loggedUser.user"
              icon="delete"
              color="negative"
              @click="deleteChannelAction(channel)"
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
        <template v-if="selectedChannel && selectedChannel.members.length > 0">
          <q-item v-for="member in selectedChannel.members" :key="member.nickName">
            <q-item-section>
              <q-item-label>{{ member.nickName }}</q-item-label>
              <q-item-label caption>
                {{ member === selectedChannel.admin ? 'Admin' : 'Member' }}
              </q-item-label>
            </q-item-section>

            <q-item-section side v-if=" member !== selectedChannel.admin" >
              <q-btn dense flat icon="delete" color="negative" v-if="loggedUser.user === selectedChannel.admin" @click="kickMember(member)" />
  <!--            <q-btn dense flat icon="delete" color="warning" v-else @click="requestKick(member.nickName)" />-->
  <!--            <q-badge v-if="kickRequests[member.nickName]" color="orange">{{ kickRequests[member.nickName].length }} / 3</q-badge>-->
            </q-item-section>
          </q-item>
        </template>
        <q-item v-else>
          <q-item-section>
            <q-item-label>You didnt select a channel</q-item-label>
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
import { mapGetters, mapMutations } from 'vuex';

export default {
  data() {
    return {
      createChannelDialog: false,
      leftDrawerOpen: false,
      rightDrawerOpen: false,
      newChannelName: '',
      isPrivate: false
    };
  },

  computed: {
    ...mapGetters('all', {
      loggedUser: 'getLoggedUser',
      selectedChannel: 'getSelectedChannel',
    }),
  },

  methods: {
    ...mapMutations('all', ['setSelectedChannel', 'createNewChannel', 'leaveChannel', 'deleteChannel', 'kickMemberFromChannel']),

    createChannel() {
      let payload = {
        name: this.newChannelName,
        isPrivate: this.isPrivate
      }
      this.createNewChannel(payload);
      this.createChannelDialog = false;
    },

    leaveChannelAction(channel) {
      this.leaveChannel(channel);
    },

    deleteChannelAction(channel) {
      this.deleteChannel(channel);
    },

    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen;
    },

    toggleRightDrawer() {
      this.rightDrawerOpen = !this.rightDrawerOpen;
    },

    openCreateChannelDialog() {
      this.createChannelDialog = true;
    },

    selectChannel(channel) {
      this.setSelectedChannel(channel);
    },

    kickMember(member) {
      let payload = {
        member: member,
        channel: this.selectedChannel,
      }
      this.kickMemberFromChannel(payload);
    }
  },
};
</script>

<style scoped>
</style>
