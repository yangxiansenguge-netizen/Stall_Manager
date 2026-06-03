<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  Smartphone,
  ShieldCheck,
  MessageSquare,
  Wallet,
  Store,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-vue-next';
import AgreementModal from '../components/AgreementModal.vue';
import { showToast } from '../composables/useToast';
import { useAuthStore } from '../stores/auth';
import backgroundVideo from '../../烟火气.mp4';

const router = useRouter();
const authStore = useAuthStore();


type LoginMode = 'code' | 'password';

const isLogin = ref(true);
const loginMode = ref<LoginMode>('code');
const activeAgreement = ref<'user' | 'privacy' | null>(null);

const loginPhone = ref('');
const loginCredential = ref('');
const loginAgreement = ref(false);

const registerPhone = ref('');
const registerSmsCode = ref('');
const registerPassword = ref('');
const registerConfirmPassword = ref('');
const registerAgreement = ref(false);

const showLoginPassword = ref(false);
const showRegisterPassword = ref(false);
const showRegisterConfirmPassword = ref(false);

const showAlertModal = ref(false);
const alertBlockMsg = ref('');

const loading = ref(false);

const isValidPhone = (phone: string) => /^\d{11}$/.test(phone.trim());

const fillLoginSmsCode = () => {
  if (loading.value) return;
  loginCredential.value = '123456';
  showToast('info', '验证码', '验证码已发送，请查收');
};

const fillRegisterSmsCode = () => {
  if (loading.value) return;
  registerSmsCode.value = '123456';
  showToast('info', '验证码', '验证码已发送，请查收');
};

const onLogin = async () => {
  if (loading.value) {
    return;
  }
  const phone = loginPhone.value.trim();
  const credential = loginCredential.value.trim();

  if (!isValidPhone(phone)) {
    showToast('error', '登录失败', '请输入11位手机号');
    return;
  }
  if (!credential) {
    showToast('error', '登录失败', loginMode.value === 'code' ? '请输入验证码' : '请输入登录密码');
    return;
  }

  if (!loginAgreement.value) {
    showToast('warning', '提示', '请先阅读并同意协议');
    return;
  }

  loading.value = true;
  try {
    await authStore.login(phone, credential, loginMode.value);
    showToast('success', '登录成功', '欢迎回来！');
    router.push(authStore.session?.userType === 'admin' ? '/admin' : '/dashboard');
  } catch (error) {
    const msg = error instanceof Error ? error.message : '请核对账号信息后重试';
    if (msg.includes('停用')) {
      alertBlockMsg.value = msg;
      showAlertModal.value = true;
    } else {
      showToast('error', '登录失败', msg);
    }
  } finally {
    loginCredential.value = '';
    showLoginPassword.value = false;
    loading.value = false;
  }
};

const onRegister = async () => {
  if (loading.value) {
    return;
  }

  const phone = registerPhone.value.trim();
  const smsCode = registerSmsCode.value.trim();
  const password = registerPassword.value.trim();
  const confirmPassword = registerConfirmPassword.value.trim();

  if (!isValidPhone(phone)) {
    showToast('error', '注册失败', '请输入11位手机号');
    return;
  }

  if (!password || password.length < 6 || password.length > 16) {
    showToast('error', '注册失败', '密码长度需为6-16位');
    return;
  }
  if (password !== confirmPassword) {
    showToast('error', '注册失败', '两次输入的密码不一致');
    return;
  }
  if (!registerAgreement.value) {
    showToast('warning', '提示', '请先阅读并同意协议');
    return;
  }

  loading.value = true;
  try {
    await authStore.register(phone, smsCode, password, confirmPassword);
    showToast('success', '注册成功', '已自动登录，欢迎加入！');
    router.push('/dashboard');
  } catch (error) {
    showToast('error', '注册失败', error instanceof Error ? error.message : '请检查信息后重试');
  } finally {
    registerPassword.value = '';
    registerConfirmPassword.value = '';
    showRegisterPassword.value = false;
    showRegisterConfirmPassword.value = false;
    loading.value = false;
  }
};



const switchToRegister = () => {
  isLogin.value = false;
  showLoginPassword.value = false;
};

const switchToLogin = () => {
  isLogin.value = true;
  showRegisterPassword.value = false;
  showRegisterConfirmPassword.value = false;
};
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-black font-sans selection:bg-amber-200/30">
    <video
      class="absolute inset-0 h-full w-full object-cover"
      :src="backgroundVideo"
      autoplay
      muted
      loop
      playsinline
    ></video>
    <div class="absolute inset-0 bg-black/60"></div>
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,193,7,0.2),transparent_30%),linear-gradient(to_bottom,rgba(0,0,0,0.35),rgba(0,0,0,0.72))]"></div>

    <div class="relative z-10 grid min-h-[100svh] place-items-center px-6 py-6 sm:min-h-screen sm:px-6 sm:py-8">
      <div class="flex w-full max-w-[1100px] flex-col items-center justify-center gap-5 sm:gap-6">
        <div class="flex flex-col items-center text-center text-white">
          <div class="flex h-11 w-11 items-center justify-center rounded-[0.95rem] bg-[#f4bf17] shadow-[0_8px_20px_rgba(244,191,23,0.24)] sm:h-14 sm:w-14 sm:rounded-[1.2rem] sm:shadow-[0_14px_30px_rgba(244,191,23,0.35)]">
            <Store class="h-5.5 w-5.5 text-white fill-white sm:h-7 sm:w-7" />
          </div>
          <p class="mt-2 text-[8px] font-bold uppercase tracking-[0.24em] text-amber-200/72 sm:mt-3 sm:text-[10px] sm:tracking-[0.28em]">
            Stall Manager
          </p>
          <h1 class="mt-2 max-w-[15rem] text-[1.7rem] font-black leading-[1.03] tracking-tight text-white sm:mt-3 sm:max-w-none sm:text-5xl">
            让摆摊经营更简单
          </h1>
          <p class="mt-1.5 max-w-[16rem] text-[10px] font-medium tracking-[0.08em] text-white/66 sm:max-w-none sm:text-sm sm:tracking-[0.2em]">
            智慧管理摊位 · 精准掌握客流 · 助力生意增长
          </p>
        </div>

        <div class="w-full max-w-[320px] rounded-[1.9rem] border border-white/65 bg-white/90 p-4 shadow-[0_22px_56px_rgba(0,0,0,0.26)] backdrop-blur-xl sm:max-w-[430px] sm:rounded-[2rem] sm:bg-white/90 sm:p-7 sm:shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
          <header class="text-center">
            <h2 class="text-[1.45rem] font-black tracking-tight text-stone-900 sm:text-[1.75rem]">
              {{ isLogin ? '欢迎回来' : '创建账号' }}
              <span class="ml-1 inline-flex align-middle text-sm text-amber-500 sm:text-lg"><Sparkles class="h-4 w-4 sm:h-5 sm:w-5" /></span>
            </h2>
            <p class="mt-1.5 text-[10px] font-medium leading-relaxed text-stone-400 sm:mt-2 sm:text-xs">
              {{ isLogin ? '登录你的经营后台，继续今天的烟火生意。' : '注册后即可开启你的数字化摊位经营。' }}
            </p>
          </header>



          <main v-if="isLogin" class="mt-4 space-y-3.5 sm:mt-5 sm:space-y-4">
            <div class="rounded-[1.1rem] bg-[#f1eee7]/95 p-1 sm:rounded-2xl">
              <div class="relative grid grid-cols-2">
                <div
                  class="absolute inset-y-0 left-0 w-1/2 rounded-[0.95rem] border border-[#e5d2aa] bg-[#efe3c7] shadow-[0_2px_8px_rgba(177,145,77,0.22)] transition-transform duration-300"
                  :style="{ transform: loginMode === 'code' ? 'translateX(0)' : 'translateX(100%)' }"
                ></div>
                <button
                  type="button"
                  @click="loginMode = 'code'"
                  :class="[
                    'relative z-10 h-10 rounded-[0.95rem] text-[11px] font-bold transition-colors sm:h-10 sm:text-xs',
                    loginMode === 'code' ? 'text-stone-900' : 'text-stone-400'
                  ]"
                >
                  验证码登录
                </button>
                <button
                  type="button"
                  @click="loginMode = 'password'"
                  :class="[
                    'relative z-10 h-10 rounded-[0.95rem] text-[11px] font-bold transition-colors sm:h-10 sm:text-xs',
                    loginMode === 'password' ? 'text-stone-900' : 'text-stone-400'
                  ]"
                >
                  密码登录
                </button>
              </div>
            </div>

            <div class="space-y-1.5 text-left sm:space-y-2">
              <label class="pl-1 text-[10px] font-bold tracking-wide text-stone-400 sm:text-[11px]">手机号</label>
              <div class="relative overflow-hidden rounded-[1rem] border border-white/90 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_2px_8px_rgba(15,23,42,0.04)] transition-all focus-within:border-amber-200 focus-within:shadow-[0_0_0_4px_rgba(251,191,36,0.12)] sm:rounded-[1.1rem]">
                <Smartphone class="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-300 sm:left-4 sm:h-4 sm:w-4" />
                <input
                  v-model="loginPhone"
                  type="tel"
                  placeholder="请输入手机号"
                  class="h-10 w-full bg-transparent pl-10 pr-3.5 text-[13px] font-medium text-stone-900 outline-none placeholder:text-stone-300 sm:h-12 sm:pl-11 sm:pr-4 sm:text-sm"
                />
              </div>
            </div>

            <div class="space-y-1.5 text-left sm:space-y-2">
              <label class="pl-1 text-[10px] font-bold tracking-wide text-stone-400 sm:text-[11px]">
                {{ loginMode === 'code' ? '验证码' : '登录密码' }}
              </label>
              <div class="relative overflow-hidden rounded-[1rem] border border-white/90 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_2px_8px_rgba(15,23,42,0.04)] transition-all focus-within:border-amber-200 focus-within:shadow-[0_0_0_4px_rgba(251,191,36,0.12)] sm:rounded-[1.1rem]">
                <ShieldCheck class="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-300 sm:left-4 sm:h-4 sm:w-4" />
                <input
                  v-model="loginCredential"
                  :type="loginMode === 'code' ? 'text' : (showLoginPassword ? 'text' : 'password')"
                  :placeholder="loginMode === 'code' ? '请输入验证码' : '请输入登录密码'"
                  class="h-10 w-full bg-transparent pl-10 pr-20 text-[13px] font-medium text-stone-900 outline-none placeholder:text-stone-300 sm:h-12 sm:pl-11 sm:pr-28 sm:text-sm"
                />
                <button
                  v-if="loginMode === 'code'"
                  type="button"
                  @click="fillLoginSmsCode"
                  class="absolute right-2.5 top-1/2 z-10 -translate-y-1/2 rounded-full border border-amber-100 bg-gradient-to-b from-amber-50 to-amber-100 px-2.5 py-1 text-[9px] font-bold text-amber-700 transition-all hover:scale-[1.02] hover:from-amber-100 hover:to-amber-200 sm:right-3 sm:px-3 sm:text-[11px]"
                >
                  获取验证码
                </button>
                <button
                  v-else
                  type="button"
                  @click="showLoginPassword = !showLoginPassword"
                  class="absolute right-2.5 top-1/2 z-10 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-amber-100 bg-amber-50 text-amber-500 transition-all hover:bg-amber-100 hover:text-amber-600 sm:right-3 sm:h-8 sm:w-8"
                  :aria-label="showLoginPassword ? '隐藏登录密码' : '显示登录密码'"
                >
                  <EyeOff v-if="showLoginPassword" class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <Eye v-else class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>

            <div class="flex items-start gap-2 text-left sm:gap-2.5">
              <input
                id="agreement-login"
                v-model="loginAgreement"
                type="checkbox"
                class="mt-0.5 h-3.5 w-3.5 rounded border-stone-300 accent-amber-500 sm:h-4 sm:w-4"
              />
              <label for="agreement-login" class="text-[9px] font-medium leading-relaxed text-stone-400 sm:text-[11px]">
                我已阅读并同意
                <span @click.prevent="activeAgreement = 'user'" class="cursor-pointer text-amber-600 hover:underline">《用户协议》</span>
                和  
                <span @click.prevent="activeAgreement = 'privacy'" class="cursor-pointer text-amber-600 hover:underline">《隐私政策》</span>
              </label>
            </div>

            <button
              @click="onLogin"
              :disabled="loading"
              class="h-10 w-full rounded-[0.95rem] bg-[#f4bf17] text-[13px] font-black text-stone-900 shadow-[0_8px_18px_rgba(244,191,23,0.24)] transition-all hover:-translate-y-0.5 hover:bg-[#f7c739] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 sm:h-12 sm:rounded-2xl sm:text-sm sm:shadow-[0_12px_25px_rgba(244,191,23,0.35)]"
            >
              {{ loading ? '登录中...' : '登录' }}
            </button>

            <div class="pt-1 sm:pt-2">
              <div class="flex items-center gap-3">
                <div class="h-px flex-1 bg-stone-200"></div>
                <span class="text-[9px] font-bold uppercase tracking-[0.18em] text-stone-300 sm:text-[10px] sm:tracking-[0.22em]">其他登录方式</span>
                <div class="h-px flex-1 bg-stone-200"></div>
              </div>

              <div class="mt-3.5 flex justify-center gap-3.5 sm:mt-4 sm:gap-4">
                <button
                  v-for="(social, i) in [
                    { icon: Smartphone, color: 'text-stone-700 bg-stone-100', label: '手机' },
                    { icon: MessageSquare, color: 'text-[#07C160] bg-[#07C160]/10', label: '微信' },
                    { icon: Wallet, color: 'text-[#1677FF] bg-[#1677FF]/10', label: '支付宝' }
                  ]"
                  :key="i"
                  type="button"
                  :class="['flex h-10 w-10 items-center justify-center rounded-full border border-stone-100 transition-transform hover:-translate-y-0.5 sm:h-11 sm:w-11', social.color]"
                  :title="social.label"
                >
                  <component :is="social.icon" class="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>

            <div class="pt-0.5 text-center sm:pt-1">
              <button type="button" @click="switchToRegister" class="text-[11px] font-bold text-stone-400 sm:text-xs">
                还没有账号？
                <span class="ml-1 text-amber-600">立即注册</span>
              </button>
            </div>
          </main>

          <main v-else class="mt-1 space-y-2 sm:mt-1.5 sm:space-y-2.5">
            <div class="space-y-1 text-left sm:space-y-1.5">
              <label class="pl-1 text-[10px] font-bold tracking-wide text-stone-400 sm:text-[11px]">手机号</label>
              <div class="relative overflow-hidden rounded-[1rem] border border-[#f0f0f0] bg-white transition-all focus-within:border-amber-200 focus-within:shadow-[0_0_0_4px_rgba(251,191,36,0.12)] sm:rounded-[1.1rem]">
                <Smartphone class="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-300 sm:left-4 sm:h-4 sm:w-4" />
                <input
                  v-model="registerPhone"
                  type="tel"
                  placeholder="请输入手机号"
                  autocomplete="off"
                  class="h-10 w-full bg-transparent pl-10 pr-3.5 text-[13px] font-medium text-stone-900 outline-none placeholder:text-stone-300 sm:h-12 sm:pl-11 sm:pr-4 sm:text-sm"
                />
              </div>
            </div>

            <div class="space-y-1 text-left sm:space-y-1.5">
              <label class="pl-1 text-[10px] font-bold tracking-wide text-stone-400 sm:text-[11px]">验证码</label>
              <div class="relative overflow-hidden rounded-[1rem] border border-[#f0f0f0] bg-white transition-all focus-within:border-amber-200 focus-within:shadow-[0_0_0_4px_rgba(251,191,36,0.12)] sm:rounded-[1.1rem]">
                <ShieldCheck class="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-300 sm:left-4 sm:h-4 sm:w-4" />
                <input
                  v-model="registerSmsCode"
                  type="text"
                  placeholder="请输入验证码"
                  class="h-10 w-full bg-transparent pl-10 pr-20 text-[13px] font-medium text-stone-900 outline-none placeholder:text-stone-300 sm:h-12 sm:pl-11 sm:pr-28 sm:text-sm"
                />
                <button
                  type="button"
                  @click="fillRegisterSmsCode"
                  class="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-bold text-amber-600 transition-all hover:bg-amber-100 hover:text-amber-700 sm:right-3 sm:px-3 sm:text-[11px]"
                >
                  获取验证码
                </button>
              </div>
            </div>

            <div class="space-y-1 text-left sm:space-y-1.5">
              <label class="pl-1 text-[10px] font-bold tracking-wide text-stone-400 sm:text-[11px]">设置密码</label>
              <div class="relative overflow-hidden rounded-[1rem] border border-[#f0f0f0] bg-white transition-all focus-within:border-amber-200 focus-within:shadow-[0_0_0_4px_rgba(251,191,36,0.12)] sm:rounded-[1.1rem]">
                <input
                  v-model="registerPassword"
                  :type="showRegisterPassword ? 'text' : 'password'"
                  placeholder="请设置6-16位密码"
                  autocomplete="new-password"
                  class="h-10 w-full bg-transparent px-3.5 pr-10 text-[13px] font-medium text-stone-900 outline-none placeholder:text-stone-300 sm:h-12 sm:px-4 sm:pr-11 sm:text-sm"
                />
                <button
                  type="button"
                  @click="showRegisterPassword = !showRegisterPassword"
                  class="absolute right-2.5 top-1/2 z-10 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-amber-100 bg-amber-50 text-amber-500 transition-all hover:bg-amber-100 hover:text-amber-600 sm:right-3 sm:h-8 sm:w-8"
                  :aria-label="showRegisterPassword ? '隐藏设置密码' : '显示设置密码'"
                >
                  <EyeOff v-if="showRegisterPassword" class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <Eye v-else class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>

            <div class="space-y-1 text-left sm:space-y-1.5">
              <label class="pl-1 text-[10px] font-bold tracking-wide text-stone-400 sm:text-[11px]">确认密码</label>
              <div class="relative overflow-hidden rounded-[1rem] border border-[#f0f0f0] bg-white transition-all focus-within:border-amber-200 focus-within:shadow-[0_0_0_4px_rgba(251,191,36,0.12)] sm:rounded-[1.1rem]">
                <input
                  v-model="registerConfirmPassword"
                  :type="showRegisterConfirmPassword ? 'text' : 'password'"
                  placeholder="请再次输入密码"
                  autocomplete="new-password"
                  class="h-10 w-full bg-transparent px-3.5 pr-10 text-[13px] font-medium text-stone-900 outline-none placeholder:text-stone-300 sm:h-12 sm:px-4 sm:pr-11 sm:text-sm"
                />
                <button
                  type="button"
                  @click="showRegisterConfirmPassword = !showRegisterConfirmPassword"
                  class="absolute right-2.5 top-1/2 z-10 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-amber-100 bg-amber-50 text-amber-500 transition-all hover:bg-amber-100 hover:text-amber-600 sm:right-3 sm:h-8 sm:w-8"
                  :aria-label="showRegisterConfirmPassword ? '隐藏确认密码' : '显示确认密码'"
                >
                  <EyeOff v-if="showRegisterConfirmPassword" class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <Eye v-else class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>

            <div class="flex items-start gap-2 text-left sm:gap-2.5">
              <input
                id="agreement-register"
                v-model="registerAgreement"
                type="checkbox"
                class="mt-0.5 h-3.5 w-3.5 rounded border-stone-300 accent-amber-500 sm:h-4 sm:w-4"
              />
              <label for="agreement-register" class="text-[9px] font-medium leading-relaxed text-stone-400 sm:text-[11px]">
                我已阅读并同意
                <span @click.prevent="activeAgreement = 'user'" class="cursor-pointer text-amber-600 hover:underline">《用户协议》</span>
                和
                <span @click.prevent="activeAgreement = 'privacy'" class="cursor-pointer text-amber-600 hover:underline">《隐私政策》</span>
              </label>
            </div>

            <button
              type="button"
              @click="onRegister"
              :disabled="loading"
              class="h-10 w-full rounded-[999px] bg-[#f4bf17] text-[14px] font-black text-stone-900 shadow-[0_10px_22px_rgba(244,191,23,0.3)] transition-all hover:-translate-y-0.5 hover:bg-[#f7c739] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 sm:h-12 sm:text-base"
            >
              {{ loading ? '注册中...' : '注册并登录' }}
            </button>

            <div class="pt-0.5 text-center sm:pt-1">
              <button type="button" @click="switchToLogin" class="text-[11px] font-bold text-stone-400 sm:text-xs">
                已有账号？
                <span class="ml-1 text-amber-600">立即登录</span>
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>

    <AgreementModal
      :is-open="!!activeAgreement"
      :type="activeAgreement === 'user' ? 'user' : 'privacy'"
      @close="activeAgreement = null"
    />

    <!-- 账号停用提醒弹窗 -->
    <div v-if="showAlertModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"></div>
      <div class="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
        <div class="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
          <span class="text-2xl">🚫</span>
        </div>
        <h3 class="text-lg font-black text-stone-900 mb-2">账号已被停用</h3>
        <p class="text-sm text-stone-500 leading-relaxed mb-6">{{ alertBlockMsg }}</p>
        <button @click="showAlertModal = false" class="w-full bg-stone-900 hover:bg-stone-800 text-white rounded-xl py-3 text-sm font-bold transition">
          我知道了
        </button>
      </div>
    </div>
  </div>
</template>
