export interface AllStateInterface {
  mentionsOnly: boolean;
  isUserLoggedIn: boolean;
  token: string;
  loggedUser: object;
  selectedChannel: object;
  usersAsMemberInterface: [];
  publicChannels: [];
  rightDrawerOpen: boolean;
  channelMessages: [];
}

function state(): AllStateInterface {
  return {
    mentionsOnly: false,
    isUserLoggedIn: false,
    token: localStorage.getItem('token') || '',
    loggedUser: {
    },
    selectedChannel: {
    },
    usersAsMemberInterface: [],
    publicChannels: [],
    rightDrawerOpen: true,
    channelMessages: [],
  };
}

export default state;
