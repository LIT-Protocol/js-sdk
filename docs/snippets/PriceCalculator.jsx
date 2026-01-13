import { useState, useMemo } from 'react';

export const PriceCalculator = ({ priceData }) => {
  const LitActionPriceComponent = window.LitPricingConstants?.LitActionPriceComponent || {};
  const LIT_ACTION_COMPONENT_NAMES = window.LitPricingConstants?.LIT_ACTION_COMPONENT_NAMES || {};
  const NodePriceMeasurement = window.LitPricingConstants?.NodePriceMeasurement || {};
  const MEASUREMENT_NAMES = window.LitPricingConstants?.MEASUREMENT_NAMES || {};
  const weiToTokens = window.LitPricingConstants?.weiToTokens || (() => 0);
  const formatPrice = window.LitPricingConstants?.formatPrice || ((price) => String(price));

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

  const {
    loading,
    error,
    currentPrices,
    litActionConfigs,
    litKeyPriceUSD,
    pkpMintCost,
    ethers,
  } = priceData || {};

  const totalTokens = useMemo(() => {
    if (!currentPrices || !litActionConfigs || !ethers) return 0;

    let total = 0;

    const addPrice = (price, count) => {
      if (price != null) total += count * weiToTokens(price, ethers);
    };

    // Basic network operations (order must match PRODUCT_IDS in PriceProvider)
    addPrice(currentPrices[0], pkpSignCount);    // PkpSign
    addPrice(currentPrices[1], encSignCount);     // EncSign
    addPrice(currentPrices[2], sessionKeyCount);  // SignSessionKey

    // PKP minting
    addPrice(pkpMintCost, pkpMintCount);

    // Lit Action operations
    litActionConfigs.forEach(config => {
      const component = Number(config.priceComponent);
      const counts = [
        litActionBaseCount, litActionRuntimeSeconds, litActionMemoryMB,
        litActionCodeLength, litActionResponseLength, litActionSignatures,
        litActionBroadcasts, litActionContractCalls, litActionCallDepth,
        litActionDecrypts, litActionFetches
      ];
      if (component < counts.length) {
        addPrice(config.price, counts[component]);
      }
    });

    return total;
  }, [
    pkpSignCount, encSignCount, sessionKeyCount, pkpMintCount,
    litActionBaseCount, litActionRuntimeSeconds, litActionMemoryMB,
    litActionCodeLength, litActionResponseLength, litActionSignatures,
    litActionBroadcasts, litActionContractCalls, litActionCallDepth,
    litActionDecrypts, litActionFetches, currentPrices, litActionConfigs,
    pkpMintCost, ethers
  ]);

  const totalUSD = litKeyPriceUSD ? totalTokens * litKeyPriceUSD : null;

  if (!priceData) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Price data not available. Please wrap this component with PriceProvider.</p>
      </div>
    );
  }

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

  const renderNumberInput = (label, value, onChange, step = 1, min = 0, allowDecimals = false) => {
    const handleChange = (e) => {
      const newValue = e.target.value;

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

    const handleIncrement = () => {
      const newValue = value + step;
      onChange(Math.max(min, allowDecimals ? newValue : Math.round(newValue)));
    };

    const handleDecrement = () => {
      const newValue = value - step;
      onChange(Math.max(min, allowDecimals ? newValue : Math.round(newValue)));
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
            onClick={handleDecrement}
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
            onClick={handleIncrement}
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
          {renderNumberInput(`${LIT_ACTION_COMPONENT_NAMES[LitActionPriceComponent.baseAmount]} ${MEASUREMENT_NAMES[NodePriceMeasurement.perCount]}`, litActionBaseCount, setLitActionBaseCount)}
          {renderNumberInput(`${LIT_ACTION_COMPONENT_NAMES[LitActionPriceComponent.runtimeLength]} ${MEASUREMENT_NAMES[NodePriceMeasurement.perSecond]}`, litActionRuntimeSeconds, setLitActionRuntimeSeconds, 0.1, 0, true)}
          {renderNumberInput(`${LIT_ACTION_COMPONENT_NAMES[LitActionPriceComponent.memoryUsage]} ${MEASUREMENT_NAMES[NodePriceMeasurement.perMegabyte]}`, litActionMemoryMB, setLitActionMemoryMB, 0.1, 0, true)}
          {renderNumberInput(`${LIT_ACTION_COMPONENT_NAMES[LitActionPriceComponent.codeLength]} ${MEASUREMENT_NAMES[NodePriceMeasurement.perMegabyte]}`, litActionCodeLength, setLitActionCodeLength, 0.1, 0, true)}
          {renderNumberInput(`${LIT_ACTION_COMPONENT_NAMES[LitActionPriceComponent.responseLength]} ${MEASUREMENT_NAMES[NodePriceMeasurement.perMegabyte]}`, litActionResponseLength, setLitActionResponseLength, 0.1, 0, true)}
        </div>
        <div>
          {renderNumberInput(`${LIT_ACTION_COMPONENT_NAMES[LitActionPriceComponent.signatures]} ${MEASUREMENT_NAMES[NodePriceMeasurement.perCount]}`, litActionSignatures, setLitActionSignatures)}
          {renderNumberInput(`${LIT_ACTION_COMPONENT_NAMES[LitActionPriceComponent.broadcasts]} ${MEASUREMENT_NAMES[NodePriceMeasurement.perCount]}`, litActionBroadcasts, setLitActionBroadcasts)}
          {renderNumberInput(`${LIT_ACTION_COMPONENT_NAMES[LitActionPriceComponent.contractCalls]} ${MEASUREMENT_NAMES[NodePriceMeasurement.perCount]}`, litActionContractCalls, setLitActionContractCalls)}
          {renderNumberInput(`${LIT_ACTION_COMPONENT_NAMES[LitActionPriceComponent.callDepth]} ${MEASUREMENT_NAMES[NodePriceMeasurement.perCount]}`, litActionCallDepth, setLitActionCallDepth)}
          {renderNumberInput(`${LIT_ACTION_COMPONENT_NAMES[LitActionPriceComponent.decrypts]} ${MEASUREMENT_NAMES[NodePriceMeasurement.perCount]}`, litActionDecrypts, setLitActionDecrypts)}
          {renderNumberInput(`${LIT_ACTION_COMPONENT_NAMES[LitActionPriceComponent.fetches]} ${MEASUREMENT_NAMES[NodePriceMeasurement.perCount]}`, litActionFetches, setLitActionFetches)}
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
