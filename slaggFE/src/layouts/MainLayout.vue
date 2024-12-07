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
          v-if="loggedUser"
          v-model="loggedUser.state"
          :options="statusOptions"
          option-value="value"
          @update:model-value="onStatusChange"
          emit-value
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
        <template v-if="loggedUser">
        <q-item-label header>Channels</q-item-label>
        <template v-if="loggedUser.channels && loggedUser.channels.length > 0">
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
            <q-btn dense flat icon="exit_to_app" @click.stop="leaveChannelAction(channel)" />
            <q-btn
              dense
              flat
              v-if="channel.admin.email === loggedUser.email"
              icon="delete"
              color="negative"
              @click.stop="deleteChannelAction(channel)"
            />
          </q-item-section>
        </q-item>
      </template>
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
      </template>
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
              <q-btn dense flat icon="delete" color="negative" v-if="loggedUser.nickName === selectedChannel.admin.nickName" @click="kickMember(member.nickName)" />
              <q-btn dense flat icon="delete" v-else-if="loggedUser && !selectedChannel.isPrivate && member.nickName !== loggedUser.nickName" :color="alreadyVotedFor(member) ? 'grey-5' : 'warning'" :disable="alreadyVotedFor(member)" @click="requestKick(member)" />
              <q-badge v-if="getVoteCount(member) > 0" color="orange">{{ getVoteCount(member) }} / 3</q-badge>
            </q-item-section>
          </q-item>
          <template v-if="!selectedChannel.isPrivate || (loggedUser && loggedUser.nickName === selectedChannel.admin.nickName)">
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
            <q-item v-for="channel in allPublicChannels" :key="channel.name">
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

<script lang="ts">
import { useUserStore } from 'src/stores/user';
import type { Member, Channel } from 'src/stores/models'
import { useQuasar } from 'quasar'
import { onMounted } from "vue";

export default {
  setup() {
    const userStore = useUserStore();

    onMounted(() => {
      userStore.setContext(useQuasar());
    })

    return {
      userStore,
    };
  },
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
      statusOptions: [
        { label: 'Online', value: 'online' },
        { label: 'Offline', value: 'offline' },
        { label: 'DND', value: 'DND' },
      ],
      rightDrawerOpenLocal: false,
      channelActionLoading: false,
    };
  },



  watch: {
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
    loggedUser() {
      return this.userStore.loggedUser;
    },
    selectedChannel() {
      return this.userStore.selectedChannel;
    },
    isUserLoggedIn() {
      return this.userStore.isUserLoggedIn;
    },
    allUsers() {
      return this.userStore.usersAsMemberInterface;
    },
    allPublicChannels() {
      return this.userStore.publicChannels;
    },
    rightDrawerOpen() {
      return this.userStore.rightDrawerOpen;
    },
  },

  methods: {
    async onStatusChange(newStatus: 'online' | 'DND' | 'offline') {
      if (this.loggedUser) {
        this.loggedUser.state = newStatus;
        await this.userStore.changeStatus(newStatus);
      }
    },
    async createChannel() {
      await this.userStore.createNewChannel(this.newChannelName, this.isPrivate);
      this.createChannelDialog = false;
      this.newChannelName = '';
      this.isPrivate = false;
    },

    async leaveChannelAction(channel: Channel) {
      if (this.channelActionLoading) return;
      this.channelActionLoading = true;
      await this.userStore.leaveChannel(channel.name);
      this.channelActionLoading = false;
    },

    async deleteChannelAction(channel: Channel) {
      if (this.channelActionLoading) return;
      this.channelActionLoading = true;
      await this.userStore.deleteChannel(channel.name);
      this.channelActionLoading = false;
    },


    // cleanUpChannelState(channelName) {
    //   const updatedChannels = this.loggedUser.channels.filter(c => c.name !== channelName);
    //   this.$store.commit('all/setLoggedUser', {
    //     ...this.loggedUser,
    //     channels: updatedChannels
    //   });

    //   this.visibleMessages = [];

    //   if (this.selectedChannel?.name === channelName) {
    //     this.selectChannel(null);
    //   }
    // },


    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen;
    },

    toggleRightDrawer() {
      this.userStore.toggleRightDrawerOpen();
    },

    openCreateChannelDialog() {
      this.createChannelDialog = true;
    },

    async openPublicChannelsDialog() {
      this.userStore.getJoinablePublicChannels();
      this.publicChannelsDialog = true;
    },

    async selectChannel(channel: Channel) {
      await this.userStore.setSelectedChannel(channel);
    },

    async joinChannel(channel: string) {
      await this.userStore.joinPublicChannel(channel)
      this.publicChannelsDialog = false;
    },

    async kickMember(member: string) {
      if(!this.selectedChannel || !this.loggedUser){
        return;
      }
      await this.userStore.kickUserFromChannel(this.selectedChannel.name, member);
      const ch = this.loggedUser.channels.find(channel => channel.name === this.selectedChannel?.name) || null;
      await this.userStore.setSelectedChannel(ch)
    },

    async inviteUser() {
      this.inviteError = '';

      const userToInvite = this.allUsers.find(user => user.nickName === this.inviteNickName);
      if (!userToInvite) {
        this.inviteError = `User with nickname '${this.inviteNickName}' doesn't exist.`;
        return;
      }
      if (!this.selectedChannel) {
        return;
      }
      const isAlreadyMember = this.selectedChannel.users.some(member => member.nickName === this.inviteNickName);

      if (isAlreadyMember) {
        this.inviteError = `User '${this.inviteNickName}' is already a member of this channel.`;
        return;
      }
      await this.userStore.addUserToChannel(this.selectedChannel.name, this.inviteNickName);
      this.inviteNickName = '';
      const ch = this.loggedUser?.channels.find(channel => channel.name === this.selectedChannel?.name) || null;
      await this.userStore.setSelectedChannel(ch)
    },

    alreadyVotedFor(member: Member) {
      if (!member.kickRequests || member.kickRequests.length == 0) {
        return false;
      }
      return member.kickRequests.some(
        (request) => request.requesterNickName === this.loggedUser?.nickName
      );
    },

    getVoteCount(member: Member) {
      if (!member.kickRequests) {
        return 0;
      }
      return member.kickRequests.length;
    },

    async requestKick(member: Member) {
      if (this.alreadyVotedFor(member)) {
        return;
      }
      if (!this.selectedChannel || !this.loggedUser || !this.loggedUser.channels) {
        return;
      }
      await this.userStore.requestKickUserFromChannel(this.selectedChannel.name, member.nickName);
      const ch = this.loggedUser.channels.find(channel => channel.name === this.selectedChannel?.name) || null;
      await this.userStore.setSelectedChannel(ch)
    },

    async logout() {
      this.$router.push('/signin/login');
      await this.userStore.logout();
    },

    toggleMentionsOnly() {

    },

    updateUserStatus (value: string) {
      console.log(value);
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
