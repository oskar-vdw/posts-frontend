<template>
    <ion-header>
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-button color="medium" @click="cancel">Cancel</ion-button>
            </ion-buttons>
            <ion-title></ion-title>
            <ion-buttons slot="end">
                <ion-button @click="confirm()" :strong="true">Done</ion-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
        <div class="post-container">
            <ion-input :maxlength=12 placeholder="circle name" v-model="newCircleName"></ion-input>
            <div class="break"></div>
            <ion-button @click="createCircle(newCircleName)" fill="solid" shape="round"> Create circle </ion-button>
        </div>
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
    IonInput,
    modalController,
    toastController,
} from '@ionic/vue';
import { ref } from 'vue';
import { useUserStore } from '../store/user.store';
import axios from 'axios';

const userStore = useUserStore();
const newCircleName = ref();

const postInfo = ref()

const createCircle = (newCircleName: string) => {
    axios.post(import.meta.env.VITE_APP_BASEURL + 'circle/create',
        {
            name: newCircleName
        },
        {
            headers: { 'Content-Type': 'application/json', 'X-API-KEY': localStorage.getItem('token') }
        })
        .then(async Response => {
            if (Response.status == 201) {
                userStore.addStoreCircle(Response.data.data)
                const toast = await toastController.create({ message: "Circle created successfully", duration: 2500, position: "bottom" });
                await toast.present();
            }
        })
        .catch(async error => {
            const toast = await toastController.create({ message: error.response.data.error, duration: 2500, position: "bottom" });
            await toast.present();
        })
}


const cancel = () => modalController.dismiss(null, 'cancel');
const confirm = () =>
    modalController.dismiss(postInfo, 'confirm')
    ;
</script>

<style scoped>
.post-container {
    margin: 1em;
    text-align: center;
    border: 1px solid var(--ion-color-light-shade);
    border-radius: 1em;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
}

ion-input {
    margin: 2em;
    width: 50%;
    padding: 2em;
    border: 1px solid var(--ion-color-light-shade);
    border-radius: 1em;
}

ion-button {
    text-transform: none;
    margin: 1em;
}

ion-button:hover {
    fill: solid;
}

ion-icon {
    --ionicon-stroke-width: 1.5em;
    font-size: 1.5em;
}

.break {
    flex-basis: 100%;
    height: 0;
}
</style>

    