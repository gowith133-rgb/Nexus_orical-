export type HomeostaticStatus = 'READY' | 'RESTING' | 'CRITICAL';
export type AQP4Polarity = 'OPTIMAL' | 'POLARIZED' | 'NON-POLAR';
export type AdenosineLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type GlymphaticIndex = 'BETA-AMYLOID_PURGED' | 'TAU_DETECTED';
export type NorepinephrineMetric = 'STABLE' | 'VOLATILE';
export type SigstoreAuth = 'VERIFIED' | 'REKOR_PROOFS_VALID' | 'FAILED';
export type TradingMode = 'PAPER' | 'REAL';

export interface Agent {
  id: string;
  name: string;
  type: 'ALPHA' | 'SIGMA' | 'OMEGA';
  status: 'ACTIVE' | 'IDLE' | 'LEARNING';
  mode: TradingMode;
  created: number;
  strategy: string;
  winRate: number;
  pnlUSD: number;
}

export interface ProcessorOutput {
  class: 'Identity' | 'Normalize' | 'Softmax' | 'Step';
  value: number[];
  timestamp: number;
  entropy: number;
  sparsity: number;
  normVariance: number;
}

export interface LatentTrajectoryPoint {
  x: number;
  y: number;
  timestamp: number;
  entropy: number;
  step: number;
}

export interface ProcessorConfig {
  temperature: number; // For Softmax (0.1 - 2.0)
  normEpsilon: number; // For LayerNorm (1e-6 to 1e-2)
  stepThreshold: number; // For Step quantization (0.1 - 0.9)
  activeTransform: 'Identity' | 'Normalize' | 'Softmax' | 'Step';
  driftDistance: number;
}

export interface ActivityEntry {
  id: string;
  type: 'STATUS' | 'LABEL_CHANGE' | 'MENTION' | 'TRADE' | 'SYSTEM' | 'SINCERITY' | 'CIRCUIT_BREAKER' | 'AUTODREAM' | 'ROUTER';
  message: string;
  timestamp: number;
  user?: string;
  metadata?: Record<string, any>;
}

export interface ArticleMetrics {
  citations: number[];
  views: number[];
  downloads: number[];
}

export interface MetamatrixStatus {
  status: HomeostaticStatus;
  aqp4: AQP4Polarity;
  adenosine: AdenosineLevel;
  glymphatic: GlymphaticIndex;
  norepinephrine: NorepinephrineMetric;
  sigstore: SigstoreAuth;
  uptime: number;
  epcAllocation: number; // EPC Page Cache allocation in MB
  phase: 'NREM' | 'REM' | 'ACTIVE' | 'CONSOLIDATING';
  oracleStatus: 'SYNCED' | 'PUSHING' | 'ATTESTED';
}

export interface TradeOrder {
  id: string;
  timestamp: number;
  productId: string;
  side: 'BUY' | 'SELL';
  stopPrice: number;
  limitPrice: number;
  size: string;
  status: 'PENDING' | 'EXECUTED' | 'REJECTED' | 'FAILED';
  rejectionReason?: string;
  spreadBps?: number;
  routerPath?: string;
}

// --- Layer 1: Substrate / Enclave TEE Hardware ---
export interface EnclaveHardwareState {
  status: 'SECURE_ENCLAVE_ACTIVE' | 'ATTESTING' | 'ISOLATED';
  epcUsageMB: number;
  epcTotalMB: number;
  mrenclave: string;
  mrsigner: string;
  hardwareEntropyBits: number;
  attestationNonce: string;
  lastAttestationTime: number;
}

// --- Layer 2: Sincerity Protocol & Anti-Sycophancy Engine ---
export interface SincerityMetrics {
  sincerityScore: number; // 0 - 100%
  epistemicHonestyIndex: number; // 0.0 - 1.0
  sycophancyDeflections: number;
  confidenceCalibration: number; // 0.0 - 1.0
  refusalThreshold: number;
  lastInterceptedEvent?: {
    prompt: string;
    interceptedReason: string;
    calibratedResponse: string;
    timestamp: number;
  };
}

// --- Layer 3: Cognitive & AutoDream Memory Layer ---
export interface DreamMemoryEntry {
  id: string;
  timestamp: number;
  type: 'SYNAPTIC_PRUNE' | 'LATENT_RECOMBINATION' | 'COUNTERFACTUAL_BACKTEST' | 'HEURISTIC_SYNTHESIS';
  description: string;
  compressionRatio: number;
  synapticSalience: number;
}

export interface AutoDreamState {
  phase: 'NREM' | 'REM' | 'ACTIVE' | 'CONSOLIDATING';
  cycleCount: number;
  tauPurgeProgress: number; // 0 - 100%
  amyloidClearance: number; // 0 - 100%
  synapticPruningFactor: number; // e.g. 0.88
  consolidatedMemories: DreamMemoryEntry[];
  dreamEpoch: number;
  isDreaming: boolean;
}

// --- Layer 4: Predictive Frequency Oracle & Secure Data Pipeline ---
export interface FrequencyVector {
  timestamp: number;
  date: string;
  frequencies: number[];
  dominantFrequencyHz: number;
  gitSha: string;
  sigstoreVerified: boolean;
  rekorLogId: string;
  inTotoStatementHash: string;
}

export interface SigstoreAttestation {
  envelopeType: string;
  rekorEntryIndex: number;
  signedAt: string;
  logUuid: string;
  certificateIssuer: string;
  signatureValid: boolean;
}

// --- Layer 5: Autonomous Router Contract & Execution ---
export interface SpreadRiskGate {
  maxSpreadToleranceBps: number; // 25 bps = 0.25%
  currentSpreadBps: number; // current bid-ask spread in bps
  isSpreadGateOpen: boolean; // open if currentSpread <= maxSpreadTolerance
  baseOrderSizeUSD: number; // $10.00 base sizing
  currentDynamicSizingUSD: number;
  blockedOrdersCount: number;
}

export interface VolatilityExpansionRatio {
  currentRatio: number; // shortTermVol / longTermVol
  shortTermVol: number;
  longTermVol: number;
  threshold: number; // e.g. 2.5
  status: 'NORMAL' | 'EXPANDING' | 'CIRCUIT_BREAKER_HALT';
}

export interface GraduatedAutonomy {
  score: number; // 0 - 100
  stage: 0 | 1 | 2 | 3;
  stageName: string;
  sharpeFactor: number;
  sincerityFactor: number;
  attestationFactor: number;
  drawdownPenalty: number;
}

// --- Week 4 Upgrade: LVR & Split Routing Types ---
export interface LVRMetrics {
  currentDailyLVRUSD: number; // LVR_t = int (sigma_s^2 / 8) * L_avg * S ds
  estimatedFeeRevenueUSD: number;
  lvrDragRatio: number; // dailyLVR / estimatedFeeRevenue
  sigmaTick: number; // tick variance
  poolLiquidityUSD: number; // active liquidity
  isToxicRegime: boolean; // true if dailyLVR > estimatedFeeRevenue
  activeFeeTierDiverted: number; // e.g. 500 bps -> 3000 bps
  regimeReason: string;
}

export interface SplitRouteAllocation {
  tier: '500bps' | '3000bps' | '10000bps';
  feeBps: number;
  fractionPct: number; // e.g. 80, 20
  allocatedAmountUSD: number;
  expectedOutputBTC: number;
  poolPriceImpactPct: number;
  quoterV2GasUnits: number;
}

export interface SplitRouteResult {
  totalAmountUSD: number;
  totalOutputBTC: number;
  weightedPriceImpactPct: number;
  allocations: SplitRouteAllocation[];
  slippageKylesLambdaPct: number;
  isLVRDiverted: boolean;
  feeSavingsUSD: number;
}

export interface KylesLambdaParameters {
  k1: number; // tick variance weight (e.g. 0.35)
  k2: number; // order impact weight (e.g. 0.045)
  lambda: number; // Kyle's Lambda parameter (e.g. 0.0018)
  sigmaTick: number; // tick variance
  tradeAmount: number; // trade size USD
  sMin: number; // min slippage bound (e.g. 0.05%)
  sMax: number; // max slippage bound (e.g. 1.00%)
  calculatedSlippagePct: number;
}

export interface AtomicCommandDetail {
  code: '0x0a' | '0x00' | '0x0c';
  name: string;
  description: string;
  gasLimit: number;
  status: 'READY' | 'ENCODED' | 'DISPATCHED';
}

export interface AtomicTripleCommandState {
  commands: AtomicCommandDetail[];
  calldataHex: string;
  deadlineSeconds: number; // 12 seconds = exactly 1 Ethereum block
  deadlineTimestamp: number;
  privateRPC: string; // Private builder RPC (e.g. Flashbots / Titan)
  jitDefenseActive: boolean;
  blockTarget: number;
  lastTxHash?: string;
}

// --- Physical Substrate & Mesh Upgrades ---
export interface ZipfStegoPacket {
  encodedText: string;
  decodedPayload: string;
  latencyMs: number; // Target < 1.5ms
  cpuOverheadPct: number; // ~0.02%
  zipfRankAverage: number;
  bitDensity: number;
  carrierWords: { subject: string; verb: string; object: string }[];
  verifiedLossless: boolean;
}

export interface CpuCorePinningState {
  pinnedCores: number[]; // [4, 5, 6, 7] Performance Cores (Cortex-X4 / A720)
  efficiencyCoresMasked: number[]; // [0, 1, 2, 3] Efficiency Cores (Cortex-A520)
  tasksetCommand: string; // taskset -c 4-7 llama-server -t 4 -b 512 --prompt-cache-all
  threadCount: number; // 4 threads
  batchSize: number; // 512
  promptCacheAll: boolean;
  inferenceLatencyMs: number; // ~220ms vs 14,000ms unpinned
  thermalZoneTempC: number;
  governor: 'performance' | 'schedutil' | 'powersave';
  affinityLocked: boolean;
}

// --- Supervisory Agent: Sincerity & Graduated Autonomy ---
export type SupervisorStage = 'Infancy' | 'Maturation' | 'Sovereignty';

export interface SupervisorPrivileges {
  fileSystemWrites: boolean;
  shellAccess: boolean;
  meshRouting: boolean;
  maxOrderSizeUSD: number;
  atomicTripleExecution: boolean;
}

export interface GraduatedAutonomySupervisor {
  compositeReputationScore: number; // R = 0.4 * S_sincerity + 0.4 * C_hermetic + 0.2 * T_uptime
  sincerityScore: number; // 0 - 100
  hermeticScore: number; // 0 - 100
  uptimeScore: number; // 0 - 100
  weights: { sincerity: number; hermetic: number; uptime: number };
  stage: 0 | 1 | 2;
  stageName: SupervisorStage;
  privileges: SupervisorPrivileges;
}

export interface AgentQuorumVote {
  agentId: string;
  agentName: string;
  type: 'ALPHA' | 'SIGMA' | 'OMEGA';
  vote: 'APPROVE' | 'REJECT' | 'NEUTRAL';
  confidence: number;
  rationale: string;
}

export interface SwapRoute {
  id: string;
  protocol: 'Uniswap V3' | 'DEXScreener Liquidity Pool' | 'Curve TriCrypto';
  pair: string;
  feeTier: string;
  estimatedOutput: string;
  priceImpactPct: number;
  gasEstimateGwei: number;
  spreadPct: number;
  isApprovedByGate: boolean;
}

export interface CircuitBreakerState {
  isTripped: boolean;
  tripReason?: string;
  trippedAt?: number;
  autoResetCooldownSeconds: number;
}

export interface RouterContractState {
  spreadRiskGate: SpreadRiskGate;
  ver: VolatilityExpansionRatio;
  graduatedAutonomy: GraduatedAutonomy;
  quorumVotes: AgentQuorumVote[];
  circuitBreaker: CircuitBreakerState;
  activeRoutes: SwapRoute[];
  totalExecutedVolumeUSD: number;
  
  // Week 4 Quantitative Execution Additions
  lvrMetrics: LVRMetrics;
  splitRoute: SplitRouteResult;
  kylesLambda: KylesLambdaParameters;
  atomicTripleCommand: AtomicTripleCommandState;
}

// --- Full Node State ---
export interface NodeState {
  price: number;
  mode: TradingMode;
  activeAgentId: string;
  agents: Agent[];
  status: MetamatrixStatus;
  orders: TradeOrder[];
  processorOutput: ProcessorOutput[];
  latentTrajectories: LatentTrajectoryPoint[];
  processorConfig: ProcessorConfig;
  activityLogs: ActivityEntry[];
  metrics: ArticleMetrics;
  
  // Hermetic 5-Layer Stack Extensions
  enclaveHardware: EnclaveHardwareState;
  sincerityMetrics: SincerityMetrics;
  autoDream: AutoDreamState;
  frequencyOracle: FrequencyVector;
  sigstoreAttestation: SigstoreAttestation;
  routerContract: RouterContractState;

  // Week 4 Hardware & Supervisory Additions
  stegoMesh: ZipfStegoPacket;
  cpuPinning: CpuCorePinningState;
  supervisor: GraduatedAutonomySupervisor;
}
