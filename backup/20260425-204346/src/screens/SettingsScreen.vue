<script setup lang="ts">
import { ref } from 'vue';
import {
  TrendingUp,
  Star,
  Heart,
  User,
  Wallet,
  Store,
  LogOut,
  ChevronRight,
  Sun,
  MapPin
} from 'lucide-vue-next';

defineProps<{
  onLogout: () => void;
}>();

const backgroundUploadRef = ref<HTMLInputElement | null>(null);

const openBackgroundPicker = () => {
  backgroundUploadRef.value?.click();
};
</script>

<template>
  <div class="space-y-8 md:space-y-10 pb-10 text-left">
    <section
      class="group relative overflow-hidden rounded-[2.4rem] border border-stone-100 bg-white shadow-[0_22px_55px_rgba(0,0,0,0.06)] cursor-pointer"
      role="button"
      tabindex="0"
      @click="openBackgroundPicker"
      @keydown.enter.prevent="openBackgroundPicker"
      @keydown.space.prevent="openBackgroundPicker"
    >
      <input
        ref="backgroundUploadRef"
        type="file"
        accept="image/*,video/*"
        class="hidden"
      />
      <img
        src="https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?q=80&w=1600&auto=format&fit=crop"
        alt="Store cover"
        class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        referrerPolicy="no-referrer"
      />
      <div class="absolute inset-0 bg-gradient-to-br from-stone-950/72 via-stone-950/36 to-amber-900/24"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_26%)]"></div>

      <div class="relative z-10 p-5 sm:p-6 md:p-8">
        <div class="flex justify-end">
          <span class="rounded-full border border-white/15 bg-black/20 px-3.5 py-2 text-[11px] font-bold text-white/90 backdrop-blur-md transition-all group-hover:bg-black/30">
            点击上传背景图或视频
          </span>
        </div>

        <div class="mt-16 flex flex-col gap-4 sm:mt-20 sm:flex-row sm:items-end">
          <div class="relative flex-shrink-0">
            <div class="h-20 w-20 rounded-full border border-amber-100/20 bg-gradient-to-tr from-amber-200 to-amber-500 p-1 shadow-lg md:h-24 md:w-24">
              <div class="h-full w-full overflow-hidden rounded-full border-2 border-white shadow-inner md:border-4">
                <img
                  alt="Avatar"
                  class="h-full w-full object-cover"
                  src="https://picsum.photos/seed/merchant/200/200"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div class="absolute bottom-0 right-0 rounded-full border-2 border-white bg-amber-400 px-2.5 py-0.5 text-[9px] font-bold tracking-wider text-stone-900 shadow-sm md:text-[10px]">
              VIP
            </div>
          </div>

          <div class="min-w-0 flex-1 text-left text-white">
            <h1 class="text-2xl font-extrabold tracking-tight text-white md:text-3xl">林晓雅</h1>
            <div class="mt-2 flex flex-wrap items-center gap-2.5">
              <span class="rounded-lg bg-amber-300/20 px-2.5 py-1 text-[9px] font-bold uppercase tracking-tight text-amber-100 backdrop-blur-md">金牌摊主 Master</span>
            </div>
            <p class="mt-2 max-w-xl text-sm font-medium leading-relaxed text-white/82">
              用一张氛围封面或一段短视频，把招牌产品、摊位风格和你的烟火故事都展示给顾客看。
            </p>
            <span class="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-white/65">
              <MapPin class="h-3 w-3" /> 静安夜市 042
            </span>
          </div>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-2 gap-3.5 md:gap-4">
      <div class="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-stone-100">
        <p class="text-stone-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">累计营收</p>
        <h3 class="text-xl md:text-2xl font-bold text-stone-900 tracking-tight">¥128,430</h3>
        <div class="mt-2 flex items-center gap-1 text-emerald-600 font-bold">
          <TrendingUp class="w-3 h-3" />
          <span class="text-[10px]">+12.5%</span>
        </div>
      </div>
      <div class="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-stone-100">
        <p class="text-stone-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">出摊天数</p>
        <h3 class="text-xl md:text-2xl font-bold text-stone-900 tracking-tight">456 天</h3>
        <div class="mt-2 flex items-center gap-1 text-amber-500 font-bold">
          <Star class="w-3 h-3 fill-amber-500" />
          <span class="text-[10px]">全勤记录</span>
        </div>
      </div>
    </section>

    <section>
      <div class="flex justify-between items-end mb-4 px-1">
        <h2 class="text-base md:text-lg font-bold text-stone-900 tracking-tight">成就勋章 Achievements</h2>
        <button class="text-amber-600 text-[11px] md:text-xs font-bold">查看全部</button>
      </div>
      <div class="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-1">
        <div v-for="(item, i) in [
          { label: '早起鸟 Early Bird', icon: Sun, color: 'bg-orange-50', text: 'text-orange-500' },
          { label: '营收达人 Master', icon: Star, color: 'bg-amber-50', text: 'text-amber-500' },
          { label: '人气摊位 Popular', icon: Heart, color: 'bg-rose-50', text: 'text-rose-500' },
        ]" :key="i" class="flex-shrink-0 w-24 md:w-28 h-32 md:h-36 bg-white rounded-2xl flex flex-col items-center justify-center p-3 md:p-4 text-center border border-stone-50 shadow-sm">
          <div :class="['w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-2 md:mb-3 shadow-inner', item.color]">
            <component :is="item.icon" :class="['w-6 h-6 md:w-8 md:h-8 fill-current', item.text]" />
          </div>
          <p class="text-[10px] md:text-[11px] font-bold leading-tight opacity-80 text-stone-900">{{ item.label }}</p>
        </div>
      </div>
    </section>

    <section class="bg-white rounded-2xl p-2 shadow-sm border border-stone-100">
      <div 
        v-for="(item, i) in [
          { title: '账号信息', sub: '个人资料与安全管理', icon: User },
          { title: '支付设置', sub: '收款账户与费率查看', icon: Wallet },
          { title: '摊位管理', sub: '位置续期与设施申请', icon: Store },
          { title: '退出登录', icon: LogOut, danger: true, action: onLogout },
        ]" 
        :key="i" 
        @click="item.action ? item.action() : null"
        class="flex items-center gap-4 p-4 hover:bg-stone-50 transition-colors rounded-xl cursor-pointer group"
      >
        <div :class="['w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-stone-50', 
          item.danger ? 'group-hover:bg-rose-50 group-hover:text-rose-500' : 'group-hover:bg-amber-50 group-hover:text-amber-600']">
          <component :is="item.icon" class="w-5 h-5" />
        </div>
        <div class="flex-1">
          <p :class="['text-sm font-bold tracking-tight', item.danger ? 'text-rose-500' : 'text-stone-900']">{{ item.title }}</p>
          <p v-if="item.sub" class="text-[10px] text-stone-400 font-medium opacity-60 leading-none mt-0.5">{{ item.sub }}</p>
        </div>
        <ChevronRight class="w-4 h-4 text-stone-300 opacity-20" />
      </div>
    </section>

    <div class="mt-8 md:mt-12 text-center opacity-10 select-none pb-8 md:pb-12 h-20 flex flex-col items-center justify-center">
      <h4 class="font-headline font-black text-3xl md:text-4xl tracking-tighter text-stone-900 leading-none">摊位管家</h4>
      <p class="font-body text-[8px] md:text-[10px] tracking-[0.4em] uppercase mt-1">STALL MANAGER</p>
    </div>
  </div>
</template>
