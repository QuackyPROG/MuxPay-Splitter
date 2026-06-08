import {
  MuxedAccount,
  StrKey,
  encodeMuxedAccount,
  encodeMuxedAccountToAddress,
} from '@stellar/stellar-sdk';

/** Build an M... address from a G... base address and an off-chain member ID. */
export function buildMuxedAddress(baseAddress: string, memberId: string): string {
  const muxedXdr = encodeMuxedAccount(baseAddress, memberId);
  return encodeMuxedAccountToAddress(muxedXdr, true);
}

/** Extract the base G... address from an M... muxed address. */
export function getBaseFromMuxed(address: string): string {
  if (!address.startsWith('M')) return address;
  try {
    // MuxedAccount.fromAddress parses an M... string
    return MuxedAccount.fromAddress(address, '0').baseAccount().accountId();
  } catch {
    return address;
  }
}

export function isValidAddress(address: string): boolean {
  return (
    StrKey.isValidEd25519PublicKey(address) ||
    StrKey.isValidMed25519PublicKey(address)
  );
}
