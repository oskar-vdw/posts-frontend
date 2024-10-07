<template>
  <ion-page>
    <ion-header :translucent="true" class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="light-contrast" id="menu-icon"></ion-menu-button>
        </ion-buttons>
        <ion-title> Settings </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large"></ion-title>
        </ion-toolbar>
      </ion-header>
      <div class="post-container">
        <div class="profile-picture-container">
          <ion-avatar v-if="pageUneditable">
            <img v-if="newPicAdded" :src="newPicSrc">
            <img v-else-if="!newPicAdded" :src=userStore.user.profilePicture>
          </ion-avatar>
          <input type="file" id="fileInput" class="hidden" accept="image/png, image/jpeg" @change="handlePicUpload()" />
          <label class="new-pic-label" for="fileInput" v-if="!pageUneditable">
            <ion-avatar id="new-pic-avatar"><ion-icon v-if="!newPicAdded" :icon="cameraOutline"></ion-icon><img
                v-else-if="newPicAdded" :src="newPicSrc"> </ion-avatar>
          </label>
        </div>
        <div class="header-bar">
          <p class="title"> Your profile </p>
        </div>
        <div class="btn-container">
          <ion-button shape="round" fill="outline" v-if=pageUneditable class="edit-btn" type="button" @click="editPage()">
            Edit </ion-button>
          <div v-else class="save-cancel-container">
            <ion-button shape="round" color="danger" fill="outline" class="edit-btn" type="button" @click="cancelEdit()">
              Cancel </ion-button>
            <ion-button shape="round" fill="outline" class="edit-btn" type="button" @click="saveEdit()"> Save
            </ion-button>
          </div>

        </div>
        <div class="username-container">
          <ion-input label-placement="stacked" fill="outline" :value=usernameInput :disabled="true">
            <div slot="label"> username <ion-text color="danger">(Cannot be changed)</ion-text></div>
          </ion-input>
        </div>
        <div class="displayname-container">
          <ion-input label-placement="stacked" fill="outline" :value=displayname v-model="displaynameInput"
            :disabled=pageUneditable :clear-input="true" id="displaynameIonInput">
            <div slot="label"> displayname</div>
          </ion-input>
        </div>

      </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonIcon, IonText, IonAvatar, IonInput, IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, toastController } from '@ionic/vue';
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { cameraOutline } from 'ionicons/icons';
import { useUserStore } from '../store/user.store';
const userStore = useUserStore()
onMounted(async () => {
  getUser()
  await userStore.getUser();
})

const usernameInput = ref(userStore.user.username)
const displayname = ref(userStore.user.displayname)
const displaynameInput = ref('')
const pageUneditable = ref(true)
const newPicAdded = ref(false)
const newPicSrc = ref('')


const cancelEdit = () => {
  pageUneditable.value = true
}

const saveEdit = () => {

  pageUneditable.value = true
  if (newPicAdded.value == true) {
    uploadProfilePicture()
  }

  if (displaynameInput.value !== userStore.user.displayname) {
    uploadDisplayName()
  }
}

const editPage = () => {
  pageUneditable.value = false
}

const handlePicUpload = () => {
  const fileInput: HTMLInputElement = document.getElementById('fileInput') as HTMLInputElement
  const profilePic = fileInput!.files![0]


  if (!['image/png', 'image/jpeg'].includes(profilePic.type)) {
    alert('Invalid file type. Please upload a PNG or JPEG image.');
    return;
  }
  newPicAdded.value = true

  newPicSrc.value = URL.createObjectURL(profilePic);
}


const getUser = () => {
  axios.get(import.meta.env.VITE_APP_BASEURL + 'user/me',
    {
      headers: { 'X-API-KEY': userStore.userTokenSt }
    })
    .then(Response => {
      if (Response.status == 200) {
        usernameInput.value = Response.data.data.username
        displaynameInput.value = Response.data.data.displayName
        localStorage.setItem("defaultCircle", Response.data.data.circles[0]['id'])
        localStorage.setItem("userCircles", JSON.stringify(Response.data.data.circles))
      }
    })
}

const uploadDisplayName = () => {
  axios.put(import.meta.env.VITE_APP_BASEURL + "user/displayname",
    {
      displayName: displaynameInput.value
    },
    {
      headers: { 'Content-Type': 'application/json', 'X-API-KEY': localStorage.getItem('token') }
    })
    .then(async Response => {
      if (Response.status == 200) {
        userStore.user.displayname = displaynameInput.value
        const toast = await toastController.create({ message: "Displayname updated successfully", duration: 2500, position: "bottom" });
        await toast.present();
      }
    })
    .catch(async error => {
      const toast = await toastController.create({ message: error.response.data.error, duration: 2500, position: "bottom" });
      await toast.present();
    })
}

const uploadProfilePicture = () => {
  const fileInput: HTMLInputElement = document.getElementById('fileInput') as HTMLInputElement
  const profilePic = fileInput!.files![0]

  userStore.user.profilePicture = newPicSrc.value

  const formData = new FormData()
  formData.append("file", profilePic)

  axios.post(import.meta.env.VITE_APP_BASEURL + "profile-picture/upload", formData,
    {
      headers: { 'Content-Type': 'multipart/form-data', 'X-API-KEY': localStorage.getItem('token') }
    })
    .then(async Response => {
      if (Response.status == 200) {
        const toast = await toastController.create({ message: "Profile Picture uploaded successfully", duration: 2500, position: "bottom" });
        await toast.present();
      }
    })
    .catch(async error => {
      const toast = await toastController.create({ message: error.response.data.error, duration: 2500, position: "bottom" });
      await toast.present();
    })
}

</script>

<style scoped>
.post-container {
  position: relative;
  text-align: center;
  height: 80vh;
  margin: 1em;
  display: grid;
  grid-template: 10% 30% repeat(4, 1fr) / 5% 1fr 1fr 1fr 10%;
  overflow: hidden;

  border: 1px solid var(--ion-color-light-shade);
  border-radius: 1em;
}

.profile-picture-container {
  grid-area: 2 / 2 / 2 / 2;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.username-container {
  grid-area: 3 / 2 / 3 / 5;
  text-align: left;
}

.displayname-container {
  grid-area: 4 / 2 / 4 / 5;
  text-align: left;
}

.new-pic-label {
  height: auto;
  width: auto;
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
}

ion-avatar {
  width: 6em;
  height: 6em;
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
}

ion-avatar>ion-icon {
  --ionicon-stroke-width: 1em;
  font-size: 2.5em;
}

#new-pic-avatar {
  --ion-background-color: GREY;
  border: 1px solid var(--ion-color-dark-tint);
  color: var(--ion-color-dark-tint);
  padding: 1em;
  aspect-ratio: 10/10;
}

.title {
  font-weight: bold;
}

.btn-container {
  grid-area: 2 / 4 / 2 / 4;
}

.edit-btn {
  display: flex;
  justify-content: center;
  align-items: center;
}


.edit-btn:hover {
  background-color: var(--ion-color-light-shade);
}

.time {
  color: var(--ion-color-light-contrast)
}

.header-bar {
  grid-area: 1 / 2 / 1 / 2;
  display: flex;
  justify-content: space-between;
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

#menu-icon {
  color: var(--ion-color-light-contrast);
}
</style>
    
