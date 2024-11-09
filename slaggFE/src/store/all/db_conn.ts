import axios from 'axios'
import { ChannelStateInterface, MemberStateInterface, MessageStateInterface, UserStateInterface } from './state'

// TODO:: Find better approach
axios.defaults.baseURL = 'http://localhost:3333' // Adonis URL

async function getChannel(name: string): Promise<ChannelStateInterface | undefined> {
  try {
    const response = await axios.get(`/api/channels/${name}`)
    return response.data || undefined
  } catch (error) {
    console.error('Error fetching channel:', error)
    return undefined
  }
}

async function registerNewUser(user: UserStateInterface): Promise<void> {
  try {
    await axios.post('/api/users', user)
  } catch (error) {
    console.error('Error registering new user:', error)
  }
}

async function createNewChannel(channel: ChannelStateInterface): Promise<void> {
  try {
    await axios.post('/api/channels', channel)
  } catch (error) {
    console.error('Error creating new channel:', error)
  }
}

async function deleteChannel(channel: ChannelStateInterface): Promise<void> {
  try {
    await axios.delete(`/api/channels/${channel.name}`)
  } catch (error) {
    console.error('Error deleting channel:', error)
  }
}

async function removeUserFromChannel(user: MemberStateInterface, channel: ChannelStateInterface): Promise<void> {
  try {
    await axios.post(`/api/channels/${channel.name}/remove-user`, { user })
  } catch (error) {
    console.error('Error removing user from channel:', error)
  }
}

async function addUserToChannel(user: MemberStateInterface, channel: ChannelStateInterface): Promise<void> {
  try {
    await axios.post(`/api/channels/${channel.name}/add-user`, { user })
  } catch (error) {
    console.error('Error adding user to channel:', error)
  }
}

async function saveMessage(message: MessageStateInterface, channel: ChannelStateInterface): Promise<[MessageStateInterface, ChannelStateInterface]> {
  try {
    const response = await axios.post('/api/messages', { message, channelName: channel.name })  // Use channel.name
    return [response.data.message, response.data.channel]
  } catch (error) {
    console.error('Error saving message:', error)
    return [message, channel]
  }
}


async function verifyUserCredentials(email: string, password: string): Promise<UserStateInterface | false> {
  try {
    const response = await axios.post('/api/login', { email, password })
    return response.data || false
  } catch (error) {
    console.error('Error verifying credentials:', error)
    return false
  }
}

async function getAllUsersAsMemberInterface(loggedUser: UserStateInterface): Promise<MemberStateInterface[]> {
  try {
    const response = await axios.get('/api/users/members', { params: { loggedUser } })
    return response.data || []
  } catch (error) {
    console.error('Error getting users as members:', error)
    return []
  }
}

async function getAllPublicChannels(): Promise<ChannelStateInterface[]> {
  try {
    const response = await axios.get('/api/channels/public')
    return response.data || []
  } catch (error) {
    console.error('Error fetching public channels:', error)
    return []
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
  verifyUserCredentials,
  getAllUsersAsMemberInterface,
  getAllPublicChannels
}
