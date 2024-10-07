<template>
    <ion-avatar><img :src="import.meta.env.VITE_APP_BASEURL + `profile-picture/get/${userid}`"
            @error="defaultPic"></ion-avatar>
</template>

<script lang="ts">
import { IonAvatar } from '@ionic/vue';
import { defineComponent } from 'vue';


export default defineComponent({
    name: 'ProfilePicComponent',
    components: {
        IonAvatar,
    },
    props: {
        userid: {
            type: String,
        }
    },
    setup() {
        const defaultPic = (event: Event) => {
            (event.target as HTMLImageElement).src = "/default-avatar.jpg";
        }
        return { defaultPic }
    }
})

</script>

<style scoped>

img {
    aspect-ratio: 1/1;
}

</style>
