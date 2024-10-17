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
    // these messages were AI generated by chat gpt
    {
      content: 'Is this the new channel everyone’s talking about?',
      timestamp: new Date('2020-01-03T09:00:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'Yes, it’s a private one!',
      timestamp: new Date('2020-01-03T09:05:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'Cool! Looking forward to some good discussions here.',
      timestamp: new Date('2020-01-03T09:10:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'Let’s start by setting some ground rules.',
      timestamp: new Date('2020-01-03T09:15:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'Good idea. Everyone should stay respectful.',
      timestamp: new Date('2020-01-03T09:20:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'And keep the conversation productive!',
      timestamp: new Date('2020-01-03T09:25:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'We should organize a team meeting soon.',
      timestamp: new Date('2020-01-03T09:30:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'Agreed. A kickoff meeting sounds great.',
      timestamp: new Date('2020-01-03T09:35:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'How about this Friday?',
      timestamp: new Date('2020-01-03T09:40:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'Friday works for me.',
      timestamp: new Date('2020-01-03T09:45:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'Same here.',
      timestamp: new Date('2020-01-03T09:50:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'Let’s schedule it then!',
      timestamp: new Date('2020-01-03T09:55:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'I’ll send out the invites.',
      timestamp: new Date('2020-01-03T10:00:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'Thanks, Lucia!',
      timestamp: new Date('2020-01-03T10:05:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'No problem!',
      timestamp: new Date('2020-01-03T10:10:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'What’s the agenda for the meeting?',
      timestamp: new Date('2020-01-03T10:15:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'I’ll draft an agenda today.',
      timestamp: new Date('2020-01-03T10:20:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'Great, make sure to include time for brainstorming.',
      timestamp: new Date('2020-01-03T10:25:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'Of course! We need to generate new ideas.',
      timestamp: new Date('2020-01-03T10:30:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'What about the project updates?',
      timestamp: new Date('2020-01-03T10:35:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'That should be the first topic.',
      timestamp: new Date('2020-01-03T10:40:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'Agreed. We need to review progress.',
      timestamp: new Date('2020-01-03T10:45:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'How’s everyone feeling about the current timeline?',
      timestamp: new Date('2020-01-03T10:50:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'I think we’re a bit behind.',
      timestamp: new Date('2020-01-03T10:55:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'Yeah, we might need to extend it.',
      timestamp: new Date('2020-01-03T11:00:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'Let’s discuss it at the meeting.',
      timestamp: new Date('2020-01-03T11:05:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'Good plan!',
      timestamp: new Date('2020-01-03T11:10:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'What about our next milestones?',
      timestamp: new Date('2020-01-03T11:15:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'We should revisit those too.',
      timestamp: new Date('2020-01-03T11:20:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'Definitely. Let’s get everything on track.',
      timestamp: new Date('2020-01-03T11:25:00.000Z'),
      user: {}
    } as MessageStateInterface,
    {
      content: 'Looking forward to it!',
      timestamp: new Date('2020-01-03T11:30:00.000Z'),
      user: {}
    } as MessageStateInterface,
  ]
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
    } as UserStateInterface,
    {
      user: {
        firstName: 'lucia',
        lastName: 'idkpriezvisko',
        nickName: 'lulu',
        status: 'online'
      },
      email: 'lu@gmail.com',
      password: '123',
      isLoggedIn: false,
      channels: []
    } as UserStateInterface,
    {
      user: {
        firstName: 'Peter',
        lastName: 'surname',
        nickName: 'pete',
        status: 'online'
      },
      email: 'pete@gmail.com',
      password: '123',
      isLoggedIn: false,
      channels: []
    } as UserStateInterface,
    {
      user: {
        firstName: 'Juraj',
        lastName: 'surname',
        nickName: 'Duro',
        status: 'online'
      },
      email: 'juro@gmail.com',
      password: '123',
      isLoggedIn: false,
      channels: []
    } as UserStateInterface,
  ]
}

export const channel_db = {
  'channel': [
    {
      name: 'general',
      isPrivate: false,
      admin: users_db.users[0].user,
      members: [users_db.users[0].user, users_db.users[1].user, users_db.users[2].user],
      messages: [message_db.message[0], message_db.message[1]],
      kickVotes: []
    } as ChannelStateInterface,
    {
      name: 'private_channel',
      isPrivate: true,
      admin: users_db.users[0].user,
      members: [users_db.users[0].user, users_db.users[1].user, users_db.users[2].user],
      messages: [message_db.message[2], message_db.message[3]],
      kickVotes: []
    } as ChannelStateInterface,
    {
      name: 'super_channel',
      isPrivate: true,
      admin: users_db.users[2].user,
      members: [users_db.users[2].user, users_db.users[0].user, users_db.users[1].user],
      messages: [
        message_db.message[4],
        message_db.message[5],
        message_db.message[6],
        message_db.message[7],
        message_db.message[8],
        message_db.message[9],
        message_db.message[10],
        message_db.message[11],
        message_db.message[12],
        message_db.message[13],
        message_db.message[14],
        message_db.message[15],
        message_db.message[16],
        message_db.message[17],
        message_db.message[18],
        message_db.message[19],
        message_db.message[20],
        message_db.message[21],
        message_db.message[22],
        message_db.message[23],
        message_db.message[24],
        message_db.message[25],
        message_db.message[26],
        message_db.message[27],
        message_db.message[28],
        message_db.message[29],
        message_db.message[30],
        message_db.message[31],
        message_db.message[32],
        message_db.message[33],
        message_db.message[34],
      ],
      kickVotes: []
    } as ChannelStateInterface
  ]
}

users_db.users[0].channels = [channel_db.channel[0], channel_db.channel[1], channel_db.channel[2]] as ChannelStateInterface[]
users_db.users[1].channels = [channel_db.channel[0], channel_db.channel[1], channel_db.channel[2]] as ChannelStateInterface[]
users_db.users[2].channels = [channel_db.channel[0], channel_db.channel[1], channel_db.channel[2]] as ChannelStateInterface[]
message_db.message[0].user = users_db.users[0].user as MemberStateInterface
message_db.message[1].user = users_db.users[1].user as MemberStateInterface
message_db.message[2].user = users_db.users[0].user as MemberStateInterface
message_db.message[3].user = users_db.users[1].user as MemberStateInterface
message_db.message[4].user = users_db.users[0].user as MemberStateInterface
message_db.message[5].user = users_db.users[2].user as MemberStateInterface
message_db.message[6].user = users_db.users[1].user as MemberStateInterface
message_db.message[7].user = users_db.users[2].user as MemberStateInterface
message_db.message[8].user = users_db.users[0].user as MemberStateInterface
message_db.message[9].user = users_db.users[1].user as MemberStateInterface
message_db.message[10].user = users_db.users[2].user as MemberStateInterface
message_db.message[11].user = users_db.users[0].user as MemberStateInterface
message_db.message[12].user = users_db.users[1].user as MemberStateInterface
message_db.message[13].user = users_db.users[2].user as MemberStateInterface
message_db.message[14].user = users_db.users[0].user as MemberStateInterface
message_db.message[15].user = users_db.users[1].user as MemberStateInterface
message_db.message[16].user = users_db.users[2].user as MemberStateInterface
message_db.message[17].user = users_db.users[0].user as MemberStateInterface
message_db.message[18].user = users_db.users[1].user as MemberStateInterface
message_db.message[19].user = users_db.users[2].user as MemberStateInterface
message_db.message[20].user = users_db.users[0].user as MemberStateInterface
message_db.message[21].user = users_db.users[1].user as MemberStateInterface
message_db.message[22].user = users_db.users[2].user as MemberStateInterface
message_db.message[23].user = users_db.users[0].user as MemberStateInterface
message_db.message[24].user = users_db.users[1].user as MemberStateInterface
message_db.message[25].user = users_db.users[2].user as MemberStateInterface
message_db.message[26].user = users_db.users[0].user as MemberStateInterface
message_db.message[27].user = users_db.users[1].user as MemberStateInterface
message_db.message[28].user = users_db.users[2].user as MemberStateInterface
message_db.message[29].user = users_db.users[0].user as MemberStateInterface
message_db.message[30].user = users_db.users[1].user as MemberStateInterface
message_db.message[31].user = users_db.users[2].user as MemberStateInterface
message_db.message[32].user = users_db.users[0].user as MemberStateInterface
message_db.message[33].user = users_db.users[1].user as MemberStateInterface
message_db.message[34].user = users_db.users[2].user as MemberStateInterface
