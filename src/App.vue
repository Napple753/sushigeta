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
              <v-card-title class="flex-column align-center">
                <div>
                  <h1 class="text-h4 mb-1">{{ $t('app.title') }}</h1>
                </div>
                <div class="text-subtitle-1 text-grey">
                  {{ $t('app.subtitle') }}
                </div>
              </v-card-title>
              <v-card-text>
                <div v-if="currentStep === 1">
                  <GroupManager />
                </div>

                <div v-else-if="currentStep === 2">
                  <h2 class="text-h5 mb-4">{{ $t('app.step.exchange') }}</h2>
                  <v-alert
                    :type="isExchangeValid ? 'success' : 'warning'"
                    variant="tonal"
                    class="mb-4"
                  >
                    {{ statusMessageKey ? $t(statusMessageKey) : '' }}
                  </v-alert>
                  <div class="text-center">
                    <v-btn
                      color="success"
                      size="large"
                      :disabled="!isExchangeValid"
                      @click="onStartExchange"
                    >
                      {{ $t('exchange.start') }}
                    </v-btn>
                  </div>
                </div>

                <div v-else-if="currentStep === 3">
                  <h2 class="text-h5 mb-4">{{ $t('app.step.result') }}</h2>
                  <div v-if="assignments.length === 0">
                    <v-alert type="warning" variant="tonal">
                      {{ $t('exchange.impossible') }}
                    </v-alert>
                  </div>

                  <div v-else>
                    <!-- One by one reveal -->
                    <div
                      v-if="revealIndex < assignments.length"
                      class="text-center my-6"
                    >
                      <div class="text-h6 mb-2">
                        {{ $t('result.oneByOne') }}
                      </div>
                      <div class="text-h4 my-4">
                        {{ getName(assignments[revealIndex].giverId) }}
                        <v-icon class="mx-3">mdi-arrow-right</v-icon>
                        {{ getName(assignments[revealIndex].receiverId) }}
                      </div>
                      <v-btn color="primary" @click="nextReveal">
                        {{ $t('result.next') }}
                        <v-icon end>mdi-arrow-right</v-icon>
                      </v-btn>
                    </div>

                    <!-- Summary -->
                    <div v-else>
                      <div
                        class="d-flex align-center justify-space-between mb-2"
                      >
                        <div class="text-h6">{{ $t('result.summary') }}</div>
                        <div>
                          <v-btn
                            class="me-2"
                            size="small"
                            variant="tonal"
                            @click="copySummary"
                          >
                            {{ $t('result.copy') }}
                          </v-btn>
                          <v-btn
                            size="small"
                            variant="tonal"
                            @click="printPage"
                          >
                            {{ $t('result.print') }}
                          </v-btn>
                        </div>
                      </div>
                      <v-list density="comfortable" class="bg-transparent">
                        <v-list-item v-for="a in assignments" :key="a.giverId">
                          <v-list-item-title>
                            {{ getName(a.giverId) }} →
                            {{ getName(a.receiverId) }}
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </div>
                  </div>
                </div>
              </v-card-text>

              <!-- Navigation -->
              <v-card-actions class="justify-space-between">
                <v-btn
                  v-if="currentStep > 1 && currentStep !== 3"
                  variant="outlined"
                  @click="currentStep--"
                >
                  <v-icon start>mdi-arrow-left</v-icon>
                  {{ $t('common.back') }}
                </v-btn>
                <v-spacer v-else />

                <v-btn
                  v-if="currentStep === 1"
                  color="primary"
                  :disabled="currentStep === 1 && !canProceedToGrouping"
                  @click="currentStep++"
                >
                  {{ $t('result.next') }}
                  <v-icon end>mdi-arrow-right</v-icon>
                </v-btn>

                <v-btn
                  v-if="currentStep === 3"
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
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import GroupManager from './components/GroupManager.vue'
import { useSushigetaState } from './composables/useSushigetaState'

const { locale } = useI18n()
const {
  state,
  canProceedToGrouping,
  setCurrentStep,
  resetState,
  validateExchange,
  performExchange,
} = useSushigetaState()

const currentStep = computed({
  get: () => state.value.currentStep,
  set: (value) => setCurrentStep(value),
})

const resetApp = () => {
  resetState()
}

// Exchange UI state and helpers
const revealIndex = ref(0)
const assignments = computed(() => state.value.assignments)
const isExchangeValid = computed(() => validateExchange().isValid)
const statusMessageKey = computed(() => validateExchange().message || '')

const onStartExchange = () => {
  const ok = performExchange()
  if (ok) {
    revealIndex.value = 0
    currentStep.value = 3
  }
}

const nextReveal = () => {
  if (revealIndex.value < assignments.value.length) {
    revealIndex.value++
  }
}

const getName = (id: string) => {
  const p = state.value.participants.find((x) => x.id === id)
  return p ? p.name : id
}

const copySummary = async () => {
  const lines = assignments.value.map(
    (a) => `${getName(a.giverId)} -> ${getName(a.receiverId)}`
  )
  try {
    await navigator.clipboard.writeText(lines.join('\n'))
  } catch (e) {
    // ignore
  }
}

const printPage = () => {
  window.print()
}
</script>
