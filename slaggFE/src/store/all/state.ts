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

export interface ChannelStateInterface {
  name: string;
  isPrivate: boolean;
  admin: MemberStateInterface;
  members: MemberStateInterface[];
  messages: MessageStateInterface[];
}

export interface UserStateInterface {
  user: MemberStateInterface;
  email: string;
  password: string;
  isLoggedIn: boolean;
  channels: ChannelStateInterface[];
}

export interface AllStateInterface {
  isUserLoggedIn: boolean;
  loggedUser: UserStateInterface;
  selectedChannel: ChannelStateInterface;
  usersAsMemberInterface: MemberStateInterface[];
}

function state(): AllStateInterface {
  return {
    isUserLoggedIn: false,
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
      messages: []
    },
    usersAsMemberInterface: []
  };
}

export default state;
