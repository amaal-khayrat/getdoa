import type { ListTemplate } from '@/types/doa-list.types'

export const LIST_TEMPLATES: ListTemplate[] = [
  {
    id: 'morning-azkar',
    name: 'Morning Azkar',
    nameMs: 'Zikir Pagi',
    description: 'Essential morning supplications to start your day',
    descriptionMs: 'Doa-doa penting untuk memulakan hari anda',
    icon: 'Sunrise',
    doaSlugs: [
      'pagi-doa-ditetapkan-islam',
      'penghulu-bagi-doa-keampunan',
      'doa-mohon-keampunan',
      'doa-mohon-taqwa',
      'doa-keluar-dari-rumah',
    ],
  },
  {
    id: 'evening-azkar',
    name: 'Evening Azkar',
    nameMs: 'Zikir Petang',
    description: 'Essential evening supplications to end your day',
    descriptionMs: 'Doa-doa penting untuk mengakhiri hari anda',
    icon: 'Sunset',
    doaSlugs: [
      'petang-doa-ditetapkan-islam',
      'penghulu-bagi-doa-keampunan',
      'doa-keampunan',
      'doa-ditetapkan-hati',
    ],
  },
  {
    id: 'forgiveness',
    name: 'Seeking Forgiveness',
    nameMs: 'Mohon Keampunan',
    description: 'Prayers for repentance and seeking forgiveness',
    descriptionMs: 'Doa-doa taubat dan memohon keampunan',
    icon: 'Heart',
    doaSlugs: [
      'penghulu-bagi-doa-keampunan',
      'doa-mohon-keampunan',
      'doa-keampunan',
    ],
  },
  {
    id: 'daily-essentials',
    name: 'Daily Essentials',
    nameMs: 'Amalan Harian',
    description: 'Core daily prayers and supplications',
    descriptionMs: 'Doa-doa asas untuk amalan harian',
    icon: 'Calendar',
    doaSlugs: [
      'doa-keluar-dari-rumah',
      'doa-petunjuk-ketaqwaan-iffah-dan-kekayaan',
      'doa-ilmu-rezeki-dan-amalan-yang-diterima',
      'doa-pertolongan-untuk-zikir',
    ],
  },
  {
    id: 'empty',
    name: 'Start Empty',
    nameMs: 'Mulakan Kosong',
    description: 'Create your own custom collection from scratch',
    descriptionMs: 'Cipta koleksi anda sendiri dari awal',
    icon: 'Plus',
    doaSlugs: [],
  },
]

export function getTemplateById(id: string): ListTemplate | undefined {
  return LIST_TEMPLATES.find((t) => t.id === id)
}
