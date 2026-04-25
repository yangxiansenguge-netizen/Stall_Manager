<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  Store, 
  Calendar, 
  TrendingUp, 
  MessageSquare, 
  User, 
  Shield, 
  FileText, 
  CircleDollarSign, 
  AlertCircle, 
  RefreshCcw, 
  Scale, 
  Headset, 
  PieChart, 
  Share2, 
  Database, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Smartphone,
  X
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  type: 'user' | 'privacy';
}>();

const emit = defineEmits(['close']);

const agreed = ref(false);

const userServiceAgreement = {
  title: '用户服务协议',
  subtitle: '感谢您信任并使用摊位管家平台',
  sections: [
    { 
      id: 1, 
      title: '服务内容', 
      icon: Store,
      items: [
        { icon: Store, text: '摊位信息管理', color: 'bg-amber-100 text-amber-600' },
        { icon: Calendar, text: '摊位预约与分配', color: 'bg-amber-100 text-amber-600' },
        { icon: TrendingUp, text: '人流数据分析', color: 'bg-amber-100 text-amber-600' },
        { icon: MessageSquare, text: '商业信息展示', color: 'bg-amber-100 text-amber-600' },
        { icon: User, text: '用户浏览与消费推荐', color: 'bg-amber-100 text-amber-600' },
      ]
    },
    { 
      id: 2, 
      title: '账号与安全', 
      icon: Shield,
      paragraphs: [
        '2.1 用户需使用手机号注册账号，并保证信息真实、准确、有效；',
        '2.2 用户应妥善保管账号信息，因账号泄露、遗失或被他人使用导致的损失由用户自行承担；',
        '2.3 用户不得将账号转让、出租、出借或用于任何非法用途。'
      ]
    },
    { id: 3, title: '用户行为规范', icon: FileText, text: '请遵守法律法规，诚信经营，不得发布虚假信息或干扰平台正常运行。' },
    { id: 4, title: '摊位管理规则', icon: Store, text: '摊位分配由系统或管理员统一安排，用户需遵守当地市场监管要求。' },
    { id: 5, title: '费用说明', icon: CircleDollarSign, text: '部分高级分析功能或推广服务可能收费，具体以支付页面实时展示为准。' },
    { id: 6, title: '免责条款', icon: AlertCircle, text: '因不可抗力或系统维护导致的服务中断，平台不承担相关违约责任。' },
    { id: 7, title: '协议修改', icon: RefreshCcw, text: '平台保留更新协议内容的权利，更新后将通过站内信或公告告知用户。' },
    { id: 8, title: '法律适用', icon: Scale, text: '本协议履行及争议解决均适用中华人民共和国相关法律法规。' },
    { id: 9, title: '联系我们', icon: Headset, text: '如有疑问请通过在线客服或客服电话与我们取得联系。' },
  ]
};

const privacyPolicy = {
  title: '隐私政策',
  subtitle: '我们将严格保护您的个人信息与隐私安全',
  sections: [
    { 
      id: 1, 
      title: '信息收集', 
      icon: FileText,
      collectItems: [
        { icon: User, title: '注册信息', sub: '手机号、昵称、头像等', color: 'bg-emerald-100 text-emerald-600' },
        { icon: TrendingUp, title: '使用信息', sub: '浏览记录、操作日志、点击行为等', color: 'bg-indigo-100 text-indigo-600' },
        { icon: Smartphone, title: '设备信息', sub: '设备型号、操作系统、IP地址等', color: 'bg-blue-100 text-blue-600' },
        { icon: MapPin, title: '位置信息 (需授权)', sub: '用于为您推荐附近的摊位和活动', color: 'bg-rose-100 text-rose-600' },
      ]
    },
    { id: 2, title: '信息使用', icon: PieChart, text: '用于为您提供基础服务、推荐商位信息并不断改进产品体验。' },
    { id: 3, title: '信息共享', icon: Share2, text: '我们承诺不会向任何第三方出售您的隐私数据，除非获得法律授权。' },
    { id: 4, title: '信息存储', icon: Database, text: '您的信息将存储在受严格保护的安全服务器中，采取冗余备份机制。' },
    { id: 5, title: '信息安全', icon: CheckCircle2, text: '采用多重加密和权限控制，确保信息在传输和存储过程中的安全。' },
    { id: 6, title: '您的权利', icon: User, text: '您可以随时查询、修改您的个人信息，或申请注销当前账号。' },
    { id: 7, title: '政策更新', icon: Clock, text: '随业务调整，我们将定期更新隐私政策并通过显着方式通知您。' },
    { id: 8, title: '联系我们', icon: Headset, text: '隐私专席客服为您解答隐私相关的所有疑问。' },
  ]
};

const data = computed(() => props.type === 'user' ? userServiceAgreement : privacyPolicy);

const onClose = () => emit('close');
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 overflow-hidden text-left">
      <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" @click="onClose"></div>
      
      <Transition
        enter-active-class="transition duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)"
        enter-from-class="opacity-0 scale-90 translate-y-8"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition duration-300 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-90 translate-y-8"
        appear
      >
        <div class="relative w-full max-w-[800px] h-[85vh] bg-stone-50 rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden">
          <header class="p-8 md:p-10 bg-white flex items-center justify-between shrink-0 border-b border-stone-100">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-[1.25rem] bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/20">
                <Store class="w-7 h-7 text-white fill-white" />
              </div>
              <div>
                <h3 class="text-2xl font-black text-stone-900 tracking-tight">{{ data.title }}</h3>
                <p class="text-xs font-bold text-stone-400 opacity-40 mt-1">{{ data.subtitle }}</p>
              </div>
            </div>
            <button 
              @click="onClose"
              class="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-900 transition-all active:scale-90"
            >
              <X class="w-6 h-6" />
            </button>
          </header>

          <div class="flex-1 overflow-y-auto bg-white scroll-smooth relative no-scrollbar">
            <main class="p-8 md:p-12 max-w-2xl mx-auto space-y-16 pb-20">
              <div v-for="section in data.sections" :key="section.id" class="scroll-mt-10">
                <div v-if="section.items" class="space-y-6">
                  <h4 class="text-xl font-black text-stone-900">{{ section.id }}. {{ section.title }}</h4>
                  <p class="text-sm text-stone-500 leading-relaxed font-medium">
                    摊位管家平台（以下简称“本平台”）为用户提供以下服务：
                  </p>
                  <div class="grid grid-cols-2 gap-3">
                    <div v-for="(item, i) in section.items" :key="i" class="flex flex-col items-center gap-2 p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                      <div :class="['w-10 h-10 rounded-xl', item.color, 'flex items-center justify-center shrink-0 shadow-sm shadow-amber-400/10']">
                        <component :is="item.icon" class="w-5 h-5" />
                      </div>
                      <span class="text-[11px] font-black text-stone-900 text-center leading-tight">{{ item.text }}</span>
                    </div>
                  </div>
                </div>
                
                <div v-else-if="section.paragraphs" class="space-y-6">
                  <h4 class="text-xl font-black text-stone-900">{{ section.id }}. {{ section.title }}</h4>
                  <div class="space-y-4">
                    <p v-for="(p, i) in section.paragraphs" :key="i" class="text-sm text-stone-500 leading-relaxed font-medium">{{ p }}</p>
                  </div>
                </div>

                <div v-else-if="section.collectItems" class="space-y-6">
                  <h4 class="text-xl font-black text-stone-900">{{ section.id }}. {{ section.title }}</h4>
                  <p class="text-sm text-stone-500 leading-relaxed font-medium">
                    我们在您使用摊位管家平台服务时，可能收集以下信息：
                  </p>
                  <div class="space-y-3">
                    <div v-for="(item, i) in section.collectItems" :key="i" class="flex items-center gap-4 p-4 bg-white border border-stone-100 rounded-3xl shadow-sm">
                      <div :class="['w-12 h-12 rounded-2xl', item.color, 'flex items-center justify-center shrink-0']">
                        <component :is="item.icon" class="w-6 h-6" />
                      </div>
                      <div>
                        <h5 class="font-bold text-stone-900 text-sm">{{ item.title }}</h5>
                        <p class="text-[11px] text-stone-400 font-medium opacity-60 leading-none mt-1">{{ item.sub }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="space-y-4 text-left">
                  <h4 class="text-xl font-black text-stone-900">{{ section.id }}. {{ section.title }}</h4>
                  <p class="text-sm text-stone-500 leading-relaxed">{{ section.text }}</p>
                </div>
              </div>
            </main>
          </div>

          <footer class="p-8 md:p-10 bg-white border-t border-stone-100 flex flex-col items-center gap-6 shrink-0 shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
            <div class="flex items-center gap-3 group cursor-pointer" @click="agreed = !agreed">
              <div :class="['w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all', agreed ? 'bg-amber-400 border-amber-400 shadow-lg shadow-amber-400/30' : 'border-stone-200 group-hover:border-amber-400']">
                <CheckCircle2 v-if="agreed" class="w-4 h-4 text-stone-900 stroke-[3]" />
              </div>
              <span class="text-sm font-bold text-stone-500 select-none">
                我已阅读并同意<span class="text-amber-600 px-1 hover:underline">《{{ data.title }}》</span>
              </span>
            </div>

            <div class="flex gap-4 w-full max-w-lg">
              <button 
                @click="onClose"
                class="flex-1 h-16 border-2 border-stone-100 text-stone-500 font-black text-lg rounded-2xl active:scale-[0.98] transition-all hover:bg-stone-50"
              >
                不同意并退出
              </button>
              <button 
                :disabled="!agreed"
                @click="agreed ? onClose() : null"
                :class="[
                  'flex-1 h-16 font-black text-lg rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center shadow-xl',
                  agreed 
                    ? 'bg-amber-400 text-stone-900 shadow-amber-400/20 hover:bg-amber-500' 
                    : 'bg-stone-100 text-stone-300 cursor-not-allowed shadow-none'
                ]"
              >
                同意并继续
              </button>
            </div>
          </footer>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
