import { defineStore } from 'pinia'
import { PostInteraction } from '../types/user';

export const usePostStore = defineStore('post', {
    state: () => ({

        postInteractions: [] as PostInteraction[]


    }),
    getters: {
    },
    actions: {

        isInStore(postId: number) {
            for (let i = 0; i < this.postInteractions.length; i++) {
                if (this.postInteractions[i].id == postId) {
                    return i
                }
            }
            return -1
        },

        addPostInteractions(data: PostInteraction[], override: boolean) {
            if (override == true) {
                this.postInteractions = data
            }
            else {
                for (let i = 0; i < data.length; i++) {
                    if (this.isInStore(data[i].id) == -1) {
                        this.postInteractions.push(data[i])
                    }
                }
            }
        },

        toggleLike(postId: number, like: boolean, userId: number) {
            const index = this.isInStore(postId)

            if (like == true) {
                this.postInteractions[index].likeIds.unshift(userId)
            }
            if (like == false) {
                this.postInteractions[index].likeIds.splice(this.postInteractions[index].likeIds.indexOf(userId), 1)
            }
        },

        addComment(parentId: number, data?: PostInteraction[]){
            if(data){
                this.addPostInteractions(data, false)
            }
            
            const index = this.isInStore(parentId)
            this.postInteractions[index].totalReplies++
            if(this.postInteractions[index].parentId){
                this.addComment(this.postInteractions[index].parentId!)
            }

        }

    }
})