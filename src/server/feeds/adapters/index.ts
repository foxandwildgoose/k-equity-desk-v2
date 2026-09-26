/**
 * Adapter registration entry point. Importing this module registers every
 * implemented source adapter with the runner. (P2+ adds adapters here.)
 */
export { hasAdapter, registerAdapter, runSource, runSources } from "../runner.ts";
