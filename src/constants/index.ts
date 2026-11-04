import type { ElementKey, WeaponType } from '@/types'

export const ELEMENT_ORDER: ElementKey[] = [
  'glacio',
  'fusion',
  'electro',
  'aero',
  'spectro',
  'havoc',
]

export const ELEMENT_META: Record<ElementKey, { label: string; color: string }> = {
  glacio: { label: '冷凝', color: '#6ec6ff' },
  fusion: { label: '热熔', color: '#ff7a59' },
  electro: { label: '导电', color: '#b18cff' },
  aero: { label: '气动', color: '#5fd3a8' },
  spectro: { label: '衍射', color: '#f2c94c' },
  havoc: { label: '湮灭', color: '#e05a7a' },
}

export const WEAPON_ORDER: WeaponType[] = [
  'broadblade',
  'sword',
  'pistols',
  'gauntlets',
  'rectifier',
]

export const WEAPON_META: Record<WeaponType, { label: string }> = {
  broadblade: { label: '长刃' },
  sword: { label: '迅刀' },
  pistols: { label: '佩枪' },
  gauntlets: { label: '臂铠' },
  rectifier: { label: '音感仪' },
}

export const SITE = {
  name: '鸣潮数据看板',
  subtitle: 'WUWA DATA',
  repoUrl: import.meta.env.VITE_REPO_URL ?? '',
  disclaimer:
    '非官方粉丝项目，与库洛游戏无关联。游戏素材与数据版权归原权利人所有。数据来自社区公开数据挖掘项目，仅用于学习与交流。',
}
