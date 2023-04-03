import { defineStore } from "pinia";
import { User } from "../models/user.models";
export const useUserStore = defineStore('user',{
	state: () => (): User => ({
		id: 0,
		username: "John",
		email: "john.doe@insalan.fr",
	}),
	getters: {
		isConnected() {
			return true;
		}
	},
	actions: {}
})
