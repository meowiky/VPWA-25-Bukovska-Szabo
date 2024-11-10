export interface AllStateInterface {
  mentionsOnly: boolean;
  isUserLoggedIn: boolean;
  token: string;
  loggedUser: object;
  selectedChannel: object;
  usersAsMemberInterface: [];
  publicChannels: [];
  rightDrawerOpen: boolean;
}

function state(): AllStateInterface {
  return {
    mentionsOnly: false,
    isUserLoggedIn: false,
    token: '',
    loggedUser: {
    },
    selectedChannel: {
    },
    usersAsMemberInterface: [],
    publicChannels: [],
    rightDrawerOpen: true,
  };
}

export default state;
