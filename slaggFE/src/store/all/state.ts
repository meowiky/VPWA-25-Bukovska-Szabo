export interface MessageStateInterface {
  content: string;
  timestamp: Date;
  user: MemberStateInterface;
}

export interface MemberStateInterface {
  firstName: string;
  lastName: string;
  nickName: string;
  status: 'online' | 'DND' | 'offline';
}

export interface KickVoteStateInterface {
  member: MemberStateInterface;
  votes: {
    voter: MemberStateInterface;
  }[];
}

export interface ChannelStateInterface {
  name: string;
  isPrivate: boolean;
  admin: MemberStateInterface;
  members: MemberStateInterface[];
  messages: MessageStateInterface[];
  kickVotes: KickVoteStateInterface[];
}

export interface UserStateInterface {
  user: MemberStateInterface;
  email: string;
  password: string;
  isLoggedIn: boolean;
  channels: ChannelStateInterface[];
}

export interface AllStateInterface {
  mentionsOnly: boolean;
  isUserLoggedIn: boolean;
  token: string;
  loggedUser: UserStateInterface;
  selectedChannel: ChannelStateInterface;
  usersAsMemberInterface: MemberStateInterface[];
  publicChannels: ChannelStateInterface[];
  rightDrawerOpen: boolean;
}

function state(): AllStateInterface {
  return {
    mentionsOnly: false,
    isUserLoggedIn: false,
    token: '',
    loggedUser: {
      user: {
        firstName: '',
        lastName: '',
        nickName: '',
        status: 'online'
      },
      email: '',
      password: '',
      isLoggedIn: false,
      channels: []
    },
    selectedChannel: {
      name: '',
      isPrivate: false,
      admin: {
        firstName: '',
        lastName: '',
        nickName: '',
        status: 'offline'
      },
      members: [],
      messages: [],
      kickVotes: []
    },
    usersAsMemberInterface: [],
    publicChannels: [],
    rightDrawerOpen: true,
  };
}

export default state;
