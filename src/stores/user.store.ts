import type { AxiosResponse } from 'axios';
import axios from 'axios';
import { defineStore } from 'pinia';
import type { Ref } from 'vue';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import type { Tournament } from '../models/tournament';
import type { User } from '../models/user';
import { useErrorStore } from './error.store';
import { useToastStore } from './toast.store';

export const useUserStore = defineStore('user', () => {
  const user: Ref<User> = ref({} as User);
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

  /* API Call to verify an email adress (an email with an URL made with the name
   * and the token is sent, we take from it these information and verify them)
   * If both value are correct, the back set the mail on verified, and return a
   * response(), function continue and MailVerified is set on true
   * If one (or both) values are incorrect, an error is returned and catch by the
   * classic error catcher, stopping the function : MailVerified stays on false */
  async function verifMail(props: { idname: string; idtoken: string }): Promise<void> {
    // I set
    MailVerified.value = false;
    await axios.get(`/user/confirm/${props.idname}/${props.idtoken}`);
    // Active only if the API Call doesn't return an error
    MailVerified.value = true;
  }

  async function signin(email: string, username: string, password: string, password_validation: string) {
    await get_csrf();
    const data = {
      username,
      email,
      password,
      password_validation,
    };
    await axios.post('/user/register/', data, { headers: { 'Content-Type': 'application/json' } });

    setContent(`Un email de confirmation vous a été envoyé a ${email} pour confirmer votre compte`, 'success');
  }

  async function login(username: string, password: string) {
    await get_csrf();

    try {
      await axios.post(
        '/user/login/',
        {
          username,
          password,
        },

        {
          withCredentials: true,
        },
      );

      const user_data = await axios.get<User>('/user/me/', { withCredentials: true });
      user.value = user_data.data;
      isConnected.value = true;
      setContent(`Bienvenue ${username}`, 'success');
      await router.push('/me');
    } catch (err) { /* empty */ }
  }
  async function ask_reset_password(email: string) {
    await get_csrf();
    await axios.post('/user/password-reset/ask/', { email });
    setContent(`Un email de confirmation vous a été envoyé a ${email} pour réinitialiser votre compte`, 'success');
  }
  async function reset_password(username: String, token: String, password: String, password_confirm: String) {
    await get_csrf();
    await axios.post('/user/password-reset/submit/', {
      username, token, password, password_confirm,
    });
    setContent('Votre mot de passe a été réinitialisé', 'success');
    await router.push('/register');
  }
  async function logout() {
    await axios.post('/user/logout/').then(
      () => {
        isConnected.value = false;
        user.value = {} as User;
      },
    );
  }

  /*
    * Fetch all the inscription of a user
    * @param user_id: the id of the user
    * @return Promise<void>
  */
  async function fetch_user_inscription_full(user_id: string): Promise<void> {
    try {
      // ref object to store the data
      const ongoing = ref([]);
      const past = ref([]);
      const unpaid = ref({});
      // Get all the inscription of the user
      // Get all the inscription of the user
      const InscriptionId = await axios.get<number[]>(`/tournament/player/fromUserId/${user_id}`);
      const inscription_details_promises = InscriptionId.data.map((id: number) => axios.get<Tournament>(`/tournament/player/${id}`));
      const inscription_details_responses = await Promise.all(inscription_details_promises);
      const teams_details_promises = inscription_details_responses.map((response: AxiosResponse<Tournament>) => axios.get(`/tournament/team/${response.data.teams}`));
      const teams_details_responses = await Promise.all(teams_details_promises);
      const tournament_details_promises = teams_details_responses.map((response) => axios.get(`/tournament/tournament/${response.data.tournament}/full`));
      const tournament_details_responses = await Promise.all(tournament_details_promises);

      for (let i = 0; i < InscriptionId.data.length; i += 1) {
        inscription_details_responses[i].data.team = teams_details_responses[i].data;
        inscription_details_responses[i].data.team.tournament = tournament_details_responses[i].data;

        // Add the inscription to the right array
        if (inscription_details_responses[i].data.payment_status === 'NOTPAID') {
          unpaid.value[inscription_details_responses[i].data.team.id] = inscription_details_responses[i].data;
        }
        // Check if the tournament is ongoing or not
        if (teams_details_responses[i].data.tournament.event.ongoing) {
          ongoing.value.push(inscription_details_responses[i].data);
        } else {
          past.value.push(inscription_details_responses[i].data);
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
      if (res.status === 200) {
        if (data.current_password) {
          setContent('Vos informations ont été modifiées, vous devez vous reconnecter', 'success');
          await logout();
        } else {
          for (const key in data) {
            user.value[key] = data[key];
          }
          setContent('Vos informations ont été modifiées', 'success');
        }
      }
    } catch (err: any) {
      if (err.request.status === 403) {
        add_error({ data: { status: err.request.status, messages: 'Le mot de passe actuel est différent de celui que vous avez entré' } });
      } else if (err.request.status === 400) {
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
