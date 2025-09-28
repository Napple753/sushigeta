<template>
  <v-app>
    <v-main>
      <v-container class="pa-4">
        <v-row justify="center">
          <v-col cols="12" md="10" lg="8">
            <!-- Language Toggle -->
            <div class="d-flex justify-end mb-4">
              <v-btn-toggle v-model="locale" mandatory variant="outlined">
                <v-btn value="ja" size="small">日本語</v-btn>
                <v-btn value="en" size="small">English</v-btn>
              </v-btn-toggle>
            </div>

            <!-- Main Content -->
            <v-card>
              <v-card-text>
                <div v-if="currentStep === 1">
                  <ParticipantInput />
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
                  :disabled="currentStep === 1 && !canProceedToGrouping"
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
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ParticipantInput from './components/ParticipantInput.vue'
import { useSushigetaState } from './composables/useSushigetaState'

const { locale } = useI18n()
const { state, canProceedToGrouping, setCurrentStep, resetState } =
  useSushigetaState()

const currentStep = computed({
  get: () => state.currentStep,
  set: (value) => setCurrentStep(value),
})

const resetApp = () => {
  resetState()
}
</script>
