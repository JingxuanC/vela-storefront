import { useState, useEffect, useCallback } from "react";
import { api } from "~/api";

interface Notification {
  id: string;
  type: "in_app" | "email";
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  metadata?: Record<string, unknown>;
}

interface NotifListResponse {
  notifications: Notification[];
  unread_count: number;
}

function timeAgo(ts: string): string {
  const now = Date.now();
  const then = new Date(ts).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "刚刚";
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} 天前`;
  return new Date(ts).toLocaleDateString("zh-CN");
}

const TYPE_ICONS: Record<string, string> = {
  in_app: "🔔",
  email: "✉️",
  default: "📌",
};

export default function Notifications() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingIds, setMarkingIds] = useState<Set<string>>(new Set());

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api<NotifListResponse>(
        "/api/notifications/in-app"
      );
      if (data?.notifications) {
        setNotifs(data.notifications);
      } else {
        setNotifs([]);
      }
    } catch {
      setError("无法加载通知，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function markRead(id: string) {
    setMarkingIds((prev) => new Set(prev).add(id));
    try {
      const ok = await api(`/api/notifications/${id}/read`, {
        method: "PATCH",
      });
      if (ok !== null) {
        setNotifs((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
      }
    } catch {
      // silently fail — user can retry
    } finally {
      setMarkingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function markAllRead() {
    const unread = notifs.filter((n) => !n.read);
    if (unread.length === 0) return;
    await Promise.all(unread.map((n) => markRead(n.id)));
  }

  const unreadCount = notifs.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div>
        <h1 className="page-title">通知中心</h1>
        <p className="page-subtitle">查看所有应用内通知</p>
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="page-title">通知中心</h1>
        <p className="page-subtitle">查看所有应用内通知</p>
        <div className="banner banner-error">{error}</div>
        <button className="btn btn-primary" onClick={fetchNotifications}>
          重试
        </button>
      </div>
    );
  }

  if (notifs.length === 0) {
    return (
      <div>
        <h1 className="page-title">通知中心</h1>
        <p className="page-subtitle">查看所有应用内通知</p>
        <div className="empty-state">
          <div className="empty-icon">🔔</div>
          <div className="empty-title">暂无通知</div>
          <div className="empty-desc">
            当有新的系统通知、AI 任务完成或订阅更新时，会在此显示。
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            通知中心
          </h1>
          <p className="page-subtitle" style={{ marginBottom: 0, marginTop: 4 }}>
            查看所有应用内通知
            {unreadCount > 0 && (
              <span
                className="badge badge-amber"
                style={{ marginLeft: 10, fontSize: 11 }}
              >
                {unreadCount} 条未读
              </span>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="btn" onClick={markAllRead}>
            全部标为已读
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {notifs.map((n) => (
          <div
            key={n.id}
            className="card"
            style={{
              padding: "16px 20px",
              opacity: n.read ? 0.6 : 1,
              transition: "opacity .3s var(--ease)",
              cursor: n.read ? "default" : "pointer",
              borderLeft: n.read
                ? undefined
                : "3px solid var(--amber)",
            }}
            onClick={() => {
              if (!n.read) markRead(n.id);
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>
                {TYPE_ICONS[n.type] || TYPE_ICONS.default}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontWeight: n.read ? 500 : 700,
                      fontSize: 14,
                      color: "var(--text-primary)",
                    }}
                  >
                    {n.title}
                  </span>
                  <span
                    className="faint"
                    style={{ fontSize: 12, flexShrink: 0 }}
                  >
                    {timeAgo(n.created_at)}
                  </span>
                </div>
                <p
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                  }}
                >
                  {n.body}
                </p>
                {!n.read && (
                  <div
                    style={{
                      marginTop: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {markingIds.has(n.id) ? (
                      <span className="faint" style={{ fontSize: 12 }}>
                        标记中...
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--amber)",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          markRead(n.id);
                        }}
                      >
                        标为已读
                      </span>
                    )}
                    {!n.read && (
                      <span
                        className="pulse"
                        style={{
                          width: 6,
                          height: 6,
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
