import axios from "axios"
axios.defaults.withCredentials = true;
export async function login_user(email: string, password: string) {
}


export default async function register_user(email: string, username: string, password: string) {
	axios.post("http://api.localhost/user/register/", {
		username,
		email,
		password
	}, {withCredentials: true}).then((response) => {console.log(response)})
	.catch(function (error) {
		console.log(error.response.data);
	});
}


