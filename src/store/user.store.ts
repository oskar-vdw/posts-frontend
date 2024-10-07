import { defineStore } from 'pinia'
import axios from 'axios'

interface User {
    id: number;
    displayName: string;
    username: string;
}

interface Circle {
    name: string;
    users: User[];
    posts: string[] | null;
    id: number;
}

interface CircleManagement {
    name: string;
    users: User[];
    id: number;
    joinId: string;
}

export const useUserStore = defineStore('user', {
    state: () => ({

        onboardingComplete: false,

        userTokenSt: localStorage.getItem('token'),

        user: {
            username: "",
            displayname: "",
            id: 0,
            profilePicture: '',
        },

        circles: [] as Circle[],

        circleManagement: {} as CircleManagement,

    }),
    getters: {
        onboardingDoneSt() {
            if (localStorage.getItem('token')) { this.userTokenSt = localStorage.getItem('token'); return true } else { return false }
        },

        defaultCircle(): number | undefined {
            if (this.circles[0] !== undefined) { return Number(this.circles[0].id) } else { return undefined }
        }

    },
    actions: {
        getUser() {
            axios.get(import.meta.env.VITE_APP_BASEURL + 'user/me',
                {
                    headers: { 'X-API-KEY': this.userTokenSt }
                })
                .then(Response => {
                    if (Response.status == 200) {
                        this.user.username = Response.data.data.username
                        this.user.displayname = Response.data.data.displayName
                        this.user.id = Response.data.data.id
                        this.checkProfilePicture(import.meta.env.VITE_APP_BASEURL + `profile-picture/get/${Response.data.data.id}`)
                        this.circles = Response.data.data.circles
                        this.defaultCircle
                        localStorage.setItem("defaultCircle", Response.data.data.circles[0]['id'])
                        localStorage.setItem("userId", JSON.stringify(Response.data.data.id))
                        localStorage.setItem("userCircles", JSON.stringify(Response.data.data.circles))
                    }
                })
        },

        async checkProfilePicture(profilePictureUrl: string) {
            try {
                await axios.get(profilePictureUrl);
                this.user.profilePicture = profilePictureUrl
                return profilePictureUrl
            } catch (error) {
                this.user.profilePicture = "/default-avatar.jpg"
                return "/default-avatar.jpg"
            }
        },

        addStoreCircle(newCircle: Circle) {
            this.circles.unshift(newCircle)
        },

        getCircle(circleId: number) {
            axios.get(import.meta.env.VITE_APP_BASEURL + 'circle/' + circleId,
                {
                    headers: { 'X-API-KEY': localStorage.getItem('token') }
                })
                .then(Response => {
                    if (Response.status == 200) {
                        this.circleManagement = Response.data.data
                    }
                })
        },

        checkOnboarding() {
            this.onboardingComplete = true
            if (localStorage.getItem('token')) { this.onboardingComplete = true; this.userTokenSt = localStorage.getItem('token'); return true } else { this.onboardingComplete = false; return false }
        },

        customReset() {
            this.onboardingComplete = false,
                this.userTokenSt = "",
                this.user = { username: "", displayname: "", id: 0, profilePicture: "" }
            this.circles = []
        }

    }
})