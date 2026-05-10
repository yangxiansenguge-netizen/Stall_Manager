<script setup lang="ts">
import { useToast } from '../composables/useToast'

const { toasts, removeToast } = useToast()

const iconMap: Record<string, string> = {
  success: '✓',
  error: '!',
  warning: '⚠',
  info: 'i'
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :data-toast-id="toast.id"
        class="notification show pointer-events-auto"
        :class="toast.type"
      >
        <div class="icon">
          <span>{{ iconMap[toast.type] }}</span>
        </div>
        <div class="content">
          <div class="title">{{ toast.title }}</div>
          <div v-if="toast.description" class="desc">{{ toast.description }}</div>
        </div>
        <button class="close-btn" @click="removeToast(toast.id)">&times;</button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.notification {
  width: 340px;
  padding: 18px 24px;
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border: 1px solid transparent;
  opacity: 0;
  transform: translateX(100%);
  transition: all 0.3s ease;
}

.notification.show {
  opacity: 1;
  transform: translateX(0);
}

.notification .icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: bold;
  font-size: 14px;
  margin-top: 2px;
}

.notification .content {
  flex: 1;
}

.notification .title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.notification .desc {
  font-size: 14px;
  color: #475569;
  line-height: 1.5;
}

.notification .close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 20px;
  color: #94a3b8;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;
  flex-shrink: 0;
}

.notification .close-btn:hover {
  color: #64748b;
}

/* Success */
.notification.success {
  background-color: #f0fdf4;
  border-color: #bbf7d0;
}
.notification.success .icon {
  background-color: #dcfce7;
  color: #16a34a;
  border: 2px solid #16a34a;
}
.notification.success .title {
  color: #166534;
}

/* Error */
.notification.error {
  background-color: #fef2f2;
  border-color: #fecaca;
}
.notification.error .icon {
  background-color: #fee2e2;
  color: #dc2626;
  border: 2px solid #dc2626;
}
.notification.error .title {
  color: #991b1b;
}

/* Warning */
.notification.warning {
  background-color: #fffbeb;
  border-color: #fde68a;
}
.notification.warning .icon {
  background-color: #fef3c7;
  color: #d97706;
  border: 2px solid #d97706;
}
.notification.warning .title {
  color: #92400e;
}

/* Info */
.notification.info {
  background-color: #eff6ff;
  border-color: #bfdbfe;
}
.notification.info .icon {
  background-color: #dbeafe;
  color: #2563eb;
  border: 2px solid #2563eb;
}
.notification.info .title {
  color: #1e40af;
}
</style>
