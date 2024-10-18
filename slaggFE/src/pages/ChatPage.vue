<template>
  <div class="chat-page">
    <div v-if="!selectedChannel.name" class="select-channel-message">
      <q-card class="q-pa-md">
        <q-card-section>
          <div class="text-h6">Please select a channel</div>
        </q-card-section>
      </q-card>
    </div>

    <div v-else class="chat-content">
      <q-card class="q-pa-md chat-container">

        <div class="message-list">
          <q-chat-message
            v-for="(message, index) in selectedChannel.messages"
            :key="index"
            :name="message.user.nickName"
            :text="[message.content]"
            :sent="isLoggedUser(message)"
            :stamp="new Date(message.timestamp).toLocaleString()"
          />
        </div>

        <div class="bottom-section">
          <div v-if="displayedError" class="error-banner">
            <q-banner type="negative" dense>
              {{ displayedError }}
              <q-btn flat round icon="close" @click="displayedError = ''" />
            </q-banner>
          </div>

          <div class="message-input">
            <q-input v-model="newMessage" label="Type a message..." outlined class="message-text-input" />
            <q-btn @click="handleMessage" label="Send" color="primary" />
          </div>
        </div>
      </q-card>
    </div>
  </div>
</template>


<script>
import {mapGetters, mapMutations} from 'vuex';

export default {
  data() {
    return {
      newMessage: '',
      displayedError: ''
    };
  },

  computed: {
    ...mapGetters('all', {
      loggedUser: 'getLoggedUser',
      selectedChannel: 'getSelectedChannel',
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
    ...mapMutations('all', ['sendNewMessage', 'addMemberToChannel', 'kickMemberFromChannel', 'addKickVoteOrKickMember', 'leaveChannel', 'deleteChannel', 'joinChannel']),

    isLoggedUser(message) {
      return message.user.nickName === this.loggedUser.user.nickName;
    },

    handleMessage() {
      const messageContent = this.newMessage.trim();
      if (messageContent.startsWith('/')) {
        this.handleCommand(messageContent);
      }
      else {
        this.sendMessage();
      }
    },

    sendMessage() {
      let payload = {
        content: this.newMessage,
        timestamp: new Date(),
        channel: this.selectedChannel
      }
      this.sendNewMessage(payload)
      this.newMessage = '';
    },

    handleCommand(commandString) {
      const [command, ...args] = commandString.split(' ');

      switch (command.toLowerCase()) {
        case '/join':
          const isAlreadyInChannel = this.loggedUser.channels.some((userChannel) => userChannel.name === args[0]);

          if (isAlreadyInChannel) {
            this.displayedError = 'You are already in this channel.';
            break;
          }

          const channelToJoin = this.filteredPublicChannels.find((channel) => channel.name === args[0]);

          if (channelToJoin) {
            this.joinChannel(channelToJoin);
          }
          else {
            this.displayedError = 'This channel does not exist or it is a private channel.';
          }
          break;

        case '/invite':
          this.displayedError = '';
          if (!this.selectedChannel.isPrivate || this.loggedUser.user === this.selectedChannel.admin) {
            const userToInvite = this.allUsers.find(user => user.nickName === args[0]);
            if (!userToInvite) {
              this.displayedError = `User with nickname '${args[0]}' doesn't exist.`;
              return;
            }

            const isAlreadyMember = this.selectedChannel.members.some(member => member.nickName === args[0]);

            if (isAlreadyMember) {
              this.displayedError = `User '${args[0]}' is already a member of this channel.`;
              return;
            }
            let payload = {
              member: userToInvite,
              channel: this.selectedChannel
            }
            this.addMemberToChannel(payload);
          }
          else {
            this.displayedError = 'You are not allowed to invite new members to this channel.';
          }
          break;

        case '/kick':
          if (args[0] === this.loggedUser.user.nickName) {
            this.displayedError = 'You can not kick or vote to kick yourself out. Please use /cancel';
            break;
          }
          const memberToKick = this.selectedChannel.members.find((member) => member.nickName === args[0]);
          if (this.loggedUser.user === this.selectedChannel.admin) {
            if (!memberToKick) {
              this.displayedError = `User with nickname '${args[0]}' is not in this channel.`;
            }
            let payload = {
              member: memberToKick,
              channel: this.selectedChannel,
            }
            this.kickMemberFromChannel(payload);
          }
          else if (!this.selectedChannel.isPrivate) {
            this.displayedError = 'You are not the admin of this channel, so you will only vote to kick a member.';
            if (!memberToKick) {
              this.displayedError = `User with nickname '${args[0]}' is not in this channel.`;
            }

            const voteData = this.selectedChannel.kickVotes.find((vote) => vote.member.nickName === args[0]);
            if (voteData && voteData.votes.some(vote => vote.voter.nickName === this.loggedUser.user.nickName)) {
              this.displayedError = `You have already voted to kick a user with nickname '${args[0]}' out.`;
            }
            else {
              let payload = {
                member: memberToKick,
                channel: this.selectedChannel
              };

              this.addKickVoteOrKickMember(payload);
            }
          }
          else {
            this.displayedError = 'You are not allowed to kick or request to kick a member out of this channel.';
          }
          break;

        case '/cancel':
          this.leaveChannel(this.selectedChannel);
          break;

        case '/quit':
          if (this.loggedUser.user === this.selectedChannel.admin) {
            this.deleteChannel(this.selectedChannel);
          }
          else {
            this.displayedError = 'You are not admin of this channel, so you can not delete it.';
          }
          break;

        default:
          this.sendMessage();
      }
      this.newMessage = '';
    },
  }
};
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.select-channel-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.chat-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  height: calc(100vh - 200px);
}

.bottom-section {
  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 2;
}

.error-banner {
  position: sticky;
  top: 0;
  z-index: 3;
}

.message-input {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-top: 1px solid #e0e0e0;
  background-color: white;
}

.q-chat-message.sent .q-message {
  justify-content: flex-end;
}

.q-chat-message.received .q-message {
  justify-content: flex-start;
}

.message-text-input {
  flex-grow: 1;
  margin-right: 10px;
}

</style>

