import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksTestnet } from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export const NETWORK = new StacksTestnet();

export function connectWallet() {
  showConnect({
    appDetails: {
      name: 'SkillMint',
      icon: window.location.origin + '/skillmint-logo.svg',
    },
    redirectTo: '/',
    onFinish: () => {
      window.location.reload();
    },
    userSession,
  });
}

export function disconnectWallet() {
  userSession.signUserOut();
  window.location.reload();
}

export function getUserAddress(): string | null {
  if (userSession.isUserSignedIn()) {
    const userData = userSession.loadUserData();
    return userData.profile.stxAddress.testnet; // Change to mainnet for production
  }
  return null;
}

export function isWalletConnected(): boolean {
  return userSession.isUserSignedIn();
}

export async function getSTXBalance(): Promise<string> {
  if (!isWalletConnected()) {
    return '0';
  }

  try {
    // This would typically call the Stacks API to get balance
    // For now, return a placeholder
    return '0.000000';
  } catch (error) {
    console.error('Error getting STX balance:', error);
    return '0.000000';
  }
}
