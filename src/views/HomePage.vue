<template>
    <ion-page>
        <ion-header :translucent="true" class="ion-no-border">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button color="light-contrast" id="menu-icon"></ion-menu-button>
                </ion-buttons>
                <ion-title> posts.</ion-title>
                <ion-icon color="light-contrast" id="settings-icon" :icon="cogOutline" slot="end"
                    @click="openCircleSettingsModal()"></ion-icon>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div class="circle-select-container">
                <div class="circle-pill-container">
                    <div class="circle-select-btn" @click="updateActive(userCircle.id)"
                        v-for="(userCircle, i) in circles" :key="i"
                        :class="{ selected: activeCircle == userCircle.id }">
                        <p class="circle-select-txt"> {{ userCircle.name }} </p>
                    </div>
                </div>
                <div class="circle-select-btn" id="circle-add-button">
                    <p class="circle-select-txt" id="popover-trigger">+</p>
                </div>
            </div>
            <ion-popover trigger="popover-trigger" :dismiss-on-select="true">
                <ion-item :button="true" class="selectable" @click="joinCircle()">
                    <ion-icon slot="start" :icon="enterOutline">
                    </ion-icon> <span> Join Circle</span>
                </ion-item>

                <ion-item :button="true" class="selectable" @click="createCircle()">
                    <ion-icon slot="start" :icon="addCircleOutline">
                    </ion-icon> <span>Create Circle</span>
                </ion-item>
            </ion-popover>

            <CircleHomePage :active="activeCircle == userCircle.id" v-for="(userCircle) in computedActiveCircleArray"
                :key="userCircle.id" :circleId="userCircle.id" :newAddedPost="newAddedPost">
            </CircleHomePage>
            <div v-if="activeCircle == 0" class="text-wrapper">
                <ion-text> Create or join your first circle by clicking the plus icon at the top!</ion-text>
            </div>
        </ion-content>

        <ion-fab v-if="activeCircle > 0" slot="fixed" vertical="bottom" horizontal="end">
            <ion-fab-button @click="openPostModal()" router-direction="forward" id="open-modal">
                <ion-icon :icon="add"></ion-icon>
            </ion-fab-button>
        </ion-fab>
    </ion-page>
</template>

<script setup lang="ts">
import { IonFab, IonFabButton, IonText, modalController, IonIcon, IonPopover, IonItem, IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import CircleHomePage from '../components/CircleHomePage.vue';
import CreateCircleModal from '../components/createCircleModal.vue';
import CreatePostModal from '../components/createPostModal.vue';
import OpenCircleSettingsModal from '../components/openSettingsModal.vue'
import JoinCircleModal from '../components/joinCircleModal.vue';
import { enterOutline, addCircleOutline } from 'ionicons/icons';
import { computed, onBeforeMount, onMounted, ref } from 'vue';
import { add, cogOutline } from 'ionicons/icons';
import { storeToRefs } from 'pinia'
import { useUserStore } from '../store/user.store';
import axios from 'axios';
const userStore = useUserStore()
const { circles, defaultCircle } = storeToRefs(userStore)




onBeforeMount(() => {
    userStore.getUser()
    userStore.defaultCircle
    activeCircle.value = userStore.defaultCircle!
})

onMounted(() => {
    userStore.defaultCircle ? activeCircle.value = userStore.defaultCircle : activeCircle.value = Number(localStorage.getItem('defaultCircle'))
})

const newAddedPost = ref(false)


const activeCircle = ref(Number(defaultCircle))

const updateActive = (componentId: number) => {
    newAddedPost.value = false
    activeCircle.value = componentId
}


const createCircle = async () => {
    const modal = await modalController.create({
        component: CreateCircleModal,
    });

    modal.present();
}

const joinCircle = async () => {
    const modal = await modalController.create({
        component: JoinCircleModal,
    });

    modal.present();
}
const openPostModal = async () => {
    const modal = await modalController.create({
        component: CreatePostModal,
        componentProps: { postType: "POST", circleId: Number(activeCircle.value) }
    });

    modal.present();

    const { role } = await modal.onDidDismiss();

    if (role == 'confirm' || role === 'confirm') {
        newAddedPost.value = true
    }

    // Set the value to false after 2 seconds so that a refresh (in the postComponent.vue) is also called when a second new post is added 
    setTimeout(function () {
        newAddedPost.value = false
    }, 2000)
};

const computedActiveCircleArray = computed(() => {
    return circles.value.filter(obj => obj.id === activeCircle.value)
})

const settingsOpened = ref(false)

const openCircleSettingsModal = async () => {
    if (settingsOpened.value == false) {
        settingsOpened.value = true
        const joinId = ref('')
        await axios.get(import.meta.env.VITE_APP_BASEURL + 'circle/' + activeCircle.value,
            {
                headers: { 'X-API-KEY': localStorage.getItem('token') }
            })
            .then(Response => {
                if (Response.status == 200) {
                    joinId.value = Response.data.data.joinId
                }
            })
        const modal = await modalController.create({
            component: OpenCircleSettingsModal,
            componentProps: { circleId: Number(activeCircle.value), joinId: joinId.value }
        });
        modal.present();

        await modal.onDidDismiss()
        settingsOpened.value = false
    }

};

</script>

<style scoped>
.circle-select-container {
    display: flex;
    flex-wrap: nowrap;
    overflow-y: hidden;
    overflow-x: auto;
    white-space: nowrap;
    max-height: 4em;
    align-items: center;

}

.circle-pill-container {
    margin: 1em;
    display: flex;
    max-height: 4em;
    align-items: center;
    background-color: var(--ion-color-light-shade);
    border-radius: 2em;
}

.circle-select-btn {
    transition: background-color 0.3s;

    padding: 0.5em 1.5em 0.5em 1.5em;
    border-radius: 2em;

    color: var(--ion-color-light-contrast);
}

#circle-add-button {
    width: 2.0em;
    height: 2.0em;
    padding: 0em;
    justify-content: center;
    align-items: center;
    text-align: center;
    display: flex;
    border-radius: 50%;
    background-color: var(--ion-color-light-shade);

}

#popover-trigger {
    color: var(--ion-color-medium);
    font-weight: bold;
}

.circle-select-txt {
    text-align: center;
    color: var(--ion-color-medium-shade);
    margin: 0;
    font-weight: bold;
    font-size: 0.9em;
}

.text-wrapper {
    margin: 3em;
    text-align: center;
    margin-top: 10em;
}

.popover-viewport {
    width: 1000px;
}

ion-fab {
    margin-bottom: 0.75em;
    margin-right: 0.75em;
}

ion-fab-button {
    --background: linear-gradient(to top left, var(--ion-color-primary), var(--ion-color-secondary)) !important;
    ;
}

.selected {
    background-image: linear-gradient(to bottom right, var(--ion-color-primary-shade), var(--ion-color-secondary)) !important;
    color: var(--ion-color-primary-contrast);
}

.selected * {
    color: var(--ion-color-primary-contrast);
    font-weight: bold;
}

.circle-management-container {
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

#settings-icon {
    --ionicon-stroke-width: 1.5em;
    font-size: 1.5em;
    margin-right: 0.5em;
    border-radius: 1em;
    padding: 0.25em;
    color: var(--ion-color-light-contrast)
}

#menu-icon {
    color: var(--ion-color-light-contrast)
}

.circle-management-container>ion-icon:hover {
    color: var(--ion-color-light-contrast);
    border: 1px solid var(--ion-color-light-contrast);
}
</style>