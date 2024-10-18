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
          :class="{ 'selected-channel': channel === selectedChannel }">
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
        <q-item clickable @click="openPublicChannelsDialog">
          <q-item-section avatar>
            <q-icon name="visibility" />
          </q-item-section>
          <q-item-section>Show all joinable public Channels</q-item-section>
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

            <q-item-section side v-if="member !== selectedChannel.admin">
              <q-btn dense flat icon="delete" color="negative" v-if="loggedUser.user === selectedChannel.admin" @click="kickMember(member)" />
              <q-btn dense flat icon="delete" v-else-if="!selectedChannel.isPrivate && member !== loggedUser.user" :color="alreadyVotedFor(member) ? 'grey-5' : 'warning'" :disable="alreadyVotedFor(member)" @click="requestKick(member)" />
              <q-badge v-if="getVoteCount(member) > 0" color="orange">{{ getVoteCount(member) }} / 3</q-badge>
            </q-item-section>
          </q-item>
          <template v-if="!selectedChannel.isPrivate || loggedUser.user === selectedChannel.admin">
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
                <q-btn icon="add" @click="joinPublicChannel(channel)" />
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
import { mapGetters, mapMutations } from 'vuex';

export default {
  data() {
    return {
      createChannelDialog: false,
      publicChannelsDialog: false,
      leftDrawerOpen: true,
      rightDrawerOpen: false,
      newChannelName: '',
      isPrivate: false,
      inviteNickName: '',
      inviteError: '',
    };
  },

  computed: {
    ...mapGetters('all', {
      loggedUser: 'getLoggedUser',
      selectedChannel: 'getSelectedChannel',
      isUserLoggedIn: 'isUserLoggedIn',
      allUsers: 'getAllUsers',
      allPublicChannels: 'getAllPublicChannels'
    }),
    filteredPublicChannels() {
      return this.allPublicChannels.filter(
        channel => !this.loggedUser.channels.some(userChannel => userChannel.name === channel.name)
      );
    },
  },

  methods: {
    ...mapMutations('all', ['toggleIsUserLoggedIn', 'setSelectedChannel', 'createNewChannel', 'leaveChannel', 'deleteChannel', 'kickMemberFromChannel', 'addMemberToChannel', 'addKickVoteOrKickMember', 'joinChannel']),

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

    openPublicChannelsDialog() {
      this.publicChannelsDialog = true;
    },

    selectChannel(channel) {
      this.setSelectedChannel(channel);
    },

    joinPublicChannel(channel) {
      this.joinChannel(channel);
      this.publicChannelsDialog = false;
    },

    kickMember(member) {
      let payload = {
        member: member,
        channel: this.selectedChannel,
      }
      this.kickMemberFromChannel(payload);
    },

    inviteUser() {
      this.inviteError = '';

      const userToInvite = this.allUsers.find(user => user.nickName === this.inviteNickName);
      if (!userToInvite) {
        this.inviteError = `User with nickname '${this.inviteNickName}' doesn't exist.`;
        return;
      }

      const isAlreadyMember = this.selectedChannel.members.some(member => member.nickName === this.inviteNickName);

      if (isAlreadyMember) {
        this.inviteError = `User '${this.inviteNickName}' is already a member of this channel.`;
        return;
      }
      let payload = {
        member: userToInvite,
        channel: this.selectedChannel
      }
      this.addMemberToChannel(payload);
      this.inviteNickName = '';
    },

    alreadyVotedFor(member) {
      const voteData = this.selectedChannel.kickVotes.find(
        (vote) => vote.member.nickName === member.nickName
      );

      if (voteData) {
        return voteData.votes.some(vote => vote.voter.nickName === this.loggedUser.user.nickName);
      }
      return false;
    },

    getVoteCount(member) {
      const voteData = this.selectedChannel.kickVotes.find(
        (vote) => vote.member.nickName === member.nickName
      );
      return voteData ? voteData.votes.length : 0;
    },

    requestKick(member) {
      if (this.alreadyVotedFor(member)) {
        return;
      }

      let payload = {
        member: member,
        channel: this.selectedChannel
      };

      this.addKickVoteOrKickMember(payload);
    },

    logout() {
      this.toggleIsUserLoggedIn();
      this.$router.push('/signin/login');
    }
  },
};
</script>

<style scoped>
.selected-channel {
  background-color: #E0F7FA;
  border-left: 4px solid #00ACC1;
}
</style>
