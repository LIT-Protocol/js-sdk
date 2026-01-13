import { useState } from 'react';

export const PriceCalculator = ({ priceData }) => {
  const LitActionPriceComponent = window.LitPricingConstants?.LitActionPriceComponent || {};
  const weiToTokens = window.LitPricingConstants?.weiToTokens || (() => 0);
  const formatPrice = window.LitPricingConstants?.formatPrice || ((price) => String(price));

  const ProductId = {
    PkpSign: 0,
    EncSign: 1,
    LitAction: 2,
    SignSessionKey: 3,
  };

  const [pkpSignCount, setPkpSignCount] = useState(0);
  const [encSignCount, setEncSignCount] = useState(0);
  const [sessionKeyCount, setSessionKeyCount] = useState(0);
  const [pkpMintCount, setPkpMintCount] = useState(0);

  const [litActionBaseCount, setLitActionBaseCount] = useState(0);
  const [litActionRuntimeSeconds, setLitActionRuntimeSeconds] = useState(0);
  const [litActionMemoryMB, setLitActionMemoryMB] = useState(0);
  const [litActionCodeLength, setLitActionCodeLength] = useState(0);
  const [litActionResponseLength, setLitActionResponseLength] = useState(0);
  const [litActionSignatures, setLitActionSignatures] = useState(0);
  const [litActionBroadcasts, setLitActionBroadcasts] = useState(0);
  const [litActionContractCalls, setLitActionContractCalls] = useState(0);
  const [litActionCallDepth, setLitActionCallDepth] = useState(0);
  const [litActionDecrypts, setLitActionDecrypts] = useState(0);
  const [litActionFetches, setLitActionFetches] = useState(0);

  if (!priceData) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Price data not available. Please wrap this component with PriceProvider.</p>
      </div>
    );
  }

  const {
    loading,
    error,
    currentPrices,
    litActionConfigs,
    litKeyPriceUSD,
    pkpMintCost,
    ethers,
  } = priceData;

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading pricing data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <p>Error loading prices: {error}</p>
      </div>
    );
  }

  const getProductPrice = (productId) => {
    const index = [ProductId.PkpSign, ProductId.EncSign, ProductId.SignSessionKey].indexOf(productId);
    if (index === -1) return 0;
    return weiToTokens(currentPrices[index], ethers);
  };

  const getLitActionComponentPrice = (componentId) => {
    const config = litActionConfigs.find(c => Number(c.priceComponent) === componentId);
    if (!config) return 0;
    return weiToTokens(config.price, ethers);
  };

  const calculateTotal = () => {
    let totalTokens = 0;

    totalTokens += pkpSignCount * getProductPrice(ProductId.PkpSign);
    totalTokens += encSignCount * getProductPrice(ProductId.EncSign);
    totalTokens += sessionKeyCount * getProductPrice(ProductId.SignSessionKey);

    if (pkpMintCost) {
      totalTokens += pkpMintCount * weiToTokens(pkpMintCost, ethers);
    }

    totalTokens += litActionBaseCount * getLitActionComponentPrice(LitActionPriceComponent.baseAmount);
    totalTokens += litActionRuntimeSeconds * getLitActionComponentPrice(LitActionPriceComponent.runtimeLength);
    totalTokens += litActionMemoryMB * getLitActionComponentPrice(LitActionPriceComponent.memoryUsage);
    totalTokens += litActionCodeLength * getLitActionComponentPrice(LitActionPriceComponent.codeLength);
    totalTokens += litActionResponseLength * getLitActionComponentPrice(LitActionPriceComponent.responseLength);
    totalTokens += litActionSignatures * getLitActionComponentPrice(LitActionPriceComponent.signatures);
    totalTokens += litActionBroadcasts * getLitActionComponentPrice(LitActionPriceComponent.broadcasts);
    totalTokens += litActionContractCalls * getLitActionComponentPrice(LitActionPriceComponent.contractCalls);
    totalTokens += litActionCallDepth * getLitActionComponentPrice(LitActionPriceComponent.callDepth);
    totalTokens += litActionDecrypts * getLitActionComponentPrice(LitActionPriceComponent.decrypts);
    totalTokens += litActionFetches * getLitActionComponentPrice(LitActionPriceComponent.fetches);

    return totalTokens;
  };

  const totalTokens = calculateTotal();
  const totalUSD = litKeyPriceUSD ? totalTokens * litKeyPriceUSD : null;

  // Helper function to render number input - defined inline to avoid focus issues
  const renderNumberInput = (label, value, onChange, step = 1, min = 0, allowDecimals = false) => {
    const handleChange = (e) => {
      const newValue = e.target.value;

      // Allow empty string temporarily
      if (newValue === '') {
        onChange(0);
        return;
      }

      const parsed = allowDecimals ? parseFloat(newValue) : parseInt(newValue, 10);
      if (!isNaN(parsed)) {
        const validated = Math.max(min, parsed);
        onChange(validated);
      }
    };

    return (
      <div key={label} style={{ marginBottom: '15px' }}>
        <label style={{
          display: 'block',
          marginBottom: '5px',
          fontSize: '0.9em',
          fontWeight: '500',
          color: 'var(--mint-text, inherit)',
        }}>
          {label}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => onChange(Math.max(min, value - step))}
            style={{
              padding: '8px 12px',
              fontSize: '1em',
              cursor: 'pointer',
              border: '1px solid var(--mint-border, #ddd)',
              borderRadius: '4px',
              backgroundColor: 'var(--mint-bg-secondary, #f5f5f5)',
              color: 'var(--mint-text, inherit)',
            }}
          >
            -
          </button>
          <input
            type="number"
            value={value || ''}
            onChange={handleChange}
            step={step}
            min={min}
            style={{
              flex: 1,
              padding: '8px',
              fontSize: '0.9em',
              border: '1px solid var(--mint-border, #ddd)',
              borderRadius: '4px',
              backgroundColor: 'var(--mint-bg-secondary, #f5f5f5)',
              color: 'var(--mint-text, inherit)',
            }}
          />
          <button
            onClick={() => onChange(value + step)}
            style={{
              padding: '8px 12px',
              fontSize: '1em',
              cursor: 'pointer',
              border: '1px solid var(--mint-border, #ddd)',
              borderRadius: '4px',
              backgroundColor: 'var(--mint-bg-secondary, #f5f5f5)',
              color: 'var(--mint-text, inherit)',
            }}
          >
            +
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      marginTop: '30px',
      marginBottom: '30px',
      padding: '20px',
      border: '1px solid var(--mint-border, #ddd)',
      borderRadius: '8px',
    }}>
      <p style={{
        fontSize: '0.9em',
        color: 'var(--mint-text-secondary, #666)',
        marginBottom: '20px'
      }}>
        Enter your expected usage below to estimate the total cost. All prices reflect real-time network rates.
      </p>

      <h4 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1em', color: 'var(--mint-text, inherit)' }}>Basic Network Operations</h4>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* Basic Network Operations */}
        <div>
          {renderNumberInput("PKP Sign Operations", pkpSignCount, setPkpSignCount)}
          {renderNumberInput("Encrypted Sign Operations", encSignCount, setEncSignCount)}
        </div>

        <div>
          {renderNumberInput("Sign Session Key Operations", sessionKeyCount, setSessionKeyCount)}
          {renderNumberInput("PKP Minting", pkpMintCount, setPkpMintCount)}
        </div>
      </div>

      <h4 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1em', color: 'var(--mint-text, inherit)' }}>Lit Action Operations</h4>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* Lit Action Operations */}
        <div>
          {renderNumberInput("Number of Executions", litActionBaseCount, setLitActionBaseCount)}
          {renderNumberInput("Runtime (seconds)", litActionRuntimeSeconds, setLitActionRuntimeSeconds, 1, 0, true)}
          {renderNumberInput("Memory Usage (MB)", litActionMemoryMB, setLitActionMemoryMB, 1, 0, true)}
          {renderNumberInput("Code Length (MB)", litActionCodeLength, setLitActionCodeLength, 1, 0, true)}
          {renderNumberInput("Response Length (MB)", litActionResponseLength, setLitActionResponseLength, 1, 0, true)}
        </div>
        <div>
          {renderNumberInput("Signatures", litActionSignatures, setLitActionSignatures)}
          {renderNumberInput("Broadcasts", litActionBroadcasts, setLitActionBroadcasts)}
          {renderNumberInput("Contract Calls", litActionContractCalls, setLitActionContractCalls)}
          {renderNumberInput("Call Depth", litActionCallDepth, setLitActionCallDepth)}
          {renderNumberInput("Decrypts", litActionDecrypts, setLitActionDecrypts)}
          {renderNumberInput("Fetches", litActionFetches, setLitActionFetches)}
        </div>
      </div>

      {/* Total Cost Display */}
      <div
        style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: 'var(--mint-bg-secondary, #f9f9f9)',
          borderRadius: '8px',
          textAlign: 'right',
        }}
      >
        <h4 style={{ marginTop: 0, marginBottom: '10px', textAlign: 'right', color: 'var(--mint-text, inherit)' }}>
          Estimated Total Cost
        </h4>
        <div
          style={{
            fontSize: '1.5em',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            color: 'var(--mint-primary, #0066cc)',
            textAlign: 'right',
          }}
        >
          {formatPrice(totalTokens, totalUSD)}
        </div>
        <button
          onClick={() => {
            setPkpSignCount(0);
            setEncSignCount(0);
            setSessionKeyCount(0);
            setPkpMintCount(0);
            setLitActionBaseCount(0);
            setLitActionRuntimeSeconds(0);
            setLitActionMemoryMB(0);
            setLitActionCodeLength(0);
            setLitActionResponseLength(0);
            setLitActionSignatures(0);
            setLitActionBroadcasts(0);
            setLitActionContractCalls(0);
            setLitActionCallDepth(0);
            setLitActionDecrypts(0);
            setLitActionFetches(0);
          }}
          style={{
            marginTop: '15px',
            padding: '10px 20px',
            fontSize: '0.9em',
            cursor: 'pointer',
            border: '1px solid var(--mint-border, #ddd)',
            borderRadius: '4px',
            backgroundColor: 'var(--mint-bg-secondary, #f5f5f5)',
            color: 'var(--mint-text, inherit)',
            textAlign: 'right',
          }}
        >
          Reset All Values
        </button>
      </div>
    </div>
  );
};
