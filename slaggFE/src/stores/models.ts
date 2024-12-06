export interface User {
    id: number,
    email: string,
    nickName: string,
    registeredAt: Date,
    name: string | null,
    surname: string | null,
    state: string | null,
    lastActiveState: Date,
    channels: Channel[],
}

export interface KickRequest {
    requesterNickName: string,
}

export interface Member {
    id: number,
    email: string,
    nickName: string,
    kickRequests: KickRequest[] | null,
    status: string | null,
}

export interface OtherUser {
    nickName: string,
}

export interface Channel {
    admin: Member,
    id: number,
    isPrivate: boolean,
    lastActive: Date,
    name: string,
    users: Member[],
}

export interface JoinableChannel {
    id: number,
    isPrivate: boolean,
    lastActive: Date,
    name: string,
}

export interface Message {
    content: string,
    sentAt: Date,
    id: number,
    sender: string,
}