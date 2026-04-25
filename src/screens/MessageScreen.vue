<script setup lang="ts">
import { 
  Bell, 
  CheckCircle2, 
  PartyPopper,
  ChevronRight,
  ShieldCheck
} from 'lucide-vue-next';

const messageCategories = [
  { 
    title: '系统通知', 
    icon: ShieldCheck, 
    color: 'text-blue-500', 
    bg: 'bg-blue-50',
    messages: [
      { title: '平台服务协议更新', time: '10:30', read: false },
      { title: '国庆期间系统维护公告', time: '昨天', read: true },
    ]
  },
  { 
    title: '审核结果', 
    icon: CheckCircle2, 
    color: 'text-emerald-500', 
    bg: 'bg-emerald-50',
    messages: [
      { title: '文化广场摊位申请已通过', time: '09:15', read: false },
      { title: '商品“手绘飞盘”审核完成', time: '前天', read: true },
    ]
  },
  { 
    title: '活动提醒', 
    icon: PartyPopper, 
    color: 'text-rose-500', 
    bg: 'bg-rose-50',
    messages: [
      { title: '“夏日狂欢”主题周开始报名', time: '12:00', read: true },
      { title: '摆摊达人经验分享会邀请', time: '3天前', read: true },
    ]
  },
];
</script>

<template>
  <div class="space-y-6 md:space-y-8 pb-10 text-left">
    <!-- 头部 -->
    <div class="flex justify-between items-end px-1">
      <div>
        <h1 class="text-3xl font-black text-stone-900 tracking-tighter">消息中心</h1>
        <p class="text-sm font-medium text-stone-400 mt-1">Notifications & Audit Results</p>
      </div>
      <button class="relative p-3 rounded-full hover:bg-stone-100 transition-colors">
        <Bell class="w-6 h-6 text-stone-900" />
        <span class="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
      </button>
    </div>

    <!-- 消息分类展示 -->
    <div class="space-y-8">
      <section v-for="(category, i) in messageCategories" :key="i" class="space-y-4">
        <div class="flex items-center gap-3 px-1">
          <div :class="['p-2 rounded-xl', category.bg, category.color]">
            <component :is="category.icon" class="w-5 h-5" />
          </div>
          <h3 class="font-black text-stone-900 tracking-tight leading-none uppercase text-sm">{{ category.title }}</h3>
          <div class="flex-1 border-b border-stone-100 mb-1"></div>
        </div>

        <div class="bg-white rounded-[2rem] overflow-hidden border border-stone-100 shadow-sm">
          <div 
            v-for="(msg, idx) in category.messages" 
            :key="idx" 
            class="p-5 flex items-center justify-between hover:bg-stone-50 transition-colors border-b last:border-none border-stone-50 cursor-pointer group"
          >
            <div class="flex items-center gap-3">
              <div v-if="!msg.read" class="w-2 h-2 bg-rose-500 rounded-full shrink-0"></div>
              <span :class="['font-bold text-sm', msg.read ? 'text-stone-400' : 'text-stone-900']">
                {{ msg.title }}
              </span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-[10px] font-medium text-stone-300">{{ msg.time }}</span>
              <ChevronRight class="w-4 h-4 text-stone-200 group-hover:text-stone-400 transition-colors" />
            </div>
          </div>
        </div>
      </section>
    </div>

    <button class="w-full py-4 bg-stone-100 text-stone-400 font-black text-[10px] rounded-2xl tracking-[0.2em] uppercase active:scale-95 transition-all hover:bg-stone-200 hover:text-stone-600">
      清空全部已读消息
    </button>
  </div>
</template>
