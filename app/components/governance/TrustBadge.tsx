/**
 * TrustBadge Component
 * KuasaTurbo × Qontrek Design System v1.1
 *
 * A reusable badge component for displaying workflow trust status.
 * Must appear identical across all surfaces: workflow list, evidence panel, QPI, audit exports.
 *
 * DESIGN CONSTITUTION RULES:
 * - Certified/Promoted = Navy (authority, NOT green/success)
 * - Rejected = Red (error)
 * - Under Review = Amber (warning)
 * - Draft/Tested/Scored/Sandbox = Gray variants
 * - NEVER clickable (badges are verdicts, not buttons)
 * - Legal badges (Certified/Promoted/Rejected) must use md size
 */

import React from 'react';

// Trust tier type definition
export type TrustTier =
  | 'draft'
  | 'tested'
  | 'scored'
  | 'underReview'
  | 'sandbox'
  | 'certified'
  | 'promoted'
  | 'rejected';

// Size type - legal badges must use 'md'
export type BadgeSize = 'sm' | 'md';

interface TrustBadgeProps {
  tier: TrustTier;
  size?: BadgeSize;
  label?: string;
  proofHash?: string;
  className?: string;
}

// Simple inline SVG icons to avoid external dependencies
const BadgeIcon = ({ type, className }: { type: TrustTier; className?: string }) => {
  const icons: Record<TrustTier, React.ReactNode> = {
    draft: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6z"/>
      </svg>
    ),
    tested: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M7 2v2h1v14a4 4 0 0 0 8 0V4h1V2H7zm4 14c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2-4h-2V4h2v8z"/>
      </svg>
    ),
    scored: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
      </svg>
    ),
    underReview: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
      </svg>
    ),
    sandbox: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 7h2v2H7V7zm0 4h2v2H7v-2zm0 4h2v2H7v-2zm4-8h6v2h-6V7zm0 4h6v2h-6v-2zm0 4h6v2h-6v-2z"/>
      </svg>
    ),
    certified: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
      </svg>
    ),
    promoted: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    ),
    rejected: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
      </svg>
    ),
  };

  return <span className={className}>{icons[type] || null}</span>;
};

// Badge configuration mapping - Design Constitution compliant
const BADGE_CONFIG: Record<TrustTier, {
  bgColor: string;
  textColor: string;
  borderColor: string;
  defaultLabel: string;
  isLegal: boolean; // Legal badges (Certified/Promoted/Rejected) must be md size
}> = {
  draft: {
    bgColor: 'bg-gray-500/20',
    textColor: 'text-gray-400',
    borderColor: 'border-gray-500/30',
    defaultLabel: 'Draft',
    isLegal: false,
  },
  tested: {
    bgColor: 'bg-gray-500/20',
    textColor: 'text-gray-400',
    borderColor: 'border-gray-500/30',
    defaultLabel: 'Tested',
    isLegal: false,
  },
  scored: {
    bgColor: 'bg-gray-600/30',
    textColor: 'text-gray-300',
    borderColor: 'border-gray-500/30',
    defaultLabel: 'Scored',
    isLegal: false,
  },
  underReview: {
    bgColor: 'bg-amber-500/20',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    defaultLabel: 'Under Review',
    isLegal: false,
  },
  sandbox: {
    bgColor: 'bg-gray-600/30',
    textColor: 'text-gray-300',
    borderColor: 'border-gray-500/30',
    defaultLabel: 'Sandbox · Limited Authority',
    isLegal: false,
  },
  // LEGAL BADGES - Authority color (Navy), never green
  certified: {
    bgColor: 'bg-[#0B1B3A]',      // Navy - authority
    textColor: 'text-white',
    borderColor: 'border-[#1E3A5F]',
    defaultLabel: 'Qontrek Ready',
    isLegal: true,
  },
  promoted: {
    bgColor: 'bg-[#0B1B3A]',      // Navy - authority
    textColor: 'text-white',
    borderColor: 'border-[#1E3A5F]',
    defaultLabel: 'Promoted for scale',
    isLegal: true,
  },
  rejected: {
    bgColor: 'bg-red-500/20',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/30',
    defaultLabel: 'Rejected',
    isLegal: true,
  },
};

/**
 * TrustBadge Component
 *
 * CRITICAL: This component is NOT clickable by design.
 * Badges are verdicts, not buttons.
 */
export default function TrustBadge({
  tier = 'draft',
  size = 'md',
  label,
  proofHash,
  className = '',
}: TrustBadgeProps) {
  const config = BADGE_CONFIG[tier] || BADGE_CONFIG.draft;
  const displayLabel = label || config.defaultLabel;

  // Enforce md size for legal badges (Certified/Promoted/Rejected)
  const effectiveSize = config.isLegal ? 'md' : size;

  // Size classes
  const sizeClasses = effectiveSize === 'sm'
    ? 'px-2 py-0.5 text-xs gap-1'
    : 'px-2.5 py-1 text-sm gap-1.5';

  return (
    <span
      role="status"
      aria-label={displayLabel}
      title={proofHash ? `Proof: ${proofHash}` : undefined}
      className={`
        inline-flex items-center font-medium rounded-md border
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeClasses}
        ${className}
      `}
      // NO onClick - badges are verdicts, not buttons
    >
      <BadgeIcon
        type={tier}
        className="flex-shrink-0"
      />
      <span className="whitespace-nowrap">{displayLabel}</span>
    </span>
  );
}

// Named exports for specific tiers (convenience)
export const DraftBadge = (props: Omit<TrustBadgeProps, 'tier'>) => <TrustBadge tier="draft" {...props} />;
export const TestedBadge = (props: Omit<TrustBadgeProps, 'tier'>) => <TrustBadge tier="tested" {...props} />;
export const ScoredBadge = (props: Omit<TrustBadgeProps, 'tier'>) => <TrustBadge tier="scored" {...props} />;
export const UnderReviewBadge = (props: Omit<TrustBadgeProps, 'tier'>) => <TrustBadge tier="underReview" {...props} />;
export const SandboxBadge = (props: Omit<TrustBadgeProps, 'tier'>) => <TrustBadge tier="sandbox" {...props} />;
export const CertifiedBadge = (props: Omit<TrustBadgeProps, 'tier'>) => <TrustBadge tier="certified" {...props} />;
export const PromotedBadge = (props: Omit<TrustBadgeProps, 'tier'>) => <TrustBadge tier="promoted" {...props} />;
export const RejectedBadge = (props: Omit<TrustBadgeProps, 'tier'>) => <TrustBadge tier="rejected" {...props} />;
