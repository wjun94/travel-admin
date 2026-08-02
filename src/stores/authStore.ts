import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getUserInfoApi, AdminInfo } from '@/api/auth'

interface AuthState {
  token: string | null
  userInfo: AdminInfo | null
  permissions: string[]
  roles: string[]

  setToken: (token: string) => void
  logout: () => void
  hasPermission: (perm: string) => boolean
  fetchUserInfo: () => Promise<AdminInfo | null>
}

// 后端 permissions 是 JSON 字符串，如 ["dashboard","users_manage"]
function parsePermissions(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      userInfo: null,
      permissions: [],
      roles: [],

      // 设置token
      setToken: (token: string) => set({ token }),

      // 退出登录
      logout: () => set({
        token: null,
        userInfo: null,
        roles: [],
        permissions: [],
      }),

      // 判断是否有权限
      hasPermission: (perm: string) => {
        return get().permissions.includes(perm)
      },

      // 获取用户信息 + 权限
      fetchUserInfo: async () => {
        try {
          const res = await getUserInfoApi()
          const info = res.data
          set({
            userInfo: info,
            roles: [info.role.name],
            permissions: parsePermissions(info.role.permissions),
          })
          return info
        } catch (err) {
          get().logout()
          return null
        }
      },
    }),
    {
      name: 'auth-storage',
      // ✅ 关键：只持久化 token，其他都不存！
      partialize: (state) => ({
        token: state.token
      })
    }
  )
)
