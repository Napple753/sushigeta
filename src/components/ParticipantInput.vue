<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <!-- Participants Management -->
        <v-card elevation="2">
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon class="me-2">mdi-account-multiple</v-icon>
              {{ $t('participant.list') }}
              <v-chip
                v-if="participantCount > 0"
                color="primary"
                size="small"
                class="ms-2"
              >
                {{ participantCount }}人
              </v-chip>
            </div>
            <v-btn
              v-if="participantCount > 0"
              color="error"
              variant="outlined"
              size="small"
              @click="showClearDialog = true"
            >
              <v-icon start>mdi-delete-sweep</v-icon>
              {{ $t('participant.clearAll') }}
            </v-btn>
          </v-card-title>

          <v-card-text>
            <!-- Add Participant Form -->
            <v-form class="mb-4" @submit.prevent="handleAddParticipant">
              <v-row align="center">
                <v-col cols="12" sm="8">
                  <v-text-field
                    v-model="newParticipantName"
                    :placeholder="$t('participant.placeholder')"
                    :error-messages="nameErrorMessage"
                    variant="outlined"
                    density="comfortable"
                    clearable
                    @keyup.enter="handleAddParticipant"
                  >
                    <template #prepend-inner>
                      <v-icon>mdi-account-plus</v-icon>
                    </template>
                  </v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-btn
                    type="submit"
                    color="primary"
                    variant="flat"
                    size="large"
                    :disabled="!canAddParticipant"
                    block
                  >
                    <v-icon start>mdi-plus</v-icon>
                    {{ $t('participant.add') }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>

            <!-- Participants List -->
            <div v-if="participantCount === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1">mdi-account-off</v-icon>
              <p class="text-grey mt-4">
                {{ $t('participant.noParticipants') }}
              </p>
            </div>

            <v-list v-else density="comfortable" class="bg-transparent">
              <v-list-item
                v-for="participant in participants"
                :key="participant.id"
                class="participant-item mb-2"
                rounded="lg"
              >
                <v-list-item-title>
                  {{ participant.name }}
                </v-list-item-title>

                <template #append>
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    color="error"
                    size="small"
                    @click="handleRemoveParticipant(participant.id)"
                  />
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- Clear Confirmation Dialog -->
        <v-dialog v-model="showClearDialog" max-width="400">
          <v-card>
            <v-card-title>{{ $t('common.confirm') }}</v-card-title>
            <v-card-text>
              {{ $t('participant.clearConfirm') }}
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn @click="showClearDialog = false">
                {{ $t('common.cancel') }}
              </v-btn>
              <v-btn color="error" @click="handleClearAll">
                {{ $t('common.ok') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSushigetaState } from '@/composables/useSushigetaState'

const { t } = useI18n()
const {
  state,
  participantCount,
  addParticipant,
  removeParticipant,
  resetState,
} = useSushigetaState()

// Local state
const newParticipantName = ref('')
const showClearDialog = ref(false)

// Computed
const participants = computed(() => state.participants)

const nameErrorMessage = computed(() => {
  const name = newParticipantName.value.trim()
  if (!name) return []

  const normalized = name.toLowerCase().normalize('NFKC')
  const isDuplicate = state.participants.some(
    (p) => p.name.toLowerCase().normalize('NFKC') === normalized
  )

  return isDuplicate ? [t('participant.duplicate')] : []
})

const canAddParticipant = computed(() => {
  const name = newParticipantName.value.trim()
  return name && nameErrorMessage.value.length === 0
})

// Actions
const handleAddParticipant = () => {
  if (!canAddParticipant.value) return

  addParticipant(newParticipantName.value)
  newParticipantName.value = ''
}

const handleRemoveParticipant = (id: string) => {
  removeParticipant(id)
}

const handleClearAll = () => {
  resetState()
  showClearDialog.value = false
}
</script>

<style scoped>
.participant-item {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition: all 0.2s ease;
}

.participant-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
  border-color: rgba(var(--v-theme-primary), 0.2);
}
</style>
