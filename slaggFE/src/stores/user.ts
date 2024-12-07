import { defineStore } from 'pinia';
import type { Channel, JoinableChannel, Message, OtherUser, User } from './models';
import { api } from 'src/boot/axios';
import socketService from 'src/services/socket';
import { SocketService } from 'src/services/socket';

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
    socketService: socketService as SocketService
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
                    const { user, allPublicChannels, allUsers } = response.data;
                    this.loggedUser = user;
                    this.publicChannels = allPublicChannels;
                    this.usersAsMemberInterface = allUsers;
                    this.isUserLoggedIn = true;
                }

                // socket.io.opts.query = { token: this.token };

                const socket = this.socketService.connect('test', this.token);
                const message = 'Dummy message'
                socket.emit('addMessage', message)
                console.log('Socket connected:', socket.connected);
            }
        } catch (error) {
            console.error('Auth error:', error);
            delete api.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
            this.token = null;
        }
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
    async register(nickName: string, email: string, password: string) {
        try {
            const data = {
                nickname: nickName,
                email: email,
                password: password,
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

    async reloadData() {
        try {
            const response = await api.get('/api/me');
            if (response) {
                const { user, allPublicChannels, allUsers } = response.data;
                this.loggedUser = user;
                this.publicChannels = allPublicChannels;
                this.usersAsMemberInterface = allUsers;
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
            await this.reloadData();
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
            await this.reloadData();
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
            await this.reloadData();
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
            await this.reloadData();
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
            await this.reloadData();
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
            await this.reloadData();
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
            await this.reloadData();
        } catch (error) {
            console.error('request kick user from channel error:', error);
        }
    },

    async fetchMessages(channelName: string) {
        try {
            const response = await api.get('/api/messages', {
                params: {
                    channelName
                }
            });
            this.channelMessages = response.data.data;
        } catch (error) {
            console.error('fetch messages error:', error);
        }
    },

    async sendNewMessage(channel: string, message: string) {
        try {
            // await api.post(
            //     '/api/messages',
            //     {
            //       channelName: channel,
            //       message
            //     },
            // );

            if (!this.socketService.sockets[channel]) {
              return;
            }

            this.socketService.sockets[channel].emit('newMessage', { message });
            await this.reloadData();
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

    toggleRightDrawerOpen() {
        this.rightDrawerOpen = !this.rightDrawerOpen;
    },

    async setSelectedChannel(channel: Channel | null) {
        this.selectedChannel = channel;
        if(channel) {
            await this.fetchMessages(channel.name);
        }
        else if(!channel) {
            this.channelMessages = [];
        }
    },

  },
  getters: {

  },
});
