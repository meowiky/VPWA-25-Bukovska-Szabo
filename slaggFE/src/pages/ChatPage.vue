<template>
  <div class="chat-page" >
<!--    <div v-if="true" class="select-channel-message">-->
     <div v-if="!selectedChannel || !selectedChannel.name" class="select-channel-message">
      <q-card class="q-pa-md">
        <q-card-section>
          <div class="text-h6">Please select a channel</div>
        </q-card-section>
      </q-card>
    </div>

    <div v-else class="chat-content">
      <q-card class="q-pa-md chat-container">

        <div class="message-list">
          <q-infinite-scroll
            :key="messagesCompositeKey"
            @load="loadMoreMessages"
            :offset="100"
            :debounce="1000"
            reverse
          >
            <q-chat-message
              v-for="(message, index) in visibleMessages"
              :key="index"
              :name="message.user.nickName"
              :text="[message.content]"
              :sent="isLoggedUser(message)"
              :stamp="new Date(message.createdAt).toLocaleString()"
              :bg-color="message.content.includes('@' + loggedUser.nickName) ? 'deep-orange-4' : ''"
            />
          </q-infinite-scroll>
        </div>

        <div v-if="typingMember" class="typing-banner">
          <q-banner type="info" dense>
            <q-icon name="chat" />
            {{ typingMember.nickName }} is typing: "{{ fakeTypingMessage }}"
          </q-banner>
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

<!--          <div class="debug-section">-->
<!--            <q-btn-->
<!--              label="Simulate"-->
<!--              color="red"-->
<!--              @click="toggleSimulatedMessages"-->
<!--              :icon="simulateIncomingMessages ? 'pause' : 'play_arrow'"-->
<!--            />-->
<!--          </div>-->
        </div>
      </q-card>
    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapMutations} from 'vuex';
import {AppVisibility} from 'quasar';

export default {
  data() {
    return {
      newMessage: '',
      displayedError: '',
      loading: false,
      itemsPerPage: 20,
      visibleMessages: [],
      simulateIncomingMessages: false,
      typingMember: null,
      fakeTypingMessage: 'This is the fake typing message.'
    };
  },

  computed: {
    ...mapGetters('all', {
      loggedUser: 'getLoggedUser',
      selectedChannel: 'getSelectedChannel',
      allUsers: 'getAllUsers',
      allPublicChannels: 'getAllPublicChannels',
      mentionsOnly: 'getMentionsOnly',
      token: 'getToken',
      messages: 'getMessages'
    }),

    messagesCompositeKey() {
      return `${this.selectedChannel.name}-${this.visibleMessages.length}-${this.loggedUser.state}`;
    }
  },

  created() {
    this.initMessages();
    // this.simulateTypingMember();
  },

  watch: {
    selectedChannel(newChannel, oldChannel) {
      if (newChannel !== oldChannel) {
        this.initMessages();
        // this.simulateTypingMember();
      }
    },
    'loggedUser.status': function (newStatus) {
      if (newStatus !== 'offline') {
        this.initMessages();
      }
    },
  },

  methods: {
    ...mapMutations('all', [
      // 'addMemberToChannel',
      // 'kickMemberFromChannel',
      // 'addKickVoteOrKickMember',
      // 'leaveChannel',
      // 'deleteChannel',
      // 'joinChannel',
      // 'fetchNewMessage',
      'toggleRightDrawerOpen',
    ]),
    ...mapActions('all', [
      'fetchMessages',
      'sendNewMessage',
      'isUserInChannel',
      'joinPublicChannel',
      'addUserToChannel',
      'kickUserFromChannel',
      'leaveChannel',
      'deleteChannel',
      'createNewChannel',
      'requestKickUserFromChannel'
    ]),

    async initMessages() {
      if (this.selectedChannel == null){
        return;
      }
      await this.fetchMessages({channel: this.selectedChannel.name, token: this.token})
      if (this.selectedChannel && this.messages) {
        this.visibleMessages = this.messages.slice(-this.itemsPerPage);
      }
    },

    isLoggedUser(message) {
      return message.user.nickName === this.loggedUser.nickName;
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

    toggleSimulatedMessages() {
      if (this.simulateIncomingMessages) {
        clearInterval(this.simulationInterval);
        this.simulateIncomingMessages = false;
      } else {
        this.simulationInterval = setInterval(this.simulateIncomingMessage, 5000);
        this.simulateIncomingMessages = true;
      }
    },

    simulateIncomingMessage() {
      const otherUsers = this.selectedChannel.users.filter(user => user.nickName !== this.loggedUser.nickName);
      const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
      const mentionLoggedUser = Math.random() < 0.5;

      let randomMessageContent = `Hello, my name is ${randomUser.firstName} ${randomUser.lastName} and my nick is ${randomUser.nickName}.`;
      if (mentionLoggedUser) {
        randomMessageContent = `Hi @${this.loggedUser.nickName} how are you?`;
      }

      const incomingMessage = {
        user: randomUser,
        content: randomMessageContent,
        timestamp: new Date(),
        channel: this.selectedChannel
      };

      this.fetchNewMessage(incomingMessage)

      if (this.loggedUser.status === 'offline') {
        return;
      }
      this.visibleMessages = [...this.messages.slice(-this.itemsPerPage)];

      // TODO:: TURN AROUND CONDITION !AppVisibility.appVisible AFTER IMPLEMENTING FULL NOTIFICATIONS AS IT IS REQUIRED IN ASSIGNMENT

      if (this.loggedUser.status === 'DND') {
        return;
      }

      if (AppVisibility.appVisible) {
        if (!this.mentionsOnly || incomingMessage.content.includes('@' + this.loggedUser.nickName)) {
          this.$q.notify({
            message: `${randomUser.nickName}: ${randomMessageContent.substring(0, 30)}...`,
            color: 'info',
            position: 'top',
            timeout: 3000
          });
        }
      }
    },

    loadMoreMessages() {
      if (this.loading) return;
      this.loading = true;


      const currentVisibleCount = this.visibleMessages.length;
      const totalMessages = this.messages.length;
      const start = Math.max(totalMessages - currentVisibleCount - this.itemsPerPage, 0);
      const newMessages = this.messages.slice(start, totalMessages - currentVisibleCount);

      if (newMessages.length > 0) {
        // This will cause a jump to the new batch of messages
        this.visibleMessages = [...newMessages, ...this.visibleMessages];
      }
      this.loading = false;
    },

    async sendMessage() {
      let payload = {
        message: this.newMessage,
        token: this.token,
        channel: this.selectedChannel.name
      }
      await this.sendNewMessage(payload);
      await this.fetchMessages({channel: this.selectedChannel.name, token: this.token})
      this.visibleMessages = [...this.messages.slice(-this.itemsPerPage)];
      this.newMessage = '';
    },

    simulateTypingMember() {
      const otherMembers = this.selectedChannel.users.filter(
        user => user.nickName !== this.loggedUser.nickName
      );
      if (otherMembers.length === 0) return;

      this.typingMember = otherMembers[Math.floor(Math.random() * otherMembers.length)];
      this.showTypingBanner = true;
    },

    async handleCommand(commandString) {
      const [command, ...args] = commandString.split(' ');

      switch (command.toLowerCase()) {
        case '/join':
          const isAlreadyInChannel = this.loggedUser.channels.some((userChannel) => userChannel.name === args[0]);

          if (isAlreadyInChannel) {
            this.displayedError = 'You are already in this channel.';
            break;
          }

          let payload = {
            token: this.token,
            channel: args[0]
          }

          const channelToJoin = this.allPublicChannels.find((channel) => channel.name === args[0]);
          if (!channelToJoin) {
            let payload = {
              name: args[0],
              isPrivate: args.length > 1 && args[1] === '[private]',
              token: this.token
            }
            await this.createNewChannel(payload);
            break;
          }

          let alreadyInChannel = false;
          await this.isUserInChannel(payload).then((isInChannel) => {
            if (isInChannel.data) {
              this.displayedError = 'You are already a member of this channel.';
              alreadyInChannel = true;
            }
          })
          if (alreadyInChannel) { break; }

          this.joinPublicChannel(payload);
          break;

        case '/invite':
          this.displayedError = '';
          if (!this.selectedChannel.isPrivate || this.loggedUser.nickName === this.selectedChannel.admin.nickName) {
            const userToInvite = this.allUsers.find(user => user.nickName === args[0]);
            if (!userToInvite) {
              this.displayedError = `User with nickname '${args[0]}' doesn't exist.`;
              break;
            }

            const isAlreadyMember = this.selectedChannel.users.some(member => member.nickName === args[0]);

            if (isAlreadyMember) {
              this.displayedError = `User '${args[0]}' is already a member of this channel.`;
              break;
            }
            let payload = {
              user: userToInvite.nickName,
              channel: this.selectedChannel.name,
              token: this.token
            }
            await this.addUserToChannel(payload);
          }
          else {
            this.displayedError = 'You are not allowed to invite new members to this channel.';
          }
          break;

        // TODO:: Admin kick works but check vote kick
        case '/kick':
          if (args[0] === this.loggedUser.nickName) {
            this.displayedError = 'You can not kick or vote to kick yourself out. Please use /cancel';
            break;
          }
          const memberToKick = this.selectedChannel.users.find((member) => member.nickName === args[0]);
          if (this.loggedUser.nickName === this.selectedChannel.admin.nickName) {
            if (!memberToKick) {
              this.displayedError = `User with nickname '${args[0]}' is not in this channel.`;
              break;
            }
            let payload = {
              user: memberToKick.nickName,
              channel: this.selectedChannel.name,
              token: this.token
            }
            await this.kickUserFromChannel(payload);
          }
          else if (!this.selectedChannel.isPrivate) {
            this.displayedError = 'You are not the admin of this channel, so you will only vote to kick a member.';
            if (!memberToKick) {
              this.displayedError = `User with nickname '${args[0]}' is not in this channel.`;
              break;
            }

            let payload = {
              user: memberToKick.nickName,
              channel: this.selectedChannel.name,
              token: this.token
            };
            await this.requestKickUserFromChannel(payload);
          }
          else {
            this.displayedError = 'You are not allowed to kick or request to kick a member out of this channel.';
          }
          break;

        case '/cancel':
          await this.leaveChannel({
            name: this.selectedChannel.name,
            token: this.token
          });
          break;

        case '/quit':
          if (this.loggedUser.nickName === this.selectedChannel.admin.nickName) {
            await this.deleteChannel({
              name: this.selectedChannel.name,
              token: this.token
            });
          }
          else {
            this.displayedError = 'You are not admin of this channel, so you can not delete it.';
          }
          break;

        case '/list':
          this.toggleRightDrawerOpen();
          break;

        default:
          await this.sendMessage();
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

.debug-section {
  margin-top: 10px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.typing-notification {
  position: sticky;
  bottom: 0;
  z-index: 2;
  background-color: white;
  padding: 10px;
  text-align: center;
}
</style>
