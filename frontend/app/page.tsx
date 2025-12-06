"use client";

import Link from "next/link";
import { ShieldIcon, ActivityIcon, UsersIcon, CheckCircleIcon } from "@/shared/ui/icons";

export default function Home() {
  return (
    <div className="landing">
      <style jsx>{`
        .landing {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          color: var(--text-primary);
          position: relative;
          overflow: hidden;
        }

        .landing::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
              circle at 20% 80%,
              rgba(16, 185, 129, 0.1) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 80% 20%,
              rgba(16, 185, 129, 0.08) 0%,
              transparent 50%
            );
          pointer-events: none;
        }

        .content {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 700px;
        }

        .logo-container {
          width: 80px;
          height: 80px;
          background: linear-gradient(
            135deg,
            var(--color-primary) 0%,
            var(--color-primary-dark) 100%
          );
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: white;
          box-shadow: 0 20px 40px rgba(16, 185, 129, 0.25);
        }

        .logo-container :global(svg) {
          width: 48px;
          height: 48px;
        }

        .title {
          font-size: 48px;
          font-weight: 800;
          margin: 0 0 16px 0;
          color: var(--text-primary);
          line-height: 1.1;
        }

        .title-accent {
          color: var(--color-primary);
        }

        .subtitle {
          font-size: 18px;
          color: var(--text-secondary);
          margin: 0 0 48px 0;
          line-height: 1.6;
        }

        .cta-group {
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
        }

        .cta-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 16px 32px;
          border-radius: 12px;
          font-family: inherit;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
          min-width: 260px;
        }

        .cta-primary {
          background: linear-gradient(
            135deg,
            var(--color-primary) 0%,
            var(--color-primary-dark) 100%
          );
          color: white;
          border: none;
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.25);
        }

        .cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(16, 185, 129, 0.35);
        }

        .cta-secondary {
          background: var(--bg-card);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .cta-secondary:hover {
          background: var(--bg-hover);
          border-color: var(--border-hover);
        }

        .cta-icon {
          width: 20px;
          height: 20px;
        }

        .cta-icon :global(svg) {
          width: 100%;
          height: 100%;
        }

        .features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 80px;
          text-align: center;
        }

        .feature {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 28px 24px;
          transition: all 0.2s ease;
        }

        .feature:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: var(--color-primary);
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          color: var(--color-primary);
        }

        .feature-icon :global(svg) {
          width: 24px;
          height: 24px;
        }

        .feature-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: var(--text-primary);
        }

        .feature-desc {
          font-size: 14px;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .title {
            font-size: 36px;
          }
          .subtitle {
            font-size: 16px;
          }
          .features {
            grid-template-columns: 1fr;
            margin-top: 60px;
          }
          .logo-container {
            width: 64px;
            height: 64px;
          }
          .logo-container :global(svg) {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>

      <div className="content">
        <div className="logo-container">
          <ShieldIcon />
        </div>
        <h1 className="title">
          <span className="title-accent">CyberSec</span> Control
        </h1>
        <p className="subtitle">
          Enterprise-grade Security Operations Center for real-time threat monitoring, incident
          management, and comprehensive security analytics.
        </p>

        <div className="cta-group">
          <Link href="/login" className="cta-button cta-primary">
            <span>Get Started</span>
          </Link>
          <Link href="/dashboard/admin" className="cta-button cta-secondary">
            <span className="cta-icon">
              <ShieldIcon />
            </span>
            <span>View Dashboard</span>
          </Link>
        </div>

        <div className="features">
          <div className="feature">
            <div className="feature-icon">
              <ActivityIcon />
            </div>
            <h3 className="feature-title">Real-time Monitoring</h3>
            <p className="feature-desc">
              24/7 surveillance of your security infrastructure with instant alerts
            </p>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <CheckCircleIcon />
            </div>
            <h3 className="feature-title">Threat Detection</h3>
            <p className="feature-desc">
              Advanced AI-powered threat detection and automated response
            </p>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <UsersIcon />
            </div>
            <h3 className="feature-title">Access Control</h3>
            <p className="feature-desc">
              Comprehensive user access management and session monitoring
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
