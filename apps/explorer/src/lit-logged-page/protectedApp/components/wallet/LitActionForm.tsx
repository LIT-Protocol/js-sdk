/**
 * LitActionForm Component
 *
 * Form for executing Lit Actions with custom JavaScript code
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Editor from "@monaco-editor/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, Check, Share2, Info } from "lucide-react";
import { useLitAuth } from "../../../../lit-login-modal/LitAuthProvider";
import { UIPKP } from "../../types";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { triggerLedgerRefresh } from "../../utils/ledgerRefresh";
import {
  getDefaultLitActionExample,
  getLitActionExample,
  litActionExamples,
} from "../../../../lit-action-examples";
import litActionsGlobalDefinition from "@lit-protocol/naga-la-types/globals?raw";
import litActionsNamespaceDefinition from "@lit-protocol/naga-la-types?raw";

// UI constants
const EDITOR_FONT_SIZE_COMPACT = 10;
const EDITOR_FONT_SIZE_FULLSCREEN = 14;
const EDITOR_LINE_HEIGHT = 20;
const FULLSCREEN_Z_INDEX = 9999;

const formatJsParams = (value?: Record<string, unknown>) => {
  if (!value || Object.keys(value).length === 0) {
    return "{}";
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "{}";
  }
};

const DEFAULT_EXAMPLE = getDefaultLitActionExample();
const DEFAULT_EXAMPLE_ID = DEFAULT_EXAMPLE?.id ?? null;
const DEFAULT_EXAMPLE_CODE = DEFAULT_EXAMPLE?.code ?? "";
const DEFAULT_JS_PARAMS_INPUT = formatJsParams(DEFAULT_EXAMPLE?.jsParams);
const CUSTOM_SHARE_EXAMPLE_ID = "custom-share";
const CUSTOM_LOCAL_PREFIX = "custom-local";
const LOCAL_STORAGE_KEY = "litExplorer.customExamples.v1";
const BLANK_EXAMPLE_ID = "blank";

const LIT_ACTION_TYPES_URI = "ts:lit-actions.d.ts";
const litActionsDefinitions = [
  litActionsGlobalDefinition
    .replace(/\/\/\/\s*<reference path="\.\/types\.d\.ts"\s*\/>/, "")
    .replace(/export\s*{\s*};?/g, ""),
  litActionsNamespaceDefinition
    .replace(/^export\s+declare\s+namespace/gm, "declare namespace")
    .replace(/\bexport\s+namespace\b/g, "namespace"),
]
  .map((definition) => definition.trim())
  .join("\n\n");

const AUTO_LOGIN_INFO_MESSAGE =
  "Auto-login works only on naga-dev because it's a free, centralised testnet. On naga-test or other decentralized networks, recipients must sign in and cover execution costs themselves.";

const CTA_HEIGHT = 44;

const SectionHeader: React.FC<{ title: string; textColor?: string }> = ({
  title,
  textColor = "#111827",
}) => (
  <div
    style={{
      marginBottom: "12px",
      fontSize: "13px",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      position: "relative",
      paddingBottom: "10px",
      color: textColor,
    }}
  >
    {title}
    <span
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        width: "60px",
        height: "2px",
        backgroundColor: "#B7410D",
        borderRadius: "999px",
      }}
    />
  </div>
);

type ExampleBadgeTone = "shared" | "local" | "default";

interface ExampleDropdownOption {
  id: string;
  label: string;
  description?: string;
  badgeLabel?: string;
  badgeTone?: ExampleBadgeTone;
}

interface ExampleSelectorProps {
  options: ExampleDropdownOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
  triggerId?: string;
}

const BADGE_STYLES: Record<ExampleBadgeTone, { background: string; border: string; color: string }> = {
  shared: {
    background: "#E0F2FE",
    border: "#93C5FD",
    color: "#1D4ED8",
  },
  local: {
    background: "#FEF3C7",
    border: "#FCD34D",
    color: "#B45309",
  },
  default: {
    background: "#E5E7EB",
    border: "#D1D5DB",
    color: "#4B5563",
  },
};

const ExampleSelector: React.FC<ExampleSelectorProps> = ({
  options,
  selectedId,
  onSelect,
  disabled = false,
  triggerId,
}) => {
  const currentOption = useMemo(() => {
    if (!options.length) return null;
    const fallback = options[0];
    return options.find((option) => option.id === selectedId) ?? fallback;
  }, [options, selectedId]);

  const value = currentOption?.id ?? "";

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild disabled={disabled}>
        <button
          id={triggerId}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px 14px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            background: disabled ? "#f3f4f6" : "white",
            color: disabled ? "#9ca3af" : "#111827",
            cursor: disabled ? "not-allowed" : "pointer",
            minWidth: 240,
            justifyContent: "space-between",
            alignSelf: "flex-start",
            minHeight: CTA_HEIGHT,
          }}
        >
          <span
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "2px",
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: 600 }}>
              {currentOption?.label ?? "Select example"}
            </span>
            {currentOption?.description && (
              <span style={{ fontSize: "11px", color: "#6b7280" }}>
                {currentOption.description}
              </span>
            )}
          </span>
          <ChevronDown size={14} style={{ color: "#6b7280" }} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={6}
          align="start"
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "6px",
            boxShadow:
              "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
            minWidth: 260,
            zIndex: FULLSCREEN_Z_INDEX + 5,
          }}
        >
          <DropdownMenu.RadioGroup
            value={value}
            onValueChange={(next) => onSelect(next)}
          >
            {options.map((option) => {
              const isSelected = option.id === value;
              const badgeTone = option.badgeTone ?? "default";
              const badgeStyle = BADGE_STYLES[badgeTone];
              return (
                <DropdownMenu.RadioItem
                  key={option.id}
                  value={option.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    cursor: "pointer",
                    color: "#111827",
                    backgroundColor: isSelected ? "#eff6ff" : "transparent",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontWeight: isSelected ? 600 : 500 }}>
                      {option.label}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {option.badgeLabel && (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            color: badgeStyle.color,
                            background: badgeStyle.background,
                            border: `1px solid ${badgeStyle.border}`,
                            padding: "1px 6px",
                            borderRadius: 9999,
                            textTransform: "uppercase",
                            letterSpacing: 0.4,
                          }}
                        >
                          {option.badgeLabel}
                        </span>
                      )}
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <DropdownMenu.ItemIndicator>
                          <Check size={12} />
                        </DropdownMenu.ItemIndicator>
                      </div>
                    </div>
                  </div>
                  {option.description && (
                    <span style={{ fontSize: "11px", color: "#6b7280" }}>
                      {option.description}
                    </span>
                  )}
                </DropdownMenu.RadioItem>
              );
            })}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

interface ShareLinkMenuProps {
  disabled?: boolean;
  onShareStandard: () => void;
  onShareAutoLogin: () => void;
  showInfo: boolean;
  toggleInfo: () => void;
  triggerId?: string;
}

const ShareLinkMenu: React.FC<ShareLinkMenuProps> = ({
  disabled = false,
  onShareStandard,
  onShareAutoLogin,
  showInfo,
  toggleInfo,
  triggerId,
}) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild disabled={disabled}>
        <button
          id={triggerId}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            background: disabled ? "#f3f4f6" : "#ffffff",
            color: disabled ? "#9ca3af" : "#1f2937",
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: "12px",
            fontWeight: 600,
            alignSelf: "flex-start",
            height: CTA_HEIGHT,
          }}
        >
          <Share2 size={14} />
          Share
          <ChevronDown size={14} style={{ color: "#6b7280" }} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={6}
          align="start"
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "6px",
            boxShadow:
              "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
            minWidth: 220,
            zIndex: FULLSCREEN_Z_INDEX + 6,
          }}
        >
          <DropdownMenu.Item
            onSelect={(event) => {
              event.preventDefault();
              onShareStandard();
            }}
            style={{
              padding: "8px 10px",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
              color: "#111827",
            }}
          >
            Copy Share Link
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={(event) => {
              event.preventDefault();
              onShareAutoLogin();
            }}
            style={{
              padding: "8px 10px",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
              color: "#1d4ed8",
              backgroundColor: "#eff6ff",
            }}
          >
            Copy Auto-Login Link
          </DropdownMenu.Item>
          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              margin: "8px -6px 6px",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              padding: "2px 2px 0",
            }}
          >
            <button
              onClick={(event) => {
                event.preventDefault();
                toggleInfo();
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px",
                borderRadius: "6px",
                border: "1px solid transparent",
                backgroundColor: showInfo ? "#0f172a" : "transparent",
                color: showInfo ? "#f9fafb" : "#1d4ed8",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              <Info size={12} />
              Why is auto-login limited?
            </button>
            {showInfo && (
              <div
                style={{
                  fontSize: "11px",
                  color: "#1f2937",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  padding: "8px",
                  lineHeight: 1.45,
                  maxWidth: "240px",
                  width: "100%",
                  alignSelf: "flex-start",
                  overflowWrap: "break-word",
                }}
              >
                {AUTO_LOGIN_INFO_MESSAGE}
              </div>
            )}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

const encodeForShare = (value: string) => {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return encodeURIComponent(btoa(binary));
};

const decodeFromShare = (value: string) => {
  const binary = atob(decodeURIComponent(value));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
};

interface LitActionFormProps {
  selectedPkp: UIPKP | null;
  disabled?: boolean;
}

interface LitActionResult {
  result: any;
  timestamp: string;
}

export const LitActionForm: React.FC<LitActionFormProps> = ({
  selectedPkp,
  disabled = false,
}) => {
  const { user, services } = useLitAuth();
  const [selectedExampleId, setSelectedExampleId] = useState<string | null>(
    DEFAULT_EXAMPLE_ID
  );
  const [litActionCode, setLitActionCode] =
    useState<string>(DEFAULT_EXAMPLE_CODE);
  const [jsParamsInput, setJsParamsInput] = useState<string>(
    DEFAULT_JS_PARAMS_INPUT
  );
  const [jsParamsError, setJsParamsError] = useState<string | null>(null);
  const [litActionResult, setLitActionResult] =
    useState<LitActionResult | null>(null);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasSharedLink, setHasSharedLink] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [localExamples, setLocalExamples] = useState<
    { id: string; title: string; code: string; params: string }[]
  >([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const editorRef = useRef<any>(null);
  const paramsEditorRef = useRef<any>(null);
  const triggerExecuteRef = useRef<() => void>(() => {});
  const monacoConfiguredRef = useRef(false);
  const litTypesDisposablesRef = useRef<any[]>([]);
  const litTypesModelRef = useRef<any>(null);
  const [showShortcutTip, setShowShortcutTip] = useState(false);
  const [showParsedModal, setShowParsedModal] = useState(false);
  const [showAutoLoginInfo, setShowAutoLoginInfo] = useState(false);

  const selectedExample = useMemo(() => {
    if (selectedExampleId === BLANK_EXAMPLE_ID) {
      return {
        id: BLANK_EXAMPLE_ID,
        title: "New Blank Action",
        description: "Start from scratch with an empty editor.",
        code: litActionCode,
      };
    }
    const localExample = localExamples.find(
      (example) => example.id === selectedExampleId
    );
    if (localExample) {
      return {
        id: localExample.id,
        title: localExample.title,
        description: "Custom action saved locally.",
        code: localExample.code,
        jsParams: (() => {
          try {
            return JSON.parse(localExample.params);
          } catch {
            return undefined;
          }
        })(),
      };
    }
    if (selectedExampleId === CUSTOM_SHARE_EXAMPLE_ID) {
      return {
        id: CUSTOM_SHARE_EXAMPLE_ID,
        title: "Shared Code",
        description: "Loaded from shared URL parameters.",
        code: litActionCode,
        jsParams: (() => {
          try {
            return JSON.parse(jsParamsInput);
          } catch {
            return undefined;
          }
        })(),
      };
    }
    return selectedExampleId
      ? getLitActionExample(selectedExampleId)
      : undefined;
  }, [jsParamsInput, litActionCode, selectedExampleId, localExamples]);

  const exampleOptions = useMemo<ExampleDropdownOption[]>(() => {
    const options: ExampleDropdownOption[] = [
      {
        id: BLANK_EXAMPLE_ID,
        label: "New Blank Action",
        description: "Start from scratch",
      },
    ];

    if (hasSharedLink) {
      options.push({
        id: CUSTOM_SHARE_EXAMPLE_ID,
        label: "Shared Code",
        description: "Loaded from shared link",
        badgeLabel: "Shared",
        badgeTone: "shared",
      });
    }

    localExamples.forEach((example) => {
      options.push({
        id: example.id,
        label: example.title,
        description: "Saved locally",
        badgeLabel: "Local",
        badgeTone: "local",
      });
    });

    litActionExamples.forEach((example) => {
      options.push({
        id: example.id,
        label: example.title,
        description: example.description,
      });
    });

    return options;
  }, [hasSharedLink, localExamples]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as {
          id: string;
          title: string;
          code: string;
          params: string;
        }[];
        setLocalExamples(parsed);
      }
    } catch (error) {
      console.error("Failed to load local Lit Action examples", error);
    }

    try {
      const params = new URLSearchParams(window.location.search);
      const encodedCode = params.get("code");
      const encodedParams = params.get("params");
      if (encodedCode || encodedParams) {
        if (encodedCode) {
          const decodedCode = decodeFromShare(encodedCode);
          setLitActionCode(decodedCode);
        }
        if (encodedParams) {
          const decodedParams = decodeFromShare(encodedParams);
          setJsParamsInput(decodedParams);
        }
        setSelectedExampleId(CUSTOM_SHARE_EXAMPLE_ID);
        setHasSharedLink(true);
        setIsFullscreen(true);
      }
    } catch (error) {
      console.error("Failed to decode shared Lit Action state", error);
    }
  }, []);

  const parsedResponse = useMemo(() => {
    const rawResponse = litActionResult?.result?.response;
    if (!rawResponse) return null;
    if (typeof rawResponse === "object") {
      return rawResponse as Record<string, unknown>;
    }
    if (typeof rawResponse === "string") {
      try {
        const parsed = JSON.parse(rawResponse);
        if (parsed && typeof parsed === "object") {
          return parsed as Record<string, unknown>;
        }
      } catch {
        return null;
      }
    }
    return null;
  }, [litActionResult]);

  const rawResultString = useMemo(() => {
    if (!litActionResult?.result) return "";
    try {
      return JSON.stringify(litActionResult.result, null, 2);
    } catch {
      return String(litActionResult.result);
    }
  }, [litActionResult]);

  const saveLocalExample = useCallback(() => {
    const baseTitle = "Custom Action";
    let suffix = 1;
    let title = baseTitle;
    const existingTitles = new Set(localExamples.map((ex) => ex.title));
    while (existingTitles.has(title)) {
      suffix += 1;
      title = `${baseTitle} ${suffix}`;
    }

    const id = `${CUSTOM_LOCAL_PREFIX}-${Date.now()}`;
    const record = {
      id,
      title,
      code: litActionCode,
      params: jsParamsInput,
    };
    const nextExamples = [record, ...localExamples];
    setLocalExamples(nextExamples);
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextExamples));
    setSelectedExampleId(id);
    setStatus(`Saved ${title}`);
  }, [jsParamsInput, litActionCode, localExamples]);

  const deleteLocalExample = useCallback(() => {
    if (!selectedExampleId?.startsWith(CUSTOM_LOCAL_PREFIX)) return;
    const nextExamples = localExamples.filter(
      (example) => example.id !== selectedExampleId
    );
    setLocalExamples(nextExamples);
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextExamples));
    setSelectedExampleId(nextExamples[0]?.id ?? DEFAULT_EXAMPLE_ID);
    setStatus("Removed local Lit Action");
  }, [localExamples, selectedExampleId]);

  const createBlankExample = useCallback(() => {
    setLitActionCode("");
    setJsParamsInput("{}");
    setJsParamsError(null);
    setSelectedExampleId(BLANK_EXAMPLE_ID);
    setStatus("Ready for new Lit Action");
    setShowParsedModal(false);
  }, []);

  const tryParseJson = useCallback(
    (text: string): Record<string, unknown> | unknown[] | null => {
      try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === "object") {
          return parsed as Record<string, unknown> | unknown[];
        }
        return null;
      } catch {
        return null;
      }
    },
    []
  );

  const copyToClipboard = useCallback(
    async (pathKey: string, value: string) => {
      try {
        if (
          typeof navigator !== "undefined" &&
          navigator?.clipboard?.writeText
        ) {
          await navigator.clipboard.writeText(value);
        } else if (typeof document !== "undefined") {
          const textarea = document.createElement("textarea");
          textarea.value = value;
          textarea.style.position = "fixed";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
        } else {
          return;
        }
        setCopiedField(pathKey);
      } catch (error) {
        console.error("Failed to copy field", error);
      }
    },
    []
  );

  const executeButtonDisabled =
    disabled || isExecutingAction || !litActionCode.trim();
  const executeButtonContent = isExecutingAction ? (
    <>
      <LoadingSpinner size={16} />
      Running...
    </>
  ) : (
    "Run"
  );

  const toggleFullscreen = () => setIsFullscreen((v) => !v);

  const handleEditorMount = useCallback(
    (editor: any, monaco: any) => {
      editorRef.current = editor;
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () =>
        triggerExecuteRef.current()
      );

      if (!monacoConfiguredRef.current) {
        const compilerOptions = {
          allowJs: true,
          checkJs: true,
          allowNonTsExtensions: true,
          module: monaco.languages.typescript.ModuleKind.ESNext,
          moduleResolution:
            monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          target: monaco.languages.typescript.ScriptTarget.ESNext,
          typeRoots: ["node_modules/@types"],
        };

        monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
          compilerOptions
        );
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
        });
        monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);

        monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
          compilerOptions
        );
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
        });

        monacoConfiguredRef.current = true;
      }

      if (litTypesDisposablesRef.current.length === 0) {
        const modelUri = monaco.Uri.parse(LIT_ACTION_TYPES_URI);

        litTypesDisposablesRef.current = [
          monaco.languages.typescript.javascriptDefaults.addExtraLib(
            litActionsDefinitions,
            LIT_ACTION_TYPES_URI
          ),
          monaco.languages.typescript.typescriptDefaults.addExtraLib(
            litActionsDefinitions,
            LIT_ACTION_TYPES_URI
          ),
        ];

        if (!monaco.editor.getModel(modelUri)) {
          litTypesModelRef.current = monaco.editor.createModel(
            litActionsDefinitions,
            "typescript",
            modelUri
          );
        } else if (!litTypesModelRef.current) {
          litTypesModelRef.current = monaco.editor.getModel(modelUri);
        }
      }
    },
    [litActionsDefinitions]
  );

  const handleParamsEditorMount = useCallback((editor: any, monaco: any) => {
    paramsEditorRef.current = editor;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () =>
      triggerExecuteRef.current()
    );
  }, []);

  const renderCodeEditor = (
    editorHeight: string | number,
    fullscreen: boolean
  ) => (
    <Editor
      value={litActionCode}
      onChange={(value) => setLitActionCode(value || "")}
      language="javascript"
      theme="vs-dark"
      onMount={handleEditorMount}
      options={{
        minimap: { enabled: false },
        wordWrap: "on",
        fontSize: fullscreen
          ? EDITOR_FONT_SIZE_FULLSCREEN
          : EDITOR_FONT_SIZE_COMPACT,
        lineHeight: EDITOR_LINE_HEIGHT,
        padding: { top: 12, bottom: 12 },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        lineNumbers: "on",
        folding: false,
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 3,
        readOnly: disabled || isExecutingAction,
      }}
      height={editorHeight}
      width="100%"
    />
  );

  const renderParamsContent = (
    editorHeight: string | number,
    fullscreen: boolean
  ) => {
    const helperTextColor = fullscreen ? "#e5e7eb" : "#6b7280";
    const errorStyles = fullscreen
      ? {
          backgroundColor: "rgba(252, 165, 165, 0.15)",
          border: "1px solid rgba(252, 165, 165, 0.4)",
          color: "#fecaca",
        }
      : {
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          color: "#b91c1c",
        };

    return (
      <>
        <Editor
          value={jsParamsInput}
          onChange={(value) => {
            setJsParamsInput(value ?? "");
            setJsParamsError(null);
          }}
          language="json"
          theme={fullscreen ? "vs-dark" : "vs-light"}
          onMount={handleParamsEditorMount}
          options={{
            minimap: { enabled: false },
            wordWrap: "off",
            fontSize: fullscreen
              ? EDITOR_FONT_SIZE_FULLSCREEN
              : EDITOR_FONT_SIZE_COMPACT,
            lineHeight: EDITOR_LINE_HEIGHT,
            padding: { top: 12, bottom: 12 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            lineNumbers: "on",
            folding: false,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 2,
            readOnly: disabled || isExecutingAction,
          }}
          height={editorHeight}
          width="100%"
        />
        <div
          style={{
            marginTop: "8px",
            fontSize: "11px",
            color: helperTextColor,
          }}
        >
          publicKey is injected automatically before execution based on the
          selected PKP.
        </div>
        {jsParamsError && (
          <div
            style={{
              marginTop: "8px",
              padding: "8px 12px",
              borderRadius: "6px",
              fontSize: "11px",
              ...errorStyles,
            }}
          >
            {jsParamsError}
          </div>
        )}
      </>
    );
  };

  const renderCompactLayout = () => {
    const codeEditorHeight = "260px";
    const paramsEditorHeight = "260px";

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "16px",
            backgroundColor: "#f9fafb",
            color: "#111827",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            opacity: disabled ? 0.6 : 1,
            minHeight: 0,
          }}
        >
          <SectionHeader title="Lit Action" />
          {renderCodeEditor(codeEditorHeight, false)}
        </div>
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "16px",
            backgroundColor: "#f9fafb",
            color: "#111827",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            opacity: disabled ? 0.6 : 1,
            minHeight: 0,
          }}
        >
          <SectionHeader title="JS Params" />
          {renderParamsContent(paramsEditorHeight, false)}
        </div>
      </div>
    );
  };

  const renderFullscreenLayout = () => {
    const codeEditorHeight = "calc(100vh - 240px)";
    const paramsEditorHeight = "25vh";
    const fullPanelStyle = {
      border: "1px solid #E5E7EB",
      background: "#F9FAFB",
      borderRadius: "8px",
      padding: "16px",
      color: "#f9fafb",
      display: "flex",
      flexDirection: "column" as const,
      minHeight: 0,
      overflow: "hidden",
      gap: "12px",
    };

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2.2fr 1fr",
          gap: "16px",
          alignItems: "stretch",
          marginTop: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            color: "#111827",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            padding: "16px",
            border: "1px solid #e5e7eb",
          }}
        >
          <SectionHeader title="Lit Action" />
          <div
            style={{
              flex: 1,
              minHeight: 0,
            }}
          >
            {renderCodeEditor(codeEditorHeight, true)}
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateRows: "minmax(0, 0.25fr) minmax(0, 0.75fr)",
            gap: "16px",
            minHeight: 0,
          }}
        >
          <div style={fullPanelStyle}>
            <SectionHeader title="JS Params" textColor="#111827" />
            <div
              style={{
                flex: 1,
                minHeight: 0,
              }}
            >
              {renderParamsContent(paramsEditorHeight, true)}
            </div>
          </div>
          <div
            style={{
              ...fullPanelStyle,
              justifyContent: "flex-start",
            }}
          >
            <SectionHeader title="Execution Result" textColor="#111827" />
            {renderResultPanel(true)}
          </div>
        </div>
      </div>
    );
  };

  const renderParsedEntries = (
    value: Record<string, unknown> | unknown[],
    fullscreen: boolean,
    path: string[] = []
  ): React.ReactNode => {
    const entryBackground = fullscreen ? "rgba(59, 130, 246, 0.08)" : "#f3f4f6";
    const entryBorder = fullscreen
      ? "1px solid rgba(59, 130, 246, 0.25)"
      : "1px solid #e5e7eb";

    const entries = Array.isArray(value)
      ? value.map((entry, index) => [String(index), entry] as [string, unknown])
      : Object.entries(value);

    const formatPrimitive = (val: unknown): string => {
      if (val === null) return "null";
      if (val === undefined) return "undefined";
      if (typeof val === "string") return val;
      try {
        return JSON.stringify(val, null, 2);
      } catch {
        return String(val);
      }
    };

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {entries.map(([key, val]) => {
          const pathKey = [...path, key].join(".");
          const parsedFromString =
            typeof val === "string" ? tryParseJson(val) : null;
          const nestedValue = parsedFromString
            ? parsedFromString
            : Array.isArray(val)
            ? val
            : val && typeof val === "object"
            ? (val as Record<string, unknown>)
            : null;
          const copyPayload = (() => {
            if (typeof val === "string") return val;
            if (nestedValue) {
              try {
                return JSON.stringify(nestedValue, null, 2);
              } catch {
                return String(nestedValue);
              }
            }
            return formatPrimitive(val);
          })();
          return (
            <div
              key={pathKey}
              style={{
                display: "grid",
                gridTemplateColumns: "160px 1fr auto",
                gap: "12px",
                padding: "10px 12px",
                backgroundColor: entryBackground,
                border: entryBorder,
                borderRadius: "6px",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "12px",
                  color: fullscreen ? "#f9fafb" : "#111827",
                }}
              >
                {key}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: fullscreen ? "#e5e7eb" : "#111827",
                  display: "flex",
                  flexDirection: "column",
                  gap: nestedValue ? "8px" : "0",
                }}
              >
                {nestedValue ? (
                  <div
                    style={{
                      marginTop: "4px",
                      paddingLeft: "10px",
                      borderLeft: fullscreen
                        ? "2px solid rgba(59,130,246,0.35)"
                        : "2px solid #cbd5f5",
                    }}
                  >
                    {renderParsedEntries(
                      nestedValue as Record<string, unknown> | unknown[],
                      fullscreen,
                      [...path, key]
                    )}
                  </div>
                ) : (
                  <pre
                    style={{
                      margin: 0,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontFamily: "monospace",
                    }}
                  >
                    {formatPrimitive(val)}
                  </pre>
                )}
              </div>
              <button
                onClick={() => copyToClipboard(pathKey, copyPayload)}
                style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: "1px solid rgba(209, 213, 219, 0.6)",
                  backgroundColor: fullscreen
                    ? "rgba(17, 24, 39, 0.6)"
                    : "#ffffff",
                  color: fullscreen ? "#f9fafb" : "#1f2937",
                  fontSize: "10px",
                  cursor: "pointer",
                }}
              >
                {copiedField === pathKey ? "Copied" : "Copy"}
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  const renderResultPanel = (fullscreen: boolean) => {
    if (!fullscreen) {
      const emptyState = (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "6px",
            border: "1px dashed #d1d5db",
            color: "#6b7280",
            fontSize: "12px",
            padding: "16px",
            minHeight: 120,
          }}
        >
          Run an action to see the response here.
        </div>
      );

      if (!litActionResult) {
        return (
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "16px",
              backgroundColor: "#f9fafb",
              color: "#111827",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <SectionHeader title="Execution Result" />
            {emptyState}
          </div>
        );
      }

      const messageBackground = status.includes("successfully")
        ? "#f0fdf4"
        : "#fef2f2";
      const messageBorder = status.includes("successfully")
        ? "1px solid #bbf7d0"
        : "1px solid #fecaca";
      const messageColor = status.includes("successfully")
        ? "#15803d"
        : "#dc2626";

      return (
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "16px",
            backgroundColor: "#f9fafb",
            color: "#111827",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <SectionHeader title="Execution Result" />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              fontSize: "11px",
              color: "#6b7280",
            }}
          >
            <span>
              Executed at: {new Date(litActionResult.timestamp).toLocaleString()}
            </span>
            {parsedResponse && (
              <button
                onClick={() => setShowParsedModal(true)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "1px solid rgba(59,130,246,0.4)",
                  backgroundColor: "#e0f2fe",
                  color: "#1d4ed8",
                  fontSize: "11px",
                  cursor: "pointer",
                }}
              >
                View Parsable JSON
              </button>
            )}
          </div>
          {status && (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                backgroundColor: messageBackground,
                border: messageBorder,
                color: messageColor,
                fontSize: "12px",
              }}
            >
              {status}
            </div>
          )}
          <pre
            style={{
              flex: 1,
              margin: 0,
              overflow: "auto",
              backgroundColor: "#ffffff",
              borderRadius: "6px",
              border: "1px solid #e5e7eb",
              padding: "12px",
              fontFamily: "monospace",
              fontSize: "11px",
              whiteSpace: "pre-wrap",
              minHeight: 120,
            }}
          >
            {rawResultString}
          </pre>
        </div>
      );
    }

    if (!litActionResult) {
      return (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "6px",
            border: "1px dashed #1f2937",
            color: "#9ca3af",
            fontSize: "12px",
            padding: "16px",
          }}
        >
          Run an action to see the response here.
        </div>
      );
    }

    const containerStyles = {
      flex: 1,
      display: "flex",
      flexDirection: "column" as const,
      minHeight: 0,
      gap: "12px",
      backgroundColor: "#111827",
      border: "1px solid #1f2937",
      borderRadius: "8px",
      padding: "14px",
      color: "#f9fafb",
    };

    const messageBackground = status.includes("successfully")
      ? "rgba(34,197,94,0.15)"
      : "rgba(248,113,113,0.15)";
    const messageBorder = status.includes("successfully")
      ? "1px solid rgba(34,197,94,0.4)"
      : "1px solid rgba(248,113,113,0.4)";
    const messageColor = status.includes("successfully")
      ? "#bbf7d0"
      : "#fecaca";

    return (
      <div style={containerStyles}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            fontSize: "11px",
            color: fullscreen ? "#d1d5db" : "#6b7280",
          }}
        >
          <span>
            Executed at: {new Date(litActionResult.timestamp).toLocaleString()}
          </span>
          {parsedResponse && (
            <button
              onClick={() => setShowParsedModal(true)}
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid rgba(59,130,246,0.4)",
                backgroundColor: fullscreen
                  ? "rgba(30, 64, 175, 0.35)"
                  : "#e0f2fe",
                color: fullscreen ? "#bfdbfe" : "#1d4ed8",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              View Parsable JSON
            </button>
          )}
        </div>
        {status && (
          <div
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              backgroundColor: messageBackground,
              border: messageBorder,
              color: messageColor,
              fontSize: "12px",
            }}
          >
            {status}
          </div>
        )}
        <pre
          style={{
            flex: 1,
            margin: 0,
            overflow: "auto",
            backgroundColor: "#0f172a",
            borderRadius: "6px",
            border: "1px solid #1f2937",
            padding: "12px",
            fontFamily: "monospace",
            fontSize: "11px",
            whiteSpace: "pre-wrap",
          }}
        >
          {rawResultString}
        </pre>
      </div>
    );
  };

  useEffect(() => {
    return () => {
      litTypesDisposablesRef.current.forEach((disposable) => {
        disposable?.dispose?.();
      });
      litTypesDisposablesRef.current = [];
      litTypesModelRef.current?.dispose?.();
      litTypesModelRef.current = null;
      monacoConfiguredRef.current = false;
      paramsEditorRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!parsedResponse) {
      setShowParsedModal(false);
    }
  }, [parsedResponse, litActionResult?.timestamp]);

  useEffect(() => {
    if (!copiedField) return;
    const timeout = window.setTimeout(() => setCopiedField(null), 2000);
    return () => window.clearTimeout(timeout);
  }, [copiedField]);

  useEffect(() => {
    if (!shareStatus) return;
    const timeout = window.setTimeout(() => setShareStatus(null), 2000);
    return () => window.clearTimeout(timeout);
  }, [shareStatus]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (showParsedModal) {
        setShowParsedModal(false);
        e.stopPropagation();
        return;
      }
      setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [showParsedModal]);

  // Show the shortcut tip when entering fullscreen; hide when exiting
  useEffect(() => {
    if (isFullscreen) {
      setShowShortcutTip(false);
    }
  }, [isFullscreen]);

  // Keep a fresh reference to the execute trigger with current conditions
  triggerExecuteRef.current = () => {
    const codeEditorHasFocus = !!editorRef.current?.hasTextFocus?.();
    const paramsEditorHasFocus = !!paramsEditorRef.current?.hasTextFocus?.();
    const editorHasFocus = codeEditorHasFocus || paramsEditorHasFocus;
    if (
      isFullscreen &&
      editorHasFocus &&
      !disabled &&
      !isExecutingAction &&
      !!litActionCode.trim()
    ) {
      void executeLitAction();
    }
  };

  const executeLitAction = async () => {
    console.log("[executeLitAction] Called.");
    console.log(
      "[executeLitAction] Context:",
      await services?.litClient.getContext()
    );
    if (!user?.authContext || !litActionCode.trim() || !services?.litClient) {
      setStatus("No auth context, Lit Action code, or Lit client");
      return;
    }

    let parsedJsParams: Record<string, unknown> = {};
    try {
      parsedJsParams = jsParamsInput.trim() ? JSON.parse(jsParamsInput) : {};
      setJsParamsError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setJsParamsError(message);
      setStatus(`Invalid JS params JSON: ${message}`);
      return;
    }

    const runtimePublicKey =
      selectedPkp?.pubkey || user?.pkpInfo?.pubkey || parsedJsParams.publicKey;
    const jsParams: Record<string, unknown> = {
      ...parsedJsParams,
    };
    if (runtimePublicKey) {
      jsParams.publicKey = runtimePublicKey;
    }

    setIsExecutingAction(true);
    setStatus("Executing Lit Action...");
    try {
      const result = await services.litClient.executeJs({
        authContext: user.authContext,
        code: litActionCode,
        jsParams,
      });
      console.log("[executeLitAction] result:", result);

      setLitActionResult({
        result,
        timestamp: new Date().toISOString(),
      });
      setIsExecutingAction(false);
      setStatus("Lit Action executed successfully!");
      try {
        const addr = selectedPkp?.ethAddress || user.pkpInfo?.ethAddress;
        if (addr) await triggerLedgerRefresh(addr);
      } catch {}
    } catch (error: any) {
      console.error("Failed to execute Lit Action:", error);
      setIsExecutingAction(false);
      setStatus(`Failed to execute Lit Action: ${error.message || error}`);
    }
  };

  const loadExample = useCallback((exampleId: string) => {
    if (!exampleId || exampleId === BLANK_EXAMPLE_ID) {
      createBlankExample();
      return;
    }
    if (exampleId === CUSTOM_SHARE_EXAMPLE_ID) {
      try {
        const params = new URLSearchParams(window.location.search);
        const encodedCode = params.get("code");
        const encodedParams = params.get("params");
        if (encodedCode) {
          const decodedCode = decodeFromShare(encodedCode);
          setLitActionCode(decodedCode);
        }
        if (encodedParams) {
          const decodedParams = decodeFromShare(encodedParams);
          setJsParamsInput(decodedParams);
        }
        setJsParamsError(null);
        setStatus("Loaded shared Lit Action");
        setShowParsedModal(false);
        setSelectedExampleId(CUSTOM_SHARE_EXAMPLE_ID);
      } catch (error) {
        console.error("Failed to load shared example", error);
        setStatus("Unable to load shared Lit Action");
      }
      return;
    }

    if (exampleId.startsWith(CUSTOM_LOCAL_PREFIX)) {
      const example = localExamples.find((ex) => ex.id === exampleId);
      if (example) {
        setLitActionCode(example.code);
        setJsParamsInput(example.params);
        setJsParamsError(null);
        setSelectedExampleId(example.id);
        setStatus("Loaded local Lit Action");
      }
      return;
    }

    const example = getLitActionExample(exampleId);
    if (!example) {
      console.warn(`[LitActionForm] Unknown Lit Action example: ${exampleId}`);
      return;
    }
    const formattedParams = formatJsParams(example.jsParams);

    setLitActionCode(example.code ?? "");
    setLitActionResult(null);
    setSelectedExampleId(example.id);
    setJsParamsInput(formattedParams);
    setJsParamsError(null);
    setStatus("");
    setShowParsedModal(false);
  }, [createBlankExample, localExamples]);

  const handleShare = useCallback(
    async (options?: { autoLogin?: boolean }) => {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("code", encodeForShare(litActionCode));
        url.searchParams.set("params", encodeForShare(jsParamsInput));
        if (options?.autoLogin) {
          url.searchParams.set("autoLogin", "1");
        } else {
          url.searchParams.delete("autoLogin");
        }
        const shareUrl = url.toString();

        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(shareUrl);
          setShareStatus(
            options?.autoLogin
              ? "Auto-login link copied! (naga-dev only)"
              : "Share link copied!"
          );
        } else {
          window.prompt("Copy this Lit Action link", shareUrl);
          setShareStatus(
            options?.autoLogin
              ? "Auto-login link ready to copy (naga-dev only)"
              : "Share link ready to copy"
          );
        }

        window.history.replaceState({}, "", shareUrl);
        setHasSharedLink(true);
        setSelectedExampleId(CUSTOM_SHARE_EXAMPLE_ID);
        if (options?.autoLogin) {
          setShowAutoLoginInfo(false);
        }
      } catch (error) {
        console.error("Failed to generate share link", error);
        setShareStatus("Unable to copy share link");
      }
    },
    [jsParamsInput, litActionCode]
  );

  const shareStatusIsError =
    typeof shareStatus === "string" &&
    shareStatus.toLowerCase().includes("unable");

const shareStatusPalette = shareStatusIsError
  ? {
      backgroundColor: "#7f1d1d",
      borderColor: "#fca5a5",
      color: "#fef2f2",
    }
  : {
      backgroundColor: "#065f46",
      borderColor: "#34d399",
      color: "#ecfdf5",
    };

  const renderActionToolbar = (fullscreen: boolean) => {
    const divider = (
      <div
        style={{
          width: "1px",
          height: CTA_HEIGHT,
          backgroundColor: "#e5e7eb",
        }}
      />
    );

    const fullscreenToggle = (
      <button
        id="lit-action-fullscreen-toggle"
        onClick={toggleFullscreen}
        aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        title={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        disabled={disabled}
        style={{
          width: CTA_HEIGHT,
          height: CTA_HEIGHT,
          borderRadius: "10px",
          border: "1px solid #d1d5db",
          backgroundColor: fullscreen ? "#111827" : "#ffffff",
          color: fullscreen ? "#f9fafb" : "#1f2937",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9 3H3v6h2V5h4V3zm12 6V3h-6v2h4v4h2zM3 15v6h6v-2H5v-4H3zm18 6v-6h-2v4h-4v2h6z" />
        </svg>
      </button>
    );

    return (
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          flexWrap: "wrap",
          ...(fullscreen ? { marginRight: 8 } : {}),
        }}
      >
        <button
          id="lit-action-run"
          onClick={executeLitAction}
          disabled={executeButtonDisabled}
          onMouseEnter={() => setShowShortcutTip(true)}
          onMouseLeave={() => setShowShortcutTip(false)}
          style={{
            padding: "12px 20px",
            borderRadius: "10px",
            border: "1px solid transparent",
            backgroundColor: executeButtonDisabled ? "#9ca3af" : "#B7410D",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.05em",
            color: "#ffffff",
            cursor: executeButtonDisabled ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            position: "relative",
            alignSelf: "flex-start",
            minHeight: CTA_HEIGHT,
          }}
        >
          {executeButtonContent}
          {fullscreen && showShortcutTip && !executeButtonDisabled && (
            <span
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                backgroundColor: "#111827",
                color: "#F9FAFB",
                borderRadius: "6px",
                padding: "6px 10px",
                fontSize: "11px",
                whiteSpace: "nowrap",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
              Press Cmd+Enter (Mac) / Ctrl+Enter (Windows)
            </span>
          )}
        </button>
        {divider}
        <div style={{ minWidth: 240 }}>
          <ExampleSelector
            triggerId="lit-action-example-selector"
            options={exampleOptions}
            selectedId={selectedExampleId}
            onSelect={loadExample}
            disabled={disabled || isExecutingAction}
          />
        </div>
        <ShareLinkMenu
          triggerId="lit-action-share"
          disabled={disabled || isExecutingAction}
          onShareStandard={() => handleShare()}
          onShareAutoLogin={() => handleShare({ autoLogin: true })}
          showInfo={showAutoLoginInfo}
          toggleInfo={() => setShowAutoLoginInfo((prev) => !prev)}
        />
        <button
          id="lit-action-save"
          onClick={saveLocalExample}
          aria-label="Save Lit Action"
          title="Save"
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "1px solid #1f2937",
            backgroundColor: "#111827",
            color: "#f9fafb",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
            width: CTA_HEIGHT,
            height: CTA_HEIGHT,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7ZM7 5h8v4H7Zm5 14a3 3 0 1 1 3-3 3 3 0 0 1-3 3Z" />
          </svg>
        </button>
        {selectedExampleId?.startsWith(CUSTOM_LOCAL_PREFIX) && (
          <button
            id="lit-action-delete"
            onClick={deleteLocalExample}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid #dc2626",
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              height: CTA_HEIGHT,
            }}
          >
            Delete
          </button>
        )}
        {fullscreenToggle}
      </div>
    );
  };

  return (
    <>
      <div
      style={{
        padding: "20px",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        boxShadow: "",
        marginBottom: "20px",
        position: "relative",
        ...(isFullscreen
          ? {
              position: "fixed" as const,
              inset: 0,
              width: "100vw",
              height: "100vh",
              zIndex: FULLSCREEN_Z_INDEX,
              marginBottom: 0,
              overflow: "auto",
            }
          : {}),
      }}
      >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          // paddingRight: 40,
        }}
      >
        <h3 style={{ margin: 0, color: "#1f2937" }}>⚡ Execute Lit Action</h3>
        {renderActionToolbar(isFullscreen)}
      </div>

      <p
        style={{
          margin: "0 0 16px 0",
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        Run custom JavaScript code with your PKP. Use the examples above to get
        started.
      </p>
      {selectedExample?.description && (
        <p
          style={{
            margin: "0 0 16px 0",
            color: "#4b5563",
            fontSize: "12px",
          }}
        >
          {selectedExample.description}
        </p>
      )}

      {isFullscreen ? (
        renderFullscreenLayout()
      ) : (
        <>
          {renderCompactLayout()}

          <button
            id="lit-action-run-secondary"
            onClick={executeLitAction}
            disabled={executeButtonDisabled}
            className={`w-full p-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border-1 border-gray-200 ${
              executeButtonDisabled
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-[#B7410D] text-white cursor-pointer"
            }`}
            style={{ alignSelf: "flex-start", height: CTA_HEIGHT, padding: "0 20px" }}
          >
            {executeButtonContent}
          </button>

          {/* <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginTop: "10px",
            }}
          >
            <button
              onClick={handleShare}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                backgroundColor: "#f3f4f6",
                color: "#1f2937",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Share Link
            </button>
          </div> */}

          <div style={{ marginTop: "16px" }}>{renderResultPanel(false)}</div>
        </>
      )}

        {showParsedModal && parsedResponse && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(15,23,42,0.85)",
            backdropFilter: "blur(4px)",
            zIndex: FULLSCREEN_Z_INDEX + 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
          }}
        >
          <div
            style={{
              width: "min(1300px, 90vw)",
              maxHeight: "80vh",
              backgroundColor: "#0f172a",
              border: "1px solid #1f2937",
              borderRadius: "12px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              color: "#f9fafb",
              boxShadow: "0 25px 50px -12px rgba(15,23,42,0.6)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                }}
              >
                Parsable JSON
              </h3>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <button
                  onClick={executeLitAction}
                  disabled={executeButtonDisabled}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid rgba(209,213,219,0.4)",
                    backgroundColor: executeButtonDisabled
                      ? "rgba(156,163,175,0.4)"
                      : "#B7410D",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: executeButtonDisabled ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {executeButtonContent}
                </button>
                <button
                  onClick={() => setShowParsedModal(false)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#e5e7eb",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflow: "auto",
              }}
            >
              {renderParsedEntries(parsedResponse, true)}
            </div>
            </div>
          </div>
        )}
      </div>
      {shareStatus && (
        <div
          style={{
            position: "fixed",
            right: 24,
            bottom: 24,
            padding: "10px 16px",
            borderRadius: "10px",
            border: `1px solid ${shareStatusPalette.borderColor}`,
            backgroundColor: shareStatusPalette.backgroundColor,
            color: shareStatusPalette.color,
            fontSize: "12px",
            boxShadow: "0 20px 45px rgba(15,23,42,0.25)",
            zIndex: FULLSCREEN_Z_INDEX + 20,
            maxWidth: "260px",
            lineHeight: 1.5,
          }}
        >
          {shareStatus}
        </div>
      )}
    </>
  );
};
