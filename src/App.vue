<template>
  <v-app>
    <v-app-bar color="primary" dark>
      <v-app-bar-title>
        <v-icon class="me-2">mdi-gift</v-icon>
        {{ $t('app.title') }}
      </v-app-bar-title>

      <v-spacer />

      <!-- Language Toggle -->
      <v-btn-toggle v-model="locale" class="me-2">
        <v-btn value="ja" size="small">日本語</v-btn>
        <v-btn value="en" size="small">English</v-btn>
      </v-btn-toggle>

      <!-- Theme Toggle -->
      <v-btn
        :icon="
          theme.global.current.value.dark
            ? 'mdi-weather-sunny'
            : 'mdi-weather-night'
        "
        @click="toggleTheme"
      />
    </v-app-bar>

    <v-main>
      <v-container class="pa-4">
        <v-row justify="center">
          <v-col cols="12" md="10" lg="8">
            <!-- Step Indicator -->
            <v-stepper
              v-model="currentStep"
              :items="stepItems"
              alt-labels
              class="mb-6"
            />

            <!-- Main Content -->
            <v-card>
              <v-card-text>
                <div v-if="currentStep === 1">
                  <h2 class="text-h5 mb-4">{{ $t('app.step.input') }}</h2>
                  <p class="text-body-1 mb-4">{{ $t('app.subtitle') }}</p>
                  <!-- ParticipantInput component will go here -->
                  <div class="text-center">
                    <v-btn color="primary" size="large" disabled>
                      {{ $t('participant.add') }}
                    </v-btn>
                  </div>
                </div>

                <div v-else-if="currentStep === 2">
                  <h2 class="text-h5 mb-4">{{ $t('app.step.group') }}</h2>
                  <!-- GroupManager component will go here -->
                  <v-alert type="info" class="mb-4">
                    {{ $t('group.instruction') }}
                  </v-alert>
                </div>

                <div v-else-if="currentStep === 3">
                  <h2 class="text-h5 mb-4">{{ $t('app.step.exchange') }}</h2>
                  <!-- Exchange logic will go here -->
                  <div class="text-center">
                    <v-btn color="success" size="large" disabled>
                      {{ $t('exchange.start') }}
                    </v-btn>
                  </div>
                </div>

                <div v-else-if="currentStep === 4">
                  <h2 class="text-h5 mb-4">{{ $t('app.step.result') }}</h2>
                  <!-- ExchangePresentation component will go here -->
                  <v-alert type="success">
                    {{ $t('result.title') }}
                  </v-alert>
                </div>
              </v-card-text>

              <!-- Navigation -->
              <v-card-actions class="justify-space-between">
                <v-btn
                  v-if="currentStep > 1"
                  variant="outlined"
                  @click="currentStep--"
                >
                  <v-icon start>mdi-arrow-left</v-icon>
                  {{ $t('common.back') }}
                </v-btn>
                <v-spacer v-else />

                <v-btn
                  v-if="currentStep < 4"
                  color="primary"
                  @click="currentStep++"
                >
                  {{ $t('result.next') }}
                  <v-icon end>mdi-arrow-right</v-icon>
                </v-btn>

                <v-btn
                  v-if="currentStep === 4"
                  color="error"
                  variant="outlined"
                  @click="resetApp"
                >
                  <v-icon start>mdi-refresh</v-icon>
                  {{ $t('result.reset') }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTheme } from 'vuetify'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const theme = useTheme()

const currentStep = ref(1)

const stepItems = computed(() => [
  { title: t('app.step.input'), value: 1 },
  { title: t('app.step.group'), value: 2 },
  { title: t('app.step.exchange'), value: 3 },
  { title: t('app.step.result'), value: 4 },
])

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}

const resetApp = () => {
  currentStep.value = 1
  // Additional reset logic will be added later
}

// Watch locale changes to update Vuetify locale
watch(locale, (_newLocale) => {
  // Vuetify locale will be synced in the vuetify plugin
})
</script>
