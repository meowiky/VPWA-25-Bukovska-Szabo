import axios from 'axios';
import { ChannelStateInterface, MemberStateInterface, MessageStateInterface, UserStateInterface } from './state';

// TODO:: Use environment variables or config files for API base URL
axios.defaults.baseURL = 'http://localhost:3333'  // Adonis API URL

// Fetch a specific channel by name
async function getChannel(name: string): Promise<ChannelStateInterface | undefined> {
  try {
    const response = await axios.get(`/api/channels/${name}`);
    return response.data || undefined;
  } catch (error) {
    console.error('Error fetching channel:', error);
    return undefined;
  }
}

// Register a new user (extract relevant fields only)
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

// Create a new channel (extract required data)
async function createNewChannel(channel: ChannelStateInterface): Promise<void> {
  const data = {
    name: channel.name,         // Only extract necessary fields
    visibility: channel.isPrivate ? 'private' : 'public'
  };

  try {
    await axios.post('/api/channels', data);
  } catch (error) {
    console.error('Error creating new channel:', error);
  }
}

// Delete a channel by name
async function deleteChannel(channel: ChannelStateInterface): Promise<void> {
  try {
    await axios.delete(`/api/channels/${channel.name}`);
  } catch (error) {
    console.error('Error deleting channel:', error);
  }
}

// Remove a user from a channel (only extract necessary user data)
async function removeUserFromChannel(user: MemberStateInterface, channel: ChannelStateInterface): Promise<void> {
  try {
    await axios.post(`/api/channels/${channel.name}/remove-user`, { nickname: user.nickName });
  } catch (error) {
    console.error('Error removing user from channel:', error);
  }
}

// Add a user to a channel (only extract necessary user data)
async function addUserToChannel(user: MemberStateInterface, channel: ChannelStateInterface): Promise<void> {
  try {
    await axios.post(`/api/channels/${channel.name}/add-user`, { user: { nickname: user.nickName } });
  } catch (error) {
    console.error('Error adding user to channel:', error);
  }
}

// Save a message (extract the necessary data)
async function saveMessage(message: MessageStateInterface, channel: ChannelStateInterface): Promise<[MessageStateInterface, ChannelStateInterface]> {
  try {
    const response = await axios.post('/api/messages', { message, channelName: channel.name });
    return [response.data.message, response.data.channel];
  } catch (error) {
    console.error('Error saving message:', error);
    return [message, channel];
  }
}

// Verify user credentials during login (only extract email and password)
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

async function getLoggedUser(token: string): Promise<UserStateInterface | false> {
  try {
    const response = await axios.get('/api/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data.user || false;
  } catch (error) {
    console.error('Error fetching logged-in user:', error);
    return false;
  }
}

// Get all users as members (exclude the logged-in user, extract required fields)
async function getAllUsersAsMemberInterface(loggedUser: UserStateInterface): Promise<MemberStateInterface[]> {
  try {
    const response = await axios.get('/api/users/members', { params: { loggedUser } });
    return response.data || [];
  } catch (error) {
    console.error('Error getting users as members:', error);
    return [];
  }
}

// Get all public channels (no need for complex data handling)
async function getAllPublicChannels(): Promise<ChannelStateInterface[]> {
  try {
    const response = await axios.get('/api/channels/public');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching public channels:', error);
    return [];
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
  getChannel,
  registerNewUser,
  createNewChannel,
  deleteChannel,
  removeUserFromChannel,
  addUserToChannel,
  saveMessage,
  login,
  getAllUsersAsMemberInterface,
  getAllPublicChannels,
  getLoggedUser,
  logout
}
