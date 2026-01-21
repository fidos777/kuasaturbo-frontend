import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  TenantCreditBalance,
  CreditTransaction,
  CreditTransactionType,
  CreditPackage,
  CreditReservation,
  CreditCheckResult,
  ExecutionCreditEstimate,
  CREDIT_PACKAGES,
  CREDIT_COST_MULTIPLIERS,
  DEFAULT_CREDIT_CONFIG,
  WorkflowStatus,
} from '@/types/orchestrator';

// ============================================================================
// PHASE 8.1: CREDIT ENGINE STORE
// ============================================================================
// Invariant I4: "No Economy Without Credits" - Which tenant owns this?
// Invariant I5: "No Chaos Without Consequence" - Which ledger drives the money?
// ============================================================================

interface CreditStore {
  // State
  balance: TenantCreditBalance | null;
  transactions: CreditTransaction[];
  reservations: CreditReservation[];
  isLoading: boolean;
  error: string | null;

  // Purchase Modal State
  isPurchaseModalOpen: boolean;
  selectedPackage: CreditPackage | null;

  // Actions - Balance
  initializeBalance: (tenantId: string, tenantName: string) => void;
  refreshBalance: () => void;

  // Actions - Purchase
  openPurchaseModal: (suggestedPackage?: CreditPackage) => void;
  closePurchaseModal: () => void;
  selectPackage: (pkg: CreditPackage) => void;
  purchaseCredits: (packageId: string) => Promise<boolean>;

  // Actions - Execution
  checkCredits: (requiredCredits: number) => CreditCheckResult;
  reserveCredits: (workflowId: string, jobId: string, estimatedCost: number) => CreditReservation | null;
  consumeReservation: (reservationId: string, actualCost: number) => boolean;
  releaseReservation: (reservationId: string) => void;

  // Actions - Calculation
  calculateWorkflowCost: (baseCost: number, status: WorkflowStatus) => ExecutionCreditEstimate | null;

  // Actions - Transactions
  addTransaction: (
    type: CreditTransactionType,
    amount: number,
    description: string,
    referenceType?: 'workflow' | 'job' | 'package' | 'admin',
    referenceId?: string,
    workflowName?: string,
    trustMultiplier?: number,
    baseCost?: number
  ) => void;

  // Getters
  getAvailableCredits: () => number;
  isLowBalance: () => boolean;
  getRecentTransactions: (limit?: number) => CreditTransaction[];
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generate proof hash (simulated - in production would be SHA256)
function generateProofHash(data: object): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `proof_${Math.abs(hash).toString(16).padStart(16, '0')}`;
}

export const useCreditStore = create<CreditStore>()(
  persist(
    (set, get) => ({
      // Initial State
      balance: null,
      transactions: [],
      reservations: [],
      isLoading: false,
      error: null,
      isPurchaseModalOpen: false,
      selectedPackage: null,

      // Initialize balance for a tenant
      initializeBalance: (tenantId: string, tenantName: string) => {
        const existingBalance = get().balance;
        if (existingBalance && existingBalance.tenant_id === tenantId) {
          return; // Already initialized
        }

        // Create new balance with demo credits
        const newBalance: TenantCreditBalance = {
          tenant_id: tenantId,
          tenant_name: tenantName,
          balance: 250, // Demo starting balance
          reserved: 0,
          available: 250,
          lifetime_purchased: 250,
          lifetime_used: 0,
          low_balance_threshold: DEFAULT_CREDIT_CONFIG.low_balance_alert_threshold,
          auto_topup_enabled: false,
        };

        // Record initial transaction
        const initialTransaction: CreditTransaction = {
          id: generateId(),
          tenant_id: tenantId,
          type: 'bonus',
          amount: 250,
          balance_after: 250,
          created_at: new Date().toISOString(),
          created_by: 'system',
          description: 'Welcome bonus credits',
          proof_hash: generateProofHash({ type: 'bonus', amount: 250, tenantId }),
        };

        set({
          balance: newBalance,
          transactions: [initialTransaction],
        });
      },

      // Refresh balance (recalculate available from balance - reserved)
      refreshBalance: () => {
        const { balance, reservations } = get();
        if (!balance) return;

        const activeReservations = reservations.filter(r => r.status === 'active');
        const totalReserved = activeReservations.reduce((sum, r) => sum + r.estimated_cost, 0);

        set({
          balance: {
            ...balance,
            reserved: totalReserved,
            available: balance.balance - totalReserved,
          },
        });
      },

      // Open purchase modal
      openPurchaseModal: (suggestedPackage?: CreditPackage) => {
        set({
          isPurchaseModalOpen: true,
          selectedPackage: suggestedPackage || CREDIT_PACKAGES.find(p => p.popular) || CREDIT_PACKAGES[0],
        });
      },

      // Close purchase modal
      closePurchaseModal: () => {
        set({ isPurchaseModalOpen: false, selectedPackage: null });
      },

      // Select a package
      selectPackage: (pkg: CreditPackage) => {
        set({ selectedPackage: pkg });
      },

      // Purchase credits (mock implementation)
      purchaseCredits: async (packageId: string): Promise<boolean> => {
        const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
        if (!pkg) return false;

        const { balance } = get();
        if (!balance) return false;

        set({ isLoading: true, error: null });

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const totalCredits = pkg.credits + (pkg.bonus_credits || 0);
        const newBalance = balance.balance + totalCredits;

        // Create transaction
        get().addTransaction(
          'purchase',
          totalCredits,
          `Purchased ${pkg.name} package (${pkg.credits} credits${pkg.bonus_credits ? ` + ${pkg.bonus_credits} bonus` : ''})`,
          'package',
          pkg.id
        );

        // Update balance
        set({
          balance: {
            ...balance,
            balance: newBalance,
            available: newBalance - balance.reserved,
            lifetime_purchased: balance.lifetime_purchased + totalCredits,
            last_transaction_at: new Date().toISOString(),
          },
          isLoading: false,
          isPurchaseModalOpen: false,
          selectedPackage: null,
        });

        return true;
      },

      // Check if credits are sufficient
      checkCredits: (requiredCredits: number): CreditCheckResult => {
        const { balance } = get();

        if (!balance) {
          return {
            can_execute: false,
            reason: 'No balance initialized',
            available_credits: 0,
            required_credits: requiredCredits,
            shortfall: requiredCredits,
          };
        }

        const available = balance.available;
        const canExecute = available >= requiredCredits;

        if (canExecute) {
          return {
            can_execute: true,
            available_credits: available,
            required_credits: requiredCredits,
          };
        }

        // Find suggested package
        const shortfall = requiredCredits - available;
        const suggestedPackage = CREDIT_PACKAGES.find(
          p => (p.credits + (p.bonus_credits || 0)) >= shortfall
        ) || CREDIT_PACKAGES[CREDIT_PACKAGES.length - 1];

        return {
          can_execute: false,
          reason: `Insufficient credits. Need ${requiredCredits}, have ${available}.`,
          available_credits: available,
          required_credits: requiredCredits,
          shortfall,
          suggested_package: suggestedPackage,
        };
      },

      // Reserve credits for a job
      reserveCredits: (workflowId: string, jobId: string, estimatedCost: number): CreditReservation | null => {
        const { balance, reservations } = get();
        if (!balance) return null;

        // Add buffer
        const bufferedCost = Math.ceil(estimatedCost * (1 + DEFAULT_CREDIT_CONFIG.reservation_buffer_percent / 100));

        // Check availability
        if (balance.available < bufferedCost) {
          return null;
        }

        const reservation: CreditReservation = {
          reservation_id: generateId(),
          tenant_id: balance.tenant_id,
          workflow_id: workflowId,
          job_id: jobId,
          estimated_cost: bufferedCost,
          reserved_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + DEFAULT_CREDIT_CONFIG.reservation_ttl_minutes * 60 * 1000).toISOString(),
          status: 'active',
        };

        // Add reservation transaction
        get().addTransaction(
          'reservation',
          -bufferedCost,
          `Reserved credits for job ${jobId}`,
          'job',
          jobId
        );

        set({
          reservations: [...reservations, reservation],
        });

        get().refreshBalance();
        return reservation;
      },

      // Consume a reservation (job completed)
      consumeReservation: (reservationId: string, actualCost: number): boolean => {
        const { reservations, balance } = get();
        if (!balance) return false;

        const reservation = reservations.find(r => r.reservation_id === reservationId);
        if (!reservation || reservation.status !== 'active') return false;

        // Calculate refund if actual < reserved
        const refund = reservation.estimated_cost - actualCost;

        // Update reservation
        const updatedReservations = reservations.map(r =>
          r.reservation_id === reservationId
            ? { ...r, status: 'consumed' as const, actual_cost: actualCost, consumed_at: new Date().toISOString() }
            : r
        );

        // Add execution transaction
        get().addTransaction(
          'execution',
          -actualCost,
          `Workflow execution completed`,
          'job',
          reservation.job_id
        );

        // Refund excess if any
        if (refund > 0) {
          get().addTransaction(
            'release',
            refund,
            `Released excess reservation`,
            'job',
            reservation.job_id
          );
        }

        // Update balance
        const newUsed = balance.lifetime_used + actualCost;
        const newBalance = balance.balance - actualCost;

        set({
          reservations: updatedReservations,
          balance: {
            ...balance,
            balance: newBalance,
            lifetime_used: newUsed,
            last_transaction_at: new Date().toISOString(),
          },
        });

        get().refreshBalance();
        return true;
      },

      // Release a reservation (job cancelled/failed)
      releaseReservation: (reservationId: string) => {
        const { reservations } = get();
        const reservation = reservations.find(r => r.reservation_id === reservationId);

        if (!reservation || reservation.status !== 'active') return;

        // Add release transaction
        get().addTransaction(
          'release',
          reservation.estimated_cost,
          `Released reservation for cancelled job`,
          'job',
          reservation.job_id
        );

        // Update reservation
        set({
          reservations: reservations.map(r =>
            r.reservation_id === reservationId
              ? { ...r, status: 'released' as const, released_at: new Date().toISOString() }
              : r
          ),
        });

        get().refreshBalance();
      },

      // Calculate workflow cost
      calculateWorkflowCost: (baseCost: number, status: WorkflowStatus): ExecutionCreditEstimate | null => {
        const multiplier = CREDIT_COST_MULTIPLIERS[status];

        if (multiplier === null) {
          return null;
        }

        const finalCost = Math.ceil(baseCost * multiplier);
        const sandboxCost = Math.ceil(baseCost * 1.0);

        return {
          workflow_id: '',
          workflow_name: '',
          workflow_status: status,
          base_cost: baseCost,
          tasks: [],
          trust_multiplier: multiplier,
          trust_discount_percent: Math.round((1 - multiplier) * 100),
          final_cost: finalCost,
          vs_sandbox_cost: sandboxCost,
          savings_from_trust: sandboxCost - finalCost,
        };
      },

      // Add a transaction
      addTransaction: (
        type: CreditTransactionType,
        amount: number,
        description: string,
        referenceType?: 'workflow' | 'job' | 'package' | 'admin',
        referenceId?: string,
        workflowName?: string,
        trustMultiplier?: number,
        baseCost?: number
      ) => {
        const { balance, transactions } = get();
        if (!balance) return;

        const newBalanceAmount = balance.balance + amount;

        const transaction: CreditTransaction = {
          id: generateId(),
          tenant_id: balance.tenant_id,
          type,
          amount,
          balance_after: newBalanceAmount,
          reference_type: referenceType,
          reference_id: referenceId,
          workflow_name: workflowName,
          trust_multiplier: trustMultiplier,
          base_cost: baseCost,
          created_at: new Date().toISOString(),
          description,
          proof_hash: generateProofHash({ type, amount, referenceId, timestamp: Date.now() }),
        };

        set({
          transactions: [transaction, ...transactions],
        });
      },

      // Get available credits
      getAvailableCredits: (): number => {
        const { balance } = get();
        return balance?.available || 0;
      },

      // Check if low balance
      isLowBalance: (): boolean => {
        const { balance } = get();
        if (!balance) return false;
        return balance.available <= balance.low_balance_threshold;
      },

      // Get recent transactions
      getRecentTransactions: (limit = 10): CreditTransaction[] => {
        const { transactions } = get();
        return transactions.slice(0, limit);
      },
    }),
    {
      name: 'kuasaturbo-credit-store',
      partialize: (state) => ({
        balance: state.balance,
        transactions: state.transactions,
        reservations: state.reservations.filter(r => r.status === 'active'),
      }),
    }
  )
);
