import React from "react";

interface ResearchCitationBadgeProps {
  source: string;
  claimRef?: string;
  isVerified?: boolean;
}

export const ResearchCitationBadge: React.FC<ResearchCitationBadgeProps> = ({
  source,
  claimRef,
  isVerified = true,
}) => {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 20px",
        background: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(12px)",
        borderRadius: "999px",
        border: "1px solid rgba(0, 245, 255, 0.35)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
        fontFamily: "'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: isVerified ? "#10B981" : "#F59E0B",
          boxShadow: `0 0 10px ${isVerified ? "#10B981" : "#F59E0B"}`,
        }}
      />
      <span
        style={{
          color: "#94A3B8",
          fontSize: "18px",
          fontWeight: 600,
          letterSpacing: "0.5px",
        }}
      >
        SOURCE: <strong style={{ color: "#E2E8F0" }}>{source}</strong>
        {claimRef && <span style={{ color: "#00F5FF" }}> [{claimRef}]</span>}
      </span>
      {isVerified && (
        <span
          style={{
            fontSize: "14px",
            background: "rgba(16, 185, 129, 0.2)",
            color: "#10B981",
            padding: "2px 8px",
            borderRadius: "6px",
            fontWeight: 700,
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          VERIFIED
        </span>
      )}
    </div>
  );
};
