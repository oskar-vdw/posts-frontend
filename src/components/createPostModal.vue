<template>
    <ion-header>
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-button color="medium" @click="cancel">Cancel</ion-button>
            </ion-buttons>
            <ion-title></ion-title>
            <ion-buttons slot="end">
                <ion-button @click="createPost()" :strong="true">Post</ion-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
        <PostComponent :postType="'CREATE'" :postAuthor="user.displayname" :userId="user.id" :images="[]">
            <template #content>
                <ion-textarea :auto-grow="true" :counter="true" :minlength="3" :maxlength="320" placeholder="New Post"
                    v-model="postContent"></ion-textarea>
                <img class="new-img" v-if="newImgAdded" :src="newImgSrc">
            </template>
            <template #footer>
                <div class="footer-bar-content">
                    <div class="img-btn-container">
                        <input type="file" id="fileInput" class="hidden" accept="image/png, image/jpeg, image/HEIC"
                            @change="handleImgUpload()" />
                        <label class="new-pic-label" for="fileInput">
                            <ion-icon :icon="imageOutline"></ion-icon>
                        </label>
                    </div>
                    <div class="img-dlt-container">
                        <ion-icon v-if="newImgAdded" :icon="trashOutline" @click="removeImg()"></ion-icon>
                    </div>
                </div>
            </template>
        </PostComponent>

    </ion-content>
</template>

<script lang="ts" setup>
import {
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonTextarea, modalController, toastController, IonIcon
} from '@ionic/vue';
import { ref } from 'vue';
import axios from 'axios';
import { useUserStore } from '../store/user.store';
import PostComponent from '../components/postComponent.vue'
import { imageOutline, trashOutline } from 'ionicons/icons';

const userStore = useUserStore();

const user = userStore.user
const count = ref(0)
const postContent = ref();

const props = defineProps({
    postType: String, circleId: Number, parentId: Number,
});

const newImgAdded = ref(false)
const newImgSrc = ref()

const uploadedImgStr = ref()

const handleImgUpload = () => {
    const fileInput: HTMLInputElement = document.getElementById('fileInput') as HTMLInputElement
    const profileImg = fileInput!.files![0]


    if (!['image/png', 'image/jpeg'].includes(profileImg.type)) {
        alert('Invalid file type. Please upload a PNG or JPEG image.');
        return;
    }
    newImgAdded.value = true

    newImgSrc.value = URL.createObjectURL(profileImg);
}

const uploadImg = async () => {
    const fileInput: HTMLInputElement = document.getElementById('fileInput') as HTMLInputElement
    const postImg = fileInput!.files![0]
    const formData = new FormData()
    formData.append("file", postImg)

    return axios.post(import.meta.env.VITE_APP_BASEURL + "post/upload-image", formData,
        {
            headers: { 'Content-Type': 'multipart/form-data', 'X-API-KEY': localStorage.getItem('token') }
        })
        .then(async Response => {
            if (Response.status == 200) {
                uploadedImgStr.value = Response.data.data.id

                const toast = await toastController.create({ message: "Image uploaded", duration: 1000, position: "bottom" });
                await toast.present();
            }
        })
        .catch(async error => {

            const toast = await toastController.create({ message: error, duration: 2500, position: "bottom" });
            await toast.present();
        })
}


const removeImg = () => {
    newImgAdded.value = false
    newImgSrc.value = false
}


const postInfo = ref()

const createPost = async () => {
    //Checks if the function got called already. If it hasn't, it proceeds with the posting.
    if (count.value == 0) {
        count.value++

        const requestData = ref<any>({})

        requestData.value['circleId'] = props.circleId
        requestData.value['text'] = postContent.value

        if (newImgAdded.value == true) {
            await uploadImg()
            requestData.value['images'] = [uploadedImgStr.value]
        }

        if (props.parentId !== null) {
            requestData.value['parentId'] = props.parentId
        }


        axios.post(import.meta.env.VITE_APP_BASEURL + 'circle/post', requestData.value,
            { headers: { 'Content-Type': 'application/json', 'X-API-KEY': localStorage.getItem('token') } }
        )
            .then(Response => {
                if (Response.status == 200) {
                    postInfo.value = Response.data.data
                    confirm()
                }
            })
            .catch(async error => {
                const toast = await toastController.create({ message: error.response.data.errors[0], duration: 2500, position: "bottom" });
                await toast.present();
                count.value = 0
            })
    }
}


const cancel = () => modalController.dismiss(null, 'cancel');
const confirm = () =>
    modalController.dismiss(postInfo, 'confirm')
    ;
</script>

<style scoped>
.post-container {
    position: relative;
    text-align: center;
    margin: 1em;
    display: grid;
    grid-template: 50px auto 50px / 20% 1fr;
    overflow: hidden;
    border: 1px solid var(--ion-color-light-shade);
    border-radius: 1em;
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
    text-align: left;
}

.post-content {
    margin: 15px
}

.author {
    font-weight: bold;
}

.time {
    color: var(--ion-color-light-contrast)
}

.header-bar {
    grid-area: 1 / 2 / 1 / 2;
    display: flex;
    justify-content: space-between;
}

.header-bar>* {
    margin-right: 15px;
    margin-left: 15px
}

.footer-bar-content {

    display: flex;
    justify-content: space-between;
    width: 100%;
}

.img-btn-container {
    width: 2em;
    display: flex;

    margin-left: 1.5em;
    margin-right: 1.5em;
}

.img-dlt-container {
    width: 2em;
    display: flex;

    margin-left: 1.5em;
    margin-right: 1.5em;
    color: var(--ion-color-danger);
}

.new-img {
    border-radius: 1em;
    margin-top: 1em;
}


ion-icon {
    --ionicon-stroke-width: 1.5em;
    font-size: 1.5em;
}

ion-fab-button {
    --box-shadow: 0px 0px 5px -3px #000000;
}

.hidden {
    display: none
}
</style>