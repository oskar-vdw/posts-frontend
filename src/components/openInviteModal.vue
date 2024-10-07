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
        <div class="invite-container">
            <ion-text>Copy this code and send it to your friend so that they can join your circle!</ion-text>
            <ion-text class="code">{{ props.joinId }}</ion-text>
            <div class="break"></div>
            <ion-button id="copy-button" @click="copyJoinId()" fill="solid" shape="round"> Copy </ion-button>

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
    IonText,
    modalController,
} from '@ionic/vue';
import { ref } from 'vue';

const props = defineProps({
    joinId: String , 
});

const postInfo = ref()

const copyJoinId = () => {
    navigator.clipboard.writeText(props.joinId ?? "change in prod");
}





const cancel = () => modalController.dismiss(null, 'cancel');
const confirm = () =>
    modalController.dismiss(postInfo, 'confirm')
    ;
</script>

<style scoped>
.invite-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin: 1em;
    text-align: center;
    border: 1px solid var(--ion-color-light-shade);
    border-radius: 1em;
}

ion-text {
    margin: 1em;
    margin-left: 2.5em;
    margin-right: 2.5em;
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

ion-fab-button {
    --box-shadow: 0px 0px 5px -3px #000000;

}

.code {
    font-weight: bold;
    font-size: 1.5em;
    padding: 0.25em;
    border: 2px solid var(--ion-color-light-contrast);
    border-radius: 0.25em;
}
.break{
  flex-basis: 100%;
  height: 0;
}
</style>

    