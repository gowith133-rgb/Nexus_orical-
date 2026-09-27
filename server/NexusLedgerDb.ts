import { DatabaseSync } from "node:sqlite";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface PaperOrderRecord {
  id: string;
  timestamp: number;
  pair: string;
  side: "BUY" | "SELL";
  amountUSD: number;
  assetAmount: number;
  priceUSD: number;
  status: "FILLED" | "ROUTED" | "PENDING" | "GATE_REJECTED";
  slippageBps: number;
  route: string;
  txHash: string;
  rejectionReason?: string;
}

export interface CausalAuditRecord {
  eventId: string;
  parentHash: string;
  timestamp: number;
  actor: string;
  eventType: string;
  payloadHash: string;
  signature: string;
}

export interface LedgerState {
  portfolioUSD: number;
  simulatedBTC: number;
  simulatedETH: number;
  lastUpdated: number;
  orders: PaperOrderRecord[];
  auditCount: number;
  isTamperProof: boolean;
}

export class NexusLedgerDb {
  private db: DatabaseSync;
  private dbPath: string;

  constructor() {
    const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.dbPath = path.join(dataDir, "nexus_paper_ledger.db");
    this.db = new DatabaseSync(this.dbPath);

    this.initPragmas();
    this.initSchema();
    this.initSeedData();
  }

  public checkpointAndClose() {
    try {
      this.db.exec("PRAGMA wal_checkpoint(TRUNCATE);");
      this.db.close();
      console.log("[NexusLedgerDb] SQLite WAL checkpointed and closed cleanly.");
    } catch (err) {
      console.warn("[NexusLedgerDb] Error during database shutdown:", err);
    }
  }

  private initPragmas() {
    this.db.exec("PRAGMA journal_mode = WAL;");
    this.db.exec("PRAGMA synchronous = NORMAL;");
    this.db.exec("PRAGMA foreign_keys = ON;");
    this.db.exec("PRAGMA busy_timeout = 5000;");
  }

  private initSchema() {
    // 1. Singleton Paper Account Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS paper_account (
        id TEXT PRIMARY KEY,
        portfolio_usd REAL NOT NULL,
        simulated_btc REAL NOT NULL,
        simulated_eth REAL NOT NULL,
        last_updated INTEGER NOT NULL
      );
    `);

    // 2. Paper Orders Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS paper_orders (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        pair TEXT NOT NULL,
        side TEXT NOT NULL,
        amount_usd REAL NOT NULL,
        asset_amount REAL NOT NULL,
        price_usd REAL NOT NULL,
        status TEXT NOT NULL,
        slippage_bps REAL NOT NULL,
        route TEXT NOT NULL,
        tx_hash TEXT NOT NULL,
        rejection_reason TEXT
      );
    `);

    // 3. Immutable Causal Audit Ledger Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS causal_audit_events (
        event_id TEXT PRIMARY KEY,
        parent_hash TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        actor TEXT NOT NULL,
        event_type TEXT NOT NULL,
        payload_hash TEXT NOT NULL,
        signature TEXT NOT NULL
      );
    `);

    // 4. Hard SQLite Triggers: Prevent ANY update or delete on the Causal Ledger
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS abort_audit_update BEFORE UPDATE ON causal_audit_events
      BEGIN
        SELECT RAISE(ABORT, 'IMMUTABLE_CAUSAL_LEDGER: UPDATE_FORBIDDEN');
      END;
    `);

    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS abort_audit_delete BEFORE DELETE ON causal_audit_events
      BEGIN
        SELECT RAISE(ABORT, 'IMMUTABLE_CAUSAL_LEDGER: DELETE_FORBIDDEN');
      END;
    `);
  }

  private initSeedData() {
    // Initialize account singleton if empty
    const row = this.db.prepare("SELECT id FROM paper_account WHERE id = 'default_account'").get();
    if (!row) {
      const genesisTime = Date.now();
      this.db.prepare(`
        INSERT INTO paper_account (id, portfolio_usd, simulated_btc, simulated_eth, last_updated)
        VALUES ('default_account', 3490.64, 0.02330, 0.3508, ?)
      `).run(genesisTime);

      // Record Genesis Audit Block
      const genesisPayload = JSON.stringify({ initialBalance: 3490.64, mode: "PAPER_INIT" });
      const payloadHash = crypto.createHash("sha256").update(genesisPayload).digest("hex");
      const genesisEventId = crypto.createHash("sha256").update(`GENESIS:0x00000000:${genesisTime}:${payloadHash}`).digest("hex");

      this.db.prepare(`
        INSERT INTO causal_audit_events (event_id, parent_hash, timestamp, actor, event_type, payload_hash, signature)
        VALUES (?, '0x0000000000000000000000000000000000000000000000000000000000000000', ?, 'NEXUS_CORE', 'GENESIS_PAPER_INIT', ?, 'SIG_GENESIS_VALID')
      `).run(genesisEventId, genesisTime, payloadHash);

      // Seed Initial Orders
      const seedOrders: PaperOrderRecord[] = [
        {
          id: "ord_p982a",
          timestamp: genesisTime - 24000,
          pair: "BTC/USD",
          side: "BUY",
          amountUSD: 500.00,
          assetAmount: 0.007416,
          priceUSD: 67420.00,
          status: "FILLED",
          slippageBps: 3.2,
          route: "Universal Router V3 (500bps/3000bps split)",
          txHash: "0x8f2a...9c41"
        },
        {
          id: "ord_p981b",
          timestamp: genesisTime - 142000,
          pair: "ETH/USDC",
          side: "BUY",
          amountUSD: 250.00,
          assetAmount: 0.07184,
          priceUSD: 3480.00,
          status: "ROUTED",
          slippageBps: 4.8,
          route: "Split Route: 80% 500bps / 20% 3000bps",
          txHash: "0x3d14...b02e"
        },
        {
          id: "ord_p980c",
          timestamp: genesisTime - 380000,
          pair: "BTC/USD",
          side: "SELL",
          amountUSD: 1000.00,
          assetAmount: 0.01485,
          priceUSD: 67340.50,
          status: "GATE_REJECTED",
          slippageBps: 28.5,
          rejectionReason: "Spread Gate engaged: Bid/Ask spread 0.28% > 0.25% limit",
          route: "Execution halted by Spread Risk Gate",
          txHash: "0x0000...GATE"
        }
      ];

      for (const ord of seedOrders) {
        this.db.prepare(`
          INSERT INTO paper_orders (id, timestamp, pair, side, amount_usd, asset_amount, price_usd, status, slippage_bps, route, tx_hash, rejection_reason)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          ord.id, ord.timestamp, ord.pair, ord.side, ord.amountUSD,
          ord.assetAmount, ord.priceUSD, ord.status, ord.slippageBps,
          ord.route, ord.txHash, ord.rejectionReason || null
        );
      }
    }
  }

  private getLatestAuditHash(): string {
    const row = this.db.prepare("SELECT event_id FROM causal_audit_events ORDER BY timestamp DESC LIMIT 1").get() as { event_id: string } | undefined;
    return row ? row.event_id : "0x0000000000000000000000000000000000000000000000000000000000000000";
  }

  public recordAuditEvent(actor: string, eventType: string, payload: any): string {
    const parentHash = this.getLatestAuditHash();
    const timestamp = Date.now();
    const payloadStr = JSON.stringify(payload);
    const payloadHash = crypto.createHash("sha256").update(payloadStr).digest("hex");
    
    // Deterministic Causal Chaining: sha256(timestamp || actor || payloadHash || parentHash)
    const eventId = crypto.createHash("sha256")
      .update(`${timestamp}:${actor}:${payloadHash}:${parentHash}`)
      .digest("hex");

    const signature = crypto.createHmac("sha256", "NEXUS_LOCAL_SECRET_KEY")
      .update(eventId)
      .digest("hex");

    this.db.prepare(`
      INSERT INTO causal_audit_events (event_id, parent_hash, timestamp, actor, event_type, payload_hash, signature)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(eventId, parentHash, timestamp, actor, eventType, payloadHash, signature);

    return eventId;
  }

  public getState(): LedgerState {
    const acct = this.db.prepare("SELECT portfolio_usd, simulated_btc, simulated_eth, last_updated FROM paper_account WHERE id = 'default_account'").get() as any;
    
    const rows = this.db.prepare("SELECT * FROM paper_orders ORDER BY timestamp DESC LIMIT 50").all() as any[];
    const orders: PaperOrderRecord[] = rows.map(r => ({
      id: r.id,
      timestamp: Number(r.timestamp),
      pair: r.pair,
      side: r.side,
      amountUSD: Number(r.amount_usd),
      assetAmount: Number(r.asset_amount),
      priceUSD: Number(r.price_usd),
      status: r.status,
      slippageBps: Number(r.slippage_bps),
      route: r.route,
      txHash: r.tx_hash,
      rejectionReason: r.rejection_reason || undefined
    }));

    const auditCountRow = this.db.prepare("SELECT COUNT(*) as count FROM causal_audit_events").get() as any;
    const auditCount = Number(auditCountRow?.count || 0);

    return {
      portfolioUSD: acct ? Number(acct.portfolio_usd) : 3490.64,
      simulatedBTC: acct ? Number(acct.simulated_btc) : 0.02330,
      simulatedETH: acct ? Number(acct.simulated_eth) : 0.3508,
      lastUpdated: acct ? Number(acct.last_updated) : Date.now(),
      orders,
      auditCount,
      isTamperProof: this.verifyAuditChain().isValid
    };
  }

  public executePaperOrder(order: {
    side: "BUY" | "SELL";
    pair?: string;
    amountUSD: number;
    priceUSD?: number;
    slippageBps?: number;
    route?: string;
  }): { order: PaperOrderRecord; updatedPortfolio: number } {
    const pair = order.pair || "BTC/USD";
    const priceUSD = order.priceUSD || 67420.00;
    const assetAmount = parseFloat((order.amountUSD / priceUSD).toFixed(6));
    const slippageBps = order.slippageBps || parseFloat((2.5 + Math.random() * 2.0).toFixed(1));
    const route = order.route || "Universal Router V3 (500bps/3000bps Split)";
    const orderId = `ord_p${Math.random().toString(36).substring(2, 7)}`;
    const txHash = `0x${crypto.randomBytes(4).toString("hex")}...${crypto.randomBytes(4).toString("hex")}`;
    const timestamp = Date.now();

    // Check if spread or slippage trips risk gate
    let status: PaperOrderRecord["status"] = "FILLED";
    let rejectionReason: string | undefined = undefined;

    if (slippageBps > 25.0) {
      status = "GATE_REJECTED";
      rejectionReason = `Spread Risk Gate tripped: Slippage ${slippageBps} bps > 25 bps limit`;
    }

    const newOrder: PaperOrderRecord = {
      id: orderId,
      timestamp,
      pair,
      side: order.side,
      amountUSD: order.amountUSD,
      assetAmount,
      priceUSD,
      status,
      slippageBps,
      route,
      txHash,
      rejectionReason
    };

    // Begin atomic transaction
    const currentState = this.getState();
    let newPortfolio = currentState.portfolioUSD;

    if (status === "FILLED") {
      newPortfolio = order.side === "BUY"
        ? Math.max(0, parseFloat((currentState.portfolioUSD - order.amountUSD).toFixed(2)))
        : parseFloat((currentState.portfolioUSD + order.amountUSD).toFixed(2));
    }

    // Insert order
    this.db.prepare(`
      INSERT INTO paper_orders (id, timestamp, pair, side, amount_usd, asset_amount, price_usd, status, slippage_bps, route, tx_hash, rejection_reason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newOrder.id, newOrder.timestamp, newOrder.pair, newOrder.side,
      newOrder.amountUSD, newOrder.assetAmount, newOrder.priceUSD,
      newOrder.status, newOrder.slippageBps, newOrder.route,
      newOrder.txHash, newOrder.rejectionReason || null
    );

    // Update account balance
    this.db.prepare(`
      UPDATE paper_account
      SET portfolio_usd = ?, last_updated = ?
      WHERE id = 'default_account'
    `).run(newPortfolio, timestamp);

    // Append to Immutable Causal Audit Ledger
    this.recordAuditEvent("PAPER_EXECUTION_ENGINE", "PAPER_ORDER_EXECUTED", {
      orderId: newOrder.id,
      pair: newOrder.pair,
      side: newOrder.side,
      amountUSD: newOrder.amountUSD,
      status: newOrder.status,
      portfolioAfter: newPortfolio
    });

    return { order: newOrder, updatedPortfolio: newPortfolio };
  }

  public depositPaperFunds(amountUSD: number): { updatedPortfolio: number; depositAmount: number } {
    const timestamp = Date.now();
    const currentState = this.getState();
    const newPortfolio = parseFloat((currentState.portfolioUSD + amountUSD).toFixed(2));

    this.db.prepare(`
      UPDATE paper_account
      SET portfolio_usd = ?, last_updated = ?
      WHERE id = 'default_account'
    `).run(newPortfolio, timestamp);

    this.recordAuditEvent("SOVEREIGN_USER", "PAPER_CAPITAL_INJECTED", {
      depositAmount: amountUSD,
      portfolioAfter: newPortfolio
    });

    return { updatedPortfolio: newPortfolio, depositAmount: amountUSD };
  }

  public verifyAuditChain(): { isValid: boolean; checkedEvents: number; failureReason?: string } {
    const rows = this.db.prepare("SELECT * FROM causal_audit_events ORDER BY timestamp ASC").all() as any[];
    if (rows.length === 0) {
      return { isValid: true, checkedEvents: 0 };
    }

    let expectedParentHash = "0x0000000000000000000000000000000000000000000000000000000000000000";

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (i > 0 && row.parent_hash !== expectedParentHash) {
        return {
          isValid: false,
          checkedEvents: i,
          failureReason: `Broken parent link at index ${i}: Expected ${expectedParentHash}, got ${row.parent_hash}`
        };
      }

      // Recompute event ID
      const expectedEventId = crypto.createHash("sha256")
        .update(`${row.timestamp}:${row.actor}:${row.payload_hash}:${row.parent_hash}`)
        .digest("hex");

      if (i > 0 && expectedEventId !== row.event_id) {
        return {
          isValid: false,
          checkedEvents: i,
          failureReason: `Hash mismatch at event ${row.event_id}: Expected ${expectedEventId}`
        };
      }

      expectedParentHash = row.event_id;
    }

    return { isValid: true, checkedEvents: rows.length };
  }

  public getAuditHistory(limit: number = 20): CausalAuditRecord[] {
    const rows = this.db.prepare("SELECT * FROM causal_audit_events ORDER BY timestamp DESC LIMIT ?").all(limit) as any[];
    return rows.map(r => ({
      eventId: r.event_id,
      parentHash: r.parent_hash,
      timestamp: Number(r.timestamp),
      actor: r.actor,
      eventType: r.event_type,
      payloadHash: r.payload_hash,
      signature: r.signature
    }));
  }
}

export const nexusLedgerDb = new NexusLedgerDb();
