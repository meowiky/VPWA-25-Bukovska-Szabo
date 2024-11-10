import axios from 'axios';

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

async function createNewChannel(channel : {
      name: string,
      isPrivate: boolean,
    }, token: string): Promise<void> {
  const data = {
    name: channel.name,
    visibility: channel.isPrivate ? 'private' : 'public'
  };

  try {
    await axios.post('/api/createChannel', data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Error creating new channel:', error);
  }
}

async function deleteChannel(channel: string, token: string): Promise<void> {
  try {
    await axios.delete('/api/deleteChannel', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      data: {
        name: channel
      }
    });
  } catch (error) {
    console.error('Error deleting channel:', error);
  }
}

async function leaveChannel(channel: string, token: string): Promise<void> {
  try {
    await axios.delete('/api/leaveChannel', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      data: {
        name: channel
      }
    });
  } catch (error) {
    console.error('Error leaving channel:', error);
  }
}

async function kickUserFromChannel(channel: string, token: string, user: string): Promise<void> {
  try {
    await axios.delete('/api/kickUserFromChannel', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      data: {
        channelName: channel,
        userNickName: user
      }
    });
  } catch (error) {
    console.error('Error leaving channel:', error);
  }
}

// todo
async function removeUserFromChannel(user: object, channel: object): Promise<void> {
  try {
    await axios.post(`/api/channels/${channel}/remove-user`, { nickname: user });
  } catch (error) {
    console.error('Error removing user from channel:', error);
  }
}

// todo
async function addUserToChannel(user: object, channel: object): Promise<void> {
  try {
    await axios.post(`/api/channels/${channel}/add-user`, { user: { nickname: user } });
  } catch (error) {
    console.error('Error adding user to channel:', error);
  }
}

// todo
async function saveMessage(message: object, channel: object): Promise<[object, object]> {
  try {
    const response = await axios.post('/api/messages', { message, channelName: channel });
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

async function getLoggedUser(token: string): Promise<{ user: object; allPublicChannels: object[]; allUsers: object[] } | false> {
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
  logout,
  leaveChannel,
  kickUserFromChannel
}
