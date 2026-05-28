// @ts-nocheck
import { defineStore } from 'pinia'

export interface Suggestion {
  id: string | number
  title: string
  label: string
  labelType: 'danger' | 'opportunity' | 'risk' | 'info'
  text: string
  rightText: string
}

export const useAIStore = defineStore('ai', {
  state: () => ({
    stallId: 108,
    stallCategory: '街头烧烤/炸串冷饮',
    healthScore: 82,
    factors: {
      attraction: 78,
      profit: 85,
      repurchase: 64
    },
    risks: [
      '近期梅雨下雨增加，夜间客流锐退导致生鲜积压',
      '商品『珍珠奶茶』周销售量略低于同阶梯大盘',
      '炸串单价略高于隔壁竞品，敏感消费者转化流失'
    ],
    suggestions: [
      {
        id: 'sales-decline',
        title: '炸串销量下降 18%',
        label: '需关注',
        labelType: 'danger',
        text: '近3天连续阴雨，晚市黄金人流量下滑严重，夜宵食品周转减缓。',
        rightText: '+12% 订单量'
      },
      {
        id: 'lemon-tea',
        title: '柠檬冰茶适合主推',
        label: '机会',
        labelType: 'opportunity',
        text: '气温闷热回升，冷饮毛利高、转化强。柠檬冰茶点击曝光率近两天骤升 28%。',
        rightText: '+18% 销售额'
      },
      {
        id: 'time-low',
        title: '15:00-17:00 时段转化率低',
        label: '问题',
        labelType: 'info',
        text: '该午后边缘时段散客稀少。相比平均时段转化率滞后约 32%。',
        rightText: '+10% 转化率'
      },
      {
        id: 'pearl-low',
        title: '珍珠原料库存不足',
        label: '风险',
        labelType: 'risk',
        text: '根据日耗算法预警，2天内将触发断货断供，即将拖累爆款珍珠鲜奶。',
        rightText: '避免损耗 ¥380'
      },
      {
        id: 'combo-opportunity',
        title: '套餐组合优化机会',
        label: '机会',
        labelType: 'opportunity',
        text: '将香辣鸡肉串与爽口红茶捆绑销售，极易契合晚餐加点习惯。',
        rightText: '+15% 客单价'
      }
    ] as Suggestion[],
    
    // UI 弹窗状态
    drawerOpen: false,
    selectedTitle: '',
    selectedId: '',
    
    // 操作反馈状态
    toastMessage: '',
    toastVisible: false
  }),
  
  actions: {
    // 触发 AI 分析面板
    openAnalysis(id: string | number) {
      const found = this.suggestions.find(s => s.id === id)
      if (found) {
        this.selectedTitle = found.title
        this.selectedId = String(found.id)
        this.drawerOpen = true
      }
    },
    
    closeAnalysis() {
      this.drawerOpen = false
    },
    
    // 一键应用方案
    applyRecommendation(actionType: string) {
      this.drawerOpen = false
      
      let alertMsg = ''
      if (actionType === 'sales-decline' || actionType === 'CREATE_DISCOUNT') {
        alertMsg = '🎉【一键开启促销成功】已为您极速配置并上线「炸串第二份半价」活动！'
        this.healthScore = 88
        this.factors.attraction = 86
        this.suggestions = this.suggestions.map(s => {
          if (s.id === 'sales-decline') {
            return {
              ...s,
              label: '已应用',
              labelType: 'opportunity',
              text: '「炸串第二份半价活动」正在进行，预计订单量回升 +12%'
            }
          }
          return s;
        })
      } else if (actionType === 'pearl-low' || actionType === 'STOCK_ALERT') {
        alertMsg = '🔔【一键补货处理成功】已向供应链管家发出「25kg 特选珍珠原料」加急配发订单！'
        this.suggestions = this.suggestions.map(s => {
          if (s.id === 'pearl-low') {
            return {
              ...s,
              label: '已锁料',
              labelType: 'opportunity',
              text: '珍珠加急原料已在配送，预计2小时内达。'
            }
          }
          return s;
        })
      } else if (actionType === 'combo-opportunity' || actionType === 'CREATE_COMBO') {
        alertMsg = '🎉【一键生成海报与套餐成功】已生成「爽饮+烤炸套餐」！并智能置顶前台菜单！'
        this.healthScore = 91
        this.factors.profit = 92
        this.factors.repurchase = 75
        this.suggestions = this.suggestions.map(s => {
          if (s.id === 'combo-opportunity') {
            return {
              ...s,
              label: '已优化',
              labelType: 'opportunity',
              text: '「红茶烤串元气套餐」上线中，排序已提前。'
            }
          }
          return s;
        })
      } else {
        alertMsg = '🎉【一键应用成功】AI 建议策略方案已自动同步到摊位前台云屏！'
      }
      
      this.showToast(alertMsg)
    },
    
    showToast(message: string) {
      this.toastMessage = message
      this.toastVisible = true
      setTimeout(() => {
        this.toastVisible = false
      }, 3500)
    }
  }
})
