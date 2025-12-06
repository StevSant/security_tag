"use client";

import Link from "next/link";
import { ShieldIcon } from "@/shared/ui/icons";

export default function OfflinePage() {
  return (
    <div className="offline-page">
      <style jsx>{`
        .offline-page {
          min-height: 100vh;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .offline-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 48px 40px;
          text-align: center;
          max-width: 420px;
          width: 100%;
        }

        .offline-icon {
          width: 80px;
          height: 80px;
          background: rgba(107, 114, 128, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: var(--text-muted);
        }

        .offline-icon :global(svg) {
          width: 40px;
          height: 40px;
        }

        .offline-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 12px 0;
        }

        .offline-text {
          font-size: 14px;
          color: var(--text-muted);
          margin: 0 0 32px 0;
          line-height: 1.6;
        }

        .retry-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 28px;
          background: linear-gradient(
            135deg,
            var(--color-primary) 0%,
            var(--color-primary-dark) 100%
          );
          color: white;
          border: none;
          border-radius: 10px;
          font-family: inherit;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }

        .retry-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
        }
      `}</style>

      <div className="offline-card">
        <div className="offline-icon">
          <ShieldIcon />
        </div>
        <h1 className="offline-title">You&apos;re Offline</h1>
        <p className="offline-text">
          It looks like you&apos;ve lost your internet connection. Some features may not be
          available until you&apos;re back online.
        </p>
        <Link href="/" className="retry-btn">
          Try Again
        </Link>
      </div>
    </div>
  );
}
