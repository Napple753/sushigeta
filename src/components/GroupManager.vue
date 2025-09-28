<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <!-- Integrated Participant & Group Management -->
        <v-card elevation="2">
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon class="me-2">mdi-account-group</v-icon>
              <v-chip
                v-if="participantCount > 0"
                color="primary"
                size="small"
                class="ms-0"
              >
                {{ $t('participant.count', { count: participantCount }) }}
              </v-chip>
              <v-chip
                v-if="groupCount > 0"
                color="secondary"
                size="small"
                class="ms-1"
              >
                {{ $t('group.count', { count: groupCount }) }}
              </v-chip>
            </div>
            <v-btn
              v-if="participantCount > 0"
              color="error"
              variant="outlined"
              size="small"
              @click="showResetDialog = true"
            >
              <v-icon start>mdi-refresh</v-icon>
              {{ $t('common.reset') }}
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

            <div v-if="participantCount === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1">mdi-account-off</v-icon>
              <p class="text-grey mt-4">{{ $t('participant.addPrompt') }}</p>
            </div>

            <div v-else>
              <!-- Instructions -->
              <v-alert
                type="info"
                variant="tonal"
                class="mb-4"
                :text="$t('group.instructions')"
              />

              <!-- Groups Grid -->
              <v-row>
                <v-col
                  v-for="group in visibleGroups"
                  :key="group.id"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <v-card
                    variant="outlined"
                    class="group-card"
                    :class="{ 'drop-zone-active': isDragOver === group.id }"
                    @drop="handleDrop($event, group.id)"
                    @dragover.prevent="handleDragOver(group.id)"
                    @dragleave="handleDragLeave"
                  >
                    <v-card-text class="pa-2">
                      <div class="min-height-100">
                        <v-list density="compact" class="bg-transparent">
                          <v-list-item
                            v-for="participant in getGroupParticipants(
                              group.id
                            )"
                            :key="participant.id"
                            :draggable="true"
                            class="participant-chip mb-1"
                            rounded="lg"
                            @dragstart="handleDragStart($event, participant.id)"
                            @dragend="handleDragEnd"
                          >
                            <template #prepend>
                              <v-icon size="small">mdi-drag</v-icon>
                            </template>
                            <v-list-item-title class="text-body-2">
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

                        <!-- Empty state for group -->
                        <div
                          v-if="getGroupParticipants(group.id).length === 0"
                          class="text-center py-4 text-grey-lighten-1"
                        >
                          <v-icon>mdi-account-plus-outline</v-icon>
                          <p class="text-caption mt-1">
                            {{ $t('group.empty') }}
                          </p>
                        </div>
                      </div>
                    </v-card-text>
                    <v-card-actions class="justify-center pa-2">
                      <v-chip size="small" color="primary">
                        {{
                          $t('participant.count', {
                            count: getGroupParticipants(group.id).length,
                          })
                        }}
                      </v-chip>
                    </v-card-actions>
                  </v-card>
                </v-col>

                <!-- New Group Drop Zone -->
                <v-col cols="12" sm="6" md="4">
                  <v-card
                    variant="outlined"
                    class="group-card"
                    :class="{ 'drop-zone-active': isDragOver === '__new' }"
                    @drop="handleDrop($event, '__new')"
                    @dragover.prevent="handleDragOver('__new')"
                    @dragleave="handleDragLeave"
                  >
                    <v-card-text class="pa-4 text-center">
                      <v-icon class="mb-2">mdi-plus-box</v-icon>
                      <div class="text-subtitle-2">
                        {{ $t('group.newGroupTitle') }}
                      </div>
                      <div class="text-caption text-medium-emphasis mt-1">
                        {{ $t('group.newGroupDescription') }}
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Exchange Validation -->
              <v-alert
                v-if="validationMessage"
                :type="isExchangeReady ? 'success' : 'warning'"
                variant="tonal"
                class="mt-4"
                :text="$t(validationMessage)"
              />
            </div>
          </v-card-text>
        </v-card>

        <!-- Reset Confirmation Dialog -->
        <v-dialog v-model="showResetDialog" max-width="400">
          <v-card>
            <v-card-title>{{ $t('common.confirm') }}</v-card-title>
            <v-card-text>
              {{ $t('group.resetAllConfirm') }}
              <br />
              <small class="text-grey">{{ $t('group.resetNote') }}</small>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn @click="showResetDialog = false">
                {{ $t('common.cancel') }}
              </v-btn>
              <v-btn color="error" @click="handleReset">
                {{ $t('common.reset') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSushigetaState } from '@/composables/useSushigetaState'

const {
  state,
  participantCount,
  addParticipant,
  removeParticipant,
  initializeGroups,
  moveParticipantToGroup,
  validateExchange,
  getGroupParticipants,
  resetState,
  createNewGroup,
} = useSushigetaState()

// Local state
const isDragOver = ref<string | null>(null)
const newParticipantName = ref('')
const showResetDialog = ref(false)

// Computed
const groupCount = computed(() => state.value.groups.length)

const visibleGroups = computed(() => {
  // Show groups that have participants
  return state.value.groups.filter((group) => {
    const participants = getGroupParticipants(group.id)
    return participants.length > 0
  })
})

const validationResult = computed(() => validateExchange())

const isExchangeReady = computed(() => validationResult.value.isValid)

const validationMessage = computed(() => {
  return validationResult.value.message || ''
})

// Participant management
const { t } = useI18n()

const nameErrorMessage = computed(() => {
  const name = newParticipantName.value.trim()
  if (!name) return []

  const normalized = name.toLowerCase().normalize('NFKC')
  const isDuplicate = state.value.participants.some(
    (p) => p.name.toLowerCase().normalize('NFKC') === normalized
  )

  return isDuplicate ? [t('participant.duplicate')] : []
})

const canAddParticipant = computed(() => {
  const name = newParticipantName.value.trim()
  return name && nameErrorMessage.value.length === 0
})

// Initialize groups when participants change
watch(
  participantCount,
  () => {
    if (participantCount.value > 0) {
      initializeGroups()
    }
  },
  { immediate: true }
)

// Drag and drop handlers
const handleDragStart = (event: DragEvent, participantId: string) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', participantId)
    event.dataTransfer.effectAllowed = 'move'
  }
}

const handleDragEnd = () => {
  isDragOver.value = null
}

const handleDragOver = (groupId: string) => {
  isDragOver.value = groupId
}

const handleDragLeave = () => {
  isDragOver.value = null
}

const handleDrop = (event: DragEvent, targetGroupId: string) => {
  event.preventDefault()
  isDragOver.value = null

  const participantId = event.dataTransfer?.getData('text/plain')
  if (participantId) {
    if (targetGroupId === '__new') {
      const newGroupId = createNewGroup()
      moveParticipantToGroup(participantId, newGroupId)
    } else {
      moveParticipantToGroup(participantId, targetGroupId)
    }
  }
}

// Participant actions
const handleAddParticipant = () => {
  if (!canAddParticipant.value) return

  addParticipant(newParticipantName.value)
  newParticipantName.value = ''
}

const handleRemoveParticipant = (id: string) => {
  removeParticipant(id)
}

const handleReset = () => {
  resetState()
  showResetDialog.value = false
}
</script>

<style scoped>
.group-card {
  transition: all 0.2s ease;
  min-height: 200px;
}

.group-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.drop-zone-active {
  border-color: rgba(var(--v-theme-primary), 0.6) !important;
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.participant-chip {
  cursor: grab;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition: all 0.2s ease;
}

.participant-chip:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.participant-chip:active {
  cursor: grabbing;
}

.min-height-100 {
  min-height: 100px;
}
</style>
