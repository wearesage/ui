import { defineStore } from 'pinia'
import { createAppKit, useAppKit, useAppKitAccount } from '@reown/appkit/vue'
import { Ethers5Adapter } from "@reown/appkit-adapter-ethers5";
import { mainnet, arbitrum } from "@reown/appkit/networks";

export const useAuth = defineStore('auth', () => {
  createAppKit({
    adapters: [new Ethers5Adapter()],
    projectId: import.meta.env.VITE_REOWN_PROJECT_ID,
    networks: [mainnet, arbitrum]
  })

  const { open, close } = useAppKit()
  const account = useAppKitAccount()
  const cachedAddress = localStorage.getItem('REOWN:wallet')
  const authenticated = computed(() => {
    return cachedAddress?.length || account.value?.address !== undefined
  })

  watch(() => authenticated.value, () => {
    if (!account.value?.address) return
    localStorage.setItem('REOWN:wallet', account.value?.address)
  })

  return {
    open,
    close,
    account,
    authenticated
  }
})