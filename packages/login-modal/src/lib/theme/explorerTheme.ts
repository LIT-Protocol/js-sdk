export const EXPLORER_THEME_CSS = `
/* Scoped styles for @lit-protocol/login-modal (Explorer default theme). */

.lit-login-modal__backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1000;
}

.lit-login-modal__overlayCard {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  width: min(400px, 92vw);
  border: 1px solid #e5e7eb;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.lit-login-modal__overlayTitle {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px;
}

.lit-login-modal__overlayText {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.lit-login-modal,
.lit-login-modal * {
  box-sizing: border-box;
}

.lit-login-modal {
  color: #111827;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
    Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji';
}

.lit-login-modal__card {
  background: #fff;
  border-radius: 12px;
  width: min(32rem, 92vw);
  max-height: 90vh;
  overflow: auto;
  border: 1px solid #e5e7eb;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 24px 16px;
  position: relative;
}

@media (min-width: 640px) {
  .lit-login-modal__card {
    padding: 28px;
  }
}

.lit-login-modal__card--wide {
  width: min(48rem, 92vw);
}

.lit-login-modal__header {
  text-align: center;
  margin-bottom: 20px;
}

.lit-login-modal__title {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
  margin: 0;
}

.lit-login-modal__badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 9999px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #374151;
  font-size: 11px;
  font-weight: 600;
  margin-top: 10px;
}

.lit-login-modal__mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    'Liberation Mono', 'Courier New', monospace;
}

.lit-login-modal__subtitle {
  margin: 8px 0 0;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.35;
}

.lit-login-modal__h3 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.lit-login-modal__alert {
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 1.35;
  white-space: pre-wrap;
}

.lit-login-modal__alert--error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.lit-login-modal__alert--warn {
  background: #fffbeb;
  border: 1px solid #fed7aa;
  color: #92400e;
}

.lit-login-modal__section {
  display: grid;
  gap: 12px;
}

.lit-login-modal__methodList {
  display: grid;
  gap: 10px;
}

.lit-login-modal__methodButton {
  appearance: none;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 12px;
  padding: 10px 12px;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease, opacity 120ms ease;
  min-height: 44px;
  text-align: left;
}

.lit-login-modal__methodButton:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.lit-login-modal__methodButton:disabled {
  background: #f9fafb;
  opacity: 0.6;
  cursor: not-allowed;
}

.lit-login-modal__methodIcon {
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 40px;
}

.lit-login-modal__methodIcon img {
  width: 22px;
  height: 22px;
  object-fit: contain;
  display: block;
}

.lit-login-modal__methodLabel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #374151;
}

.lit-login-modal__methodLabelSuffix {
  font-size: 12px;
  font-weight: 400;
  color: #6b7280;
  margin-left: 6px;
}

.lit-login-modal__methodLabelSuffix--danger {
  color: #dc2626;
}

.lit-login-modal__methodRight {
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 40px;
}

.lit-login-modal__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 9999px;
  animation: lit-login-modal-spin 0.9s linear infinite;
}

.lit-login-modal__spinner--lg {
  width: 40px;
  height: 40px;
  border-width: 4px;
  border-top-color: #2563eb;
}

@keyframes lit-login-modal-spin {
  to {
    transform: rotate(360deg);
  }
}

.lit-login-modal__hint {
  text-align: center;
  margin-top: 14px;
  font-size: 11px;
  color: #6b7280;
}

.lit-login-modal__actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
}

.lit-login-modal__row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.lit-login-modal__btn {
  appearance: none;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.1;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.lit-login-modal__btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.lit-login-modal__btn--primary {
  border-color: #111827;
  background: #111827;
  color: #fff;
}

.lit-login-modal__btn--secondary {
  border-color: #d1d5db;
  background: #fff;
  color: #111827;
}

.lit-login-modal__btn--secondary:hover {
  background: #f9fafb;
}

.lit-login-modal__btn--ghost {
  border-color: transparent;
  color: #6b7280;
  padding: 6px 8px;
}

.lit-login-modal__btn--ghost:hover {
  background: #f3f4f6;
  color: #374151;
}

.lit-login-modal__btn--block {
  width: 100%;
}

.lit-login-modal__field {
  display: grid;
  gap: 6px;
}

.lit-login-modal__label {
  font-size: 12px;
  font-weight: 600;
  color: #111827;
}

.lit-login-modal__input,
.lit-login-modal__select {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 14px;
}

.lit-login-modal__muted {
  font-size: 12px;
  color: #6b7280;
}

.lit-login-modal__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.lit-login-modal__listItem {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
}

.lit-login-modal__divider {
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.lit-login-modal__panel {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
}

.lit-login-modal__panel--warning {
  border: 1px dashed rgba(245, 158, 11, 0.35);
  background: #fffbeb;
  color: #92400e;
}

.lit-login-modal__tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.lit-login-modal__tab {
  appearance: none;
  border: 0;
  background: transparent;
  padding: 8px 10px;
  margin: 0;
  cursor: pointer;
  font-size: 12px;
  color: #6b7280;
  border-bottom: 2px solid transparent;
}

.lit-login-modal__tab:hover {
  color: #111827;
}

.lit-login-modal__tab--active {
  color: #4338ca;
  font-weight: 600;
  border-bottom-color: #4f46e5;
}

.lit-login-modal__settingsButton {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}

.lit-login-modal__btn--icon {
  padding: 6px 8px;
  border-radius: 8px;
  font-size: 16px;
  line-height: 1;
}
`;
