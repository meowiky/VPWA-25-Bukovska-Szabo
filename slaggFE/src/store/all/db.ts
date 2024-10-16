export const channel_db = {
  'channel': [
  {
    'id': 1,
    'name': 'general',
    'visibility': 'public',
    'adminId': 1,
    'lastActive': '2020-01-01T00:00:00.000Z'
  },
  {
    'id': 2,
    'name': 'private_channel',
    'visibility': 'private',
    'adminId': 1,
    'lastActive': '2020-01-01T00:00:00.000Z'
  }
]
}

export const messagesChannel_db = {
  'membersChannel': [
    {
      'memberId': 1,
      'channelId': 1
    },
    {
      'memberId': 2,
      'channelId': 1
    }
  ]
}


export const message_db = {
  'message': [
    {
      'id': 1,
      'userId': 1,
      'channelId': 1,
      'sentAt': '2020-01-01T00:00:00.000Z',
      'content': 'Hello!'
    },
    {
      'id': 2,
      'userId': 2,
      'channelId': 1,
      'sentAt': '2020-01-01T00:00:00.000Z',
      'content': 'Hey there!'
    },
    {
      'id': 3,
      'userId': 1,
      'channelId': 2,
      'sentAt': '2020-01-01T00:00:00.000Z',
      'content': 'Hello there!'
    },
    {
      'id': 4,
      'userId': 2,
      'channelId': 2,
      'sentAt': '2020-01-01T00:00:00.000Z',
      'content': 'Hi!'
    }
  ],
}

export const msg_ch_db = {
  'messagesChannel': [
    {
      'messageId': 1,
      'channelId': 1
    },
    {
      'messageId': 2,
      'channelId': 1
    },
    {
      'messageId': 3,
      'channelId': 2
    },
    {
      'messageId': 4,
      'channelId': 2
    }
  ]
}

export const users_db = {
  'users': [
    {
      'id': 1,
      'nickName': 'user1',
      'firstName': 'John',
      'lastName': 'Doe',
      'email': 'j@j.com',
      'password': 'pass1',
      'registeredAt': '2020-01-01T00:00:00.000Z',
      'state': 'offline',
      'lastActiveState': 'online'
    },
    {
      'id': 2,
      'nickName': 'user2',
      'firstName': 'Jane',
      'lastName': 'Doe',
      'email': 'j@j.com',
      'password': 'pass2',
      'registeredAt': '2020-01-01T00:00:00.000Z',
      'state': 'offline',
      'lastActiveState': 'busy'
    }
  ]
}

