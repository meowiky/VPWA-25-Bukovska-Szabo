import { defineStore } from 'pinia';
import type { Channel, JoinableChannel, Member, Message, OtherUser, User } from './models';
import { UserState } from './models';
import { api } from 'src/boot/axios';
import socketService from 'src/services/socket';
import { SocketService } from 'src/services/socket';
import {AppVisibility, QVueGlobals} from "quasar";

export const useUserStore = defineStore('user', {
  state: () => ({
    mentionsOnly: false as boolean,
    isUserLoggedIn: false as boolean,
    token: localStorage.getItem('token') || null,
    loggedUser: null as User | null,
    selectedChannel: null as Channel | null,
    usersAsMemberInterface: [] as OtherUser[],
    publicChannels: [] as JoinableChannel[],
    rightDrawerOpen: true as boolean,
    channelMessages: null as Message[] | null,
    queuedMessages: [] as Message[],
    socketService: socketService as SocketService,
    ctx: null as QVueGlobals | null
  }),
  actions: {
    async initializeAuth() {
        const token = localStorage.getItem('token');

        try {
            if (token) {
                this.token = token;
                api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
                const response = await api.get('/api/me');
                if (response) {
                    const { user, channels } = response.data;
                    this.loggedUser = {
                        id: user.id,
                        email: user.email,
                        nickName: user.nickName,
                        registeredAt: user.registeredAt,
                        name: user.name || null,
                        surname: user.surname || null,
                        state: user.state || null,
                        lastActiveState: user.lastActiveState,
                        channels: [],
                    };
                    this.isUserLoggedIn = true;
                    await this.getAllUsers();
                    await this.getJoinablePublicChannels();
                    await this.loadChannels(channels);
                }
            }
        } catch (error) {
            console.error('Auth error:', error);
            delete api.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
            this.token = null;
        }
    },

    async notifyNewMessage(message: Message, channelName: string | null = null) {
      if (
        !this.ctx ||
        (this.loggedUser && this.loggedUser.nickName == message.sender) ||
        (this.loggedUser && this.loggedUser.state == UserState.DND) ||
        (this.loggedUser && this.mentionsOnly && !message.content.includes(`@${this.loggedUser.nickName}`))
        || !AppVisibility.appVisible
      ) { return }

      let notificationMessage = `${message.sender}: ${message.content}`
      if (channelName){
          notificationMessage = `${message.sender} in ${channelName}: ${message.content}`
      }

      this.ctx.notify({
        message: notificationMessage,
        color: 'info',
        position: 'top',
        timeout: 5000
      })

      if (Notification && Notification.permission !== 'granted') {
        await Notification.requestPermission()
      }

      if (Notification) {
        const notification = new Notification(`${message.sender} in ${channelName}`, {
          body: message.content,
          icon: '/favicon.ico'
        })
        notification.onclick = () => {
          window.focus()
          notification.close()
        }
      }
    },

    async loadChannels(channels: string[]) {
        channels.forEach((channelString) => {
            const socket = this.socketService.connect(`${channelString}`, this.token as string);
            socket.on('channel', (addedChannel: Channel) => {
                console.log('channel received:', addedChannel);
                if (this.loggedUser?.channels) {
                    this.loggedUser?.channels.push(addedChannel);
                }
                else {
                    if (this.loggedUser) {
                        this.loggedUser.channels = [addedChannel];
                    }
                }
            });
            socket.on('newMessage', (messageData: Message) => {
                console.log('New message received:', messageData);
                if (this.loggedUser && this.loggedUser.state == UserState.OFFLINE) {
                  this.queuedMessages.push(messageData)
                  return
                }
                this.notifyNewMessage(messageData, channelString);
                if (this.selectedChannel && this.selectedChannel.name === channelString) {
                    if (this.channelMessages) {
                        this.channelMessages.push(messageData);
                    }
                    else {
                        this.channelMessages = [messageData];
                    }
                }
            });
            socket.on('deletedChannel', (channelNameToRemove: string) => {
                console.log('deleted channel:', channelNameToRemove);
                if (this.loggedUser) {
                    this.loggedUser.channels = this.loggedUser.channels.filter(
                        (channel) => channel.name !== channelNameToRemove
                    );
                }
                this.socketService.disconnect(channelNameToRemove);

            });
            socket.on('memberLeftChannel', (memberString: string) => {
                console.log('member left channel:', memberString);
                if (this.loggedUser) {
                    const targetChannel = this.loggedUser.channels.find(
                        (ch) => ch.name === channelString
                    );
                    if (targetChannel) {
                        targetChannel.users = targetChannel.users.filter(
                            (user) => user.nickName !== memberString
                        );
                    }
                }
            });
            socket.on('addedMember', (member: Member) => {
                console.log('member joined channel:', member);
                if (this.loggedUser && (this.loggedUser.nickName != member.nickName)) {
                    const targetChannel = this.loggedUser.channels.find(
                        (ch) => ch.name === channelString
                    );
                    if (targetChannel) {
                        targetChannel.users.push(member);
                    }
                }
            });
            socket.on('reloadUser', (changedMember: Member) => {
                console.log('reloaded user', changedMember);
                if (this.loggedUser) {
                    const targetChannel = this.loggedUser.channels.find(
                        (ch) => ch.name === channelString
                    );
                    if (targetChannel) {
                        targetChannel.users = targetChannel.users.filter(
                            (user) => user.nickName !== changedMember.nickName
                        );
                        if (targetChannel.users) {
                            targetChannel.users.push(changedMember);
                        }
                        else {
                            targetChannel.users = [changedMember];
                        }
                    }

                    if (this.queuedMessages && this.queuedMessages.length > 0) {
                        this.queuedMessages.forEach((message) => {
                            this.notifyNewMessage(message, channelString);
                            if (this.channelMessages) {
                                this.channelMessages.push(message);
                            }
                            else {
                                this.channelMessages = [message];
                            }
                        });
                        this.queuedMessages = [];
                    }
                }
            });
        });
    },
    async login(email: string, password: string) {
        try {
            const response = await api.post('/api/login', { email, password });
            const token = response.data?.token;
            if (token) {
                localStorage.setItem('token', token);
                await this.initializeAuth();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    },
    async register(nickName: string, email: string, password: string, name: string, surname: string) {
        try {
            const data = {
                nickname: nickName,
                email: email,
                password: password,
                name: name,
                surname: surname
            };
            const response = await api.post('/api/register', data);
            const token = response.data.token;

            if (token) {
                localStorage.setItem('token', token);
                await this.initializeAuth();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Register error:', error);
            return false;
        }
    },

    async logout() {
        try {
            for (const channelName in this.socketService.sockets) {
                this.socketService.disconnect(channelName);
            }
            this.socketService.deleteAll();
            const response = await api.delete('/api/logout');
            if (response.data.message == 'Logout successful') {
                localStorage.removeItem('token');
                delete api.defaults.headers.common['Authorization'];
                this.token = null;
                this.isUserLoggedIn = false;
                this.loggedUser = null;
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    },

    async changeStatus(status: UserState | 'online' | 'DND' | 'offline') {
        try {
            const data = {
                status: status,
            };
            const response = await api.post('/api/changeStatus', data);
            if (this.loggedUser) {
                this.loggedUser.state = response.data.status;
                if(this.loggedUser.channels){
                    this.loggedUser.channels.forEach((channel) => {
                        const socket = this.socketService.connect(`${channel.name}`, this.token as string);
                        socket.emit('reloadUser', this.loggedUser?.nickName);
                    });
                }
            }

        } catch (error) {
            console.error('Change status error:', error);
        }
    },

    async getAllUsers() {
        try {
            const response = await api.get('/api/users');
            if (response) {
                const { allUsers } = response.data;
                this.usersAsMemberInterface = allUsers;
            }
        } catch (error) {
            console.error('Reload error:', error);
        }
    },

    async getJoinablePublicChannels() {
        try {
            const response = await api.get('/api/joinable-channels');
            if (response) {
                const { allPublicChannels } = response.data;
                this.publicChannels = allPublicChannels;
            }
        } catch (error) {
            console.error('Reload error:', error);
        }
    },

    async createNewChannel(name: string, isPrivate: boolean) {
        try {
            const data = {
                name: name,
                isPrivate: isPrivate
            };
            await api.post('/api/createChannel', data);
            await this.loadChannels([name]);
        } catch (error) {
            console.error('Create new channel error:', error);
        }
    },

    async deleteChannel(name: string){
        try {
            await api.delete('/api/deleteChannel', {
                data: {
                    name: name,
                }
            });
            if (this.selectedChannel?.name == name) {
                this.selectedChannel = null;
            }
            const socket = this.socketService.connect(`${name}`, this.token as string);
            socket.emit('deletedChannel');
            this.socketService.delete(name);
        } catch (error) {
            console.error('Delete channel error:', error);
        }
    },

    async leaveChannel(name: string){
        try {
            await api.delete('/api/leaveChannel', {
                data: {
                    name: name,
                }
            });
            if (this.selectedChannel?.name == name) {
              this.selectedChannel = null;
            }
            const socket = this.socketService.connect(`${name}`, this.token as string);
            socket.emit('deletedChannel'); // pre istotu ak by bol nas user admin a channel sa aj vymaze
            socket.emit('memberLeftChannel', this.loggedUser?.nickName);
            this.socketService.delete(name);
            if (this.loggedUser) {
                this.loggedUser.channels = this.loggedUser.channels.filter(
                    (channel) => channel.name !== name
                );
            }
        } catch (error) {
            console.error('Delete channel error:', error);
        }
    },

    async kickUserFromChannel(channel: string, user: string) {
        try {
            await api.delete('/api/kickUserFromChannel', {
                data: {
                    channelName: channel,
                    userNickName: user
                }
            });
            const socket = this.socketService.connect(`${channel}`, this.token as string);
            socket.emit('memberLeftChannel', user);
        } catch (error) {
            console.error('Kick user from channel error:', error);
        }
    },

    async addUserToChannel(channel: string, user: string) {
        try {
            await api.post(
                '/api/addUserToChannel',
                {
                  channelName: channel,
                  userNickName: user
                }
            );
            const socket = this.socketService.connect(`${channel}`, this.token as string);
            socket.emit('addedMember', user);
        } catch (error) {
            console.error('add user to channel error:', error);
        }
    },

    async joinPublicChannel(channel: string) {
        try {
            await api.post(
                '/api/joinPublicChannel',
                {
                    channelName: channel
                }
            );
            await this.loadChannels([channel]);
            const socket = this.socketService.connect(`${channel}`, this.token as string);
            socket.emit('addedMember', this.loggedUser?.nickName);
        } catch (error) {
            console.error('join public channel error:', error);
        }
    },

    async requestKickUserFromChannel(channel: string, user: string) {
        try {
            await api.post(
                '/api/requestKickUserFromChannel',
                {
                    channelName: channel,
                    userNickName: user
                }
            );
            const socket = this.socketService.connect(`${channel}`, this.token as string);
            socket.emit('memberLeftChannel', user); // pre istotu, ak by bol member uz vyhodeny lebo toto bol 3 request
            socket.emit('reloadUser', user);
        } catch (error) {
            console.error('request kick user from channel error:', error);
        }
    },

    async sendNewMessage(channel: string, message: string) {
        try {
            if (!this.socketService.sockets[channel]) {
              return;
            }
            this.socketService.sockets[channel].emit('addMessage', message );
        } catch (error) {
            console.error('send message error:', error);
        }
    },

    async isUserInChannel(channel: string) {
        try {
            const response = await api.get('/api/isUserInChannel', {
                params: {
                    channelName: channel
                }
            });

            return response.data || false;
        } catch (error) {
            console.error('is user in channel error:', error);
            return false;
        }
    },

    async loadMessages(channelName: string, messageId: number | null = null, limit: number = 3, callback: (messages: Message[]) => void | null = () => {}) {
        if (this.token) {
            const socket = this.socketService.connect(`${channelName}`, this.token);
            socket.emit('getMessages', limit, messageId);

            socket.on('loadedMessages', (messageData: Message[]) => {
                console.log('Messages received:', messageData);

                this.channelMessages = messageData;
                if (callback) callback(messageData);
            });
        }
    },

    toggleRightDrawerOpen() {
        this.rightDrawerOpen = !this.rightDrawerOpen;
    },

    async setSelectedChannel(channel: Channel | null) {
        this.selectedChannel = channel;
        if(!channel) {
            this.channelMessages = [];
        }
    },

    setContext(ctx: QVueGlobals | null) {
      this.ctx = ctx
    }

  },
  getters: {

  },
});
