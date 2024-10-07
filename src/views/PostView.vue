<template>
  <ion-page>
    <ion-header :translucent="true" class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title> posts. </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <PostComponent :id="post.id" :postType="post.postType" :postAuthor="post.displayName" :likes="post.likes"
        :createdAt="post.createdAt" :userId="post.userId" :totalReplies="post.totalReplies" :images="post.images">
        <template #content>
          <p class="post-content"> {{ post.text }}</p>
        </template>
      </PostComponent>
      <div class="reply-wrapper">
        <ion-text class="header"> Replies </ion-text>
        <keep-alive v-for="(reply, index) in post.directReplies" :key="index">
          <PostComponent :id="reply.id" :postType="reply.postType" :postAuthor="reply.displayName" :likes="reply.likes"
            :createdAt="reply.createdAt" :userId="reply.userId" :totalReplies="reply.totalReplies"
            :images="reply.images" @click="openPost(reply.id)">
            <template #content>
              <p class="post-content"> {{ reply.text }}</p>
            </template>
          </PostComponent>
        </keep-alive>
      </div>
    </ion-content>
    <ion-fab slot="fixed" vertical="bottom" horizontal="end">
      <ion-fab-button @click="openPostModal()" router-direction="forward" id="open-modal">
        <ion-icon :icon="arrowUndoOutline"></ion-icon>
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup lang="ts">
import { IonText, IonFab, IonFabButton, IonIcon, IonButtons, IonContent, IonHeader, IonBackButton, IonPage, IonTitle, IonToolbar, modalController } from '@ionic/vue';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import CreatePostModal from '../components/createPostModal.vue';
import { IndividualPost } from '../types/user';
import { usePostStore } from '../store/post.store';

import PostComponent from '../components/postComponent.vue'
import { arrowUndoOutline } from 'ionicons/icons';
import router from '@/router';


const route = useRoute()
const postStore = usePostStore()


const post = ref<IndividualPost>({
  id: 0,
  postType: '',
  text: '',
  displayName: '',
  likes: [],
  createdAt: '',
  userId: 0,
  totalReplies: 0,
  circleId: 0,
  directReplies: [],
  images: []
}
)

const getPost = async () => {
  await axios.get(import.meta.env.VITE_APP_BASEURL + 'post/' + route.params.postId,
    {
      headers: { 'X-API-KEY': localStorage.getItem('token') }
    })
    .then(Response => {
      if (Response.status == 200) {
        post.value = Response.data.data
        const arr1 = []
        for (let i = 0; i < Response.data.data.directReplies.length; i++) {
          arr1.push({ id: Response.data.data.directReplies[i].id, likeIds: Response.data.data.directReplies[i].likes, totalReplies: Response.data.data.directReplies[i].totalReplies })
        }
        postStore.addPostInteractions(arr1, false)
      }
    })
}
getPost()



const openPostModal = async () => {
  const modal = await modalController.create({
    component: CreatePostModal,
    componentProps: { postType: "POST", circleId: Number(post?.value?.circleId), parentId: Number(post?.value?.id) }
  });

  modal.present();

  const { data, role } = await modal.onDidDismiss();

  if (role == 'confirm' || role === 'confirm') {
    console.log(data.value)
    post.value.directReplies.unshift(data.value)
    const tmpCmtArr = [{ id: data.value.id, likeIds: [], totalReplies: 0, parentId: post.value.id, images: [] }]
    postStore.addComment(post.value.id, tmpCmtArr)
  }
};

const count = ref(0)
watch(
  () => route.params.postId,
  async (newPostId) => {
    if (newPostId && post.value.id !== 0 && count.value < 2)
      await getPost();
    count.value++
  }
);
const openPost = (postId: number) => {
  router.push(`/post/${postId}`)
}

</script>
<style scoped>
ion-icon {
  --ionicon-stroke-width: 1.5em;
  font-size: 1.5em;
}

ion-fab {
  margin-bottom: 0.75em;
  margin-right: 0.75em;
}


ion-fab-button {
  --background: linear-gradient(to top left, var(--ion-color-primary), var(--ion-color-secondary)) !important;
  --box-shadow: 0px 0px 5px -3px #000000;

}

.header {
  margin: 2em;
  margin-top: 6em;
  font-weight: bold;
  text-align: left;
}

.reply-wrapper {
  margin-bottom: 15vh;
}
</style>