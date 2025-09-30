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
                    <!-- One by one reveal with dual drum roll (giver | receiver) -->
                    <div
                      v-if="revealIndex < assignments.length"
                      class="text-center my-6"
                    >
                      <div class="text-h6 mb-4">
                        {{ $t('result.oneByOne') }}
                      </div>
                      <div
                        class="d-flex flex-column align-center justify-center ga-4 my-4"
                        style="width: 100%"
                      >
                        <NameLotteryCore
                          v-if="currentGiver && currentReceiver"
                          :key="`giver-${revealIndex}`"
                          ref="giverRef"
                          :winner="currentGiver!"
                          :candidates="allParticipants"
                          :play-drum-roll="true"
                        />
                        <v-icon size="36">mdi-arrow-down</v-icon>
                        <NameLotteryCore
                          v-if="currentGiver && currentReceiver"
                          :key="`receiver-${revealIndex}`"
                          ref="receiverRef"
                          :winner="currentReceiver!"
                          :candidates="allParticipants"
                          :play-drum-roll="true"
                        />
                      </div>

                      <div class="mt-6">
                        <v-btn
                          color="primary"
                          :disabled="
                            isRolling || !currentGiver || !currentReceiver
                          "
                          @click="onNextInStep3"
                        >
                          {{ $t('result.next') }}
                          <v-icon end>mdi-arrow-right</v-icon>
                        </v-btn>
                      </div>
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
                        <v-list-item
                          v-for="(_, pos) in revealOrder"
                          :key="orderedAssignmentAt(pos)?.giverId"
                        >
                          <v-list-item-title>
                            {{ getName(orderedAssignmentAt(pos).giverId) }} →
                            {{ getName(orderedAssignmentAt(pos).receiverId) }}
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
import { computed, ref, nextTick } from 'vue'
import { shuffleArray } from '@/logic/shuffleArray'
import { useI18n } from 'vue-i18n'
import GroupManager from './components/GroupManager.vue'
import NameLotteryCore from './components/NameLotteryCore.vue'
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
const revealOrder = ref<number[]>([])
const orderedAssignmentAt = (idx: number) =>
  state.value.assignments[revealOrder.value[idx]]
const isExchangeValid = computed(() => validateExchange().isValid)
const statusMessageKey = computed(() => validateExchange().message || '')
const isRolling = ref(false)
const allParticipants = computed(() => state.value.participants)
const currentReceiver = computed(() =>
  state.value.participants.find(
    (p) => p.id === orderedAssignmentAt(revealIndex.value)?.receiverId
  )
)
const currentGiver = computed(() =>
  state.value.participants.find(
    (p) => p.id === orderedAssignmentAt(revealIndex.value)?.giverId
  )
)
const giverRef = ref<InstanceType<typeof NameLotteryCore> | null>(null)
const receiverRef = ref<InstanceType<typeof NameLotteryCore> | null>(null)
const ROLL_MS = 500

const onStartExchange = () => {
  const ok = performExchange()
  if (ok) {
    revealIndex.value = 0
    isRolling.value = false
    currentStep.value = 3
    // Create random reveal order for givers
    revealOrder.value = shuffleArray(state.value.assignments.map((_, i) => i))
    // Auto start the first pair after rendering
    nextTick().then(() => startCurrentPairRoll())
  }
}

const startCurrentPairRoll = async () => {
  if (isRolling.value) return
  isRolling.value = true
  await nextTick()
  // eslint-disable-next-line no-console
  console.log('[App] giver draw start', {
    index: revealIndex.value,
    giver: currentGiver.value?.name,
    ms: ROLL_MS,
  })
  await giverRef.value?.draw(ROLL_MS, 0)
  // eslint-disable-next-line no-console
  console.log('[App] giver draw done')
  await receiverRef.value?.draw(ROLL_MS, 0)
  // eslint-disable-next-line no-console
  console.log('[App] receiver draw done')
  isRolling.value = false
}

const onNextInStep3 = async () => {
  if (isRolling.value) return
  // If current pair finished, move to next or summary and start roll
  if (revealIndex.value < assignments.value.length - 1) {
    revealIndex.value++
    await nextTick()
    await startCurrentPairRoll()
  } else {
    // Move to summary view
    revealIndex.value++
  }
}

const getName = (id: string) => {
  const p = state.value.participants.find((x) => x.id === id)
  return p ? p.name : id
}

const copySummary = async () => {
  const lines = revealOrder.value.map((pos) => {
    const a = orderedAssignmentAt(pos)
    return `${getName(a.giverId)} -> ${getName(a.receiverId)}`
  })
  try {
    await navigator.clipboard.writeText(lines.join('\n'))
  } catch (e) {
    // ignore
  }
}

const printPage = () => {
  window.print()
}

// no-op: finish events handled via awaiting draw()
</script>
