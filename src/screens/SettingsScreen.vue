<script setup lang="ts">
import { onMounted, ref } from 'vue';
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
  MapPin,
  Camera,
  X,
  Clock,
  Tag,
  CheckCircle2,
  AlertCircle
} from 'lucide-vue-next';
import { buildApiUrl } from '../utils/api';
import { showToast } from '../composables/useToast';

defineProps<{
  onLogout: () => void;
}>();

interface StallDetail {
  hasApplication: boolean;
  stallName?: string;
  stallCode?: string;
  boothCode?: string;
  areaName?: string;
  categoryName?: string;
  plannedStartTime?: string;
  status?: string;
  applicationStatus?: string;
  nextStep?: string;
}

// -- 状态 --
const profileName = ref('加载中...');
const totalRevenue = ref('¥ --');
const boothLocation = ref('--');
const trackInventory = ref(false);
const stallDays = ref('--');
const avatarUrl = ref('');
const coverUrl = ref('');
const bio = ref('');
const vipTag = ref('LOCAL');

// 编辑弹窗
const showEditModal = ref(false);
const editName = ref('');
const editBio = ref('');

// 摊位管理弹窗
const showStallModal = ref(false);
const stallDetail = ref<StallDetail>({ hasApplication: false });

// 文件 refs
const avatarInputRef = ref<HTMLInputElement | null>(null);
const coverInputRef = ref<HTMLInputElement | null>(null);
const uploadingAvatar = ref(false);
const uploadingCover = ref(false);

// -- API 请求 --
const authHeaders = () => {
  const token = localStorage.getItem('stall_auth_token') || '';
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
};

const fetchOverview = async () => {
  try {
    const resp = await fetch(buildApiUrl('/api/settings/overview'), {
      headers: authHeaders(),
    });
    const payload = await resp.json();
    if (payload.success && payload.data) {
      const p = payload.data.profile;
      if (p) {
        profileName.value = p.merchantName || '商户';
        boothLocation.value = p.boothLocation || '--';
        avatarUrl.value = p.avatarUrl || '';
        bio.value = p.description || '';
        vipTag.value = p.vipTag || 'LOCAL';
        trackInventory.value = p.trackInventory === true;
      }
      coverUrl.value = payload.data.coverMedia?.coverUrl || '';
      const stats = payload.data.stats || [];
      const rev = stats.find((s: any) => s.label && s.label.includes('营收'));
      if (rev) totalRevenue.value = rev.value || '¥ --';
      const days = stats.find((s: any) => s.label && s.label.includes('入驻'));
      if (days) stallDays.value = days.value || '--';
    }
  } catch { /* keep fallback */ }
};

const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const token = localStorage.getItem('stall_auth_token') || '';
  const resp = await fetch(buildApiUrl('/api/common/upload'), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const result = await resp.json();
  if (result.code === 200 || result.success) {
    return result.data as string;
  }
  throw new Error(result.message || '上传失败');
};

// -- 头像上传 --
const openAvatarPicker = () => avatarInputRef.value?.click();

const onAvatarChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    showToast('error', '上传失败', '头像大小不能超过 5MB');
    return;
  }
  uploadingAvatar.value = true;
  try {
    const ossUrl = await uploadFile(file);
    const resp = await fetch(buildApiUrl(`/api/settings/avatar?avatarUrl=${encodeURIComponent(ossUrl)}`), {
      method: 'PUT',
      headers: authHeaders(),
    });
    const payload = await resp.json();
    if (payload.success) {
      avatarUrl.value = ossUrl;
      showToast('success', '头像已更新', '');
    }
  } catch (err: any) {
    showToast('error', '上传失败', err.message || '请重试');
  } finally {
    uploadingAvatar.value = false;
    if (avatarInputRef.value) avatarInputRef.value.value = '';
  }
};

// -- 背景图上传 --
const openCoverPicker = () => coverInputRef.value?.click();

const onCoverChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    showToast('error', '上传失败', '背景图大小不能超过 5MB');
    return;
  }
  uploadingCover.value = true;
  try {
    const ossUrl = await uploadFile(file);
    const resp = await fetch(buildApiUrl(`/api/settings/cover?coverUrl=${encodeURIComponent(ossUrl)}`), {
      method: 'PUT',
      headers: authHeaders(),
    });
    const payload = await resp.json();
    if (payload.success) {
      coverUrl.value = ossUrl;
      showToast('success', '背景图已更新', '');
    }
  } catch (err: any) {
    showToast('error', '上传失败', err.message || '请重试');
  } finally {
    uploadingCover.value = false;
    if (coverInputRef.value) coverInputRef.value.value = '';
  }
};

// -- 编辑个人信息 --
const openEditModal = () => {
  editName.value = profileName.value;
  editBio.value = bio.value;
  showEditModal.value = true;
};

const submitProfile = async () => {
  try {
    const resp = await fetch(buildApiUrl('/api/settings/profile'), {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ merchantName: editName.value.trim(), bio: editBio.value.trim() }),
    });
    const payload = await resp.json();
    if (payload.success) {
      profileName.value = editName.value.trim() || profileName.value;
      bio.value = editBio.value.trim();
      showEditModal.value = false;
      showToast('success', '保存成功', '个人信息已更新');
    }
  } catch {
    showToast('error', '保存失败', '请稍后重试');
  }
};

// -- 摊位管理 --
const openStallModal = async () => {
  try {
    const resp = await fetch(buildApiUrl('/api/settings/stall'), {
      headers: authHeaders(),
    });
    const payload = await resp.json();
    if (payload.success && payload.data) {
      stallDetail.value = payload.data;
    }
  } catch { /* keep default */ }
  showStallModal.value = true;
};

const toggleInventory = async () => {
  const newVal = !trackInventory.value;
  try {
    const resp = await fetch(buildApiUrl(`/api/settings/inventory?track=${newVal}`), { method: 'PUT', headers: authHeaders() });
    const payload = await resp.json();
    if (payload.success) { trackInventory.value = newVal; showToast('success', '已更新', newVal ? '库存记录已开启' : '库存记录已关闭'); }
  } catch { showToast('error', '更新失败', ''); }
};

const handleAction = (actionKey: string) => {
  if (actionKey === 'account') openEditModal();
  else if (actionKey === 'stall-manage') openStallModal();
  else if (actionKey === 'logout') { /* handled by parent via onLogout prop */ }
};

onMounted(() => { fetchOverview(); });
</script>

<template>
  <div class="space-y-8 md:space-y-10 pb-10 text-left">
    <!-- ===== 背景图 Banner ===== -->
    <section
      class="group relative overflow-hidden rounded-[2.4rem] border border-stone-100 bg-white shadow-[0_22px_55px_rgba(0,0,0,0.06)] cursor-pointer"
      role="button" tabindex="0"
      @click="openCoverPicker"
      @keydown.enter.prevent="openCoverPicker"
      @keydown.space.prevent="openCoverPicker"
    >
      <input ref="coverInputRef" type="file" accept="image/*" class="hidden" @change="onCoverChange" />

      <!-- 背景图 -->
      <template v-if="coverUrl">
        <img :src="coverUrl" alt="Store cover" class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" referrerPolicy="no-referrer" />
      </template>
      <template v-else>
        <img src="https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?q=80&w=1600&auto=format&fit=crop" alt="Store cover" class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" referrerPolicy="no-referrer" />
      </template>

      <div class="absolute inset-0 bg-gradient-to-br from-stone-950/72 via-stone-950/36 to-amber-900/24"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_26%)]"></div>

      <div class="relative z-10 flex h-full flex-col justify-between p-5 sm:p-6 md:p-8">
        <!-- 顶栏 -->
        <div>
          <span class="rounded-full border border-white/15 bg-black/20 px-3.5 py-2 text-[11px] font-bold text-white/90 backdrop-blur-md">
            {{ uploadingCover ? '上传中...' : '点击更换背景图' }}
          </span>
        </div>

        <!-- 底栏：左侧头像 + 右侧信息 -->
        <div class="flex items-end gap-4">
          <!-- 左侧：头像（左下角，距底和左有间距） -->
          <div class="relative flex-shrink-0 cursor-pointer mb-2 ml-1 sm:mb-3 sm:ml-2" @click.stop="openAvatarPicker">
            <input ref="avatarInputRef" type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
            <div class="h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-full border-[3px] border-white/80 bg-gradient-to-tr from-amber-200 to-amber-500 p-0.5 shadow-xl hover:scale-105 transition-transform">
              <div class="h-full w-full overflow-hidden rounded-full border-2 border-white/60">
                <img v-if="avatarUrl" :src="avatarUrl" alt="Avatar" class="h-full w-full object-cover" referrerPolicy="no-referrer" />
                <img v-else alt="Avatar" class="h-full w-full object-cover" src="https://picsum.photos/seed/merchant/200/200" referrerPolicy="no-referrer" />
              </div>
            </div>
            <div class="absolute -bottom-1 -right-1 rounded-full bg-stone-800 p-1 text-white shadow"><Camera class="h-2.5 w-2.5 sm:h-3 sm:w-3" /></div>
            <div v-if="uploadingAvatar" class="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
              <div class="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            </div>
          </div>

          <!-- 右侧：名称 + 标签 + 签名 + 位置 -->
          <div class="min-w-0 flex-1 text-left text-white">
            <h1 class="text-2xl font-extrabold tracking-tight text-white md:text-3xl">{{ profileName }}</h1>
            <div class="mt-2 flex flex-wrap items-center gap-2.5">
              <span class="rounded-lg bg-amber-300/20 px-2.5 py-1 text-[9px] font-bold uppercase tracking-tight text-amber-100 backdrop-blur-md">金牌摊主 Master</span>
              <span class="rounded-lg bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-tight text-white/70 backdrop-blur-md">{{ vipTag }}</span>
            </div>
            <p class="mt-2 max-w-xl text-sm font-medium leading-relaxed text-white/82">{{ bio || '用美食传递温暖，用心经营每一天' }}</p>
            <span class="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-white/65"><MapPin class="h-3 w-3" />{{ boothLocation }}</span>
          </div>
        </div>
      </div>
    </section>
    
    <!-- ===== 统计卡片 ===== -->
    <section class="grid grid-cols-2 gap-3.5 md:gap-4">
      <div class="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-stone-100">
        <p class="text-stone-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">累计营收</p>
        <h3 class="text-xl md:text-2xl font-bold text-stone-900 tracking-tight">{{ totalRevenue }}</h3>
        <div class="mt-2 flex items-center gap-1 text-emerald-600 font-bold">
          <TrendingUp class="w-3 h-3" />
          <span class="text-[10px]">来自销售订单</span>
        </div>
      </div>
      <div class="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-stone-100">
        <p class="text-stone-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">入驻天数</p>
        <h3 class="text-xl md:text-2xl font-bold text-stone-900 tracking-tight">{{ stallDays }}</h3>
        <div class="mt-2 flex items-center gap-1 text-stone-400 font-bold">
          <span class="text-[10px]">从首次申请起算</span>
        </div>
      </div>
    </section>

    <!-- ===== 成就徽章 ===== -->
    <section>
      <h3 class="text-sm font-black text-stone-900 mb-3">成就徽章</h3>
      <div class="flex gap-3 overflow-x-auto pb-2">
        <div v-for="(badge, i) in [
          { label: '早起鸟 Early Bird', icon: Sun, color: 'bg-orange-50', text: 'text-orange-500' },
          { label: '营收达人 Master', icon: Star, color: 'bg-amber-50', text: 'text-amber-500' },
          { label: '人气摊位 Popular', icon: Heart, color: 'bg-rose-50', text: 'text-rose-500' },
        ]" :key="i"
          class="flex shrink-0 items-center gap-2.5 rounded-2xl border border-stone-100 bg-white px-4 py-3 shadow-sm"
        >
          <div :class="['flex h-9 w-9 items-center justify-center rounded-xl', badge.color]">
            <component :is="badge.icon" :class="['h-4 w-4', badge.text]" />
          </div>
          <div class="text-left">
            <p class="text-[11px] font-black text-stone-900">{{ badge.label }}</p>
            <p class="text-[9px] font-bold text-stone-400">已解锁</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== 设置菜单 ===== -->
    <section class="space-y-2">
      <div
        v-for="(item, i) in [
          { title: '账号信息', sub: '个人资料与安全管理', icon: User, action: 'account' },
          { title: '支付设置', sub: '收款账户与费率查看', icon: Wallet, action: 'payment' },
          { title: '摊位管理', sub: '查看摊位申请详情', icon: Store, action: 'stall-manage' },
        ]" :key="i"
        class="flex items-center justify-between rounded-2xl border border-stone-100 bg-white p-4 cursor-pointer hover:bg-stone-50 transition-colors"
        @click="handleAction(item.action)"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-50">
            <component :is="item.icon" class="h-4 w-4 text-stone-500" />
          </div>
          <div class="text-left">
            <p class="text-sm font-bold text-stone-900">{{ item.title }}</p>
            <p class="text-[11px] text-stone-400">{{ item.sub }}</p>
          </div>
        </div>
        <ChevronRight class="h-4 w-4 text-stone-300" />
      </div>

      <div class="flex items-center justify-between rounded-2xl border border-stone-100 bg-white p-4 cursor-pointer hover:bg-stone-50 transition-colors" @click="toggleInventory">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-50">
            <Store class="h-4 w-4 text-stone-500" />
          </div>
          <div class="text-left">
            <p class="text-sm font-bold text-stone-900">记录库存数量</p>
            <p class="text-[11px] text-stone-400">{{ trackInventory ? '已开启' : '已关闭' }}</p>
          </div>
        </div>
        <div :class="['w-10 h-5 rounded-full relative transition-colors', trackInventory ? 'bg-green-500' : 'bg-stone-300']">
          <div :class="['absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all', trackInventory ? 'right-1' : 'left-1']" />
        </div>
      </div>

      <div
        class="flex items-center justify-between rounded-2xl border border-rose-100 bg-white p-4 cursor-pointer hover:bg-rose-50 transition-colors"
        @click="onLogout"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50">
            <LogOut class="h-4 w-4 text-rose-500" />
          </div>
          <div class="text-left">
            <p class="text-sm font-bold text-rose-600">退出登录</p>
          </div>
        </div>
        <ChevronRight class="h-4 w-4 text-rose-300" />
      </div>
    </section>

    <!-- 品牌尾 -->
    <div class="text-center pt-4">
      <p class="text-[10px] font-bold text-stone-300 tracking-widest">摊位管家</p>
      <p class="text-[8px] font-bold text-stone-300/60 tracking-[0.2em] uppercase mt-0.5">STALL MANAGER</p>
    </div>

    <!-- ===== 编辑个人信息弹窗 ===== -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" @click.self="showEditModal = false">
          <div class="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
            <div class="flex items-center justify-between mb-5">
              <h3 class="text-lg font-black text-stone-900">编辑个人信息</h3>
              <button @click="showEditModal = false" class="rounded-xl p-2 hover:bg-stone-100">
                <X class="h-4 w-4 text-stone-400" />
              </button>
            </div>
            <div class="space-y-4">
              <div>
                <label class="text-xs font-bold text-stone-500 mb-1.5 block">商户名称</label>
                <input v-model="editName" class="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm font-semibold text-stone-800 outline-none focus:border-amber-300" placeholder="请输入商户名称" maxlength="20" />
              </div>
              <div>
                <label class="text-xs font-bold text-stone-500 mb-1.5 block">个性签名</label>
                <textarea v-model="editBio" rows="3" class="w-full resize-none rounded-xl border border-stone-200 px-3 py-2.5 text-sm font-semibold text-stone-800 outline-none focus:border-amber-300" placeholder="写一句话介绍自己..." maxlength="200"></textarea>
                <p class="text-[10px] text-stone-400 mt-1">{{ editBio.length }}/200</p>
              </div>
            </div>
            <div class="mt-5 flex gap-3">
              <button @click="showEditModal = false" class="flex-1 rounded-xl border border-stone-200 py-2.5 text-sm font-bold text-stone-500 hover:bg-stone-50">取消</button>
              <button @click="submitProfile" class="flex-1 rounded-xl bg-amber-500 py-2.5 text-sm font-black text-white hover:bg-amber-600 transition-colors">保存</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ===== 摊位管理弹窗 ===== -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showStallModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" @click.self="showStallModal = false">
          <div class="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
            <div class="flex items-center justify-between mb-5">
              <h3 class="text-lg font-black text-stone-900">摊位管理</h3>
              <button @click="showStallModal = false" class="rounded-xl p-2 hover:bg-stone-100">
                <X class="h-4 w-4 text-stone-400" />
              </button>
            </div>

            <template v-if="stallDetail.hasApplication">
              <div class="space-y-3">
                <div class="flex items-center justify-between rounded-xl bg-stone-50 p-3">
                  <span class="text-xs font-bold text-stone-500">申请状态</span>
                  <span :class="['inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-black',
                    stallDetail.applicationStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600']">
                    <CheckCircle2 v-if="stallDetail.applicationStatus === 'APPROVED'" class="h-3 w-3" />
                    <AlertCircle v-else class="h-3 w-3" />
                    {{ stallDetail.applicationStatus === 'APPROVED' ? '已通过' : stallDetail.applicationStatus === 'REJECTED' ? '未通过' : '审核中' }}
                  </span>
                </div>
                <div v-if="stallDetail.stallName" class="flex items-center justify-between rounded-xl bg-stone-50 p-3">
                  <span class="text-xs font-bold text-stone-500">摊位名称</span>
                  <span class="text-sm font-black text-stone-900">{{ stallDetail.stallName }}</span>
                </div>
                <div v-if="stallDetail.categoryName" class="flex items-center justify-between rounded-xl bg-stone-50 p-3">
                  <span class="text-xs font-bold text-stone-500"><Tag class="h-3 w-3 inline mr-1" />经营类目</span>
                  <span class="text-sm font-bold text-stone-700">{{ stallDetail.categoryName }}</span>
                </div>
                <div v-if="stallDetail.areaName" class="flex items-center justify-between rounded-xl bg-stone-50 p-3">
                  <span class="text-xs font-bold text-stone-500"><MapPin class="h-3 w-3 inline mr-1" />经营地点</span>
                  <span class="text-sm font-bold text-stone-700 truncate max-w-[180px]">{{ stallDetail.areaName }}</span>
                </div>
                <div v-if="stallDetail.plannedStartTime" class="flex items-center justify-between rounded-xl bg-stone-50 p-3">
                  <span class="text-xs font-bold text-stone-500"><Clock class="h-3 w-3 inline mr-1" />计划开始</span>
                  <span class="text-sm font-bold text-stone-700">{{ stallDetail.plannedStartTime.replace('T', ' ') }}</span>
                </div>
                <div v-if="stallDetail.stallCode" class="flex items-center justify-between rounded-xl bg-stone-50 p-3">
                  <span class="text-xs font-bold text-stone-500">摊位编号</span>
                  <span class="text-sm font-bold text-stone-700">{{ stallDetail.stallCode }}</span>
                </div>
                <div v-if="stallDetail.nextStep" class="rounded-xl bg-amber-50 p-3">
                  <p class="text-xs font-bold text-amber-700">📋 {{ stallDetail.nextStep }}</p>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="text-center py-8">
                <Store class="mx-auto h-10 w-10 text-stone-300 mb-3" />
                <p class="text-sm font-bold text-stone-400">尚未申请摊位</p>
                <p class="text-xs text-stone-300 mt-1">前往摊位页面提交入驻申请</p>
              </div>
            </template>

            <button @click="showStallModal = false" class="mt-5 w-full rounded-xl bg-stone-900 py-2.5 text-sm font-black text-white">关闭</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
