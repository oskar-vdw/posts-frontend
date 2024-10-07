<template>
  <ion-page>
    <ion-header :translucent="true" class="ion-no-border">
      <ion-toolbar>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div id="background-img"></div>
      <ion-header collapse="condense">

      </ion-header>

      <ion-buttons>
        <ion-back-button defaultHref="/onboarding" :icon="arrowBackOutline" text=""> <ion-icon
            :icon="arrowBackOutline"></ion-icon></ion-back-button>
      </ion-buttons>

      <div class="username-container container" v-show="pinStage == false">
        <div class="username-input-container">
          <ion-input v-model="usernameInput" placeholder="username" :counter="true" :maxlength="12"
            @keydown="handleKeyDown" @keyup="handleKeyUp">
          </ion-input>
        </div>


      </div>
      <div class="container" v-show="pinStage == true">
        <div class="pin-container ">
          <div class="pin-display">
            <p v-if="pinInput.length == 0">_ _ _ _ _ _</p>
            <p v-else>{{ pinInput }}</p>
          </div>
          <ion-button @click="pin(1)" id="pin-1" class="pin-button">1</ion-button>
          <ion-button @click="pin(2)" id="pin-2" class="pin-button">2</ion-button>
          <ion-button @click="pin(3)" id="pin-3" class="pin-button">3</ion-button>
          <ion-button @click="pin(4)" id="pin-4" class="pin-button">4</ion-button>
          <ion-button @click="pin(5)" id="pin-5" class="pin-button">5</ion-button>
          <ion-button @click="pin(6)" id="pin-6" class="pin-button">6</ion-button>
          <ion-button @click="pin(7)" id="pin-7" class="pin-button">7</ion-button>
          <ion-button @click="pin(8)" id="pin-8" class="pin-button">8</ion-button>
          <ion-button @click="pin(9)" id="pin-9" class="pin-button">9</ion-button>
          <ion-button @click="pin(0)" id="pin-0" class="pin-button">0</ion-button>
          <ion-button @click="pin(-1)" id="pin-back" class="pin-button"><ion-icon
              :icon="backspaceOutline"></ion-icon></ion-button>

        </div>
      </div>
      <div class="username-feedback-container">
        <div id="username-free" v-if="usernameFree" class="username-feedback">
          <div class="emoji">🎉</div>
          <p class="feedback-text">Great choice.</p>
        </div>
        <div class="username-taken username-feedback" v-if="usernameTaken">
          <div class="emoji">⚠️</div>
          <p class="feedback-text">This username is taken. Already have an account? <a @click="loginRoute">Login
              instead.</a></p>
        </div>
        <div class="username-taken username-feedback" v-if="usernameFreeError">
          <div class="emoji">⚠️</div>
          <p class="feedback-text">This username does not exist. Do not have an account yet? <a
              @click="registerRoute">Register
              instead.</a></p>
        </div>
        <div class="username-taken username-feedback" v-if="pinError">
          <div class="emoji">❌</div>
          <p class="feedback-text">{{ errorMessage }}</p>
        </div>
      </div>
      <div class="button-container">
        <ion-button :disabled=!canContinue @click="sendData"><ion-icon slot="start"
            :icon="arrowForwardOutline"></ion-icon>{{
              authTypeRef }}</ion-button>
      </div>


    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonIcon, IonButtons, IonBackButton, toastController, IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonSegment, IonSegmentButton, IonLabel } from '@ionic/vue';
import { ref, watch } from 'vue';
import { arrowForwardOutline } from 'ionicons/icons';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
import { NewUser, LoginUser } from '../types/user';
import router from '@/router';
const route = useRoute()
import { useUserStore } from '../store/user.store'
const userStore = useUserStore()

const props = defineProps({
  authType: String
})


import { arrowBackOutline, backspaceOutline } from 'ionicons/icons';

const canContinue = ref(false)

const usernameInput = ref("")

const pinStage = ref(false)

const authTypeRef = ref(props.authType)

const usernameTaken = ref(false)
const usernameFree = ref(false)
const usernameFreeError = ref(false)
const pinError = ref(false)
const errorMessage = ref('')

const pinInput = ref("")

const pin = (inputNumber: number) => {
  if (inputNumber == -1) {
    pinInput.value = pinInput.value.slice(0, pinInput.value.length - 1)
  }
  else if (pinInput.value.length <= 5) {
    pinInput.value += String(inputNumber)
  }

  if (pinInput.value.length > 3) {
    canContinue.value = true
  }
  else {
    canContinue.value = false
  }

}


const timeoutId = ref()

const handleKeyUp = () => {
  canContinue.value = false
  resetMessages()
  timeoutId.value = setTimeout(() => {
    checkAvailability()
  }, 1000)
}

const handleKeyDown = (event: any) => {
  clearTimeout(timeoutId.value)
}


const checkAvailability = () => {
  if (usernameInput.value.length > 3) {
    axios.get(import.meta.env.VITE_APP_BASEURL + 'user/username-available/' + usernameInput.value,
    )
      .then(async Response => {
        // check if the username is available
        if (Response.data.data.available == true) {
          // If you want to register, then this is a good response. The username is free, the messages update accordingly
          if (authTypeRef.value == 'register') {
            usernameTaken.value = false
            usernameFree.value = true
            canContinue.value = true
          }
          // If you want to login, this is bad because the username with which you want to login doesn't exist.
          else {
            usernameFreeError.value = true
            canContinue.value = false
          }

        }
        // If the username is taken:
        else if (Response.data.data.available == false) {
          //If you want to register, then this is a bad response. The username is taken, the messages update accordingly
          if (authTypeRef.value == 'register') {
            usernameTaken.value = true
            usernameFree.value = false
            canContinue.value = false
          }
          // If you want to login, then this is a good response. The username exists, the user can continue
          else {
            canContinue.value = true
          }
        }
      })
      .catch(async error => {
        canContinue.value = false
        const toast = await toastController.create({ message: error.response.data.error, duration: 2500, position: "bottom" });
        await toast.present();
      })
  }
  else {
    canContinue.value = false
    resetMessages()
  }
}

const loginRoute = () => {
  resetMessages()
  authTypeRef.value = 'login'
  pinStage.value = true
}
const registerRoute = () => {
  resetMessages()
  authTypeRef.value = 'register'
  pinStage.value = false
}

const sendData = () => {
  if (pinStage.value == true) {
    axios.post(import.meta.env.VITE_APP_BASEURL + 'user/' + authTypeRef.value, {
      pin: pinInput.value, username: usernameInput.value, displayName: usernameInput.value
    }, {
      headers: { 'Content-Type': 'application/json' }
    })
      .then(async Response => {
        if (Response.status == 200) {
          localStorage.setItem('token', Response.data.data.loginSecret)
          const toast = await toastController.create({ message: "Login successful!", duration: 2500, position: "bottom" });
          await toast.present();
          continueJourney()
        }
      })
      .catch(async error => {
        pinError.value = true
        errorMessage.value = error.response.data.error
        const toast = await toastController.create({ message: error.response.data.error, duration: 2500, position: "bottom" });
        await toast.present();
      })
  }
  else {
    pinStage.value = true
  }
}

const continueJourney = async () => {
  await userStore.checkOnboarding()
  router.push('/home')


  // reset all variables to the baseline
  resetMessages()
  canContinue.value = false
  usernameInput.value = ""
  pinStage.value = false
  authTypeRef.value = 'register'
  pinInput.value = ""
}

const resetMessages = () => {
  usernameTaken.value = false
  usernameFree.value = false
  pinError.value = false
  usernameFreeError.value = false
}

</script>

<style scoped>
* {
  color: white;
}

ion-back-button {
  color: white !important;
}

.pin-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  grid-template-rows: 2fr repeat (5, 1fr);
  margin: 1.5em 0;
}

.pin-display {
  grid-column: 2 / 5;
  grid-row: 1 / 1;
  font-weight: bold;
  text-align: center;
  margin: 0.5em;
  font-size: 2em;
}

.pin-button {
  --border-radius: 300em;
  width: 4.5em;
  height: 4.5em;
  margin: 0.5em;

}

#pin-1 {
  grid-column-start: 2;
  grid-row-start: 2
}

#pin-2 {
  grid-column-start: 3;
  grid-row-start: 2
}

#pin-3 {
  grid-column-start: 4;
  grid-row-start: 2
}

#pin-4 {
  grid-column-start: 2;
  grid-row-start: 3
}

#pin-5 {
  grid-column-start: 3;
  grid-row-start: 3
}

#pin-6 {
  grid-column-start: 4;
  grid-row-start: 3
}

#pin-7 {
  grid-column-start: 2;
  grid-row-start: 4
}

#pin-8 {
  grid-column-start: 3;
  grid-row-start: 4
}

#pin-9 {
  grid-column-start: 4;
  grid-row-start: 4
}

#pin-0 {
  grid-column-start: 3;
  grid-row-start: 5
}

#pin-back {
  --border-style: none;
  font-size: 1em;
  grid-column-start: 4;
  grid-row-start: 5;
}


#background-img {
  position: absolute;
  top: 0;
  left: -200px;
  width: 300%;
  height: 150vh;
  filter: brightness(45%);
  background-image: url(/public/background-purple.jpg);
  /*      background: rgb(136, 26, 245);
    background: linear-gradient(142deg, rgba(136, 26, 245, 1) 0%, rgba(50, 115, 246, 1) 100%); */
  background-size: cover;
  --webkit-background-size: cover;
  z-index: 0;
}

.container {
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-radius: 1em;
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  margin: 0 2em;
}

.username-feedback-container {
  margin: 1em 2em;
  display: grid;
}

.username-feedback {
  border: 4px solid;

  width: 100%;
  border-radius: 1em;
  padding: 0.25em 0.5em;
  font-size: 1.1em;
  font-weight: 500;
  grid-template-columns: 1fr 4fr;


  z-index: 1;
}

.feedback-text {
  grid-column-start: 2;
  grid-row-start: 1
}

.emoji {
  grid-column-start: 1;
  grid-row-start: 1;
  grid-column-end: span 1;
}

a {
  color: white;
  text-decoration: underline;
}


.username-taken {
  border-color: rgba(237, 87, 107, 0.4);
  background-color: rgba(237, 87, 107, 0.3);
}

#username-free {
  background-color: rgba(40, 186, 98, 0.3);
  border-color: rgba(40, 186, 98, 0.4);
}


ion-title {
  margin: 0.25em;
}

.button-container {
  margin: 1em 1em;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}

ion-button {
  --background: transparent;
  --border-radius: 1em;
  --border-color: rgba(255, 255, 255, 0.2);
  --border-style: solid;
  --border-width: 3px;
  --border-: 3px;

  --color: rgba(255, 255, 255, 0.7);
  --color-activated: white;
  --background-activated: rgba(255, 255, 255, 0.2);
}

ion-back-button {
  color: var(--ion-color-light-contrast);
  margin: 0 2em 2em 1em;
}

.username-input-container {
  margin: 4em 3em 2.5em 3em;
}
</style>