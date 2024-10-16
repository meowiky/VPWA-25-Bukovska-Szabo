import {
  ChannelStateInterface,
  MemberStateInterface,
  MessageStateInterface,
  UserStateInterface
} from 'src/store/all/state';




export const message_db = {
  'message': [
    {
      content: 'Hello!',
      timestamp: new Date('2020-01-01T00:00:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'Hey there!',
      timestamp: new Date('2020-01-01T00:00:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'Hello there!',
      timestamp: new Date('2020-01-01T00:00:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'Hi!',
      timestamp: new Date('2020-01-01T00:00:00.000Z'),
      user: {}
    } as MessageStateInterface,
  ],
}


export const users_db = {
  'users': [
    {
      user: {
        firstName: 'John',
        lastName: 'Doe',
        nickName: 'user1',
        status: 'online'
      },
      email: 'j@j.com',
      password: '123',
      isLoggedIn: false,
      channels: []
    } as UserStateInterface,
    {
      user: {
        firstName: 'Jane',
        lastName: 'Doe',
        nickName: 'user2',
        status: 'online'
      },
      email: 'j2@j.com',
      password: '123',
      isLoggedIn: false,
      channels: []
    } as UserStateInterface
  ]
}

export const channel_db = {
  'channel': [
    {
      name: 'general',
      isPrivate: false,
      admin: users_db.users[0].user,
      members: [users_db.users[0].user, users_db.users[1].user],
      messages: [message_db.message[0], message_db.message[1]]
    } as ChannelStateInterface,
    {
      name: 'private_channel',
      isPrivate: true,
      admin: users_db.users[0].user,
      members: [users_db.users[0].user, users_db.users[1].user],
      messages: [message_db.message[2], message_db.message[3]]
    } as ChannelStateInterface
  ]
}

users_db.users[0].channels = [channel_db.channel[0], channel_db.channel[1]] as ChannelStateInterface[]
users_db.users[1].channels = [channel_db.channel[0], channel_db.channel[1]] as ChannelStateInterface[]
message_db.message[0].user = users_db.users[0].user as MemberStateInterface
message_db.message[1].user = users_db.users[1].user as MemberStateInterface
message_db.message[2].user = users_db.users[0].user as MemberStateInterface
message_db.message[3].user = users_db.users[1].user as MemberStateInterface
