export interface MessageStateInterface {
  content: string;
  timestamp: Date;
  userNickName: string;
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
  password?: string;
  isLoggedIn: boolean;
  channels: ChannelStateInterface[];
}

export interface AllStateInterface {
  loggedUser: UserStateInterface;
}

function state(): AllStateInterface {
  return {
    loggedUser: {
      user: {
        firstName: '',
        lastName: '',
        nickName: '',
        status: 'online'
      },
      email: '',
      isLoggedIn: false,
      channels: []
    },
  };
}

export default state;