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
      <q-card class="q-pa-md">
        <q-card-section>
          <div class="text-h6">{{ selectedChannel.name }} Chat</div>
        </q-card-section>

        <q-list class="message-list">
          <q-item v-for="message in selectedChannel.messages" :key="message.timestamp" :class="{'message-right': isLoggedUser(message)}">
            <q-item-section>
              <q-item-label :class="{'sent-message': isLoggedUser(message), 'received-message': !isLoggedUser(message)}">
                {{ message.content }}
              </q-item-label>
              <q-item-label caption>
                {{ message.user.nickName }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>

      <div class="message-input">
        <q-input v-model="newMessage" label="Type a message..." outlined />
        <q-btn @click="sendMessage" label="Send" color="primary" />
      </div>
    </div>
  </div>
</template>

<script>
import {mapGetters, mapMutations} from 'vuex';

export default {
  data() {
    return {
      newMessage: '',
    };
  },

  computed: {
    ...mapGetters('all', {
      loggedUser: 'getLoggedUser',
      selectedChannel: 'getSelectedChannel',
    }),
  },

  methods: {
    ...mapMutations('all', ['sendNewMessage']),

    isLoggedUser(message) {
      return message.user.nickName === this.loggedUser.user.nickName;
    },
    sendMessage() {
      let payload = {
        content: this.newMessage,
        timestamp: new Date(),
        channel: this.selectedChannel
      }
      this.sendNewMessage(payload)
      this.newMessage = '';
    }
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
  justify-content: space-between;
  height: 100%;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  max-height: 70vh;
  padding-bottom: 10px;
}

.message-right {
  text-align: right;
}

.sent-message {
  background-color: #E0F7FA;
  padding: 5px;
  border-radius: 5px;
  margin-bottom: 5px;
}

.received-message {
  background-color: #E0E0E0;
  padding: 5px;
  border-radius: 5px;
  margin-bottom: 5px;
}

.message-input {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-top: 1px solid #e0e0e0;
}
</style>
