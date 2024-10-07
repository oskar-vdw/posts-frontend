export type User = {
    username: string;
    displayname: string;
    id: number;
    token: string;
    profilePicture?: string;
}

export interface LoginUser {

    codeInput?: number;
    usernameInput?: string;
}

export interface NewUser extends LoginUser {
    displayName?: string;
}


export interface Circle {
    name: string;
    users: User[];
    posts: string[] | null;
    id: number;
}


export interface Post {
    id: number;
    postType: string;
    text: string;
    displayName: string;
    likes: [];
    createdAt: string;
    userId: number;
    totalReplies: number;
    images: []
}

export interface IndividualPost extends Post {
    circleId: number,
    directReplies: IndividualPost[]
}

export interface PostInteraction {
    id: number,
    likeIds: number[],
    totalReplies: number,
    parentId?: number,
}