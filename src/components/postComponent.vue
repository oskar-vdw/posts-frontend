<template>
    <div class="post-container">
<!--         <div class="profile-picture-container" v-if="postType == 'TEST' || postType == 'TESTIMG'">
            <ion-avatar><img :src="JSON.stringify(computedUserId)" @error="defaultPic"></ion-avatar>

        </div> -->
        <div class="profile-picture-container">
            <ProfilePicComponent :userid="JSON.stringify(userId)"></ProfilePicComponent>
        </div>
        <div class="header-bar">
            <p class="author"> {{ postAuthor }} </p>
            <p class="time"> {{ createdAt }} </p>
        </div>
        <div class="content-container">
            <slot name="content"></slot>
            <div class="image-container" v-if="postType == 'IMAGES'">
                <img :src="imgSrc" @error="defaultPic" class="post-img">
            </div>
            <div class="image-container" v-if="postType == 'TESTIMG'">
                <img style="margin-top: 10px;" src="/public/posts_demo_pic_9.jpeg" @error="defaultPic" class="post-img">
            </div>
        </div>
        <div class="footer-bar" v-if="postType == 'CREATE'">
            <slot name="footer"></slot>
        </div>
        <div class="footer-bar" v-if="postType == 'TEXT' || postType == 'IMAGES'">
            <div class="likes">
                <div class="like-count-container">
                    <ion-icon :class="likedByAppUser ? 'liked' : ''" :icon="likedByAppUser ? heart : heartOutline"
                        @click.stop="likeButton(Number(id))"></ion-icon>
                    <p class="like-text"> {{ computedLikeNumber }}</p>
                </div>
                <ProfilePicComponent v-for="(pic, index) in computedLikedPicSources" :key="index"
                    :userid="JSON.stringify(pic)"> </ProfilePicComponent>
            </div>
            <div class="comments">
                <ion-icon :icon="chatbubbleOutline"></ion-icon>
                <p class="comment-text"> {{ computedTotalReplies }}</p>
            </div>
        </div>
        <div class="footer-bar" v-if="postType == 'TEST'|| postType == 'TESTIMG'">
            <div class="likes">
                <div class="like-count-container">
                    <ion-icon :class="demoLiked ? 'liked' : ''" :icon="demoLiked ? heart : heartOutline"
                        @click.stop="demoLiked = !demoLiked"></ion-icon>
                    <p class="like-text"> {{ likes }}</p>
                </div>
                <ProfilePicComponent v-for="(pic, index) in computedLikedPicSources" :key="index"
                    :userid="JSON.stringify(pic)"> </ProfilePicComponent>
            </div>
            <div class="comments">
                <ion-icon :icon="chatbubbleOutline"></ion-icon>
                <p class="comment-text"> {{ totalReplies }}</p>
            </div>
        </div>
    </div>

</template>

<script lang="ts">
import { IonAvatar, IonIcon, toastController, } from '@ionic/vue';
import { computed, defineComponent } from 'vue';
import { ref } from 'vue';
import { heartOutline, chatbubbleOutline, heart } from 'ionicons/icons';
import axios from 'axios';
import { useUserStore } from '../store/user.store';
import ProfilePicComponent from '../components/ProfilePic.vue'
import { usePostStore } from '../store/post.store';
import { storeToRefs } from 'pinia';


export default defineComponent({
    name: 'PostComponent',
    components: {
        IonAvatar, IonIcon, ProfilePicComponent
    },
    props: {
        id: {
            type: Number,
        },
        postType: {
            type: String,
        },
        text: {
            type: String,
        },
        postAuthor: {
            type: String,
        },
        likes: {
            type: Array,
        },
        createdAt: {
            type: String,
        },
        userId: {
            type: Number,
        },
        totalReplies: {
            type: Number,
        },
        images: {
            type: Array
        }
    },
    setup(props) {
        const userStore = useUserStore()
        const postStore = usePostStore()

        const computedUserId = computed(()=> {
            return `/public/posts_demo_pic_${JSON.stringify(props.userId)}.jpeg`
        })

        const computedImgSrc = computed(() => {
            return `${import.meta.env.VITE_APP_BASEURL}post/get-picture/${props!.images![0]}`
        })

        const imgSrc = ref(computedImgSrc)

        const demoLiked = ref(false)



        const { postInteractions } = storeToRefs(postStore)

        const computedIndex = computed(() => {
            for (let i = 0; i < postInteractions.value.length; i++) {
                if (postInteractions.value[i].id == props.id) {
                    return i
                }
            }
            return -1
        })

        const computedLikedPicSources = computed(() => {
            if (computedIndex.value !== -1) {
                return postInteractions.value[computedIndex.value].likeIds.filter((like, index) => index < 3);
            }
            else {
                return []
            }
        })

        const computedLikeNumber = computed(() => {
            if (computedIndex.value !== -1) {
                return postInteractions.value[computedIndex.value].likeIds.length;
            }
            else {
                return 0
            }
        })
        const computedTotalReplies = computed(() => {
            if (computedIndex.value !== -1) {
                return postInteractions.value[computedIndex.value].totalReplies;
            }
            else {
                return 0
            }
        })

        const likedByAppUser = computed(() => {
            if (computedIndex.value !== -1) {
                for (let i = 0; i < postInteractions.value[computedIndex.value].likeIds.length; i++) {
                    if (postInteractions.value[computedIndex.value].likeIds[i] == userStore.user.id) {
                        return true
                    }
                }
            }

            return false
        })



        const likedClassName = ref("")
        const profilePicSrc = ref("")

        if (props.userId == userStore.user.id) {
            profilePicSrc.value = userStore.user.profilePicture
        }

        const likeButton = (id: number) => {
            if (likedByAppUser.value == true) {
                axios.get(import.meta.env.VITE_APP_BASEURL + 'post/' + props.id + '/unlike',
                    { headers: { 'Content-Type': 'application/json', 'X-API-KEY': userStore.userTokenSt } }
                )
                    .then(Response => {
                        if (Response.status == 200) {
                            postStore.toggleLike(id, false, userStore.user.id)
                        }
                    })
                    .catch(async error => {
                        const toast = await toastController.create({ message: error.response.data.error, duration: 2500, position: "bottom" });
                        await toast.present();
                    })
            }

            else {
                axios.get(import.meta.env.VITE_APP_BASEURL + 'post/' + id + '/like',
                    { headers: { 'X-API-KEY': userStore.userTokenSt } }
                )
                    .then(Response => {
                        if (Response.status == 200) {
                            postStore.toggleLike(id, true, userStore.user.id)
                        }
                    })
                    .catch(async error => {
                        const toast = await toastController.create({ message: error.response.data.error, duration: 2500, position: "bottom" });
                        await toast.present();
                    })
            }
        }

        const defaultPic = (event: Event) => {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                (event.target as HTMLImageElement).src = "/blocked-black.png";

            } else {
                (event.target as HTMLImageElement).src = "/blocked-whitegrey.png";
            }
        }

        return { computedUserId, demoLiked, defaultPic, imgSrc, computedTotalReplies, likedByAppUser, computedLikeNumber, computedLikedPicSources, profilePicSrc, likedClassName, heartOutline, chatbubbleOutline, likeButton, heart }
    }
})

</script>

<style scoped>
.post-img {
    border-radius: 1em;
}

.post-container {
    position: relative;
    text-align: center;
    margin: 1em;
    display: grid;
    grid-template: 50px auto 50px / 20% 1fr;
    overflow: hidden;
    border-radius: 1em;
    background-color: var(--ion-color-light)
}

.profile-picture-container {
    margin: 0.3em;
    grid-area: 1 / 1 / 3 / 2;
    display: flex;
    align-items: flex-start;
    justify-content: center;
}

.profile-picture-container>ion-avatar {
    width: auto;
    height: auto;
    margin: 5px;
}

.content-container {
    padding: 0 15px 15px 15px;
    overflow: none;
    text-align: left;
    word-break: normal;
    white-space: pre-wrap;
}

.post-content {
    margin: 15px;
}

.author {
    font-weight: bold;
    text-align: left;
}

.time {
    color: var(--ion-color-light-contrast)
}

.header-bar {
    grid-area: 1 / 2 / 1 / 2;
    display: flex;
    justify-content: space-between;
    padding-top: 5px
}

.header-bar>* {
    margin-right: 15px;
    margin-left: 15px
}


.footer-bar {
    grid-area: 3 / 2 / 3 / 2;
    display: flex;
    flex-wrap: nowrap;
}

.likes {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-start;
    margin-left: 1.5em;
    margin-right: 1.5em;
}

.likes>ion-avatar {
    width: 2em;
    height: 2em;
    margin-left: -0.75em;
    border: 2px solid var(--ion-color-light);
}

.like-count-container {
    display: flex;
    align-items: center;
    margin-right: 1em;
    width: 2.5em;
}

.comments {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;

}

p.like-text,
p.comment-text {
    margin-left: 0.25em;
}

.profile-picture-containersss {
    width: 20%;
    position: absolute;
    height: 100%;
    left: 0;
}

.post-containers {
    position: relative;
    text-align: center;
    margin: 1em;
    display: flex;
    justify-content: center;
    flex-direction: row;
    overflow: hidden;
}

.liked {
    color: red;
}

ion-icon {
    --ionicon-stroke-width: 1.5em;
    font-size: 1.5em;
}

ion-fab-button {
    --box-shadow: 0px 0px 5px -3px #000000;
}

ion-textarea {
    margin-right: 2em
}
</style>