/**
 * PaymentOperationsDashboard Component
 * 
 * Specialized dashboard for payment operations with enhanced UX
 */

import { useEffect, useState, type FC } from "react";

import { SUPPORTED_CHAINS } from "@/domain/lit/chains";

import { SendTransactionForm } from './SendTransactionForm';
import { UIPKP, TransactionResult } from '../../types';

interface PaymentOperationsDashboardProps {
  selectedPkp: UIPKP | null;
  selectedChain: string;
  disabled?: boolean;
  onTransactionComplete?: (result: TransactionResult) => void;
}

interface PaymentTemplate {
  id: string;
  name: string;
  recipient: string;
  amount: string;
  description: string;
}

interface RecentRecipient {
  address: string;
  label?: string;
  lastUsed: string;
  transactionCount: number;
}

export const PaymentOperationsDashboard: FC<PaymentOperationsDashboardProps> = ({ 
  selectedPkp,
  selectedChain,
  disabled = false,
  onTransactionComplete,
}) => {
  const [paymentMode, setPaymentMode] = useState<'quick' | 'advanced'>('quick');
  const [quickAmount, setQuickAmount] = useState('');
  const [quickRecipient, setQuickRecipient] = useState('');
  const [recentRecipients, setRecentRecipients] = useState<RecentRecipient[]>([]);
  const [paymentTemplates, setPaymentTemplates] = useState<PaymentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PaymentTemplate | null>(null);

  // Get chain info
  const chainInfo = SUPPORTED_CHAINS[selectedChain as keyof typeof SUPPORTED_CHAINS];

  // Load saved recipients and templates from localStorage
  useEffect(() => {
    const savedRecipients = localStorage.getItem('payment-recent-recipients');
    const savedTemplates = localStorage.getItem('payment-templates');
    
    if (savedRecipients) {
      try {
        setRecentRecipients(JSON.parse(savedRecipients));
      } catch (e) {
        console.error('Failed to parse saved recipients:', e);
      }
    }

    if (savedTemplates) {
      try {
        setPaymentTemplates(JSON.parse(savedTemplates));
      } catch (e) {
        console.error('Failed to parse saved templates:', e);
      }
    }
  }, []);

  // Save recipient to recent list
  const saveRecipient = (address: string) => {
    setRecentRecipients(prev => {
      const existing = prev.find(r => r.address.toLowerCase() === address.toLowerCase());
      let updated;
      
      if (existing) {
        // Update existing recipient
        updated = prev.map(r => 
          r.address.toLowerCase() === address.toLowerCase()
            ? { ...r, lastUsed: new Date().toISOString(), transactionCount: r.transactionCount + 1 }
            : r
        );
      } else {
        // Add new recipient
        const newRecipient: RecentRecipient = {
          address,
          lastUsed: new Date().toISOString(),
          transactionCount: 1,
        };
        updated = [newRecipient, ...prev].slice(0, 10); // Keep only last 10
      }
      
      localStorage.setItem('payment-recent-recipients', JSON.stringify(updated));
      return updated;
    });
  };

  // Handle transaction completion
  const handleTransactionComplete = (result: TransactionResult) => {
    // Save recipient to recent list
    saveRecipient(result.to);
    
    // Forward to parent handler
    if (onTransactionComplete) {
      onTransactionComplete(result);
    }
  };

  // Quick amount buttons
  const quickAmounts = ['0.001', '0.01', '0.1', '1.0'];

  // Quick payment form
  const QuickPaymentForm = () => (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        boxShadow: "",
        marginBottom: "20px",
      }}
    >
      <h3 style={{ margin: "0 0 16px 0", color: "#1f2937" }}>
        ⚡ Quick Payment
      </h3>
      <p style={{ margin: "0 0 16px 0", color: "#6b7280", fontSize: "14px" }}>
        Send {chainInfo?.symbol || "ETH"} instantly with preset amounts
      </p>

      {/* Quick Amount Selection */}
      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#374151" }}>
          Amount ({chainInfo?.symbol || "ETH"})
        </label>
        <div style={{ display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
          {quickAmounts.map(amount => (
            <button
              key={amount}
              onClick={() => setQuickAmount(amount)}
              style={{
                padding: "8px 16px",
                border: `2px solid ${quickAmount === amount ? "#3b82f6" : "#d1d5db"}`,
                borderRadius: "8px",
                backgroundColor: quickAmount === amount ? "#eff6ff" : "#ffffff",
                color: quickAmount === amount ? "#3b82f6" : "#374151",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.2s",
              }}
            >
              {amount}
            </button>
          ))}
        </div>
        <input
          type="number"
          value={quickAmount}
          onChange={(e) => setQuickAmount(e.target.value)}
          placeholder="Custom amount"
          step="0.001"
          min="0"
          style={{
            width: "100%",
            padding: "12px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "14px",
            color: "#374151",
          }}
        />
      </div>

      {/* Recipient Selection */}
      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#374151" }}>
          Recipient
        </label>
        <input
          type="text"
          value={quickRecipient}
          onChange={(e) => setQuickRecipient(e.target.value)}
          placeholder="Enter recipient address (0x...)"
          style={{
            width: "100%",
            padding: "12px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "14px",
            fontFamily: "monospace",
            color: "#374151",
            marginBottom: "8px",
          }}
        />

        {/* Recent Recipients */}
        {recentRecipients.length > 0 && (
          <div>
            <p style={{ fontSize: "12px", color: "#6b7280", margin: "8px 0 4px 0" }}>
              Recent recipients:
            </p>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {recentRecipients.slice(0, 3).map((recipient, index) => (
                <button
                  key={index}
                  onClick={() => setQuickRecipient(recipient.address)}
                  style={{
                    padding: "4px 8px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    backgroundColor: "#f9fafb",
                    color: "#374151",
                    cursor: "pointer",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    transition: "all 0.2s",
                  }}
                  title={`Used ${recipient.transactionCount} times, last: ${new Date(recipient.lastUsed).toLocaleDateString()}`}
                >
                  {recipient.address.slice(0, 6)}...{recipient.address.slice(-4)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Self-send Helper */}
      <div style={{ marginBottom: "16px" }}>
        <button
          onClick={() => setQuickRecipient(selectedPkp?.ethAddress || '')}
          disabled={!selectedPkp?.ethAddress}
          style={{
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            backgroundColor: "#f9fafb",
            color: "#374151",
            cursor: selectedPkp?.ethAddress ? "pointer" : "not-allowed",
            fontSize: "12px",
            transition: "all 0.2s",
          }}
        >
          💸 Send to self (for testing)
        </button>
      </div>

      {/* Payment Templates */}
      {paymentTemplates.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#374151" }}>
            Payment Templates
          </label>
          <select
            value={selectedTemplate?.id || ''}
            onChange={(e) => {
              const template = paymentTemplates.find(t => t.id === e.target.value);
              setSelectedTemplate(template || null);
              if (template) {
                setQuickAmount(template.amount);
                setQuickRecipient(template.recipient);
              }
            }}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#374151",
            }}
          >
            <option value="">Select a template...</option>
            {paymentTemplates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name} - {template.amount} {chainInfo?.symbol}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Header */}
      <div
        style={{
          marginBottom: "20px",
          padding: "16px 20px",
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          borderRadius: "12px",
          color: "white",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            margin: "0 0 8px 0",
            fontSize: "20px",
            fontWeight: "700",
          }}
        >
          💰 Payment Operations
        </h2>
        <p
          style={{
            margin: "0",
            fontSize: "14px",
            opacity: 0.9,
            lineHeight: "1.4",
          }}
        >
          Send payments quickly and securely using your PKP wallet across multiple chains.
        </p>
      </div>

      {/* Payment Mode Toggle */}
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            backgroundColor: "#f3f4f6",
            borderRadius: "8px",
            padding: "4px",
            border: "1px solid #d1d5db",
          }}
        >
          <button
            onClick={() => setPaymentMode('quick')}
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "6px",
              backgroundColor: paymentMode === 'quick' ? "#3b82f6" : "transparent",
              color: paymentMode === 'quick' ? "white" : "#6b7280",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s",
            }}
          >
            ⚡ Quick Payment
          </button>
          <button
            onClick={() => setPaymentMode('advanced')}
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "6px",
              backgroundColor: paymentMode === 'advanced' ? "#3b82f6" : "transparent",
              color: paymentMode === 'advanced' ? "white" : "#6b7280",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s",
            }}
          >
            🔧 Advanced
          </button>
        </div>
      </div>

      {/* Payment Forms */}
      {paymentMode === 'quick' ? (
        <>
          <QuickPaymentForm />
          {/* Quick Send Transaction Form */}
          <SendTransactionForm
            selectedPkp={selectedPkp}
            selectedChain={selectedChain}
            disabled={disabled}
            onTransactionComplete={handleTransactionComplete}
            initialRecipient={quickRecipient}
            initialAmount={quickAmount}
          />
        </>
      ) : (
        <SendTransactionForm
          selectedPkp={selectedPkp}
          selectedChain={selectedChain}
          disabled={disabled}
          onTransactionComplete={handleTransactionComplete}
        />
      )}

      {/* Network Information */}
      <div
        style={{
          marginTop: "20px",
          padding: "16px",
          backgroundColor: "#f0f9ff",
          border: "1px solid #bfdbfe",
          borderRadius: "8px",
        }}
      >
        <h4 style={{ margin: "0 0 8px 0", color: "#1e40af", fontSize: "14px" }}>
          💡 Payment Tips
        </h4>
        <ul style={{ margin: "0", paddingLeft: "20px", color: "#1e40af", fontSize: "13px" }}>
          <li>Use Quick Payment for common amounts and recipients</li>
          <li>Recipients are automatically saved for future use</li>
          <li>All transactions are secure and signed by your PKP wallet</li>
          {chainInfo?.testnet && (
            <li>
              This is a testnet - get free tokens from the{" "}
              <a
                href="https://chronicle-yellowstone-faucet.getlit.dev/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#1e40af", textDecoration: "underline" }}
              >
                faucet
              </a>
            </li>
          )}
        </ul>
      </div>
    </>
  );
};
