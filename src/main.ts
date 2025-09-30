import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import i18n from './plugins/i18n'
import { SoundUtilities } from './logic/SoundUtilities'

const app = createApp(App)
app.use(vuetify).use(i18n)

// Provide sound utilities for drumroll feature
app.provide('soundUtilities', new SoundUtilities())

app.mount('#app')
