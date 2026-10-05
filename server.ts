import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Server as SocketServer } from "socket.io";
import { createServer } from "http";
import { MetamatrixEngine } from "./server/MetamatrixEngine.ts";
import { nexusLedgerDb } from "./server/NexusLedgerDb.ts";
import { NexusMarketFeed } from "./server/NexusMarketFeed.ts";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new SocketServer(httpServer);
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Engine with WebSocket broadcasting
  const engine = new MetamatrixEngine((state) => {
    io.emit("state_update", state);
  });

  // Phase 2: Autonomous Market Data Ingestion Pipeline (Coinbase Public WS)
  const marketFeed = new NexusMarketFeed((tick) => {
    io.emit("market_tick", tick);
  });

  // Base Health & State
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  app.get("/api/state", (req, res) => {
    res.json(engine.getState());
  });

  // Phase 2: Live Market Feed Status & Ticker
  app.get("/api/market/ticker", (_req, res) => {
    res.json(marketFeed.getStatus());
  });

  // --- Phase 1: Persistent SQLite Paper Ledger Endpoints ---
  app.get("/api/ledger/state", (_req, res) => {
    try {
      res.json(nexusLedgerDb.getState());
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to query ledger state" });
    }
  });

  app.post("/api/ledger/order", (req, res) => {
    try {
      const { side, pair, amountUSD, priceUSD, slippageBps, route } = req.body;
      if (!side || !amountUSD) {
        return res.status(400).json({ error: "Missing required side or amountUSD parameter" });
      }
      const result = nexusLedgerDb.executePaperOrder({
        side: side === "SELL" ? "SELL" : "BUY",
        pair,
        amountUSD: parseFloat(amountUSD),
        priceUSD: priceUSD ? parseFloat(priceUSD) : undefined,
        slippageBps: slippageBps ? parseFloat(slippageBps) : undefined,
        route
      });
      io.emit("ledger_update", nexusLedgerDb.getState());
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to execute paper order" });
    }
  });

  app.post("/api/ledger/deposit", (req, res) => {
    try {
      const amountUSD = parseFloat(req.body.amountUSD);
      if (isNaN(amountUSD) || amountUSD <= 0) {
        return res.status(400).json({ error: "Invalid deposit amount" });
      }
      const result = nexusLedgerDb.depositPaperFunds(amountUSD);
      io.emit("ledger_update", nexusLedgerDb.getState());
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to deposit paper funds" });
    }
  });

  app.get("/api/ledger/audit", (_req, res) => {
    try {
      const history = nexusLedgerDb.getAuditHistory(50);
      const verification = nexusLedgerDb.verifyAuditChain();
      res.json({ history, verification });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to fetch audit log" });
    }
  });

  // Agents
  app.post("/api/agents/spawn", (req, res) => {
    const agent = engine.spawnAgent(req.body.name, req.body.type);
    res.json(agent);
  });

  app.post("/api/agents/activate", (req, res) => {
    engine.activateAgent(req.body.id);
    res.json({ activeAgentId: req.body.id });
  });

  // Orders
  app.post("/api/order", (req, res) => {
    try {
      const { side, stopPrice, size } = req.body;
      const order = engine.placeOrder(side, parseFloat(stopPrice), size);
      res.json(order);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Failed to place order" });
    }
  });

  // Router Contract & Execution Endpoints
  app.post("/api/router/swap", (req, res) => {
    try {
      const { pair, protocol, amountInUSD, slippageToleranceBps } = req.body;
      const result = engine.executeRouterSwap({
        pair: pair || 'WBTC / USDC',
        protocol: protocol || 'Uniswap V3',
        amountInUSD: parseFloat(amountInUSD) || 10.0,
        slippageToleranceBps: parseInt(slippageToleranceBps) || 25
      });
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Swap execution failed" });
    }
  });

  // Week 4 Atomic Triple-Command Execution (0x0a PERMIT2 + 0x00 V3_SWAP + 0x0c UNWRAP)
  app.post("/api/router/atomic-swap", (req, res) => {
    try {
      const { amountInUSD } = req.body;
      const result = engine.executeAtomicTripleSwap({
        amountInUSD: parseFloat(amountInUSD) || 25000.0
      });
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Atomic Triple-Command execution failed" });
    }
  });

  // Week 4 Dynamic Split-Routing Optimizer
  app.post("/api/router/split-route", (req, res) => {
    try {
      const amountUSD = parseFloat(req.body.amountUSD) || 25000.0;
      const sigma = parseFloat(req.body.sigmaTick) || 0.048;
      const isToxic = req.body.isToxic !== undefined ? req.body.isToxic : engine.getState().routerContract.lvrMetrics.isToxicRegime;
      const plan = engine.optimize_split_route(amountUSD, sigma, isToxic);
      res.json(plan);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Split route optimization failed" });
    }
  });

  // Week 4 Fast Zipf Steganography Mesh Tester
  app.post("/api/stego/encode", (req, res) => {
    try {
      const payload = req.body.payload || "NEXUS_ORACLE_SIG:0x8f2a1b9c_SPLIT_ROUTE";
      const packet = engine.encodeZipfStego(payload);
      res.json(packet);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Stego encoding failed" });
    }
  });

  app.post("/api/stego/decode", (req, res) => {
    try {
      const carrierText = req.body.carrierText || "";
      const result = engine.decodeZipfStego(carrierText);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Stego decoding failed" });
    }
  });

  // Week 4 CPU Core Affinity & Pinning Controller
  app.post("/api/cpu/pinning", (req, res) => {
    try {
      const updated = engine.setCpuCoreAffinity(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Failed to update CPU affinity" });
    }
  });

  // Week 4 Sincerity Corporate Disclaimer Scrubber
  app.post("/api/sincerity/scrub", (req, res) => {
    try {
      const text = req.body.text || "";
      const confidence = parseFloat(req.body.confidence) || 0.85;
      const result = engine.scrubCorporateDisclaimers(text, confidence);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Scrubbing failed" });
    }
  });

  app.post("/api/router/circuit-breaker", (req, res) => {
    const { action, reason } = req.body;
    if (action === 'TRIP') {
      engine.tripCircuitBreaker(reason || 'Operator manual intervention');
      res.json({ status: 'TRIPPED' });
    } else if (action === 'RESET') {
      engine.resetCircuitBreaker();
      res.json({ status: 'RESET' });
    } else {
      res.status(400).json({ error: 'Invalid circuit breaker action' });
    }
  });

  app.post("/api/router/update-gate", (req, res) => {
    const { maxSpreadToleranceBps, baseOrderSizeUSD } = req.body;
    engine.updateSpreadGateConfig(
      parseInt(maxSpreadToleranceBps) || 25,
      parseFloat(baseOrderSizeUSD) || 10.0
    );
    res.json({ success: true });
  });

  // AutoDream Memory & Sleep Cycle
  app.post("/api/autodream/trigger", (req, res) => {
    engine.triggerAutoDreamCycle();
    res.json({ status: 'CYCLE_TRIGGERED' });
  });

  // Hidden States Processor v2 Configuration
  app.post("/api/processor/configure", (req, res) => {
    engine.updateProcessorConfig(req.body);
    res.json({ success: true });
  });

  // Sincerity Protocol Interception Tester
  app.post("/api/sincerity/interception-test", (req, res) => {
    const result = engine.testSincerityInput(req.body.prompt || "");
    res.json(result);
  });

  // Oracle & Rekor Attestation
  app.post("/api/oracle/push-vector", (req, res) => {
    const result = engine.pushOracleVectorManually();
    res.json(result);
  });

  // WebSocket Connection Handling
  io.on("connection", (socket) => {
    console.log("Client connected via Socket.io");
    socket.emit("state_update", engine.getState());
    
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Nexus Oracle Node active on http://localhost:${PORT}`);
  });

  // Graceful Shutdown Signal Handlers (FIRE Layer)
  const shutdown = (signal: string) => {
    console.log(`[Nexus] Received ${signal}. Commencing graceful shutdown...`);
    marketFeed.close();
    nexusLedgerDb.checkpointAndClose();
    httpServer.close(() => {
      console.log("[Nexus] HTTP and WebSocket server closed cleanly.");
      process.exit(0);
    });

    // Forced exit timeout after 5 seconds
    setTimeout(() => {
      console.error("[Nexus] Forced exit after timeout.");
      process.exit(1);
    }, 5000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer();
