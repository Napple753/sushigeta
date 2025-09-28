import { ref, computed, watch } from 'vue'
import type {
  Participant,
  AppState,
  NormalizeName,
  ExchangeValidationResult,
} from '@/types'

// Local storage key
const STORAGE_KEY = 'sushigeta:v1'

// Name normalization function
const normalizeName: NormalizeName = (name: string) => {
  return name.trim().normalize('NFKC').toLowerCase()
}

// Create initial state
const createInitialState = (): AppState => ({
  participants: [],
  groups: [],
  assignments: [],
  currentStep: 1,
  isExchangeReady: false,
  isCheckingExchange: false,
  errorMessage: null,
})

// Global state
const state = ref<AppState>(createInitialState())

// Load from localStorage
const loadFromStorage = (): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      state.value.participants = parsed.participants || []
      state.value.groups = parsed.groups || []
      // stepは保持する必要なし。再読込時は入力画面から再入力
    }
  } catch (error) {
    console.warn('Failed to load from localStorage:', error)
  }
}

// Save to localStorage
const saveToStorage = (): void => {
  try {
    const toSave = {
      participants: state.value.participants,
      groups: state.value.groups,
      // stepは保持する必要なし。再読込時は入力画面から再入力
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch (error) {
    console.warn('Failed to save to localStorage:', error)
  }
}

// Debounced save
let saveTimeout: number | null = null
const debouncedSave = (): void => {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = window.setTimeout(saveToStorage, 300)
}

export function useSushigetaState() {
  // Initialize state on first use
  if (
    state.value.participants.length === 0 &&
    state.value.groups.length === 0
  ) {
    loadFromStorage()
  }

  // Computed properties
  const participantCount = computed(() => state.value.participants.length)

  const duplicateNames = computed(() => {
    const names = state.value.participants.map((p) => normalizeName(p.name))
    const duplicates = names.filter(
      (name, index) => names.indexOf(name) !== index
    )
    return [...new Set(duplicates)]
  })

  const hasDuplicates = computed(() => duplicateNames.value.length > 0)

  const canProceedToGrouping = computed(
    () => participantCount.value >= 2 && !hasDuplicates.value
  )

  const groupedParticipants = computed(() => {
    const grouped = new Map<string, Participant[]>()
    state.value.participants.forEach((participant) => {
      const groupId = participant.groupId || participant.id
      if (!grouped.has(groupId)) {
        grouped.set(groupId, [])
      }
      grouped.get(groupId)!.push(participant)
    })
    return grouped
  })

  const maxGroupSize = computed(() => {
    let max = 0
    groupedParticipants.value.forEach((participants) => {
      max = Math.max(max, participants.length)
    })
    return max
  })

  // Actions
  const addParticipant = (name: string): string => {
    if (!name.trim()) return ''

    const id = `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const participant: Participant = {
      id,
      name: name.trim(),
      groupId: id, // Initially each participant is in their own group
    }

    state.value.participants.push(participant)
    debouncedSave()
    return id
  }

  const removeParticipant = (id: string): void => {
    state.value.participants = state.value.participants.filter(
      (p) => p.id !== id
    )
    debouncedSave()
  }

  const updateParticipantName = (id: string, name: string): void => {
    const participant = state.value.participants.find((p) => p.id === id)
    if (participant) {
      participant.name = name.trim()
      debouncedSave()
    }
  }

  const moveParticipantToGroup = (
    participantId: string,
    groupId: string
  ): void => {
    const participant = state.value.participants.find(
      (p) => p.id === participantId
    )
    if (participant) {
      participant.groupId = groupId
      debouncedSave()
    }
  }

  const setCurrentStep = (step: number): void => {
    state.value.currentStep = step
    debouncedSave()
  }

  const resetState = (): void => {
    state.value = createInitialState()
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }
  }

  // Exchange validation (placeholder)
  const validateExchange = async (): Promise<ExchangeValidationResult> => {
    if (participantCount.value < 2) {
      return { isValid: false, message: 'At least 2 participants required' }
    }

    if (groupedParticipants.value.size === 1) {
      return {
        isValid: false,
        message: 'All participants are in the same group',
      }
    }

    // Quick check: if largest group > n/2, likely impossible
    if (maxGroupSize.value > Math.floor(participantCount.value / 2)) {
      return {
        isValid: false,
        message: 'Largest group is too big for valid exchange',
      }
    }

    // TODO: Implement actual 1000-try validation
    return { isValid: true }
  }

  // Watch for changes to trigger auto-save
  watch(
    () => [
      state.value.participants,
      state.value.groups,
      state.value.currentStep,
    ],
    debouncedSave,
    { deep: true }
  )

  return {
    // State
    state: state.value,

    // Computed
    participantCount,
    duplicateNames,
    hasDuplicates,
    canProceedToGrouping,
    groupedParticipants,
    maxGroupSize,

    // Actions
    addParticipant,
    removeParticipant,
    updateParticipantName,
    moveParticipantToGroup,
    setCurrentStep,
    resetState,
    validateExchange,

    // Utilities
    normalizeName,
  }
}
