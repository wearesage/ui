import { defineStore } from "pinia";
import { createAppKit, useAppKit, useAppKitAccount } from "@reown/appkit/vue";
import { Ethers5Adapter } from "@reown/appkit-adapter-ethers5";
import { mainnet, arbitrum } from "@reown/appkit/networks";
import { createSIWEConfig, formatMessage } from "@reown/appkit-siwe";

export const useAuth = defineStore("auth", () => {
  const siweConfig = createSIWEConfig({
    getMessageParams: async () => ({
      domain: window.location.host,
      uri: window.location.origin,
      chains: [mainnet.id, arbitrum.id],
      statement: "Sign in and authorize agent tools.",
      resources: toolsMetadata.value.map(
        (tool) =>
          `urn:goat:tool:${tool.name}:${encodeURIComponent(tool.description)}`
      ),
    }),
    createMessage: ({ address, ...args }) => {
      return createToolsMessage({ address, ...args });
    },
    getNonce: async () => {
      return Math.random().toString(36).substring(7);
    },
    getSession: async () => {
      const stored = localStorage.getItem("siwe-session");
      if (!stored) return null;
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    },
    verifyMessage: async ({ message, signature }) => {
      try {
        const response = await fetch("http://localhost:3000/api/auth/verify-siwe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, signature }),
        });

        if (response.ok) {
          const session = await response.json();
          localStorage.setItem("siwe-session", JSON.stringify(session));
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    signOut: async () => {
      localStorage.removeItem("siwe-session");
      return true;
    },
  });

  createAppKit({
    adapters: [new Ethers5Adapter()],
    projectId: import.meta.env.VITE_REOWN_PROJECT_ID,
    networks: [mainnet, arbitrum],
    siweConfig,
  });

  const { open, close } = useAppKit();
  const isOpen = ref(false);
  const account = useAppKitAccount();
  const cachedAddress = localStorage.getItem("REOWN:wallet");
  const authenticated = computed(
    () => cachedAddress?.length || account.value?.address !== undefined
  );
  const { toolsMetadata } = useAgentTools();

  function createToolsMessage({ address, ...args }: any) {
    const baseMessage = formatMessage(args, address);
    const toolsSection = `

  Tools to authorize:
  ${toolsMetadata.value
    .map((tool) => `- ${tool.name}: ${tool.description}`)
    .join("\n")}`;

    return baseMessage + toolsSection;
  }

  watch(
    () => [authenticated.value, account.value?.address],
    () => {
      if (!account.value?.address) return;
    },
    { immediate: true }
  );

  return {
    open,
    close,
    account,
    authenticated,
    isOpen,
  };
});
