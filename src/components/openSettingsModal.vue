<template>
    <ion-header>
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-button color="medium" @click="cancel">Cancel</ion-button>
            </ion-buttons>
            <ion-title> {{ circleManagement.name }} </ion-title>
            <ion-buttons slot="end">
                <ion-button @click="confirm()" :strong="true">Done</ion-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
        <div class="post-container">
            <div class="header-bar">
                <p class="title"> Circle settings </p>
                <div class="btn-container">
                    <ion-button shape="round" fill="outline" v-if=pageUneditable class="edit-btn" type="button"
                        @click="editPage()">
                        Edit </ion-button>
                    <div v-else class="save-cancel-container">
                        <ion-button shape="round" color="danger" fill="outline" class="edit-btn" type="button"
                            @click="cancelEdit()">
                            Cancel </ion-button>
                        <ion-button shape="round" fill="outline" class="edit-btn" type="button" @click="saveEdit()">
                            Save
                        </ion-button>
                    </div>

                </div>
            </div>

            <div class="circlename-container">
                <ion-input label-placement="stacked" fill="outline" v-model=circleNameInput :value=circleManagement.name
                    :disabled=pageUneditable :clear-input="true" id="circlenameIonInput">
                    <div slot="label"> circlename </div>
                </ion-input>
            </div>
            <div class="invite-container">
                <ion-text>Copy this code and send it to your friend so that they can join your circle!</ion-text>
                <ion-text class="code">{{ props.joinId }}</ion-text>
                <div class="break"></div>
                <ion-button id="copy-button" @click="copyJoinId()" fill="solid" shape="round"> Copy </ion-button>
            </div>

            <div class="circle-user-list-container">
                <ion-text> Circle users:</ion-text>
                <ion-list>
                    <ion-item-sliding v-for="circleUser in circleManagement.users" :key="circleUser.id">
                        <ion-item>
                            <ProfilePicComponent :userid="JSON.stringify(circleUser.id)"></ProfilePicComponent>

                            <ion-label> @{{ circleUser.username }}</ion-label>
                        </ion-item>
                        <ion-item-options v-if="!pageUneditable">
                            <ion-item-option>Admin</ion-item-option>
                            <ion-item-option color="danger">Delete</ion-item-option>
                        </ion-item-options>
                    </ion-item-sliding>
                </ion-list>
            </div>

            <div class="leave-btn-container">
                <ion-button color="danger" shape="round" fill="outline" @click="leaveCircle()">Leave Circle</ion-button>
            </div>

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
    modalController, IonInput, IonList, IonItem, IonLabel, IonItemOptions, IonItemSliding, IonItemOption,
    toastController
} from '@ionic/vue';
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useUserStore } from '../store/user.store';
import ProfilePicComponent from '../components/ProfilePic.vue';
import axios from 'axios';

const userStore = useUserStore()

const { circleManagement } = storeToRefs(userStore)


const props = defineProps({
    circleId: Number,
    joinId: String,
});

const pageUneditable = ref(true)
const circleNameInput = ref(circleManagement.value.name)

onMounted(() => {
    userStore.getCircle(props.circleId ?? 0)
})

const cancelEdit = () => {
    pageUneditable.value = true
}

const saveEdit = () => {
    pageUneditable.value = true

    axios.put(import.meta.env.VITE_APP_BASEURL + "circle/" + props.circleId + '/name', {circleName: circleNameInput.value},
        {
            headers: { 'Content-Type': 'application/json', 'X-API-KEY': localStorage.getItem('token') }
        })
        .then(async Response => {
            if (Response.status == 200) {
                const toast = await toastController.create({ message: "Circlename updated successfully", duration: 2500, position: "bottom"});
                await toast.present();
                userStore.getUser()
            }
        })
        .catch(async error => {
            const toast = await toastController.create({ message: error.response.data.error, duration: 2500, position: "bottom" });
            await toast.present();
        })
}

const editPage = () => {
    pageUneditable.value = false
}

const cancel = () => modalController.dismiss(null, 'cancel');
const confirm = () =>
    modalController.dismiss('confirm')
    ;


const copyJoinId = () => {
    navigator.clipboard.writeText(props.joinId ?? "change in prod");
}

const leaveCircle = () => {
    if (window.confirm("By proceeding, you will leave the circle")) {
        axios.get(import.meta.env.VITE_APP_BASEURL + 'circle/leave/' + props.circleId,
            {
                headers: { 'Content-Type': 'application/json', 'X-API-KEY': localStorage.getItem('token') }
            })
            .then(async Response => {
                if (Response.status == 200) {
                    userStore.addStoreCircle(Response.data.data)
                    const toast = await toastController.create({ message: "Successfully left the circle.", duration: 2500, position: "bottom" });
                    await toast.present();
                    userStore.getUser()
                    cancel()
                }
            })
            .catch(async error => {
                const toast = await toastController.create({ message: error.response.data.error, duration: 2500, position: "bottom" });
                await toast.present();
            })
    }
}

</script>

<style scoped>
.post-container {
    position: relative;
    text-align: center;
    height: auto;
    margin: 0.5em;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    border: 1px solid var(--ion-color-light-shade);
    border-radius: 1em;
    padding: 1em 0px 1em 0px;
}


.invite-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width: 90%;
    margin: 1em;
    min-height: 8em;
    text-align: center;
    border: 1px solid var(--ion-color-light-shade);
    border-radius: 1em;
}

.invite-container>ion-text {
    margin: 1em;
    margin-left: 2.5em;
    margin-right: 2.5em;
}

.invite-container>ion-button {
    text-transform: none;
    margin-bottom: 1em;

}

.circle-user-list-container {
    text-align: left;
    width: 90%;
    padding: 0.5em;
    border: 1px solid var(--ion-color-light-shade);
    border-radius: 1em;
}

.circle-user-list-container ion-text {
    text-align: left;
    font-weight: bold;
    margin-top: 0.75em;
    margin-bottom: 1em;
    margin-left: 1em;
}

.circle-user-list-container ion-label {
    margin-left: 1em;
}

.circlename-container {
    text-align: left;
    width: 90%;
}

.header-bar {
    margin-top: 1.5em;
    display: flex;
    text-align: left;
    justify-content: space-between;
    width: 90%;
}

.title {
    margin-top: 0.5em;
    margin-left: 0.5em;
    margin-right: 1em;
    font-weight: bold;
}

.btn-container {
    min-height: 6em;
}

.edit-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    text-transform: none;
}


.edit-btn:hover {
    background-color: var(--ion-color-light-shade);
}

.leave-btn-container {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1em;
}

.code {
    font-weight: bold;
    font-size: 1.5em;
    padding: 0.25em;
    border: 2px solid var(--ion-color-light-contrast);
    border-radius: 0.25em;
}

.leave-btn-container>ion-button {
    text-transform: none;
}

.time {
    color: var(--ion-color-light-contrast)
}

.break {
    flex-basis: 100%;
    height: 0;
}

ion-icon {
    --ionicon-stroke-width: 1.5em;
    font-size: 1.5em;
}

ion-item-option {
    text-transform: none;
}
</style>
