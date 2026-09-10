<script setup lang="ts">
defineProps<{
  dataInicial: string;
  dataFinal: string;
}>();

const emit = defineEmits<{
  'update:dataInicial': [value: string];
  'update:dataFinal': [value: string];
}>();
</script>

<template>
  <div class="date-fields">
    <label class="field">
      <span class="field__label">Data inicial</span>
      <input
        class="field__input"
        type="date"
        :value="dataInicial"
        @input="emit('update:dataInicial', ($event.target as HTMLInputElement).value)"
      />
    </label>
    <label class="field">
      <span class="field__label">Data final</span>
      <input
        class="field__input"
        type="date"
        :value="dataFinal"
        @input="emit('update:dataFinal', ($event.target as HTMLInputElement).value)"
      />
    </label>
  </div>
</template>

<style scoped>
.date-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.field__label {
  font-size: 12px;
  font-weight: 600;
  color: #9fadbc;
  letter-spacing: 0.01em;
}

.field__input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #38414a;
  border-radius: 6px;
  background: #22272b;
  color: #c7d1db;
  font: inherit;
  font-size: 13px;
  padding: 8px 10px;
  outline: none;
  color-scheme: dark;
}

.field__input:focus {
  border-color: #579dff;
  box-shadow: 0 0 0 1px #579dff;
}

.field__input::-webkit-calendar-picker-indicator {
  filter: invert(0.8);
  cursor: pointer;
}
</style>
