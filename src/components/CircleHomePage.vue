<template>
  <div>
    
    <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
      <ion-refresher-content></ion-refresher-content>
    </ion-refresher>
    <PostComponent v-for="(post) in postsArray" :key="post.id" :id=post.id :postType="post.postType" :text="post.text"
      :postAuthor="post.displayName" :likes="post.likes" :createdAt="post.createdAt" :userId="post.userId"
      :totalReplies="post.totalReplies" :images="post.images" @click="openPost(post.id)">
      <template #content>
        <p class="post-content"> {{ post.text }}</p>
      </template>
    </PostComponent>

    <ion-infinite-scroll @ionInfinite="infiniteScrollFunc">
      <ion-infinite-scroll-content></ion-infinite-scroll-content>
    </ion-infinite-scroll>

  </div>
</template>

<script lang="ts">
import { IonInfiniteScroll, IonInfiniteScrollContent, IonRefresher, IonRefresherContent, toastController, InfiniteScrollCustomEvent } from '@ionic/vue';
import PostComponent from '../components/postComponent.vue'
import { defineComponent, ref, watch } from 'vue';

import { Post } from '../types/user';

import axios from 'axios';
import { add, personAddOutline, cogOutline } from 'ionicons/icons';
import { useUserStore } from '../store/user.store';
import { usePostStore } from '../store/post.store';

import router from '@/router';

export default defineComponent({
  name: 'CircleHomeComponent',
  components: {
    IonInfiniteScroll, IonInfiniteScrollContent, IonRefresher, IonRefresherContent, PostComponent
  },
  props: {
    circleId: {
      type: Number, required: true,
    },
    active: {
      type: Boolean,
    },
    newAddedPost: {
      type: Boolean,
    }
  },
  setup(props) {
    const userStore = useUserStore()
    const postStore = usePostStore()
    const active = ref(props.active)
    const count = ref(0)

    const offsentCount = ref(0)

    const postsArray = ref<Post[]>([])

    const getPosts = async (offsetInput: number) => {
      axios.get(import.meta.env.VITE_APP_BASEURL + 'circle/posts/' + props.circleId + '?limit=5&offset=' + offsetInput, {
        headers: { 'Content-Type': 'application/json', 'X-API-KEY': userStore.userTokenSt }
      })
        .then(Response => {
          if (Response.status == 200) {
            const arr1 = []
            for (let i = 0; i < Response.data.data.length; i++) {
              arr1.push({ id: Response.data.data[i].id, likeIds: Response.data.data[i].likes, totalReplies: Response.data.data[i].totalReplies, images: Response.data.data[i].images})
            }
            if (offsetInput == 0) {
              postsArray.value = Response.data.data
              postStore.addPostInteractions(arr1, true)
            }
            else if (Response.data.data.length > 0) {
              postsArray.value.push(...Response.data.data)
              postStore.addPostInteractions(arr1, false)
            }
          }
        })
    }




    const handleRefresh = async (event: CustomEvent) => {
      const toast = await toastController.create({ message: "Refresh requested", duration: 2500, position: "bottom" });
      await toast.present();
      setTimeout(() => {
        getPosts(0)

        if (event.target !== null) {
          (event.target as any).complete()
        }
      }, 2000);
    }

    const openPost = (postId: number) => {
      router.push(`/post/${postId}`)
    }

    const infiniteScrollFunc = async (ev: InfiniteScrollCustomEvent) => {
      offsentCount.value++
      await getPosts(offsentCount.value)
      setTimeout(() => ev.target.complete(), 1500);
    }

    watch(
      () => props.active,
      (newValue: boolean) => {
        active.value = newValue;
        if (newValue && count.value == 0) {
          userStore.getUser()
          getPosts(0)
          count.value++
        }
      },
      { immediate: true }
    )
    watch(
      () => props.newAddedPost,
      (isNewPost: boolean) => {
        let count2 = 0
        if (isNewPost == true && count2 == 0) {
          getPosts(0)
          count2++
        }
      },
    )

    return { infiniteScrollFunc, openPost, handleRefresh, cogOutline, personAddOutline, add, postsArray }
  }
})


</script>

<style scoped>



.popover-viewport {
  width: 1000px;
}
</style>