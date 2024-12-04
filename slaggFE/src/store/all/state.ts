export interface AllStateInterface {
  mentionsOnly: boolean;
  isUserLoggedIn: boolean;
  token: string;
  loggedUser: object | null;
  selectedChannel: object | null;
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
    loggedUser: null,
    selectedChannel: null,
    usersAsMemberInterface: [],
    publicChannels: [],
    rightDrawerOpen: true,
    channelMessages: [],
  };
}

export default state;
