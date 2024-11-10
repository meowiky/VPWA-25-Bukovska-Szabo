<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>
          <q-avatar>
            <img src="https://i.imgur.com/u7bezXG.png" alt="Slagg">
          </q-avatar>
          Slagg
        </q-toolbar-title>

        <q-select
          v-model="currentUserStatus"
          :options="statusOptions"
          transition-show="jump-up"
          transition-hide="jump-up"
          filled
          outlined
          dense
          color="primary"
          class="user-status-selector"
        />

        <q-toggle v-model="mentionsOnly" label="Mentions Only" @click="toggleMentionsOnly" color="positive" />
        <q-btn dense flat round icon="menu" @click="toggleRightDrawer" />
        <q-btn dense flat round icon="logout" @click="logout" />
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <q-list>
        <q-item-label header>Channels</q-item-label>

        <q-item
          clickable
          v-for="channel in loggedUser.channels"
          :key="channel.name"
          @click="selectChannel(channel)"
          :class="{ 'selected-channel': selectedChannel && channel.name === selectedChannel.name }">
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
              v-if="channel.admin.email === loggedUser.email"
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
        <q-item clickable @click="openPublicChannelsDialog">
          <q-item-section avatar>
            <q-icon name="visibility" />
          </q-item-section>
          <q-item-section>Show all joinable public Channels</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-drawer show-if-above v-model="rightDrawerOpenLocal" @update:model-value="toggleRightDrawer" side="right" bordered>
      <q-list>
        <q-item-label header>Channel Members</q-item-label>
        <template v-if="selectedChannel">
          <q-item v-for="member in selectedChannel.users" :key="member.nickName">
            <q-item-section>
              <q-item-label>{{ member.nickName }}</q-item-label>
              <q-item-label caption>
                {{ member.nickName === selectedChannel.admin.nickName ? 'Admin' : 'Member' }} - Status: {{ member.status }}
              </q-item-label>
            </q-item-section>

            <q-item-section side v-if="member.nickName !== selectedChannel.admin.nickName">
              <q-btn dense flat icon="delete" color="negative" v-if="this.loggedUser.nickName === this.selectedChannel.admin.nickName" @click="kickMember(member.nickName)" />
              <q-btn dense flat icon="delete" v-else-if="!selectedChannel.isPrivate && member.nickName !== loggedUser.nickName" :color="alreadyVotedFor(member) ? 'grey-5' : 'warning'" :disable="alreadyVotedFor(member)" @click="requestKick(member)" />
              <q-badge v-if="getVoteCount(member) > 0" color="orange">{{ getVoteCount(member) }} / 3</q-badge>
            </q-item-section>
          </q-item>
          <template v-if="!selectedChannel.isPrivate || loggedUser.user.nickName === selectedChannel.admin.nickName">
            <q-item-label header>Invite User</q-item-label>

            <q-item>
              <q-item-section>
                <q-input
                  v-model="inviteNickName"
                  label="NickName"
                  placeholder="Enter user's nickname"
                  filled
                />
              </q-item-section>
              <q-item-section side>
                <q-btn @click="inviteUser" label="Invite" color="primary" />
              </q-item-section>
            </q-item>
            <q-item-section v-if="inviteError">
              <q-banner color="negative">{{ inviteError }}</q-banner>
            </q-item-section>
          </template>
        </template>
        <q-item v-else>
          <q-item-section>
            <q-item-label>You didn't select a channel</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-dialog v-model="publicChannelsDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Join Public Channels</div>
        </q-card-section>

        <q-card-section>
          <q-list>
            <q-item v-for="channel in filteredPublicChannels" :key="channel.name">
              <q-item-section>{{ channel.name }}</q-item-section>
              <q-item-section side>
                <q-btn icon="add" @click="joinChannel(channel.name)" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" @click="publicChannelsDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

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
import { mapGetters, mapMutations, mapActions } from 'vuex';

export default {
  data() {
    return {
      createChannelDialog: false,
      publicChannelsDialog: false,
      leftDrawerOpen: true,
      newChannelName: '',
      isPrivate: false,
      inviteNickName: '',
      inviteError: '',
      mentionsOnly: false,
      currentUserStatus: 'Online',
      statusOptions: [
        { label: 'Online', value: 'online' },
        { label: 'Offline', value: 'offline' },
        { label: 'DND', value: 'DND' },
      ],
      rightDrawerOpenLocal: false,
    };
  },

  watch: {
    currentUserStatus(status) {
      this.updateUserStatus(status.value)
    },
    rightDrawerOpen(newVal) {
      this.rightDrawerOpenLocal = newVal;
    },
    loggedUser(newVal) {
      if (newVal === null) {
        this.$router.push('/signin/login');
      }
    }
  },

  computed: {
    ...mapGetters('all', {
      loggedUser: 'getLoggedUser',
      selectedChannel: 'getSelectedChannel',
      isUserLoggedIn: 'isUserLoggedIn',
      allUsers: 'getAllUsers',
      allPublicChannels: 'getAllPublicChannels',
      rightDrawerOpen: 'getRightDrawerOpen',
      token: 'getToken',
    }),
    filteredPublicChannels() {
      return this.allPublicChannels.filter(
        channel => !this.loggedUser.channels.some(userChannel => userChannel.name === channel.name)
      );
    },
  },

  methods: {
    ...mapMutations('all', [
      'toggleIsUserLoggedIn',
      'setSelectedChannel',
      'setMentionsOnly',
      'setUserStatus',
      'toggleRightDrawerOpen'
    ]),
    ...mapActions('all', ['logOut', 'reloadData', 'createNewChannel', 'deleteChannel', 'leaveChannel', 'kickUserFromChannel', 'addUserToChannel', 'joinPublicChannel', 'requestKickUserFromChannel']),

    async createChannel() {
      let payload = {
        name: this.newChannelName,
        isPrivate: this.isPrivate,
        token: this.token
      }
      await this.createNewChannel(payload);
      this.createChannelDialog = false;
    },

    async leaveChannelAction(channel) {
      let payload = {
        name: channel.name,
        token: this.token
      }
      await this.leaveChannel(payload);
    },

    async deleteChannelAction(channel) {
      let payload = {
        name: channel.name,
        token: this.token
      }
      await this.deleteChannel(payload);
    },

    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen;
    },

    toggleRightDrawer() {
      this.toggleRightDrawerOpen();
    },

    openCreateChannelDialog() {
      this.createChannelDialog = true;
    },

    openPublicChannelsDialog() {
      this.publicChannelsDialog = true;
    },

    selectChannel(channel) {
      this.setSelectedChannel(channel);
    },

    async joinChannel(channel) {
      let payload = {
        channel: channel,
        token: this.token
      }
      await this.joinPublicChannel(payload)
      this.publicChannelsDialog = false;
    },

    async kickMember(member) {
      let payload = {
        channel: this.selectedChannel.name,
        token: this.token,
        user: member
      };
      await this.kickUserFromChannel(payload)
      const ch = this.loggedUser.channels.find(channel => channel.name === this.selectedChannel.name);
      this.selectChannel(ch)
    },

    async inviteUser() {
      // this.inviteError = '';

      // const userToInvite = this.allUsers.find(user => user.nickName === this.inviteNickName);
      // if (!userToInvite) {
      //   this.inviteError = `User with nickname '${this.inviteNickName}' doesn't exist.`;
      //   return;
      // }

      // const isAlreadyMember = this.selectedChannel.members.some(member => member.nickName === this.inviteNickName);

      // if (isAlreadyMember) {
      //   this.inviteError = `User '${this.inviteNickName}' is already a member of this channel.`;
      //   return;
      // }
      let payload = {
        channel: this.selectedChannel.name,
        token: this.token,
        user: this.inviteNickName
      }
      await this.addUserToChannel(payload);
      this.inviteNickName = '';
      const ch = this.loggedUser.channels.find(channel => channel.name === this.selectedChannel.name);
      this.selectChannel(ch)
    },

    alreadyVotedFor(member) {
      return member.kickRequests.some(
        (request) => request.requesterNickName === this.loggedUser.nickName
      );
    },

    getVoteCount(member) {
      return member.kickRequests.length;
    },

    async requestKick(member) {
      if (this.alreadyVotedFor(member)) {
        return;
      }

      let payload = {
        channel: this.selectedChannel.name,
        token: this.token,
        user: member.nickName
      };

      await this.requestKickUserFromChannel(payload);
      const ch = this.loggedUser.channels.find(channel => channel.name === this.selectedChannel.name);
      this.selectChannel(ch)
    },

    async logout() {
      await this.logOut(this.token);
    },

    toggleMentionsOnly() {
      const currentValue = this.mentionsOnly;
      this.setMentionsOnly(currentValue);
    },

    updateUserStatus (value) {
      this.setUserStatus(value);
    }
  },
};
</script>

<style scoped>
.selected-channel {
  background-color: #E0F7FA;
  border-left: 4px solid #00ACC1;
}

.user-status-selector {
  width: 100px;
}

:deep(.user-status-selector .q-field__native), :deep(.user-status-selector .q-icon) {
  color: white !important;
}

</style>
