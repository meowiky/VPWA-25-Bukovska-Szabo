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
          <div v-if="loading" class="loading-indicator">
            <q-spinner />
          </div>

          <q-infinite-scroll
            :key="messagesCompositeKey"
            ref="infiniteScroll"
            @load="loadMoreMessages"
            :offset="100"
            :debounce="1000"
            reverse
          >
            <q-chat-message
              v-for="(message, index) in visibleMessages"
              :key="index"
              :name="message.sender"
              :text="[message.content]"
              :sent="isLoggedUser(message)"
              :stamp="new Date(message.sentAt).toLocaleString()"
              :bg-color="message.content.includes('@' + (loggedUser?.nickName || '')) ? 'deep-orange-4' : ''"
            />
          </q-infinite-scroll>
        </div>

        <div class="bottom-section">
          <div v-if="displayedError" class="error-banner">
            <q-banner type="negative" dense>
              {{ displayedError }}
              <q-btn flat round icon="close" @click="displayedError = ''" />
            </q-banner>
          </div>

          <div class="message-input">
            <q-input v-model="newMessage"
                     label="Type a message..."
                     outlined class="message-text-input"
                     @update:model-value="onMessageInputChange"
            />
            <q-btn @click="handleMessage" label="Send" color="primary" />
          </div>

          <div
            v-if="typingMember"
            class="typing-banner"
            :key="typingCompositeKey"
          >
            <q-banner type="info" dense>
              <q-icon name="chat" />
              {{ typingMember.nickName }} is typing: "{{ typingMessage }}"
            </q-banner>
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

<script lang="ts">
//import {AppVisibility} from 'quasar';
import { useUserStore } from 'src/stores/user';
import type {Message} from 'src/stores/models'
import { ref } from 'vue';
import {QInfiniteScroll} from "quasar";

export default {
  setup() {
    const userStore = useUserStore();
    const infiniteScroll = ref<QInfiniteScroll | null>(null);

    return {
      userStore,
      infiniteScroll
    };
  },
  data() {
    return {
      newMessage: '',
      displayedError: '',
      loading: false,
      itemsPerPage: 20,
      visibleMessages: [] as Message[],
      simulateIncomingMessages: false,
      lastVisibleMessage: null as Message | null | undefined,
      typingTimeout: null as ReturnType<typeof setTimeout> | null
    };
  },

  computed: {
    loggedUser() {
      return this.userStore.loggedUser;
    },
    selectedChannel() {
      return this.userStore.selectedChannel;
    },
    mentionsOnly() {
      return this.userStore.mentionsOnly;
    },
    allUsers() {
      return this.userStore.usersAsMemberInterface;
    },
    allPublicChannels() {
      return this.userStore.publicChannels;
    },

    typingMessage() {
      return this.userStore.typingMessage;
    },
    typingMember() {
      return this.userStore.typingMember;
    },

    messagesCompositeKey() {
      if (!this.loggedUser || !this.selectedChannel){
        return '';
      }
      return `${this.selectedChannel.name}-${this.visibleMessages.length}-${this.loggedUser.state}`;
    },

    typingCompositeKey() {
      if (!this.typingMessage || !this.typingMember){
        return '';
      }

      return `${this.typingMessage}-${this.typingMember?.nickName}`
    }
  },

  // created() {
  //   // this.initMessages();
  //   // this.simulateTypingMember();
  // },

  watch: {
    selectedChannel(newChannel, oldChannel) {
      if (!newChannel) {
        this.visibleMessages = [];
      }
      else if (newChannel !== oldChannel) {
        this.visibleMessages = [];
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

    onMessageInputChange(newValue: string | number | null) {
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }

      this.userStore.emitTyping(newValue)
      this.typingTimeout = setTimeout(() => {
        this.userStore.emitStopTyping();
        this.typingTimeout = null;
      }, 5000);
    },

    async initMessages() {
      if (!this.selectedChannel) {
        return;
      }

      if (this.loading) {
        if (this.infiniteScroll && this.infiniteScroll.stop) {
          this.infiniteScroll.stop();
        }
        return;
      }
      this.loading = true;

      await this.userStore.loadMessages(
        this.selectedChannel.name,
        null,
        this.itemsPerPage,
        (messages: Message[]) => {
          this.visibleMessages = messages
          this.lastVisibleMessage = this.visibleMessages.length > 0 ? this.visibleMessages[0] : null;
        }
      )

      this.loading = false;
    },

    async loadMoreMessages() {
      if (!this.selectedChannel || !this.userStore.channelMessages) {
        return;
      }

      if (this.loading) {
        this.infiniteScroll?.stop();
        return;
      }
      this.loading = true;

      if (this.userStore.channelMessages.length < this.itemsPerPage) {
        this.infiniteScroll?.stop();
        this.loading = false;
        return;
      }

      try {
        const currentMessages = this.visibleMessages;
        await this.userStore.loadMessages(
          this.selectedChannel.name,
          this.lastVisibleMessage?.id ?? null,
          this.itemsPerPage,
          (messages: Message[]) => {
            if (messages && messages.length === 0) {
              this.infiniteScroll?.stop();
              this.loading = false;
              return;
            }
            this.visibleMessages = [...messages, ...currentMessages];
            this.lastVisibleMessage = this.visibleMessages.length > 0 ? this.visibleMessages[0] : null;
          }
        );
      } catch (error) {
        console.error('Error loading more messages:', error);
      } finally {
        this.loading = false;
      }
    },

    isLoggedUser(message: Message) {
      if (this.loggedUser) {
        return message.sender === this.loggedUser.nickName;
      }
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
      // if (this.simulateIncomingMessages) {
      //   clearInterval(this.simulationInterval);
      //   this.simulateIncomingMessages = false;
      // } else {
      //   this.simulationInterval = setInterval(this.simulateIncomingMessage, 5000);
      //   this.simulateIncomingMessages = true;
      // }
    },

    simulateIncomingMessage() {
      // const otherUsers = this.selectedChannel.users.filter(user => user.nickName !== this.loggedUser.nickName);
      // const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
      // const mentionLoggedUser = Math.random() < 0.5;

      // let randomMessageContent = `Hello, my name is ${randomUser.firstName} ${randomUser.lastName} and my nick is ${randomUser.nickName}.`;
      // if (mentionLoggedUser) {
      //   randomMessageContent = `Hi @${this.loggedUser.nickName} how are you?`;
      // }

      // const incomingMessage = {
      //   user: randomUser,
      //   content: randomMessageContent,
      //   timestamp: new Date(),
      //   channel: this.selectedChannel
      // };

      // this.fetchNewMessage(incomingMessage)

      // if (this.loggedUser.status === 'offline') {
      //   return;
      // }
      // this.visibleMessages = [...this.messages.slice(-this.itemsPerPage)];

      // //  TURN AROUND CONDITION !AppVisibility.appVisible AFTER IMPLEMENTING FULL NOTIFICATIONS AS IT IS REQUIRED IN ASSIGNMENT

      // if (this.loggedUser.status === 'DND') {
      //   return;
      // }

      // if (AppVisibility.appVisible) {
      //   if (!this.mentionsOnly || incomingMessage.content.includes('@' + this.loggedUser.nickName)) {
      //     this.$q.notify({
      //       message: `${randomUser.nickName}: ${randomMessageContent.substring(0, 30)}...`,
      //       color: 'info',
      //       position: 'top',
      //       timeout: 3000
      //     });
      //   }
      // }
    },


    async sendMessage() {
      if (!this.newMessage || this.newMessage.length === 0) return;
      if (this.selectedChannel) {
        await this.userStore.sendNewMessage(this.selectedChannel.name, this.newMessage);
        this.newMessage = '';
      }
    },


    simulateTypingMember() {
      // const otherMembers = this.selectedChannel.users.filter(
      //   user => user.nickName !== this.loggedUser.nickName
      // );
      // if (otherMembers.length === 0) return;

      // this.typingMember = otherMembers[Math.floor(Math.random() * otherMembers.length)];
      // this.showTypingBanner = true;
    },

    async handleCommand(commandString: string) {
      const [command, ...args] = commandString.split(' ');

      if(!command || !this.selectedChannel || !this.loggedUser){
        return;
      }

      switch (command.toLowerCase()) {
        case '/join': {
          const channelName = args[0] || '';
          if (channelName == ''){
            await this.sendMessage();
            break;
          }
          const isAlreadyInChannel = this.loggedUser.channels.some((userChannel) => userChannel.name === channelName);

          if (isAlreadyInChannel) {
            this.displayedError = 'You are already in this channel.';
            break;
          }

          const channelToJoin = this.allPublicChannels.find((channel) => channel.name === channelName);
          if (!channelToJoin) {
            const isPrivate = args.length > 1 && args[1] === '[private]';

            await this.userStore.createNewChannel(channelName, isPrivate);
            break;
          }

          let alreadyInChannel = false;
          await this.userStore.isUserInChannel(channelName).then((isInChannel) => {
            if (isInChannel.data) {
              this.displayedError = 'You are already a member of this channel.';
              alreadyInChannel = true;
            }
          })
          if (alreadyInChannel) { break; }

          this.userStore.joinPublicChannel(channelName);
          break;
        }
        case '/invite': {
          this.displayedError = '';
          const nickName = args[0] || '';
          if (nickName == ''){
            await this.sendMessage();
            break;
          }
          if (!this.selectedChannel.isPrivate || this.loggedUser.nickName === this.selectedChannel.admin.nickName) {
            const userToInvite = this.allUsers.find(user => user.nickName === nickName);
            if (!userToInvite) {
              this.displayedError = `User with nickname '${nickName}' doesn't exist.`;
              break;
            }

            const isAlreadyMember = this.selectedChannel.users.some(member => member.nickName === nickName);

            if (isAlreadyMember) {
              this.displayedError = `User '${nickName}' is already a member of this channel.`;
              break;
            }
            await this.userStore.addUserToChannel(this.selectedChannel.name, userToInvite.nickName);
          }
          else {
            this.displayedError = 'You are not allowed to invite new members to this channel.';
          }
          break;
        }
        case '/kick': {
          const nickName = args[0] || '';
          if (nickName == ''){
            await this.sendMessage();
            break;
          }
          if (nickName === this.loggedUser.nickName) {
            this.displayedError = 'You can not kick or vote to kick yourself out. Please use /cancel';
            break;
          }
          const memberToKick = this.selectedChannel.users.find((member) => member.nickName === nickName);
          if (this.loggedUser.nickName === this.selectedChannel.admin.nickName) {
            if (!memberToKick) {
              this.displayedError = `User with nickname '${nickName}' is not in this channel.`;
              break;
            }
            await this.userStore.kickUserFromChannel(this.selectedChannel.name, memberToKick.nickName);
          }
          else if (!this.selectedChannel.isPrivate) {
            this.displayedError = 'You are not the admin of this channel, so you will only vote to kick a member.';
            if (!memberToKick) {
              this.displayedError = `User with nickname '${nickName}' is not in this channel.`;
              break;
            }
            await this.userStore.requestKickUserFromChannel(this.selectedChannel.name, memberToKick.nickName);
          }
          else {
            this.displayedError = 'You are not allowed to kick or request to kick a member out of this channel.';
          }
          break;
        }
        case '/cancel':
          await this.userStore.leaveChannel(this.selectedChannel.name);
          break;

        case '/quit':
          if (this.loggedUser.nickName === this.selectedChannel.admin.nickName) {
            await this.userStore.deleteChannel(this.selectedChannel.name);
          }
          else {
            this.displayedError = 'You are not admin of this channel, so you can not delete it.';
          }
          break;

        case '/list':
          this.userStore.toggleRightDrawerOpen();
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

.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
}

</style>
