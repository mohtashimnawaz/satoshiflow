import { createActor, canisterId } from '../../../declarations/satoshiflow_backend';

export function getBackendActor(identity) {
  const agentOptions = identity ? { identity } : {};
  return createActor(canisterId, { agentOptions });
} 