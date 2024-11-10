import axios from 'axios';
import { ChannelStateInterface, MemberStateInterface, MessageStateInterface, UserStateInterface } from './state';

// TODO:: Use environment variables or config files for API base URL
axios.defaults.baseURL = 'http://localhost:3333'  // Adonis API URL

async function registerNewUser(nickName: string, email: string, password: string): Promise<string | null> {
  const data = {
    nickname: nickName,
    email: email,
    password: password,
  };

  try {
    const response = await axios.post('/api/register', data);
    const token = response.data?.token;

    return token || null;
  } catch (error) {
    console.error('Error registering new user:', error);
    return null;
  }
}

// todo
async function createNewChannel(channel: ChannelStateInterface): Promise<void> {
  const data = {
    name: channel.name,
    visibility: channel.isPrivate ? 'private' : 'public'
  };

  try {
    await axios.post('/api/channels', data);
  } catch (error) {
    console.error('Error creating new channel:', error);
  }
}

// todo
async function deleteChannel(channel: ChannelStateInterface): Promise<void> {
  try {
    await axios.delete(`/api/channels/${channel.name}`);
  } catch (error) {
    console.error('Error deleting channel:', error);
  }
}

// todo
async function removeUserFromChannel(user: MemberStateInterface, channel: ChannelStateInterface): Promise<void> {
  try {
    await axios.post(`/api/channels/${channel.name}/remove-user`, { nickname: user.nickName });
  } catch (error) {
    console.error('Error removing user from channel:', error);
  }
}

// todo
async function addUserToChannel(user: MemberStateInterface, channel: ChannelStateInterface): Promise<void> {
  try {
    await axios.post(`/api/channels/${channel.name}/add-user`, { user: { nickname: user.nickName } });
  } catch (error) {
    console.error('Error adding user to channel:', error);
  }
}

// todo
async function saveMessage(message: MessageStateInterface, channel: ChannelStateInterface): Promise<[MessageStateInterface, ChannelStateInterface]> {
  try {
    const response = await axios.post('/api/messages', { message, channelName: channel.name });
    return [response.data.message, response.data.channel];
  } catch (error) {
    console.error('Error saving message:', error);
    return [message, channel];
  }
}

async function login(email: string, password: string): Promise<string | null> {
  try {
    const response = await axios.post('/api/login', { email, password });
    const token = response.data?.token;
    return token || null;
  } catch (error) {
    console.error('Error verifying credentials:', error);
    return null;
  }
}

async function getLoggedUser(token: string): Promise<{ user: UserStateInterface; allPublicChannels: ChannelStateInterface[]; allUsers: MemberStateInterface[] } | false> {
  try {
    const response = await axios.get('/api/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const { user, allPublicChannels, allUsers } = response.data;

    if (user && allPublicChannels && allUsers) {
      return { user, allPublicChannels, allUsers };
    }

    return false;
  } catch (error) {
    console.error('Error fetching logged-in user:', error);
    return false;
  }
}

async function logout(token: string): Promise <boolean> {
  try {
    const response = await axios.delete('/api/logout', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (response.data.message = 'success') {
      return true
    }
    return false
  } catch (error) {
    console.error('Error during logout:', error);
    return false;
  }
}

export {
  registerNewUser,
  createNewChannel,
  deleteChannel,
  removeUserFromChannel,
  addUserToChannel,
  saveMessage,
  login,
  getLoggedUser,
  logout
}
