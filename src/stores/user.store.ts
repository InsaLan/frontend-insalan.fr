import axios from 'axios';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useErrorStore } from './error.store';
import { useToastStore } from './toast.store';

export const useUserStore = defineStore('user', () => {
  const user = ref({});
  const isConnected = ref(false);
  const csrf = ref('');
  const router = useRouter();
  const ToastStore = useToastStore();
  const ErrorStore = useErrorStore();
  const inscriptions = ref({});
  const MailVerified = ref(false);
  const { setContent } = ToastStore;
  const { add_error } = ErrorStore;

  /*
	 * Get a new csrf token from the server
	 * @return Promise<void>
	*/
  async function get_csrf():Promise<void> {
    await axios.get('/user/get-csrf/');
    const cookies:{ name: string; value: string }[] = [];
    document.cookie.split(';').forEach((cookie) => {
      cookies.push({
        name: cookie.split('=')[0],
        value: cookie.split('=')[1],
      });
    });
    const token = cookies.find((cookie) => cookie.name === 'csrftoken');
    csrf.value = token ? token.value : '';
  }

  // API Call to verify an email adress (an email with an URL made with the name and the token is sent, we take from it these information and verify them)
  // If both value are correct, the back set the mail on verified, and return a response(), function continue and MailVerified is set on true
  // If one (or both) values are incorrect, an error is returned and catch by the classic error catcher, stopping the function : MailVerified stays on false
  async function verifMail(props): Promise<void> {
    // I set
    MailVerified.value = false;
    await axios.get(`/user/confirm/${props.idname}/${props.idtoken}`);
    // Active only if the API Call doesn't return an error
    MailVerified.value = true;
  }

  async function signin(email: String, username: String, password: String, password_validation: String) {
    get_csrf();
    const data = {
      username,
      email,
      password,
      password_validation,
    };
    console.log(data);
    const res = await axios.post('/user/register/', data, { headers: { 'Content-Type': 'application/json' } });

    setContent(`Un email de confirmation vous a été envoyé a ${email} pour confirmer votre compte`, 'success');
  }

  async function login(username: String, password: String) {
    get_csrf();

    try {
      const res = await axios.post(
        '/user/login/',
        {
          username,
          password,
        },

        {
          withCredentials: true,
        },
      );

      const user_data = await axios.get('/user/me/', { withCredentials: true });
      user.value = user_data.data;
      isConnected.value = true;
      setContent(`Bienvenue ${username}`, 'success');
      router.push('/me');
    } catch (err) {}
  }
  async function ask_reset_password(email: String) {
    get_csrf();
    const response = await axios.post('/user/password-reset/ask/', { email });
    setContent(`Un email de confirmation vous a été envoyé a ${email} pour réinitialiser votre compte`, 'success');
  }
  async function reset_password(user: String, token: String, password: String, password_confirm: String) {
    get_csrf();
    const response = await axios.post('/user/password-reset/submit/', {
      user, token, password, password_confirm,
    });
    setContent('Votre mot de passe a été réinitialisé', 'success');
    router.push('/register');
  }
  async function logout() {
    await axios.post('/user/logout/').then(
      () => {
        isConnected.value = false;
        user.value = {};
      },
    );
    location = '/';
  }

  /*
	 * Fetch all the inscription of a user
	 * @param user_id: the id of the user
	 * @return Promise<void>
	*/
  async function fetch_user_inscription_full(user_id: String): Promise<void> {
    try {
      // ref object to store the data
      const ongoing = ref([]);
      const past = ref([]);
      const unpaid = ref({});

      // Get all the inscription of the user
      const InscriptionId = await axios.get(`/tournament/player/fromUserId/${user_id}`);
      for (let i = 0; i < InscriptionId.data.length; i++) {
        // Get the details of the inscription
        const inscription_details = await axios.get(`/tournament/player/${InscriptionId.data[i]}`);
        // Get the details of the team
        const teams_details = await axios.get(`/tournament/team/${inscription_details.data.team}`);
        inscription_details.data.team = teams_details.data;
        // Get the details of the tournament
        const tournament_details = await axios.get(`/tournament/tournament/${teams_details.data.tournament}/full`);
        inscription_details.data.team.tournament = tournament_details.data;
        console.log(inscription_details.data);

        // Add the inscription to the right array
        if (inscription_details.data.payment_status == 'NOTPAID') {
          unpaid.value[inscription_details.data.team.id] = inscription_details.data;
        }
        // Check if the tournament is ongoing or not
        if (teams_details.data.tournament.event.ongoing) {
          ongoing.value.push(inscription_details.data);
        } else {
          past.value.push(inscription_details.data);
        }
      }
      // Set the value of the ref object
      inscriptions.value = {
        ongoing,
        past,
        unpaid,
      };
    } catch (err) {
      add_error('Impossible de récupérer vos inscriptions, veuillez réessayer plus tard ou contacter un administrateur');
    }
  }
  async function patch_user(data: Object) {
    await get_csrf();
    try {
      const res = await axios.patch('/user/me/', data, {
        withCredentials: true,
        headers: {
          'X-CSRFToken': csrf.value,
          'Content-Type': 'application/json',
        },
      });
      if (res.status == 200) {
        if (data.current_password) {
          setContent('Vos informations ont été modifiées, vous devez vous reconnecter', 'success');
          logout();
        } else {
          for (const key in data) {
            user.value[key] = data[key];
          }
          setContent('Vos informations ont été modifiées', 'success');
        }
      }
    } catch (err) {
      if (err.request.status == 403) {
        add_error({ data: { status: err.request.status, messages: 'Le mot de passe actuel est différent de celui que vous avez entré' } });
      } else if (err.request.status == 400) {
        const response = JSON.parse(err.request.response);
        if (response.user) {
          add_error({ data: { status: err.request.status, messages: response.user[0] } });
        } else {
          add_error({ data: { status: err.request.status, messages: response.password } });
        }
      }
    }
  }
  const role = computed(() => {
    if (user.value.is_superuser) { return 'dev'; }
    if (user.value.is_staff) { return 'staff'; }
		 return 'joueur';
  });

  return {
    user,
    signin,
    login,
    logout,
    fetch_user_inscription_full,
    patch_user,
    verifMail,
    ask_reset_password,
    reset_password,
    role,
    isConnected,
    inscriptions,
    MailVerified,
  };
});
