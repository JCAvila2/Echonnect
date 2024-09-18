<template>
  <h1>TODO: Login Component</h1>

  <a href="" target="_blank">
    <img src="@/assets/logo.svg" class="logo" />
  </a>
  <h1>Ingresa a tu Cuenta</h1>
  <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
  <div class="input_area">
    <div class="txt_field">
      <input v-model="email" required />
      <label>Correo Electrónico</label>
    </div>
    <div class="txt_field">
      <input v-model="password" type="password" required />
      <label>Contraseña</label>
    </div>
    <button class="login_button" @click="login">Ingresar</button>
    <div class="register">
      Olvidaste tu contraseña?
      <div @click="changePassword" class="cambiarC">Cambiar Contraseña</div>
    </div>
    <div class="register">
      ¿No tienes cuenta? <router-link to="/register">Registrarme</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    const email = ref('');
    const password = ref('');
    const errorMessage = ref('');

    const login = () => {
      const auth = getAuth();

      signInWithEmailAndPassword(auth, email.value, password.value)
        .then(() => {
          router.push('/profile');
        })
        .catch(error => {
          console.log(error.code);
          switch (error.code) {
            case 'auth/user-not-found':
              errorMessage.value = 'Incorrect Email';
              break;
            case 'auth/wrong-password':
              errorMessage.value = 'Incorrect Password';
              break;
            default:
              errorMessage.value = 'Invalid Email or Password';
              break;
          }
        });
    };

    const changePassword = () => {
      const label = 'Enter your email';
      const response = 'An email has been sent to change your password, change it and try again';

      const emailInput = prompt(label);
      if (emailInput) {
        const auth = getAuth();
        sendPasswordResetEmail(auth, emailInput)
          .then(() => {
            alert(response);
          })
          .catch(error => {
            console.log(error);
          });
      }
    };

    return {
      email,
      password,
      login,
      changePassword,
      errorMessage,
    };
  },
};
</script>

<style>
/* Add your styles here */
</style>
