"use client";

interface ProgressBarProps {
  label: string;
  value: number;
  maxValue?: number;
  showPercentage?: boolean;
  color?: string;
}

export function ProgressBar({
  label,
  value,
  maxValue = 100,
  showPercentage = true,
  color = "var(--text-primary)",
}: ProgressBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div className="progress-container">
      <style jsx>{`
        .progress-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .progress-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          margin: 0;
        }

        .progress-value {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .progress-track {
          width: 100%;
          height: 8px;
          background: var(--bg-tertiary);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: ${color};
          border-radius: 4px;
          transition: width 0.3s ease;
          width: ${percentage}%;
        }
      `}</style>

      <div className="progress-header">
        <p className="progress-label">{label}</p>
        <p className="progress-value">{showPercentage ? `${Math.round(percentage)}%` : value}</p>
      </div>
      <div className="progress-track">
        <div className="progress-fill" />
      </div>
    </div>
  );
}

