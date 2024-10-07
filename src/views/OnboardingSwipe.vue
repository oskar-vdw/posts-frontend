<template>
    <ion-page>

        <ion-content :scroll-y="false" :fullscreen="true">

            <swiper-container init="false" :parallax="true" :pagination="{ clickable: true }" :slides-per-view="1">
                <div class="parallax-bg" id="background-img" data-swiper-parallax="-23%"></div>

                <swiper-slide id="slide-1">
                    <ion-text class="heading">
                        Welcome to posts, the world's first <i><u>truly private</u></i> social media.
                    </ion-text>

                    <ion-text>Free, private, open source. No user data collected. </ion-text>
                </swiper-slide>
                <swiper-slide id="slide-2" data-swiper-parallax-opacity="1">
                    <ion-text class="heading">
                        Circles, Not Followers
                    </ion-text>
                    <div id="circle">
                        <div id="avatar-wrapper">
                            <ion-avatar v-for="item in images"><img :src="item"></ion-avatar>
                        </div>
                    </div>
                    <ion-text>
                        Connect with up to 8 friends in your own private circle.
                    </ion-text>
                </swiper-slide>
                <swiper-slide>
                    <ion-text class="subheading">
                        Post whatever comes to mind, knowing it's safe in your circle.
                    </ion-text>
                    <div id="post-container">
                        <PostComponent :class="`div-${index} test-post`" v-for="(post, index) in postsArray"
                            :key="index" :userId="post.userId" :postType="post.postType" :text="post.text"
                            :postAuthor="post.postAuthor" :createdAt="post.createdAt" :totalReplies="post.totalReplies"
                            :images="post.images">
                            <template #content>
                                <p class="post-content"> {{ post.text }}</p>
                            </template>
                        </PostComponent>
                    </div>
                </swiper-slide>
                <swiper-slide>
                    <ion-text class="heading">Choose a username to get started :)</ion-text>
                    <ion-button :router-link="'/auth/register'">choose now</ion-button>
                    <ion-text id="login-text">
                        Already have an account?
                    </ion-text>
                    <ion-button id="login-button" :router-link="'/auth/login'">login</ion-button>
                    <!-- <ion-text> If you already have an account, you can login <a @click="loginRoute" :router-link="'/auth/register'"> here</a>. </ion-text> -->
                </swiper-slide>


            </swiper-container>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonAvatar, IonText, toastController, IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonSegment, IonSegmentButton, IonLabel } from '@ionic/vue';
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { register } from 'swiper/element/bundle';
import PostComponent from '../components/postComponent.vue'


register();

import { onMounted } from 'vue';
import router from '@/router';

const images = [
    "posts_demo_pic_1.jpeg",
    "posts_demo_pic_2.jpeg",
    "posts_demo_pic_3.jpeg",
    "posts_demo_pic_4.jpeg",
    "posts_demo_pic_5.jpeg",
    "posts_demo_pic_6.jpeg",
    "posts_demo_pic_7.jpeg",
    "posts_demo_pic_8.jpeg"
];

const postsArray = [{
    id: 0,
    userId: 5808564752670089,
    postType: "TEST",
    text: "Guys the preworkout gave me diarrhea send help",
    postAuthor: "TilliMilli",
    createdAt: "now",
    totalReplies: 1,
},
{
    id: 1,
    userId: 1554986688153572,
    postType: "TEST",
    text: "We hebben een serieus probleem",
    postAuthor: "Moronius",
    createdAt: "2h",
    totalReplies: 3,

},
{
    id: 2,
    userId: 1114050371982290,
    postType: "TESTIMG",
    images: ["/public/posts_demo_pic_9.jpeg"],
    // images: ["fb9866b2-91b3-47ed-836b-1c5c35f6c86a"],
    text: "I pushed the posts update we're so back!",
    postAuthor: "oskar",
    createdAt: "2h",
    totalReplies: 3,

},

]

onMounted(() => {
    const swiperEl = document.querySelector('swiper-container');

    const params = {
        // array with CSS styles
        injectStyles: [`.swiper-wrapper { align-items: center }`],
    };

    if (swiperEl) {
        Object.assign(swiperEl, params);
        swiperEl.initialize();
    }
});


const loginRoute = () => {
    router.push("/auth/login")
}




</script>

<style scoped>
ion-button {
    --background: transparent;
    --border-radius: 3em;
    --border-color: rgba(255, 255, 255, 0.747);
    --border-style: solid;
    --background-hover: rgb(136, 26, 245);
    --background-activated: rgba(255, 255, 255, 0.747);

    --border-width: 3px;
    backdrop-filter: 0;
    width: 10em;
    height: 4em;
}

#login-button {
    margin: 2em 2em 0 2em;
    width: auto;
    height: 2em;
    --border-width: 2px;
    --border-color: rgba(255, 255, 255, 0.6);
    color: rgba(255, 255, 255, 0.6);
}

#login-text {
    align-self: flex-end;
    margin: 0 2em;
}

#post-container {
    display: flex;
    flex-wrap: wrap;
    width: 16em;
    position: relative;
}

.div-0 {
    position: absolute;
    top: -16em;
    left: -4em;
}

.div-1 {
    position: absolute;
    top: -10em;
    right: -4em;
}

.div-2 {
    position: absolute;
    top: -5em;
    left: -2em
}

.test-post {
    box-shadow: 0 0 0.2em 0 grey;
}


.post-content {
    margin-bottom: 0;
    font-weight: normal
}

.content-container {
    padding-bottom: 0;
}

.time {
    font-weight: normal
}

swiper-container {
    height: 100vh;
    position: relative;
    overflow: hidden;
    --swiper-pagination-color: white;
    --swiper-pagination-bullet-inactive-color: #FFF;
    --swiper-pagination-bullet-inactive-opacity: 0.4;
    --swiper-pagination-bottom: 2em;
}

ion-text {
    color: white;
    margin: 2em;
    z-index: 4;
}

.subheading {
    font-size: 1.5em;
    margin: 1.1em;
    margin-top: 0.8em;
}

.heading {
    font-size: 2em;
    margin: 1.1em;
    margin-top: 2em;
}

#circle {
    width: 15em;
    height: 15em;
    border-radius: 50%;
    border: 2px dashed white;
    display: flex;
    align-items: center;
}


#avatar-wrapper {
    margin-top: 1em;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    align-content: center;
}

ion-avatar {
    margin: 0.1em;
    box-shadow: 0 0 0.2em 0 black;
    width: 3.5em;
    height: 3.5em;
}

swiper-slide {

    display: flex;
    justify-content: center;

    flex-wrap: wrap;
    /*     border: 3px solid white;
    border-radius: 1em; */
    max-height: 80%;
    max-width: 80%;
    margin: 0 10%;
    font-weight: bold;
    border: 3px solid rgba(255, 255, 255, 0.2);
    /* Glassy border */
    border-radius: 1em;
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    /* Adds glassy effect */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    /* Optional: shadow for depth */
    overflow: hidden
}


#background-img {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    width: 600%;
    height: 100%;
    filter: brightness(90%);
    background-image: url(/public/background-purple.jpg);
    /*      background: rgb(136, 26, 245);
    background: linear-gradient(142deg, rgba(136, 26, 245, 1) 0%, rgba(50, 115, 246, 1) 100%); */
    background-size: cover;
    --webkit-background-size: cover;
}

a {
    color: white;
    text-decoration: underline;
}
</style>