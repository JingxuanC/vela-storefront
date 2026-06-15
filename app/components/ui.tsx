// ============================================================================
// VTron — Shared UI Components Library
// ============================================================================
// Toast, Skeleton, EmptyState, ConfirmDialog, StatusBadge
// Uses CSS variables from design-tokens.css (--neutral-*, --brand-*, --success,
// --danger, --warning, --accent-*, --radius-*, --space-*, --shadow-*).
// No Polaris dependencies. Inter font, OKLCH palette, 8px grid.
// ============================================================================

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
  type CSSProperties,
} from "react";

// ============================================================================
// 1. Toast Notification System
// ============================================================================

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_TYPE_STYLES: Record<ToastType, { bg: string; icon: string; borderColor: string }> = {
  success: { bg: "oklch(0.95 0.03 150)", icon: "✓", borderColor: "var(--success)" },
  error: { bg: "oklch(0.95 0.03 30)", icon: "✕", borderColor: "var(--danger)" },
  warning: { bg: "oklch(0.95 0.03 85)", icon: "⚠", borderColor: "var(--warning)" },
  info: { bg: "oklch(0.93 0.05 220)", icon: "ℹ", borderColor: "var(--accent-500)" },
};

const TOAST_KEYFRAMES = `
@keyframes toast-slide-in {
  from { opacity: 0; transform: translateX(100%) scale(0.95); }
  to { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes toast-slide-out {
  from { opacity: 1; transform: translateX(0) scale(1); }
  to { opacity: 0; transform: translateX(100%) scale(0.95); }
}
`;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const idCounter = useRef(0);

  const removeToast = useCallback((id: string) => {
    // Mark as exiting, then remove from DOM after animation
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const ToastValue = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = `toast-${++idCounter.current}`;
      setToasts((prev) => [...prev, { id, message, type }]);

      // Auto-dismiss after 3s
      const timer = setTimeout(() => {
        removeToast(id);
      }, 3000);
      timersRef.current.set(id, timer);
    },
    [removeToast],
  );

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast: ToastValue }}>
      {children}

      {/* Toast container */}
      <style>{TOAST_KEYFRAMES}</style>
      <div
        style={{
          position: "fixed",
          top: "var(--space-4)",
          right: "var(--space-4)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
          pointerEvents: "none",
          maxWidth: 380,
          width: "100%",
        }}
        role="region"
        aria-label="Notifications"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const style = TOAST_TYPE_STYLES[t.type];
          return (
            <div
              key={t.id}
              role="alert"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "var(--space-3)",
                padding: "var(--space-4)",
                background: style.bg,
                border: `1px solid ${style.borderColor}`,
                borderLeft: `4px solid ${style.borderColor}`,
                borderRadius: "var(--radius-sm)",
                boxShadow: "var(--shadow-lg)",
                pointerEvents: "auto",
                animation: "toast-slide-in 0.25s ease-out both",
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: "var(--text-sm)",
                lineHeight: 1.5,
                color: "var(--neutral-900)",
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "var(--radius-full)",
                  background: style.borderColor,
                  color: "white",
                  fontSize: 11,
                  fontWeight: 700,
                  lineHeight: 1,
                  marginTop: 1,
                }}
              >
                {style.icon}
              </span>
              <span style={{ flex: 1 }}>{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                aria-label="Dismiss"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--neutral-500)",
                  fontSize: "var(--text-lg)",
                  lineHeight: 1,
                  padding: 0,
                  flexShrink: 0,
                  opacity: 0.6,
                  transition: "opacity 0.15s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.6"; }}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a <ToastProvider>");
  }
  return ctx;
}


// ============================================================================
// 1.5. Spinner
// ============================================================================

export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <span
      className="vtron-spinner"
      style={{
        display: "inline-block",
        width: size,
        height: size,
        border: "2px solid var(--neutral-200)",
        borderTopColor: "var(--brand-500)",
        borderRadius: "50%",
        animation: "vtron-spin 0.6s linear infinite",
      }}
      role="status"
      aria-label="Loading"
    />
  );
}

// ============================================================================
// 2. Skeleton Loading Components
// ============================================================================
// Uses the existing .skeleton shimmer animation from globals.css.

interface SkeletonBoxProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: CSSProperties;
}

export function SkeletonBox({
  width = "100%",
  height = 20,
  borderRadius = "var(--radius-sm)",
  style,
}: SkeletonBoxProps) {
  return (
    <div
      className="skeleton"
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        borderRadius: typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

interface SkeletonTextProps {
  lines?: number;
  width?: string | number;
  style?: CSSProperties;
}

export function SkeletonText({
  lines = 3,
  width = "100%",
  style,
}: SkeletonTextProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        ...style,
      }}
      aria-hidden="true"
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            width: i === lines - 1 ? "60%" : (typeof width === "number" ? `${width}px` : width),
            height: 14,
            borderRadius: "var(--radius-sm)",
          }}
        />
      ))}
    </div>
  );
}

interface SkeletonCardProps {
  style?: CSSProperties;
}

export function SkeletonCard({ style }: SkeletonCardProps) {
  return (
    <div
      className="feature-card"
      style={{
        cursor: "default",
        pointerEvents: "none",
        ...style,
      }}
      aria-hidden="true"
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-4)" }}>
        {/* Icon skeleton */}
        <div
          className="skeleton"
          style={{
            width: 40,
            height: 40,
            borderRadius: "var(--radius-sm)",
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {/* Title skeleton */}
          <div
            className="skeleton"
            style={{ width: "55%", height: 16, borderRadius: "var(--radius-sm)" }}
          />
          {/* Description skeleton */}
          <div
            className="skeleton"
            style={{ width: "100%", height: 12, borderRadius: "var(--radius-sm)" }}
          />
          <div
            className="skeleton"
            style={{ width: "80%", height: 12, borderRadius: "var(--radius-sm)" }}
          />
          {/* Badge skeleton */}
          <div
            className="skeleton"
            style={{
              width: 60,
              height: 20,
              borderRadius: "var(--radius-full)",
              marginTop: "var(--space-1)",
            }}
          />
        </div>
      </div>
    </div>
  );
}


// ============================================================================
// 3. EmptyState Component
// ============================================================================

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: CSSProperties;
}

export function EmptyState({
  icon = "📭",
  title,
  description,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-12) var(--space-6)",
        textAlign: "center",
        minHeight: 240,
        ...style,
      }}
    >
      <span
        style={{
          fontSize: "3rem",
          lineHeight: 1,
          marginBottom: "var(--space-4)",
          display: "block",
        }}
        aria-hidden="true"
      >
        {icon}
      </span>
      <h3
        style={{
          fontSize: "var(--text-xl)",
          fontWeight: 700,
          color: "var(--neutral-700)",
          marginBottom: "var(--space-2)",
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--neutral-500)",
            maxWidth: 320,
            lineHeight: 1.6,
            marginBottom: actionLabel ? "var(--space-6)" : 0,
          }}
        >
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          className="btn btn--primary"
          onClick={onAction}
          type="button"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}


// ============================================================================
// 4. ConfirmDialog — Confirmation Modal
// ============================================================================

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Focus trap & ESC handler
  useEffect(() => {
    if (!open) return;

    previousActiveElement.current = document.activeElement;

    const dialog = dialogRef.current;
    if (!dialog) return;

    // Focus the first focusable element (confirm button) inside dialog
    const focusableElements = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
      focusableElements[0]?.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
        return;
      }

      // Focus trap: cycle through focusable elements
      if (e.key !== "Tab" || focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Prevent body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;

      // Restore focus
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [open, onCancel]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        padding: "var(--space-4)",
        animation: "fadeSlideUp 0.2s ease-out both",
      }}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        ref={dialogRef}
        style={{
          background: "white",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-2xl)",
          padding: "var(--space-6)",
          maxWidth: 420,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
          animation: "fadeSlideUp 0.2s ease-out both",
        }}
      >
        <h3
          id="confirm-dialog-title"
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: 700,
            color: danger ? "var(--danger)" : "var(--neutral-900)",
            lineHeight: 1.3,
          }}
        >
          {title}
        </h3>

        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--neutral-600)",
            lineHeight: 1.6,
          }}
        >
          {message}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "var(--space-3)",
            marginTop: "var(--space-2)",
          }}
        >
          <button
            className="btn btn--ghost"
            onClick={onCancel}
            type="button"
            style={{ height: "2.25rem", paddingInline: "var(--space-4)" }}
          >
            {cancelLabel}
          </button>
          <button
            className="btn"
            onClick={onConfirm}
            type="button"
            style={{
              height: "2.25rem",
              paddingInline: "var(--space-4)",
              background: danger
                ? "var(--danger)"
                : "var(--gradient-cta)",
              color: "white",
              border: "1px solid transparent",
              borderRadius: "var(--radius-sm)",
              fontWeight: 600,
              fontSize: "var(--text-sm)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}


// ============================================================================
// 5. StatusBadge — Reusable status indicator
// ============================================================================

const STATUS_BADGE_MAP: Record<string, { bg: string; color: string }> = {
  pending:  { bg: "oklch(0.95 0.03 85)",  color: "oklch(0.40 0.12 85)" },
  approved: { bg: "oklch(0.93 0.05 220)", color: "oklch(0.38 0.12 220)" },
  active:   { bg: "oklch(0.95 0.03 150)", color: "oklch(0.40 0.10 150)" },
  inactive: { bg: "oklch(0.92 0 0)",      color: "oklch(0.45 0 0)" },
  refunded: { bg: "oklch(0.95 0.03 150)", color: "oklch(0.40 0.10 150)" },
  rejected: { bg: "oklch(0.95 0.03 30)",  color: "oklch(0.40 0.12 30)" },
};

/** Fallback for unknown statuses */
const FALLBACK_BADGE = { bg: "oklch(0.92 0 0)", color: "oklch(0.45 0 0)" };

interface StatusBadgeProps {
  status: string;
  style?: CSSProperties;
}

export function StatusBadge({ status, style }: StatusBadgeProps) {
  const normalized = status.toLowerCase().trim();
  const badgeStyle = STATUS_BADGE_MAP[normalized] ?? FALLBACK_BADGE;

  return (
    <span
      className="feature-badge"
      style={{
        background: badgeStyle.bg,
        color: badgeStyle.color,
        ...style,
      }}
    >
      {status}
    </span>
  );
}
