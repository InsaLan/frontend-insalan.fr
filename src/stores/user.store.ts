import axios, { type AxiosError, isAxiosError } from 'axios';
import { defineStore } from 'pinia';
import { computed, type Ref, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { PlayerRegistrationDeref } from '@/models/registration';
import type { User, UserPatch, UserPatchError } from '@/models/user';

import { useErrorStore } from './error.store';
import { useToastStore } from './toast.store';

export const useUserStore = defineStore('user', () => {
  const user = ref<User>({} as User);
  const isConnected = ref(false);
  const csrf = ref('');
  const router = useRouter();
  const ToastStore = useToastStore();
  const ErrorStore = useErrorStore();
  const inscriptions = ref<{
    ongoing: Ref<[string, PlayerRegistrationDeref][]>;
    past: Ref<[string, PlayerRegistrationDeref][]>;
    unpaid: Ref<{ [key: string]: boolean }>;
  }>({
    ongoing: ref([]),
    past: ref([]),
    unpaid: ref({}),
  });
  const MailVerified = ref(false);
  const { setContent } = ToastStore;
  const { add_error } = ErrorStore;

  /*
  * Get a new csrf token from the server
  */
  async function get_csrf() {
    await axios.get('/user/get-csrf/');
    const cookies: { name: string; value: string }[] = [];
    document.cookie.split(';').forEach((cookie) => {
      cookies.push({
        name: cookie.split('=')[0],
        value: cookie.split('=')[1],
      });
    });
    const token = cookies.find((cookie) => cookie.name === 'csrftoken');
    csrf.value = token ? token.value : '';
  }

  /* API Call to verify an email address (an email with a URL made with the name
   * and the token is sent, we take from it these information and verify them)
   * If both value are correct, the back set the mail on verified, and return a
   * response(), function continue and MailVerified is set on true
   * If one (or both) values are incorrect, an error is returned and catch by the
   * classic error catcher, stopping the function : MailVerified stays on false */
  async function verifMail(props: { idname: string; idtoken: string }) {
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
      await axios.post('/user/login/', { username, password }, { withCredentials: true });

      const user_data = await axios.get<User>('/user/me/', { withCredentials: true });
      user.value = user_data.data;
      isConnected.value = true;
      setContent(`Bienvenue ${username}`, 'success');
      await router.push('/me');
    } catch (err) {
      /* empty */
    }
  }

  async function ask_reset_password(email: string) {
    await get_csrf();
    await axios.post('/user/password-reset/ask/', { email });
    setContent(`Un email de confirmation vous a été envoyé a ${email} pour réinitialiser votre compte`, 'success');
  }

  async function reset_password(username: string, token: string, password: string, password_confirm: string) {
    await get_csrf();
    await axios.post('/user/password-reset/submit/', {
      username, token, password, password_confirm,
    });
    setContent('Votre mot de passe a été réinitialisé', 'success');
    await router.push('/register');
  }

  async function logout() {
    await axios.post('/user/logout/');
    isConnected.value = false;
    user.value = {} as User;
  }

  /*
    * Fetch all the inscription of a user
    * TODO: ADD manager handling
    * @param user_id: the id of the user
  */
  async function fetch_user_inscription_full() {
    try {
      // ref object to store the data
      const ongoing: [string, PlayerRegistrationDeref][] = [];
      const past: [string, PlayerRegistrationDeref][] = [];
      const unpaid: { [key: number]: boolean } = {};
      // Get all the inscription of the user
      const registrations = await axios.get<{ 'player': PlayerRegistrationDeref[]; 'manager': PlayerRegistrationDeref[] }>('/tournament/me');
      // Set the value of the ref object
      registrations.data.player.forEach((registration) => {
        if (registration.team.tournament.event.ongoing) {
          ongoing.push(['player', registration]);
        } else {
          past.push(['player', registration]);
        }
        // If the registration is not paid, add the tournament to the unpaid object
        if (registration.payment_status === 'NOT_PAID') {
          unpaid[registration.id] = true;
        }
      });
      registrations.data.manager.forEach((registration) => {
        if (registration.team.tournament.event.ongoing) {
          ongoing.push(['manager', registration]);
        } else {
          past.push(['manager', registration]);
        }
        // If the registration is not paid, add the tournament to the unpaid object
        if (registration.payment_status === 'NOT_PAID') {
          unpaid[registration.id] = true;
        }
      });

      inscriptions.value = {
        ongoing,
        past,
        unpaid,
      };
    } catch (err) {
      add_error('Impossible de récupérer vos inscriptions, veuillez réessayer plus tard ou contacter un administrateur');
    }
  }

  async function patch_user(data: UserPatch) {
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
          user.value = { ...user.value, ...data };
          setContent('Vos informations ont été modifiées', 'success');
        }
      }
    } catch (err: unknown) {
      const error = err as Error | AxiosError;
      if (isAxiosError(error)) {
        const request = error.request as XMLHttpRequest;
        if (request.status === 403) {
          add_error({ data: { status: request.status, message: 'Le mot de passe actuel est différent de celui que vous avez entré' } });
        } else if (request.status === 400) {
          const response = JSON.parse(request.responseText) as UserPatchError;
          if (response.user) {
            add_error({ data: { status: request.status, message: response.user[0] } });
          } else {
            add_error({ data: { status: request.status, message: response.password as string } });
          }
        }
      }
    }
  }

  const role = computed(() => {
    if (user.value.is_superuser) return 'dev';
    if (user.value.is_staff) return 'staff';
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
