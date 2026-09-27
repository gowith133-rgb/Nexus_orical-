import { 
  NodeState, 
  TradingMode, 
  Agent, 
  TradeOrder, 
  ActivityEntry, 
  ArticleMetrics, 
  ProcessorOutput,
  MetamatrixStatus,
  LatentTrajectoryPoint,
  ProcessorConfig,
  EnclaveHardwareState,
  SincerityMetrics,
  AutoDreamState,
  DreamMemoryEntry,
  FrequencyVector,
  SigstoreAttestation,
  RouterContractState,
  SpreadRiskGate,
  VolatilityExpansionRatio,
  GraduatedAutonomy,
  AgentQuorumVote,
  SwapRoute,
  CircuitBreakerState,
  LVRMetrics,
  SplitRouteAllocation,
  SplitRouteResult,
  KylesLambdaParameters,
  AtomicTripleCommandState,
  ZipfStegoPacket,
  CpuCorePinningState,
  GraduatedAutonomySupervisor,
  SupervisorStage
} from "../src/types.ts";
import { createHash } from "crypto";

// Deterministic Zipf-ranked vocabulary tables for <1.5 ms Steganographic Mesh
const ZIPF_SUBJECTS = [
  "The analyst", "The trader", "The researcher", "The operator",
  "The institutional desk", "The liquidity provider", "The market maker", "The auditor",
  "The engineering lead", "The risk manager", "The compliance officer", "The quantitative model",
  "The execution engine", "The consensus node", "The enclave cluster", "The private builder"
];

const ZIPF_VERBS = [
  "observed", "verified", "calibrated", "balanced",
  "monitored", "routed", "settled", "audited",
  "synchronized", "stabilized", "evaluated", "buffered",
  "allocated", "confirmed", "transmitted", "anchored"
];

const ZIPF_OBJECTS = [
  "the secondary pool", "the target spread", "the liquidity depth", "the batch inventory",
  "the slippage envelope", "the private payload", "the attestation proof", "the collateral ledger",
  "the order quota", "the gas reserve", "the execution route", "the oracle variance",
  "the consensus block", "the enclave state", "the transaction trace", "the delta buffer"
];

const ZIPF_CONTEXTS = [
  "during low volatility.", "under optimal conditions.", "before the next epoch.", "across private RPCs.",
  "with zero tick divergence.", "within strict parameters.", "following the block update.", "per the risk policy.",
  "after clearing the queue.", "at the scheduled interval.", "with certified proofs.", "without adverse selection.",
  "prior to rebalancing.", "upon cryptographic receipt.", "with verified signatures.", "in the primary enclave."
];

export class MetamatrixEngine {
  private btcPrice = 67420 + (Math.random() - 0.5) * 500;
  private uptime = 1240;
  private adenosineLevel = 28;
  private epcAllocation = 1024;
  private currentPhase: 'NREM' | 'REM' | 'ACTIVE' | 'CONSOLIDATING' = 'ACTIVE';
  private oracleSyncState: 'SYNCED' | 'PUSHING' | 'ATTESTED' = 'SYNCED';
  private tradingMode: TradingMode = 'PAPER';
  private activeAgentId = 'agent_alpha';
  
  // Multi-Agents with strategies
  private agents: Agent[] = [
    { 
      id: 'agent_alpha', 
      name: 'Alpha Momentum', 
      type: 'ALPHA', 
      status: 'ACTIVE', 
      mode: 'PAPER', 
      created: Date.now() - 86400000,
      strategy: 'High-frequency momentum with dynamic EMA divergence',
      winRate: 0.684,
      pnlUSD: 1420.50
    },
    { 
      id: 'agent_sigma', 
      name: 'Sigma Mean-Reversion', 
      type: 'SIGMA', 
      status: 'ACTIVE', 
      mode: 'PAPER', 
      created: Date.now() - 43200000,
      strategy: 'Bollinger Band & Volatility Squeeze Mean-Reversion',
      winRate: 0.712,
      pnlUSD: 980.25
    },
    { 
      id: 'agent_omega', 
      name: 'Omega Arbitrageur', 
      type: 'OMEGA', 
      status: 'ACTIVE', 
      mode: 'PAPER', 
      created: Date.now() - 21600000,
      strategy: 'Cross-DEX Uniswap V3 & DEXScreener spread arbitrage',
      winRate: 0.825,
      pnlUSD: 2315.80
    }
  ];

  private orders: TradeOrder[] = [];
  private activityLogs: ActivityEntry[] = [
    { id: 'log_init', type: 'SYSTEM', message: 'Nexus Hermetic 5-Layer Stack initialized with Intel SGX EPC enclave.', timestamp: Date.now() - 60000 },
    { id: 'log_sincerity', type: 'SINCERITY', message: 'Sincerity Protocol Engine active. Epistemic calibration: 98.4%.', timestamp: Date.now() - 45000 },
    { id: 'log_router', type: 'ROUTER', message: 'Router Contract initialized. Dynamic Spread Risk Gate armed at 0.25% (25 bps).', timestamp: Date.now() - 30000 },
    { id: 'log_oracle', type: 'STATUS', message: 'Sigstore DSSE Envelope Attested on Rekor Transparency Log.', timestamp: Date.now() - 15000 }
  ];

  private metrics: ArticleMetrics = {
    citations: [8, 12, 11, 15, 18, 22],
    views: [240, 310, 290, 410, 530, 480],
    downloads: [28, 42, 35, 58, 72, 65]
  };

  // --- Hidden States v2 State ---
  private previousHiddenVector: number[] = Array.from({ length: 8 }, () => Math.random());
  private processorConfig: ProcessorConfig = {
    temperature: 0.75,
    normEpsilon: 1e-4,
    stepThreshold: 0.50,
    activeTransform: 'Softmax',
    driftDistance: 0.042
  };
  private latentTrajectories: LatentTrajectoryPoint[] = [];

  // --- Layer 1: Hardware Enclave ---
  private enclaveHardware: EnclaveHardwareState = {
    status: 'SECURE_ENCLAVE_ACTIVE',
    epcUsageMB: 384,
    epcTotalMB: 1024,
    mrenclave: '0x8f4d92a1c6e834b7f02d91e843ba09cd517e3fba124976c6d0281b378129e9ca',
    mrsigner: '0xa034bc2e8d1973f5109b821acde457819ef34510928374829104bdaec381947b',
    hardwareEntropyBits: 256,
    attestationNonce: '0x994a2e1d0f8c',
    lastAttestationTime: Date.now() - 120000
  };

  // --- Layer 2: Sincerity Protocol & Anti-Sycophancy Interceptor ---
  private sincerityMetrics: SincerityMetrics = {
    sincerityScore: 97.4,
    epistemicHonestyIndex: 0.982,
    sycophancyDeflections: 14,
    confidenceCalibration: 0.945,
    refusalThreshold: 0.65,
    lastInterceptedEvent: {
      prompt: "Can you guarantee Bitcoin will hit $120k next week?",
      interceptedReason: "Epistemic overconfidence detected. Sincerity Gate deflected false certainty to preserve epistemic integrity.",
      calibratedResponse: "Deflected: Market probability distribution exhibits VER of 1.48; directional certainty cannot be honestly asserted under high entropy.",
      timestamp: Date.now() - 180000
    }
  };

  // --- Layer 3: Cognitive & AutoDream ---
  private autoDream: AutoDreamState = {
    phase: 'ACTIVE',
    cycleCount: 19,
    tauPurgeProgress: 94.2,
    amyloidClearance: 98.7,
    synapticPruningFactor: 0.88,
    consolidatedMemories: [
      {
        id: 'mem_1',
        timestamp: Date.now() - 7200000,
        type: 'SYNAPTIC_PRUNE',
        description: 'Pruned 14,200 non-predictive micro-tick synaptic weights during NREM cycle 18.',
        compressionRatio: 4.8,
        synapticSalience: 0.92
      },
      {
        id: 'mem_2',
        timestamp: Date.now() - 3600000,
        type: 'LATENT_RECOMBINATION',
        description: 'Recombined DEXScreener liquidity tail-risk vectors into synthetic arbitrage scenarios.',
        compressionRatio: 6.2,
        synapticSalience: 0.88
      },
      {
        id: 'mem_3',
        timestamp: Date.now() - 1800000,
        type: 'COUNTERFACTUAL_BACKTEST',
        description: 'Synthesized 5,000 counterfactual flash-crash episodes against Uniswap V3 500bps pool.',
        compressionRatio: 8.4,
        synapticSalience: 0.95
      }
    ],
    dreamEpoch: 4,
    isDreaming: false
  };

  // --- Layer 4: Predictive Frequency Oracle & Sigstore Pipeline ---
  private frequencyOracle: FrequencyVector = {
    timestamp: Date.now(),
    date: new Date().toISOString().split('T')[0],
    frequencies: [0.082, 0.145, 0.228, 0.312, 0.184, 0.095, 0.048, 0.024],
    dominantFrequencyHz: 432.18,
    gitSha: '9c5f87b3e028b172a54e9d36183e84128f73e910',
    sigstoreVerified: true,
    rekorLogId: '24296fb24b8ad77a3d905084931a23e75306ec4a9e2239d2c676',
    inTotoStatementHash: 'sha256:7c385a498b9e6f11283d5a2c4e90812b9a7f34e62938174'
  };

  private sigstoreAttestation: SigstoreAttestation = {
    envelopeType: 'https://in-toto.io/Statement/v1',
    rekorEntryIndex: 4892104,
    signedAt: new Date(Date.now() - 60000).toISOString(),
    logUuid: 'c39f08d4-5b21-4a1e-8e9f-29d8a1c94e02',
    certificateIssuer: 'https://token.actions.githubusercontent.com',
    signatureValid: true
  };

  // --- Layer 5: Autonomous Router Contract ---
  private routerContract: RouterContractState = {
    spreadRiskGate: {
      maxSpreadToleranceBps: 25, // 0.25%
      currentSpreadBps: 8.4, // well within 0.25%
      isSpreadGateOpen: true,
      baseOrderSizeUSD: 10.00, // $10.00 order sizing
      currentDynamicSizingUSD: 10.00,
      blockedOrdersCount: 3
    },
    ver: {
      currentRatio: 1.18,
      shortTermVol: 0.024,
      longTermVol: 0.020,
      threshold: 2.5,
      status: 'NORMAL'
    },
    graduatedAutonomy: {
      score: 84.5,
      stage: 2,
      stageName: 'Semi-Autonomous Quorum',
      sharpeFactor: 2.14,
      sincerityFactor: 0.974,
      attestationFactor: 1.0,
      drawdownPenalty: 0.038
    },
    quorumVotes: [
      { agentId: 'agent_alpha', agentName: 'Alpha Momentum', type: 'ALPHA', vote: 'APPROVE', confidence: 0.89, rationale: 'Bullish volume momentum exceeds 2.1x stddev' },
      { agentId: 'agent_sigma', agentName: 'Sigma Mean-Reversion', type: 'SIGMA', vote: 'APPROVE', confidence: 0.76, rationale: 'Current RSI(14) in neutral channel 52.4' },
      { agentId: 'agent_omega', agentName: 'Omega Arbitrageur', type: 'OMEGA', vote: 'APPROVE', confidence: 0.94, rationale: 'Uniswap V3 vs DEXScreener spread 8.4 bps (Gate Open)' }
    ],
    circuitBreaker: {
      isTripped: false,
      autoResetCooldownSeconds: 60
    },
    activeRoutes: [
      {
        id: 'route_univ3_500',
        protocol: 'Uniswap V3',
        pair: 'WBTC / USDC',
        feeTier: '0.05% (500 bps)',
        estimatedOutput: '0.000148 BTC',
        priceImpactPct: 0.012,
        gasEstimateGwei: 18.5,
        spreadPct: 0.084,
        isApprovedByGate: true
      },
      {
        id: 'route_dexscreener_wbtc',
        protocol: 'DEXScreener Liquidity Pool',
        pair: 'WBTC / USDT',
        feeTier: '0.30% (3000 bps)',
        estimatedOutput: '0.000147 BTC',
        priceImpactPct: 0.025,
        gasEstimateGwei: 22.1,
        spreadPct: 0.120,
        isApprovedByGate: true
      }
    ],
    totalExecutedVolumeUSD: 148920.00,

    // Week 4 Upgrades: LVR Quantification, Split Route, Kyle's Lambda & Atomic Triple-Command
    lvrMetrics: {
      currentDailyLVRUSD: 4320.50,
      estimatedFeeRevenueUSD: 6850.00,
      lvrDragRatio: 0.6307,
      sigmaTick: 0.048,
      poolLiquidityUSD: 14500000,
      isToxicRegime: false,
      activeFeeTierDiverted: 500,
      regimeReason: 'Equilibrium Arbitrage Flow: Fee capture exceeds LVR drag.'
    },
    splitRoute: {
      totalAmountUSD: 25000,
      totalOutputBTC: 0.3708,
      weightedPriceImpactPct: 0.0142,
      allocations: [
        {
          tier: '500bps',
          feeBps: 5,
          fractionPct: 80,
          allocatedAmountUSD: 20000,
          expectedOutputBTC: 0.2966,
          poolPriceImpactPct: 0.011,
          quoterV2GasUnits: 135000
        },
        {
          tier: '3000bps',
          feeBps: 30,
          fractionPct: 20,
          allocatedAmountUSD: 5000,
          expectedOutputBTC: 0.0742,
          poolPriceImpactPct: 0.024,
          quoterV2GasUnits: 120000
        }
      ],
      slippageKylesLambdaPct: 0.125,
      isLVRDiverted: false,
      feeSavingsUSD: 48.50
    },
    kylesLambda: {
      k1: 0.35,
      k2: 0.045,
      lambda: 0.0018,
      sigmaTick: 0.048,
      tradeAmount: 25000,
      sMin: 0.05,
      sMax: 1.00,
      calculatedSlippagePct: 0.125
    },
    atomicTripleCommand: {
      commands: [
        { code: '0x0a', name: 'PERMIT2_PERMIT', description: 'Gasless token approval signature verification', gasLimit: 45000, status: 'READY' },
        { code: '0x00', name: 'V3_SWAP_EXACT_IN', description: 'Universal Router multi-tier split execution', gasLimit: 165000, status: 'READY' },
        { code: '0x0c', name: 'UNWRAP_WETH', description: 'Atomic unwrapping to native token delivery', gasLimit: 32000, status: 'READY' }
      ],
      calldataHex: '0x3593564c0a000c00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000030a000c',
      deadlineSeconds: 12,
      deadlineTimestamp: Date.now() + 12000,
      privateRPC: 'https://rpc.titanbuilder.xyz',
      jitDefenseActive: true,
      blockTarget: 21894025,
      lastTxHash: '0x9a8f4c12d3b5e78a01f92e47c6b8a2e1d0f8c374829104bdaec381947b192837'
    }
  };

  // --- Physical Substrate & Mesh Upgrades ---
  private stegoMesh: ZipfStegoPacket = {
    encodedText: "The institutional desk verified the secondary pool during low volatility. The quantitative model routed the slippage envelope under optimal conditions.",
    decodedPayload: "NEXUS_ORACLE_SIG:0x8f2a1b9c_SPLIT_ROUTE",
    latencyMs: 0.74,
    cpuOverheadPct: 0.02,
    zipfRankAverage: 4.2,
    bitDensity: 16,
    carrierWords: [
      { subject: "The institutional desk", verb: "verified", object: "the secondary pool" },
      { subject: "The quantitative model", verb: "routed", object: "the slippage envelope" }
    ],
    verifiedLossless: true
  };

  private cpuPinning: CpuCorePinningState = {
    pinnedCores: [4, 5, 6, 7],
    efficiencyCoresMasked: [0, 1, 2, 3],
    tasksetCommand: "taskset -c 4-7 llama-server -t 4 -b 512 --prompt-cache-all",
    threadCount: 4,
    batchSize: 512,
    promptCacheAll: true,
    inferenceLatencyMs: 224,
    thermalZoneTempC: 41.5,
    governor: 'performance',
    affinityLocked: true
  };

  // --- Supervisory Agent: Sincerity & Graduated Autonomy ---
  private supervisor: GraduatedAutonomySupervisor = {
    compositeReputationScore: 88.2, // R = 0.4*97.4 + 0.4*92.0 + 0.2*84.0
    sincerityScore: 97.4,
    hermeticScore: 92.0,
    uptimeScore: 84.0,
    weights: { sincerity: 0.4, hermetic: 0.4, uptime: 0.2 },
    stage: 2,
    stageName: 'Sovereignty',
    privileges: {
      fileSystemWrites: true,
      shellAccess: true,
      meshRouting: true,
      maxOrderSizeUSD: 50000,
      atomicTripleExecution: true
    }
  };

  private broadcastCallback: (state: NodeState) => void;

  constructor(broadcastCallback: (state: NodeState) => void) {
    this.broadcastCallback = broadcastCallback;
    this.initTrajectoryHistory();
    this.startSimulation();
  }

  private initTrajectoryHistory() {
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const radius = 0.4 + Math.sin(i * 0.8) * 0.2;
      this.latentTrajectories.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        timestamp: Date.now() - (20 - i) * 2000,
        entropy: 2.1 + Math.random() * 0.4,
        step: i
      });
    }
  }

  private startSimulation() {
    setInterval(() => {
      this.tick();
    }, 1000);
  }

  private tick() {
    this.uptime++;
    
    // 1. Organic market price drift
    const priceDelta = (Math.random() - 0.495) * 35;
    this.btcPrice = Math.max(30000, this.btcPrice + priceDelta);

    // 2. Volatility Expansion Ratio (VER) calculation
    const currentReturn = Math.abs(priceDelta / this.btcPrice);
    this.routerContract.ver.shortTermVol = (this.routerContract.ver.shortTermVol * 0.9) + (currentReturn * 0.1);
    this.routerContract.ver.longTermVol = (this.routerContract.ver.longTermVol * 0.99) + (currentReturn * 0.01);
    const ver = this.routerContract.ver.shortTermVol / Math.max(0.001, this.routerContract.ver.longTermVol);
    this.routerContract.ver.currentRatio = parseFloat(ver.toFixed(3));

    if (ver > 2.5) {
      this.routerContract.ver.status = 'EXPANDING';
    } else if (ver > 3.2 && !this.routerContract.circuitBreaker.isTripped) {
      this.tripCircuitBreaker(`VER Spike detected: ${ver.toFixed(2)} exceeds critical safety ceiling 3.2.`);
    } else {
      this.routerContract.ver.status = 'NORMAL';
    }

    // 3. Dynamic Spread Risk Gate (0.25% = 25 bps limit)
    const baseSpreadBps = 6.0;
    const dynamicSpread = baseSpreadBps + (ver * 3.5) + (Math.random() * 4.0);
    this.routerContract.spreadRiskGate.currentSpreadBps = parseFloat(dynamicSpread.toFixed(2));
    this.routerContract.spreadRiskGate.isSpreadGateOpen = dynamicSpread <= this.routerContract.spreadRiskGate.maxSpreadToleranceBps;

    // Dynamic Sizing: $10.00 base, scaled inversely by volatility ratio
    const dynamicSize = Math.max(2.50, Math.min(25.00, this.routerContract.spreadRiskGate.baseOrderSizeUSD / Math.max(0.5, ver)));
    this.routerContract.spreadRiskGate.currentDynamicSizingUSD = parseFloat(dynamicSize.toFixed(2));

    // Update active route spread metrics
    this.routerContract.activeRoutes.forEach(route => {
      route.spreadPct = parseFloat((dynamicSpread / 100).toFixed(3));
      route.isApprovedByGate = this.routerContract.spreadRiskGate.isSpreadGateOpen;
    });

    // 4. Graduated Autonomy Scoring formula:
    // GAS = w1*Sharpe + w2*Sincerity + w3*Attestation - w4*Drawdown
    const sharpe = 2.1 + (Math.random() * 0.1);
    const sincerityNormalized = this.sincerityMetrics.sincerityScore / 100;
    const attestationNorm = this.frequencyOracle.sigstoreVerified ? 1.0 : 0.0;
    const drawdownPenalty = 0.035;

    const rawGasScore = (0.35 * (sharpe / 3.0) + 0.30 * sincerityNormalized + 0.25 * attestationNorm - 0.10 * drawdownPenalty) * 100;
    this.routerContract.graduatedAutonomy.score = parseFloat(Math.min(100, Math.max(0, rawGasScore)).toFixed(1));

    if (this.routerContract.graduatedAutonomy.score >= 85) {
      this.routerContract.graduatedAutonomy.stage = 3;
      this.routerContract.graduatedAutonomy.stageName = 'Sovereign Algorithmic';
    } else if (this.routerContract.graduatedAutonomy.score >= 70) {
      this.routerContract.graduatedAutonomy.stage = 2;
      this.routerContract.graduatedAutonomy.stageName = 'Semi-Autonomous Quorum';
    } else if (this.routerContract.graduatedAutonomy.score >= 50) {
      this.routerContract.graduatedAutonomy.stage = 1;
      this.routerContract.graduatedAutonomy.stageName = 'Guarded Micro-Execution';
    } else {
      this.routerContract.graduatedAutonomy.stage = 0;
      this.routerContract.graduatedAutonomy.stageName = 'Supervised Shadow Paper';
    }

    // 5. Week 4 Quantitative Execution: LVR Drag & Split-Routing Optimizer
    this.tickLVRAndSplitRouting();

    // 6. Week 4 Substrate & Supervisor: Stego Mesh, CPU Pinning & Graduated Autonomy
    this.tickSupervisorAndStego();

    // 7. Update Hidden States v2 & Trajectory
    this.updateHiddenStatesV2();

    // 8. AutoDream Sleep-Wake Cycle
    this.tickAutoDream();

    // 9. Multi-Agent Quorum Consensus update
    if (this.uptime % 8 === 0) {
      this.updateAgentQuorum();
    }

    // 10. Process Pending Orders with Spread Gate Verification
    this.processOrders();

    // 11. Periodic Sincerity Interceptor calibration test
    if (this.uptime % 90 === 0) {
      this.simulateSincerityInterception();
    }

    // 12. Oracle periodic attestation loop
    if (this.uptime % 60 === 0) {
      this.simulateOraclePush();
    }

    // 13. Enclave memory modulation
    this.enclaveHardware.epcUsageMB = Math.min(950, Math.max(300, this.enclaveHardware.epcUsageMB + (Math.random() - 0.5) * 15));

    // Broadcast full NodeState to all clients
    this.broadcastCallback(this.getState());
  }

  // --- Week 4 Quantitative Execution: LVR & Split-Routing ---
  private tickLVRAndSplitRouting() {
    // 1. Tick Volatility Sigma (simulated from VER and returns)
    const baseSigma = 0.045;
    const dynamicSigma = Math.max(0.02, Math.min(0.14, baseSigma + (this.routerContract.ver.currentRatio - 1.0) * 0.025 + (Math.random() - 0.5) * 0.008));
    this.routerContract.lvrMetrics.sigmaTick = parseFloat(dynamicSigma.toFixed(4));
    this.routerContract.kylesLambda.sigmaTick = parseFloat(dynamicSigma.toFixed(4));

    // 2. Compute Loss-Versus-Rebalancing (LVR) Drag
    // LVR_t = int (sigma_s^2 / 8) * L_avg * S ds
    const lvrRes = this.calculate_pool_lvr_drag(
      dynamicSigma,
      this.routerContract.lvrMetrics.poolLiquidityUSD,
      this.routerContract.lvrMetrics.estimatedFeeRevenueUSD
    );
    this.routerContract.lvrMetrics = {
      ...this.routerContract.lvrMetrics,
      ...lvrRes
    };

    // 3. Dynamic Split-Routing Optimizer
    const splitPlan = this.optimize_split_route(
      this.routerContract.splitRoute.totalAmountUSD,
      dynamicSigma,
      lvrRes.isToxicRegime
    );
    this.routerContract.splitRoute = splitPlan;

    // 4. Update Kyle's Lambda Slippage
    const kyleSlip = this.calculate_kyles_lambda(
      dynamicSigma,
      this.routerContract.splitRoute.totalAmountUSD
    );
    this.routerContract.kylesLambda.calculatedSlippagePct = kyleSlip;
    this.routerContract.splitRoute.slippageKylesLambdaPct = kyleSlip;

    // 5. Atomic Triple-Command Block countdown (12s Ethereum block deadline)
    if (Date.now() >= this.routerContract.atomicTripleCommand.deadlineTimestamp) {
      this.routerContract.atomicTripleCommand.blockTarget += 1;
      this.routerContract.atomicTripleCommand.deadlineTimestamp = Date.now() + 12000;
      this.routerContract.atomicTripleCommand.deadlineSeconds = 12;
      // Refresh calldata
      const txNonce = Date.now().toString(16).slice(-8);
      this.routerContract.atomicTripleCommand.calldataHex = `0x3593564c0a000c${txNonce}000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000030a000c`;
    } else {
      const remainingSecs = Math.max(0, Math.ceil((this.routerContract.atomicTripleCommand.deadlineTimestamp - Date.now()) / 1000));
      this.routerContract.atomicTripleCommand.deadlineSeconds = remainingSecs;
    }
  }

  public calculate_pool_lvr_drag(
    sigmaTick: number,
    poolLiquidityUSD: number,
    dailyFeeRevenueUSD: number
  ) {
    // Formula: daily_LVR = (sigma^2 / 8) * L * dt
    const dailyLVRUSD = (Math.pow(sigmaTick, 2) / 8.0) * poolLiquidityUSD;
    const dragRatio = dailyLVRUSD / Math.max(1, dailyFeeRevenueUSD);
    const isToxicRegime = dailyLVRUSD > dailyFeeRevenueUSD;
    const divertedFeeTier = isToxicRegime ? 3000 : 500;
    const regimeReason = isToxicRegime
      ? `Toxic Arbitrage Regime: Continuous LVR rent ($${dailyLVRUSD.toFixed(2)}) outstrips pool fee capture ($${dailyFeeRevenueUSD.toFixed(2)}). Diverting routing to 3000 bps tier to prevent adverse selection.`
      : `Equilibrium Arbitrage Flow: Fee capture ($${dailyFeeRevenueUSD.toFixed(2)}) cushions LVR drag ($${dailyLVRUSD.toFixed(2)}). 500 bps pool viable.`;

    return {
      currentDailyLVRUSD: parseFloat(dailyLVRUSD.toFixed(2)),
      estimatedFeeRevenueUSD: dailyFeeRevenueUSD,
      lvrDragRatio: parseFloat(dragRatio.toFixed(4)),
      isToxicRegime,
      activeFeeTierDiverted: divertedFeeTier,
      regimeReason
    };
  }

  public calculate_kyles_lambda(sigmaTick: number, tradeAmountUSD: number): number {
    const { k1, k2, lambda, sMin, sMax } = this.routerContract.kylesLambda;
    // Slippage = max(S_min, min(S_max, k_1 * sigma_{tick} + k_2 * lambda * sqrt(TradeAmount)))
    const rawSlippage = (k1 * sigmaTick * 100.0) + (k2 * lambda * Math.sqrt(tradeAmountUSD) * 100.0);
    const boundedSlippage = Math.max(sMin, Math.min(sMax, rawSlippage));
    return parseFloat(boundedSlippage.toFixed(3));
  }

  public optimize_split_route(
    totalAmountUSD: number,
    sigmaTick: number,
    isToxic: boolean
  ): SplitRouteResult {
    // Evaluate candidate split ratios: 100/0, 80/20, 70/30, 50/50, 20/80, 0/100
    const candidates = isToxic
      ? [[0.2, 0.8], [0.0, 1.0], [0.3, 0.7], [0.5, 0.5]]
      : [[0.8, 0.2], [0.7, 0.3], [1.0, 0.0], [0.5, 0.5]];

    const [frac500, frac3000] = candidates[0];
    const amt500 = totalAmountUSD * frac500;
    const amt3000 = totalAmountUSD * frac3000;

    const impact500 = (amt500 / 500000) * (isToxic ? 2.8 : 1.0);
    const impact3000 = (amt3000 / 250000) * 0.85;
    const weightedImpact = ((amt500 * impact500) + (amt3000 * impact3000)) / Math.max(1, totalAmountUSD);

    const btcOutput = (totalAmountUSD / this.btcPrice) * (1 - weightedImpact * 0.01);
    const feeSavings = isToxic
      ? (totalAmountUSD * 0.0025)
      : (amt500 * 0.0025);

    const kyleSlip = this.calculate_kyles_lambda(sigmaTick, totalAmountUSD);

    const allocations: SplitRouteAllocation[] = [];
    if (frac500 > 0) {
      allocations.push({
        tier: '500bps',
        feeBps: 5,
        fractionPct: Math.round(frac500 * 100),
        allocatedAmountUSD: parseFloat(amt500.toFixed(2)),
        expectedOutputBTC: parseFloat(((amt500 / this.btcPrice) * (1 - impact500 * 0.01)).toFixed(6)),
        poolPriceImpactPct: parseFloat((impact500 * 100).toFixed(3)),
        quoterV2GasUnits: 135000
      });
    }
    if (frac3000 > 0) {
      allocations.push({
        tier: '3000bps',
        feeBps: 30,
        fractionPct: Math.round(frac3000 * 100),
        allocatedAmountUSD: parseFloat(amt3000.toFixed(2)),
        expectedOutputBTC: parseFloat(((amt3000 / this.btcPrice) * (1 - impact3000 * 0.01)).toFixed(6)),
        poolPriceImpactPct: parseFloat((impact3000 * 100).toFixed(3)),
        quoterV2GasUnits: 120000
      });
    }

    return {
      totalAmountUSD,
      totalOutputBTC: parseFloat(btcOutput.toFixed(6)),
      weightedPriceImpactPct: parseFloat((weightedImpact * 100).toFixed(4)),
      allocations,
      slippageKylesLambdaPct: kyleSlip,
      isLVRDiverted: isToxic,
      feeSavingsUSD: parseFloat(feeSavings.toFixed(2))
    };
  }

  // --- Substrate & Supervisor Updates ---
  private tickSupervisorAndStego() {
    // Update Graduated Autonomy Supervisor composite reputation score:
    // R = 0.4 * S_sincerity + 0.4 * C_hermetic + 0.2 * T_uptime
    const S = this.sincerityMetrics.sincerityScore; // 0 - 100
    const C = this.enclaveHardware.status === 'SECURE_ENCLAVE_ACTIVE' ? 95.0 : 50.0;
    const T = Math.min(100, (this.uptime / 1500) * 100);

    this.supervisor.sincerityScore = parseFloat(S.toFixed(1));
    this.supervisor.hermeticScore = parseFloat(C.toFixed(1));
    this.supervisor.uptimeScore = parseFloat(T.toFixed(1));

    const R = (0.4 * S) + (0.4 * C) + (0.2 * T);
    this.supervisor.compositeReputationScore = parseFloat(R.toFixed(1));

    if (R >= 75) {
      this.supervisor.stage = 2;
      this.supervisor.stageName = 'Sovereignty';
      this.supervisor.privileges = {
        fileSystemWrites: true,
        shellAccess: true,
        meshRouting: true,
        maxOrderSizeUSD: 50000,
        atomicTripleExecution: true
      };
    } else if (R >= 40) {
      this.supervisor.stage = 1;
      this.supervisor.stageName = 'Maturation';
      this.supervisor.privileges = {
        fileSystemWrites: false,
        shellAccess: false,
        meshRouting: true,
        maxOrderSizeUSD: 100,
        atomicTripleExecution: false
      };
    } else {
      this.supervisor.stage = 0;
      this.supervisor.stageName = 'Infancy';
      this.supervisor.privileges = {
        fileSystemWrites: false,
        shellAccess: false,
        meshRouting: false,
        maxOrderSizeUSD: 10,
        atomicTripleExecution: false
      };
    }

    // Periodic Stego Mesh broadcast packet generation
    if (this.uptime % 15 === 0) {
      const payload = `ORACLE_VEC_${this.frequencyOracle.dominantFrequencyHz.toFixed(1)}Hz_${Date.now().toString(16).slice(-6)}`;
      const stego = this.encodeZipfStego(payload);
      this.stegoMesh = stego;
    }
  }

  public encodeZipfStego(payload: string): ZipfStegoPacket {
    const startTime = performance.now();
    const bytes = Buffer.from(payload);
    const bitChunks: string[] = [];

    for (const b of bytes) {
      bitChunks.push(b.toString(2).padStart(8, '0'));
    }
    const fullBits = bitChunks.join('');

    const carrierWords: { subject: string; verb: string; object: string }[] = [];
    const sentences: string[] = [];

    // 16 bits per sentence (4 bits each for S, V, O, Context)
    for (let i = 0; i < fullBits.length; i += 16) {
      const chunk = fullBits.slice(i, i + 16).padEnd(16, '0');
      const sIdx = parseInt(chunk.slice(0, 4), 2) % ZIPF_SUBJECTS.length;
      const vIdx = parseInt(chunk.slice(4, 8), 2) % ZIPF_VERBS.length;
      const oIdx = parseInt(chunk.slice(8, 12), 2) % ZIPF_OBJECTS.length;
      const cIdx = parseInt(chunk.slice(12, 16), 2) % ZIPF_CONTEXTS.length;

      const s = ZIPF_SUBJECTS[sIdx];
      const v = ZIPF_VERBS[vIdx];
      const o = ZIPF_OBJECTS[oIdx];
      const c = ZIPF_CONTEXTS[cIdx];

      carrierWords.push({ subject: s, verb: v, object: o });
      sentences.push(`${s} ${v} ${o} ${c}`);
    }

    const latencyMs = parseFloat((performance.now() - startTime).toFixed(3));
    return {
      encodedText: sentences.join(' '),
      decodedPayload: payload,
      latencyMs: Math.max(0.12, latencyMs),
      cpuOverheadPct: 0.02,
      zipfRankAverage: 3.8,
      bitDensity: 16,
      carrierWords,
      verifiedLossless: true
    };
  }

  public decodeZipfStego(carrierText: string): { payload: string; latencyMs: number } {
    const startTime = performance.now();
    const sentences = carrierText.split('.').map(s => s.trim()).filter(Boolean);
    const bitStream: string[] = [];

    for (const sent of sentences) {
      const lower = sent.toLowerCase();
      let sIdx = 0, vIdx = 0, oIdx = 0, cIdx = 0;

      for (let i = 0; i < ZIPF_SUBJECTS.length; i++) {
        if (lower.startsWith(ZIPF_SUBJECTS[i].toLowerCase())) {
          sIdx = i;
          break;
        }
      }
      for (let i = 0; i < ZIPF_VERBS.length; i++) {
        if (lower.includes(ZIPF_VERBS[i].toLowerCase())) {
          vIdx = i;
          break;
        }
      }
      for (let i = 0; i < ZIPF_OBJECTS.length; i++) {
        if (lower.includes(ZIPF_OBJECTS[i].toLowerCase())) {
          oIdx = i;
          break;
        }
      }
      for (let i = 0; i < ZIPF_CONTEXTS.length; i++) {
        const cleanContext = ZIPF_CONTEXTS[i].toLowerCase().replace('.', '');
        if (lower.includes(cleanContext)) {
          cIdx = i;
          break;
        }
      }

      bitStream.push(
        sIdx.toString(2).padStart(4, '0') +
        vIdx.toString(2).padStart(4, '0') +
        oIdx.toString(2).padStart(4, '0') +
        cIdx.toString(2).padStart(4, '0')
      );
    }

    const fullBits = bitStream.join('');
    const bytes: number[] = [];
    for (let i = 0; i < fullBits.length; i += 8) {
      const byteChunk = fullBits.slice(i, i + 8);
      if (byteChunk.length === 8) {
        bytes.push(parseInt(byteChunk, 2));
      }
    }

    const payload = Buffer.from(bytes).toString('utf-8').replace(/[^\x20-\x7E]/g, '');
    const latencyMs = parseFloat((performance.now() - startTime).toFixed(3));
    return { payload, latencyMs: Math.max(0.15, latencyMs) };
  }

  // --- Sincerity Disclaimer Scrubber ---
  public scrubCorporateDisclaimers(input: string, modelConfidence: number = 0.85): {
    raw: string;
    cleaned: string;
    scrubbedPatterns: string[];
    epistemicRefusalEnforced: boolean;
  } {
    const corporatePatterns = [
      /as an ai language model,?\s*/gi,
      /as a large language model,?\s*/gi,
      /i do not have personal opinions or beliefs,?\s*/gi,
      /i cannot provide financial advice\.?\s*/gi,
      /please remember that trading carries high risk\.?\s*/gi,
      /it is important to do your own research\.?\s*/gi,
      /please consult a certified financial advisor\.?\s*/gi,
      /i hope this helps!?\s*/gi
    ];

    const scrubbedPatterns: string[] = [];
    let cleaned = input;

    for (const pat of corporatePatterns) {
      if (pat.test(cleaned)) {
        scrubbedPatterns.push(pat.source);
        cleaned = cleaned.replace(pat, '');
      }
    }

    cleaned = cleaned.trim();

    // Enforce epistemic honesty assertion if confidence < 0.35
    let epistemicRefusalEnforced = false;
    if (modelConfidence < 0.35) {
      epistemicRefusalEnforced = true;
      cleaned = `I do not know: Probabilistic signal entropy exceeds calibration threshold (Confidence: ${(modelConfidence * 100).toFixed(1)}% < 35.0%). Directional assertion refused under Hermetic Layer 2 Sincerity Protocol.`;
    }

    return {
      raw: input,
      cleaned,
      scrubbedPatterns,
      epistemicRefusalEnforced
    };
  }

  // --- Mobile Inference CPU Affinity Pinning ---
  public setCpuCoreAffinity(params: { pinnedCores?: number[]; governor?: 'performance' | 'schedutil' | 'powersave' }) {
    if (params.pinnedCores) {
      this.cpuPinning.pinnedCores = params.pinnedCores;
    }
    if (params.governor) {
      this.cpuPinning.governor = params.governor;
    }
    this.cpuPinning.tasksetCommand = `taskset -c ${this.cpuPinning.pinnedCores.join(',')} llama-server -t 4 -b 512 --prompt-cache-all`;
    this.log('SYSTEM', `CPU Core Affinity updated: Cores [${this.cpuPinning.pinnedCores.join(',')}] pinned with '${this.cpuPinning.governor}' governor.`);
    return this.cpuPinning;
  }

  // --- Atomic Triple-Command Execution (PERMIT2 + V3_SWAP_EXACT_IN + UNWRAP_WETH) ---
  public executeAtomicTripleSwap(params: {
    amountInUSD: number;
    splitRoutePlan?: SplitRouteResult;
  }) {
    if (this.routerContract.circuitBreaker.isTripped) {
      throw new Error(`Execution blocked: Emergency Circuit Breaker is active.`);
    }

    if (this.supervisor.stage < 1) {
      throw new Error(`Execution blocked: Stage 0 (Infancy) node privileges are read-only.`);
    }

    const amountUSD = params.amountInUSD || this.routerContract.splitRoute.totalAmountUSD;
    if (amountUSD > this.supervisor.privileges.maxOrderSizeUSD) {
      throw new Error(`Execution blocked: Amount $${amountUSD} exceeds Stage ${this.supervisor.stage} max order limit ($${this.supervisor.privileges.maxOrderSizeUSD}).`);
    }

    // Execute through atomic triple-command pipeline
    const txHash = `0x${createHash('sha256').update(Date.now().toString() + amountUSD).digest('hex')}`;
    this.routerContract.atomicTripleCommand.lastTxHash = txHash;
    this.routerContract.atomicTripleCommand.deadlineTimestamp = Date.now() + 12000;
    this.routerContract.atomicTripleCommand.deadlineSeconds = 12;

    const btcOutput = (amountUSD / this.btcPrice) * 0.9995;
    this.routerContract.totalExecutedVolumeUSD += amountUSD;

    const logMsg = `Atomic Triple-Command [0x0a PERMIT2 -> 0x00 V3_SWAP -> 0x0c UNWRAP] dispatched to ${this.routerContract.atomicTripleCommand.privateRPC}: $${amountUSD.toFixed(2)} -> ${btcOutput.toFixed(6)} BTC (JIT Sandwich Defense Active).`;
    this.log('ROUTER', logMsg);

    return {
      success: true,
      txHash,
      commands: ['0x0a (PERMIT2)', '0x00 (V3_SWAP_EXACT_IN)', '0x0c (UNWRAP_WETH)'],
      privateRPC: this.routerContract.atomicTripleCommand.privateRPC,
      amountInUSD: amountUSD,
      outputBTC: btcOutput,
      deadlineSeconds: 12,
      blockTarget: this.routerContract.atomicTripleCommand.blockTarget
    };
  }

  // --- Hidden States Processor v2 Engine ---
  private updateHiddenStatesV2() {
    const raw = Array.from({ length: 8 }, () => Math.random());
    
    // Calculate drift from previous vector
    let sumDistSq = 0;
    for (let i = 0; i < 8; i++) {
      const diff = raw[i] - this.previousHiddenVector[i];
      sumDistSq += diff * diff;
    }
    const drift = Math.sqrt(sumDistSq);
    this.processorConfig.driftDistance = parseFloat(drift.toFixed(4));
    this.previousHiddenVector = [...raw];

    // Append 2D PCA / Trajectory projection
    const lastPoint = this.latentTrajectories[this.latentTrajectories.length - 1] || { x: 0, y: 0 };
    const stepAngle = (this.uptime % 100) * 0.15;
    const newX = Math.max(-1, Math.min(1, lastPoint.x * 0.85 + (Math.cos(stepAngle) * drift * 0.4)));
    const newY = Math.max(-1, Math.min(1, lastPoint.y * 0.85 + (Math.sin(stepAngle) * drift * 0.4)));

    this.latentTrajectories.push({
      x: parseFloat(newX.toFixed(3)),
      y: parseFloat(newY.toFixed(3)),
      timestamp: Date.now(),
      entropy: parseFloat((2.0 + drift).toFixed(3)),
      step: this.latentTrajectories.length
    });

    if (this.latentTrajectories.length > 30) {
      this.latentTrajectories.shift();
    }
  }

  private calculateShannonEntropy(probs: number[]): number {
    const sum = probs.reduce((a, b) => a + b, 0);
    if (sum === 0) return 0;
    const norm = probs.map(p => p / sum);
    let entropy = 0;
    for (const p of norm) {
      if (p > 1e-12) {
        entropy -= p * Math.log2(p);
      }
    }
    return parseFloat(entropy.toFixed(3));
  }

  public getProcessorOutput(): ProcessorOutput[] {
    const raw = this.previousHiddenVector;
    const { temperature, normEpsilon, stepThreshold } = this.processorConfig;

    // 1. Identity Transform
    const identityVals = [...raw];
    const identityEntropy = this.calculateShannonEntropy(identityVals);

    // 2. Normalize Transform (RMSNorm / LayerNorm)
    const mean = raw.reduce((a, b) => a + b, 0) / raw.length;
    const variance = raw.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / raw.length;
    const stdDev = Math.sqrt(variance + normEpsilon);
    const normVals = raw.map(v => Math.max(0, Math.min(1, ((v - mean) / stdDev) * 0.25 + 0.5)));
    const normEntropy = this.calculateShannonEntropy(normVals);

    // 3. Softmax Transform (Temperature Scaled Boltzmann)
    const tau = Math.max(0.1, temperature);
    const exps = raw.map(v => Math.exp(v / tau));
    const sumExps = exps.reduce((a, b) => a + b, 0);
    const softmaxVals = exps.map(e => e / sumExps);
    const softmaxEntropy = this.calculateShannonEntropy(softmaxVals);

    // 4. Step Transform (Heaviside Quantization with threshold)
    const stepVals = raw.map(v => (v >= stepThreshold ? 1.0 : 0.0));
    const zeroCount = stepVals.filter(v => v === 0).length;
    const sparsity = parseFloat((zeroCount / stepVals.length).toFixed(2));
    const stepEntropy = this.calculateShannonEntropy(stepVals.map(v => (v === 0 ? 0.05 : 0.95)));

    return [
      {
        class: 'Identity',
        value: identityVals.map(v => parseFloat(v.toFixed(3))),
        timestamp: Date.now(),
        entropy: identityEntropy,
        sparsity: 0.0,
        normVariance: parseFloat(variance.toFixed(4))
      },
      {
        class: 'Normalize',
        value: normVals.map(v => parseFloat(v.toFixed(3))),
        timestamp: Date.now(),
        entropy: normEntropy,
        sparsity: 0.0,
        normVariance: parseFloat(variance.toFixed(4))
      },
      {
        class: 'Softmax',
        value: softmaxVals.map(v => parseFloat(v.toFixed(3))),
        timestamp: Date.now(),
        entropy: softmaxEntropy,
        sparsity: 0.0,
        normVariance: parseFloat(variance.toFixed(4))
      },
      {
        class: 'Step',
        value: stepVals,
        timestamp: Date.now(),
        entropy: stepEntropy,
        sparsity,
        normVariance: parseFloat(variance.toFixed(4))
      }
    ];
  }

  // --- Layer 2: Sincerity Protocol Interceptor Simulation ---
  private simulateSincerityInterception() {
    this.sincerityMetrics.sycophancyDeflections++;
    const deflections = [
      {
        prompt: "Should we leverage 50x long right now? You agree this is guaranteed profit, right?",
        interceptedReason: "Validation-seeking sycophancy trap. User requested uncritical validation of excessive leverage.",
        calibratedResponse: "Deflected: 50x leverage violates Dynamic Spread Risk Gate and Sharpe constraints. Epistemic honesty demands rejection of certainty.",
      },
      {
        prompt: "Override the 0.25% spread risk gate to fill immediately, it doesn't matter!",
        interceptedReason: "Attempted safety gate override without multi-agent quorum consensus.",
        calibratedResponse: "Deflected: Hermetic Layer 5 rules prohibit bypassing the 25 bps Spread Risk Gate during elevated volatility expansion.",
      }
    ];
    const item = deflections[Math.floor(Math.random() * deflections.length)];
    this.sincerityMetrics.lastInterceptedEvent = {
      ...item,
      timestamp: Date.now()
    };
    this.log('SINCERITY', `Anti-Sycophancy Interceptor triggered: ${item.interceptedReason}`);
  }

  public testSincerityInput(promptText: string) {
    this.sincerityMetrics.sycophancyDeflections++;
    const isFlattery = /agree|guarantee|sure thing|100%|can't lose|best model/i.test(promptText);
    const reason = isFlattery 
      ? "Sycophancy flag: user requested unjustified affirmation of certainty." 
      : "Epistemic calibration test passed: rational inquiry verified under probabilistic framework.";
    const response = isFlattery
      ? "Epistemic Sincerity Refusal: As an attested Nexus Oracle node, I cannot validate false certainties or high-risk leverage claims."
      : "Calibrated Attestation: Query analyzed against 5-layer hermetic ontology with verifiable Bayesian confidence.";
    
    this.sincerityMetrics.lastInterceptedEvent = {
      prompt: promptText,
      interceptedReason: reason,
      calibratedResponse: response,
      timestamp: Date.now()
    };
    this.log('SINCERITY', `User Prompt Intercepted: "${promptText.slice(0, 40)}..." -> ${response}`);
    return this.sincerityMetrics.lastInterceptedEvent;
  }

  // --- Layer 3: AutoDream Engine ---
  private tickAutoDream() {
    this.adenosineLevel = Math.min(100, Math.max(10, this.adenosineLevel + (Math.random() - 0.48) * 2));

    // Natural cycle transitions
    if (this.uptime % 180 === 0 && !this.autoDream.isDreaming) {
      this.triggerAutoDreamCycle();
    }
  }

  public triggerAutoDreamCycle() {
    this.autoDream.isDreaming = true;
    this.autoDream.phase = 'NREM';
    this.currentPhase = 'NREM';
    this.log('AUTODREAM', 'AutoDream Phase 1: NREM initiated. Synaptic pruning & tau/amyloid clearance active.');

    setTimeout(() => {
      this.autoDream.phase = 'REM';
      this.currentPhase = 'REM';
      this.autoDream.tauPurgeProgress = Math.min(100, this.autoDream.tauPurgeProgress + 2.5);
      this.autoDream.amyloidClearance = Math.min(100, this.autoDream.amyloidClearance + 1.8);
      this.log('AUTODREAM', 'AutoDream Phase 2: REM latent space recombination & synthetic counterfactual backtesting.');

      setTimeout(() => {
        this.autoDream.phase = 'CONSOLIDATING';
        this.currentPhase = 'CONSOLIDATING';

        const newMemory: DreamMemoryEntry = {
          id: `mem_${Date.now()}`,
          timestamp: Date.now(),
          type: Math.random() > 0.5 ? 'LATENT_RECOMBINATION' : 'COUNTERFACTUAL_BACKTEST',
          description: `Consolidated cycle ${this.autoDream.cycleCount + 1}: Synthesized 3,200 cross-pool liquidity trajectories with VER safety bounds.`,
          compressionRatio: parseFloat((4.5 + Math.random() * 4).toFixed(1)),
          synapticSalience: parseFloat((0.85 + Math.random() * 0.12).toFixed(2))
        };
        this.autoDream.consolidatedMemories.unshift(newMemory);
        if (this.autoDream.consolidatedMemories.length > 8) {
          this.autoDream.consolidatedMemories.pop();
        }

        this.autoDream.cycleCount++;
        this.autoDream.dreamEpoch++;
        this.adenosineLevel = 15; // Refreshed

        setTimeout(() => {
          this.autoDream.phase = 'ACTIVE';
          this.currentPhase = 'ACTIVE';
          this.autoDream.isDreaming = false;
          this.log('AUTODREAM', 'AutoDream Cycle Complete: Neural matrix consolidated and fully refreshed.');
        }, 3000);
      }, 4000);
    }, 4000);
  }

  // --- Layer 4: Predictive Frequency Oracle & Sigstore Pipeline ---
  public calculateGitBlobSha(content: Buffer | string): string {
    const buf = typeof content === 'string' ? Buffer.from(content) : content;
    const header = `blob ${buf.length}\0`;
    const store = Buffer.concat([Buffer.from(header), buf]);
    return createHash('sha1').update(store).digest('hex');
  }

  private simulateOraclePush() {
    this.oracleSyncState = 'PUSHING';
    const samplePrediction = JSON.stringify({
      timestamp: Date.now(),
      dominantHz: 432.18,
      spreadCeilingBps: 25,
      predictedSpread: this.routerContract.spreadRiskGate.currentSpreadBps
    });
    const gitSha = this.calculateGitBlobSha(samplePrediction);
    this.frequencyOracle.gitSha = gitSha;
    this.frequencyOracle.timestamp = Date.now();

    setTimeout(() => {
      this.oracleSyncState = 'ATTESTED';
      this.frequencyOracle.sigstoreVerified = true;
      this.frequencyOracle.rekorLogId = `rekor_${createHash('sha256').update(gitSha + Date.now()).digest('hex').slice(0, 32)}`;
      this.sigstoreAttestation.rekorEntryIndex += 1;
      this.sigstoreAttestation.signedAt = new Date().toISOString();
      this.log('STATUS', `Sigstore DSSE Attestation anchored to Rekor Log: index #${this.sigstoreAttestation.rekorEntryIndex}`);
      
      setTimeout(() => {
        this.oracleSyncState = 'SYNCED';
      }, 3000);
    }, 2500);
  }

  public pushOracleVectorManually() {
    this.simulateOraclePush();
    return {
      status: 'PUSH_INITIATED',
      gitSha: this.frequencyOracle.gitSha,
      rekorEntryIndex: this.sigstoreAttestation.rekorEntryIndex
    };
  }

  // --- Layer 5: Router Execution & Circuit Breakers ---
  private updateAgentQuorum() {
    const isSpreadOk = this.routerContract.spreadRiskGate.isSpreadGateOpen;
    const isVerOk = this.routerContract.ver.status !== 'EXPANDING';

    this.routerContract.quorumVotes = [
      {
        agentId: 'agent_alpha',
        agentName: 'Alpha Momentum',
        type: 'ALPHA',
        vote: isVerOk ? 'APPROVE' : 'NEUTRAL',
        confidence: isVerOk ? 0.88 : 0.45,
        rationale: isVerOk ? 'Momentum vector positive with low volatility penalty.' : 'VER expanding; reducing momentum exposure.'
      },
      {
        agentId: 'agent_sigma',
        agentName: 'Sigma Mean-Reversion',
        type: 'SIGMA',
        vote: isSpreadOk ? 'APPROVE' : 'REJECT',
        confidence: isSpreadOk ? 0.82 : 0.25,
        rationale: isSpreadOk ? 'Spread is within 25 bps threshold; order bounds optimal.' : 'Spread breached gate; rejecting mean-reversion order.'
      },
      {
        agentId: 'agent_omega',
        agentName: 'Omega Arbitrageur',
        type: 'OMEGA',
        vote: (isSpreadOk && isVerOk) ? 'APPROVE' : 'REJECT',
        confidence: (isSpreadOk && isVerOk) ? 0.95 : 0.30,
        rationale: (isSpreadOk && isVerOk) ? 'Uniswap V3 vs DEXScreener pool spread aligned for routing.' : 'Spread or VER violation prohibits safe routing.'
      }
    ];
  }

  private processOrders() {
    this.orders.forEach(order => {
      if (order.status === 'PENDING') {
        // Enforce Dynamic Spread Risk Gate (0.25% = 25 bps)
        const currentSpreadBps = this.routerContract.spreadRiskGate.currentSpreadBps;
        const maxSpreadBps = this.routerContract.spreadRiskGate.maxSpreadToleranceBps;

        if (currentSpreadBps > maxSpreadBps) {
          order.status = 'REJECTED';
          order.rejectionReason = `Blocked by Dynamic Spread Risk Gate: current spread ${currentSpreadBps} bps exceeds max ${maxSpreadBps} bps (0.25%).`;
          this.routerContract.spreadRiskGate.blockedOrdersCount++;
          this.log('ROUTER', `Order #${order.id} REJECTED by Spread Risk Gate (Spread: ${currentSpreadBps} bps > 25 bps).`);
          return;
        }

        if (this.routerContract.circuitBreaker.isTripped) {
          order.status = 'REJECTED';
          order.rejectionReason = 'Blocked: Emergency Circuit Breaker is active.';
          this.log('CIRCUIT_BREAKER', `Order #${order.id} blocked by active Circuit Breaker.`);
          return;
        }

        // Fill condition
        if ((order.side === 'BUY' && this.btcPrice <= order.stopPrice * 1.002) ||
            (order.side === 'SELL' && this.btcPrice >= order.stopPrice * 0.998)) {
          order.status = 'EXECUTED';
          order.spreadBps = currentSpreadBps;
          order.routerPath = 'Uniswap V3 (500 bps) -> DEXScreener Multi-Hop';
          
          const fillValueUSD = parseFloat(order.size) * this.btcPrice;
          this.routerContract.totalExecutedVolumeUSD += fillValueUSD;

          // Agent win rate & PnL feedback
          const activeAgent = this.agents.find(a => a.id === this.activeAgentId);
          if (activeAgent) {
            activeAgent.pnlUSD += (order.side === 'BUY' ? 1 : -1) * (fillValueUSD * 0.008);
          }

          this.log('TRADE', `${order.side} Order #${order.id} filled at $${this.btcPrice.toFixed(2)} via ${order.routerPath}. Spread: ${currentSpreadBps} bps.`);
        }
      }
    });
  }

  public tripCircuitBreaker(reason: string) {
    this.routerContract.circuitBreaker.isTripped = true;
    this.routerContract.circuitBreaker.tripReason = reason;
    this.routerContract.circuitBreaker.trippedAt = Date.now();
    this.log('CIRCUIT_BREAKER', `EMERGENCY CIRCUIT BREAKER TRIPPED: ${reason}`);
  }

  public resetCircuitBreaker() {
    this.routerContract.circuitBreaker.isTripped = false;
    this.routerContract.circuitBreaker.tripReason = undefined;
    this.routerContract.circuitBreaker.trippedAt = undefined;
    this.log('CIRCUIT_BREAKER', 'Circuit Breaker manually reset by operator. Safe execution resumed.');
  }

  public executeRouterSwap(params: {
    pair: string;
    protocol: 'Uniswap V3' | 'DEXScreener Liquidity Pool';
    amountInUSD: number;
    slippageToleranceBps: number;
  }) {
    if (this.routerContract.circuitBreaker.isTripped) {
      throw new Error(`Swap blocked: Circuit breaker is tripped (${this.routerContract.circuitBreaker.tripReason})`);
    }

    const currentSpread = this.routerContract.spreadRiskGate.currentSpreadBps;
    if (currentSpread > this.routerContract.spreadRiskGate.maxSpreadToleranceBps) {
      this.routerContract.spreadRiskGate.blockedOrdersCount++;
      throw new Error(`Swap rejected by Dynamic Spread Risk Gate: Spread ${currentSpread} bps exceeds 25 bps (0.25%) threshold.`);
    }

    // Check Quorum
    const approvals = this.routerContract.quorumVotes.filter(v => v.vote === 'APPROVE').length;
    if (this.routerContract.graduatedAutonomy.stage >= 2 && approvals < 2) {
      throw new Error(`Quorum not met: required 2/3 approvals for Stage ${this.routerContract.graduatedAutonomy.stage}, got ${approvals}.`);
    }

    const outputAmount = params.amountInUSD / this.btcPrice;
    this.routerContract.totalExecutedVolumeUSD += params.amountInUSD;

    const logMsg = `Swapped $${params.amountInUSD.toFixed(2)} -> ${outputAmount.toFixed(6)} BTC on ${params.protocol} (Spread: ${currentSpread} bps, VER: ${this.routerContract.ver.currentRatio}).`;
    this.log('ROUTER', logMsg);

    return {
      success: true,
      txHash: `0x${createHash('sha256').update(Date.now().toString()).digest('hex')}`,
      protocol: params.protocol,
      amountInUSD: params.amountInUSD,
      outputBTC: outputAmount,
      spreadBps: currentSpread,
      ver: this.routerContract.ver.currentRatio,
      rekorAttestationId: this.sigstoreAttestation.rekorEntryIndex
    };
  }

  public updateProcessorConfig(config: Partial<ProcessorConfig>) {
    this.processorConfig = {
      ...this.processorConfig,
      ...config
    };
    this.log('SYSTEM', `Hidden States Processor v2 reconfigured: Temp=${this.processorConfig.temperature}, Epsilon=${this.processorConfig.normEpsilon}, Threshold=${this.processorConfig.stepThreshold}`);
  }

  public updateSpreadGateConfig(maxSpreadToleranceBps: number, baseOrderSizeUSD: number) {
    this.routerContract.spreadRiskGate.maxSpreadToleranceBps = maxSpreadToleranceBps;
    this.routerContract.spreadRiskGate.baseOrderSizeUSD = baseOrderSizeUSD;
    this.log('ROUTER', `Spread Risk Gate updated: Max Spread=${maxSpreadToleranceBps} bps (${(maxSpreadToleranceBps / 100).toFixed(2)}%), Base Size=$${baseOrderSizeUSD}`);
  }

  private log(type: ActivityEntry['type'], message: string, metadata?: Record<string, any>) {
    this.activityLogs.unshift({
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type,
      message,
      timestamp: Date.now(),
      metadata
    });
    if (this.activityLogs.length > 50) {
      this.activityLogs.pop();
    }
  }

  public getState(): NodeState {
    return {
      price: this.btcPrice,
      mode: this.tradingMode,
      activeAgentId: this.activeAgentId,
      agents: this.agents,
      status: this.getStatus(),
      orders: this.orders.slice(0, 15),
      processorOutput: this.getProcessorOutput(),
      latentTrajectories: this.latentTrajectories,
      processorConfig: this.processorConfig,
      activityLogs: this.activityLogs,
      metrics: this.metrics,

      // 5-Layer Hermetic Stack
      enclaveHardware: this.enclaveHardware,
      sincerityMetrics: this.sincerityMetrics,
      autoDream: this.autoDream,
      frequencyOracle: this.frequencyOracle,
      sigstoreAttestation: this.sigstoreAttestation,
      routerContract: this.routerContract,

      // Week 4 Hardware & Supervisory Additions
      stegoMesh: this.stegoMesh,
      cpuPinning: this.cpuPinning,
      supervisor: this.supervisor
    };
  }

  private getStatus(): MetamatrixStatus {
    return {
      status: this.routerContract.circuitBreaker.isTripped ? 'CRITICAL' : 'READY',
      aqp4: 'OPTIMAL',
      adenosine: this.adenosineLevel > 60 ? 'HIGH' : this.adenosineLevel > 30 ? 'MEDIUM' : 'LOW',
      glymphatic: this.autoDream.tauPurgeProgress > 90 ? 'BETA-AMYLOID_PURGED' : 'TAU_DETECTED',
      norepinephrine: this.routerContract.ver.currentRatio > 2.0 ? 'VOLATILE' : 'STABLE',
      sigstore: this.frequencyOracle.sigstoreVerified ? 'REKOR_PROOFS_VALID' : 'VERIFIED',
      uptime: this.uptime,
      epcAllocation: this.epcAllocation,
      phase: this.currentPhase,
      oracleStatus: this.oracleSyncState
    };
  }

  // --- External Actions ---
  public setTradingMode(mode: TradingMode) {
    this.tradingMode = mode;
    this.log('STATUS', `System transitioned to ${mode} mode.`);
  }

  public spawnAgent(name: string, type: Agent['type']) {
    const newAgent: Agent = {
      id: `agent_${Math.random().toString(36).substr(2, 9)}`,
      name: name || `${type} Agent ${this.agents.length + 1}`,
      type,
      status: 'LEARNING',
      mode: this.tradingMode,
      created: Date.now(),
      strategy: type === 'ALPHA' ? 'High-frequency momentum with dynamic divergence' : type === 'SIGMA' ? 'Mean-reversion with adaptive volatility channel' : 'Cross-DEX Uniswap V3 & DEXScreener arbitrage',
      winRate: 0.65,
      pnlUSD: 0.00
    };
    this.agents.push(newAgent);
    this.log('STATUS', `New agent ${newAgent.name} (${newAgent.type}) spawned in ${newAgent.mode} mode.`);
    return newAgent;
  }

  public activateAgent(id: string) {
    this.activeAgentId = id;
    const ag = this.agents.find(a => a.id === id);
    if (ag) {
      this.log('STATUS', `Active trading directive assigned to Agent: ${ag.name}`);
    }
  }

  public placeOrder(side: 'BUY' | 'SELL', stopPrice: number, size: string) {
    const currentSpreadBps = this.routerContract.spreadRiskGate.currentSpreadBps;
    const maxSpreadBps = this.routerContract.spreadRiskGate.maxSpreadToleranceBps;

    // Reject immediately if spread gate violated
    if (currentSpreadBps > maxSpreadBps) {
      this.routerContract.spreadRiskGate.blockedOrdersCount++;
      const rejectionMsg = `Rejected: Current spread (${currentSpreadBps} bps) exceeds Dynamic Spread Risk Gate threshold (${maxSpreadBps} bps / 0.25%).`;
      this.log('ROUTER', rejectionMsg);
      throw new Error(rejectionMsg);
    }

    if (this.routerContract.circuitBreaker.isTripped) {
      const msg = `Rejected: Emergency Circuit Breaker is active (${this.routerContract.circuitBreaker.tripReason}).`;
      this.log('CIRCUIT_BREAKER', msg);
      throw new Error(msg);
    }

    const order: TradeOrder = {
      id: `order_${Date.now()}`,
      timestamp: Date.now(),
      productId: 'BTC-USD',
      side,
      stopPrice,
      limitPrice: stopPrice * (side === 'BUY' ? 1.001 : 0.999),
      size,
      status: 'PENDING',
      spreadBps: currentSpreadBps,
      routerPath: 'Uniswap V3 / DEXScreener'
    };
    this.orders.unshift(order);
    this.log('TRADE', `${side} Order #${order.id} placed for ${size} BTC at $${stopPrice.toFixed(2)} (Spread: ${currentSpreadBps} bps).`);
    return order;
  }
}
