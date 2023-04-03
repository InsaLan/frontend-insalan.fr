import { Tournament } from './tournament.models'
/*
 * User model
 * */
export interface User {
	id: number,
	username:string,
	email:string,
	tournaments?: Array<Tournament>,
}
