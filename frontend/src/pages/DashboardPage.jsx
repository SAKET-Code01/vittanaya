import React, { useState } from 'react';

import {
  useWorkspace,
} from '../context/WorkspaceContext';

import SelectedBusinessHeader from '../components/dashboard/SelectedBusinessHeader';
import MarketInsightSection from '../components/dashboard/MarketInsightSection';
import VittanayaInsightsCard from '../components/dashboard/VittanayaInsightsCard';
import FinancialOutlookCard from '../components/dashboard/FinancialOutlookCard';
import PaymentFinancialTrackCard from '../components/dashboard/PaymentFinancialTrackCard';
import DashboardFooter from '../components/dashboard/DashboardFooter';
import BusinessChangeModal from '../components/common/BusinessChangeModal';

/* =========================================================
   ICON SYSTEM
   No extra package required
   ========================================================= */

function Icon({
  name,
  size = 20,
  strokeWidth = 1.9,
  className = '',
}) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
    'aria-hidden': true,
  };

  switch (name) {
    case 'building':
      return (
        <svg {...props}>
          <path d="M4 21V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v16" />
          <path d="M2 21h20" />
          <path d="M8 7h2M12 7h2M8 11h2M12 11h2M8 15h2M12 15h2" />
          <path d="M17 21v-7h4v7" />
        </svg>
      );

    case 'location':
      return (
        <svg {...props}>
          <path d="M20 10c0 5.5-8 11-8 11S4 15.5 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );

    case 'calendar':
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="17" rx="3" />
          <path d="M16 2v4M8 2v4M3 9h18" />
          <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" />
        </svg>
      );

    case 'download':
      return (
        <svg {...props}>
          <path d="M12 3v11" />
          <path d="m8 10 4 4 4-4" />
          <path d="M4 20h16" />
        </svg>
      );

    case 'percent':
      return (
        <svg {...props}>
          <path d="m7 17 10-10" />
          <circle cx="7.5" cy="7.5" r="2" />
          <circle cx="16.5" cy="16.5" r="2" />
        </svg>
      );

    case 'trend':
      return (
        <svg {...props}>
          <path d="M4 17 10 11l4 4 6-8" />
          <path d="M15 7h5v5" />
        </svg>
      );

    case 'shield':
      return (
        <svg {...props}>
          <path d="M12 3 20 6v5c0 5.2-3.3 8.6-8 10-4.7-1.4-8-4.8-8-10V6l8-3Z" />
          <path d="m8.5 12 2.3 2.3 4.7-5" />
        </svg>
      );

    case 'target':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="12" cy="12" r="1" />
        </svg>
      );

    case 'clock':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case 'wallet':
      return (
        <svg {...props}>
          <path d="M4 7h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12" />
          <path d="M17 13h4" />
          <circle
            cx="17"
            cy="13"
            r=".7"
            fill="currentColor"
          />
        </svg>
      );

    case 'arrow':
      return (
        <svg {...props}>
          <path d="M4 12h15" />
          <path d="m14 7 5 5-5 5" />
        </svg>
      );

    case 'chevron':
      return (
        <svg {...props}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );

    case 'spark':
      return (
        <svg {...props}>
          <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" />
          <path d="m19 16 .5 2.5L22 19l-2.5.5L19 22l-.5-2.5L16 19l2.5-.5L19 16Z" />
        </svg>
      );

    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}

/* =========================================================
   BUSINESS PROFILE ART
   ========================================================= */

function BusinessProfileImage({
  profile,
}) {
  const image =
    profile?.image ||
    profile?.imageUrl ||
    profile?.avatar ||
    null;

  return (
    <div className="relative h-[104px] w-[104px] shrink-0">

      {/* soft aura */}
      <div
        className="
          absolute
          inset-[-12px]
          rounded-[30px]
          bg-[#B6EACD]/30
          blur-2xl
        "
      />

      <div
        className="
          relative
          h-full
          w-full
          overflow-hidden
          rounded-[26px]
          border
          border-white/90
          bg-gradient-to-br
          from-[#F2FBF6]
          to-[#DDF2E7]
          shadow-[0_15px_35px_rgba(24,101,66,.12)]
        "
      >

        {image ? (
          <img
            src={image}
            alt={profile?.name || 'Business'}
            className="h-full w-full object-cover"
          />
        ) : (
          <svg
            viewBox="0 0 120 120"
            className="h-full w-full"
          >
            <defs>
              <linearGradient
                id="dashSky"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#BCEAF6"
                />
                <stop
                  offset="100%"
                  stopColor="#62C7EA"
                />
              </linearGradient>

              <linearGradient
                id="dashHill"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#61CE96"
                />
                <stop
                  offset="100%"
                  stopColor="#08784C"
                />
              </linearGradient>

              <linearGradient
                id="dashBuilding"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#F3FBF8"
                />
                <stop
                  offset="100%"
                  stopColor="#C5E8DA"
                />
              </linearGradient>
            </defs>

            <rect
              width="120"
              height="120"
              fill="url(#dashSky)"
            />

            <circle
              cx="84"
              cy="24"
              r="11"
              fill="white"
              opacity=".9"
            />

            <circle
              cx="95"
              cy="26"
              r="8"
              fill="white"
              opacity=".85"
            />

            <circle
              cx="76"
              cy="29"
              r="7"
              fill="white"
              opacity=".8"
            />

            <path
              d="M0 75 30 44l18 20 17-18 30 28 25-13v59H0Z"
              fill="#5CAE92"
              opacity=".7"
            />

            <path
              d="M0 82c20-12 35-8 50 0 17 9 31 3 43-4 12-7 18-3 27 4v38H0Z"
              fill="url(#dashHill)"
            />

            <rect
              x="34"
              y="55"
              width="45"
              height="47"
              rx="2"
              fill="url(#dashBuilding)"
            />

            <path
              d="M30 55 56 39l28 16Z"
              fill="#B8DFCE"
            />

            <rect
              x="68"
              y="42"
              width="10"
              height="60"
              fill="#DFF1EA"
            />

            <rect
              x="42"
              y="63"
              width="7"
              height="7"
              rx="1"
              fill="#187958"
            />

            <rect
              x="55"
              y="63"
              width="7"
              height="7"
              rx="1"
              fill="#187958"
            />

            <rect
              x="42"
              y="76"
              width="7"
              height="7"
              rx="1"
              fill="#187958"
            />

            <rect
              x="55"
              y="76"
              width="7"
              height="7"
              rx="1"
              fill="#187958"
            />

            <rect
              x="50"
              y="88"
              width="10"
              height="14"
              rx="1"
              fill="#156B4F"
            />
          </svg>
        )}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-br
            from-white/25
            via-transparent
            to-[#087B4B]/10
          "
        />

        <span
          className="
            absolute
            right-2.5
            top-2.5
            h-3
            w-3
            rounded-full
            border-2
            border-white
            bg-[#16A36B]
            shadow-[0_0_0_4px_rgba(22,163,107,.11)]
          "
        />
      </div>
    </div>
  );
}

/* =========================================================
   SCORE RING
   ========================================================= */

function ScoreRing({
  score = 78,
}) {
  const radius = 51;
  const circumference =
    2 * Math.PI * radius;

  const progress =
    (score / 100) * circumference;

  return (
    <div className="relative h-[150px] w-[150px] shrink-0">

      <div
        className="
          absolute
          inset-3
          rounded-full
          bg-[#28D793]/10
          blur-2xl
        "
      />

      <svg
        width="150"
        height="150"
        viewBox="0 0 150 150"
        className="-rotate-90"
      >

        <defs>
          <linearGradient
            id="dashboardScoreGradient"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#078B57"
            />

            <stop
              offset="75%"
              stopColor="#0BA96B"
            />

            <stop
              offset="100%"
              stopColor="#35DD9A"
            />
          </linearGradient>
        </defs>

        <circle
          cx="75"
          cy="75"
          r={radius}
          fill="none"
          stroke="#DCEDE5"
          strokeWidth="11"
        />

        <circle
          cx="75"
          cy="75"
          r={radius}
          fill="none"
          stroke="url(#dashboardScoreGradient)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          className="
            transition-all
            duration-1000
            ease-out
          "
        />

      </svg>

      <div
        className="
          absolute
          inset-0
          flex
          flex-col
          items-center
          justify-center
        "
      >
        <span
          className="
            text-[45px]
            font-black
            leading-none
            tracking-[-0.055em]
            text-[#092119]
          "
        >
          {score}
        </span>

        <span
          className="
            mt-1
            text-[12px]
            font-bold
            text-[#718078]
          "
        >
          /100
        </span>
      </div>

    </div>
  );
}

/* =========================================================
   PREMIUM HERO SECTION
   ========================================================= */

function DashboardHero({
  profile,
  onOpenChangeBusiness,
  onNavigate,
  onOpenWhy,
}) {
  const [
    showWhy,
    setShowWhy,
  ] = useState(false);

  const handleWhy = () => {
    setShowWhy(
      (previous) => !previous
    );

    if (typeof onOpenWhy === 'function') {
      onOpenWhy();
    }
  };

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[30px]
        border
        border-[#D9E8E0]
        bg-white/80
        shadow-[0_18px_52px_rgba(27,83,55,.075)]
        backdrop-blur-2xl
      "
    >

      {/* glass background */}
      <div
        className="
          pointer-events-none
          absolute
          -right-24
          -top-32
          h-[340px]
          w-[340px]
          rounded-full
          bg-[#C9F3D9]/45
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-36
          -left-24
          h-[300px]
          w-[460px]
          rounded-full
          bg-[#DFF7E8]/55
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          right-[30%]
          top-[-70px]
          h-[230px]
          w-[230px]
          rounded-full
          border
          border-[#D7EEE0]/70
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-white
          to-transparent
        "
      />

      {/* content */}
      <div
        className="
          relative
          grid
          grid-cols-1
          gap-7
          px-6
          py-7
          sm:px-8
          sm:py-8
          lg:grid-cols-[1.45fr_1.05fr_.72fr]
          lg:items-center
          lg:gap-8
          lg:px-10
        "
      >

        {/* =================================================
            BUSINESS
            ================================================= */}

        <div className="flex min-w-0 items-center gap-5">

          <BusinessProfileImage
            profile={profile}
          />

          <div className="min-w-0">

            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-[#C7E6D5]
                bg-[#EEF9F3]
                px-3
                py-1.5
              "
            >

              <span
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-[#0C985C]
                "
              />

              <span
                className="
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.12em]
                  text-[#087A49]
                "
              >
                Selected Business
              </span>

            </div>

            <h1
              className="
                mt-3
                max-w-[670px]
                text-[28px]
                font-black
                leading-[1.06]
                tracking-[-0.045em]
                text-[#092118]
                sm:text-[31px]
                lg:text-[34px]
              "
            >
              {profile.name}
            </h1>

            <button
              type="button"
              onClick={onOpenChangeBusiness}
              className="
                group
                mt-3
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-[#BDDACA]
                bg-white/90
                px-4
                py-2
                text-[10px]
                font-black
                text-[#087B4B]
                shadow-[0_5px_16px_rgba(24,86,54,.05)]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:border-[#87B69D]
                hover:bg-[#F0FAF4]
                hover:shadow-[0_10px_25px_rgba(24,102,64,.11)]
              "
            >
              Change Business

              <Icon
                name="arrow"
                size={12}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            </button>

            <div
              className="
                mt-4
                flex
                flex-wrap
                items-center
                gap-x-5
                gap-y-2
              "
            >

              <span
                className="
                  flex
                  items-center
                  gap-2
                  text-[10px]
                  font-semibold
                  text-[#677770]
                "
              >
                <span className="text-[#0D8253]">
                  <Icon
                    name="building"
                    size={14}
                  />
                </span>

                {profile.category}
              </span>

              <span
                className="
                  flex
                  items-center
                  gap-2
                  text-[10px]
                  font-semibold
                  text-[#677770]
                "
              >
                <span className="text-[#3776C7]">
                  <Icon
                    name="location"
                    size={14}
                  />
                </span>

                {profile.location}
              </span>

            </div>

            <p
              className="
                mt-3
                text-[10px]
                font-semibold
                text-[#78867F]
              "
            >
              Investment Range

              <strong
                className="
                  ml-2
                  font-black
                  text-[#07834E]
                "
              >
                {profile.investmentRange}
              </strong>
            </p>

          </div>
        </div>

        {/* =================================================
            FEASIBILITY SCORE
            ================================================= */}

        <div
          className="
            relative
            overflow-hidden
            rounded-[26px]
            border
            border-[#D0E7DA]
            bg-gradient-to-br
            from-white/95
            via-[#F4FCF7]/95
            to-[#E5F7ED]/90
            p-5
            shadow-[0_15px_36px_rgba(16,94,57,.09)]
            backdrop-blur-xl
          "
        >

          <div
            className="
              pointer-events-none
              absolute
              -right-10
              -top-12
              h-[140px]
              w-[140px]
              rounded-full
              bg-white/80
              blur-3xl
            "
          />

          <div
            className="
              relative
              flex
              items-center
              gap-5
            "
          >

            <ScoreRing
              score={78}
            />

            <div className="min-w-0">

              <p
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.14em]
                  text-[#728079]
                "
              >
                Business Feasibility Score
              </p>

              <p
                className="
                  mt-2
                  text-[21px]
                  font-black
                  tracking-[-0.035em]
                  text-[#07834E]
                "
              >
                Good Potential
              </p>

              <div
                className="
                  mt-2.5
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-[#C4E3D2]
                  bg-[#EAF8F0]
                  px-3
                  py-1.5
                  text-[9px]
                  font-black
                  text-[#087B4B]
                "
              >

                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-[#0A985C]
                  "
                />

                Confidence 87%

              </div>

              <button
                type="button"
                onClick={handleWhy}
                className="
                  group
                  mt-3
                  flex
                  items-center
                  gap-1.5
                  text-[10px]
                  font-black
                  text-[#137A50]
                "
              >

                Why 78?

                <Icon
                  name="chevron"
                  size={11}
                  className={`
                    transition-transform
                    duration-300
                    ${
                      showWhy
                        ? 'rotate-180'
                        : ''
                    }
                  `}
                />

              </button>

            </div>

          </div>

          {/* why explanation */}

          <div
            className={`
              grid
              transition-all
              duration-300
              ${
                showWhy
                  ? 'mt-4 grid-rows-[1fr] opacity-100'
                  : 'grid-rows-[0fr] opacity-0'
              }
            `}
          >

            <div className="overflow-hidden">

              <div
                className="
                  border-t
                  border-[#DDEBE4]
                  pt-3
                "
              >

                <p
                  className="
                    text-[9px]
                    font-medium
                    leading-4
                    text-[#6F7D76]
                  "
                >
                  This score combines market
                  opportunity, financial readiness,
                  location fit, competition and
                  business risk indicators.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    onNavigate?.('feasibility')
                  }
                  className="
                    group
                    mt-2
                    flex
                    items-center
                    gap-1.5
                    text-[9px]
                    font-black
                    text-[#087B4B]
                  "
                >
                  View full assessment

                  <Icon
                    name="arrow"
                    size={10}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            DATE / REPORT
            ================================================= */}

        <div
          className="
            rounded-[24px]
            border
            border-[#DDE9E3]
            bg-white/75
            p-4
            shadow-[0_10px_28px_rgba(26,83,54,.05)]
            backdrop-blur-xl
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-br
                from-[#EEF8F2]
                to-[#E2F2E9]
                text-[#17382B]
              "
            >
              <Icon
                name="calendar"
                size={19}
              />
            </div>

            <div>

              <p
                className="
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.1em]
                  text-[#77857E]
                "
              >
                Assessment Date
              </p>

              <p
                className="
                  mt-1
                  text-[11px]
                  font-black
                  text-[#17261F]
                "
              >
                {profile.assessmentDate}
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              onNavigate?.('reports')
            }
            className="
              group
              mt-4
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-[#D5E1DB]
              bg-white
              py-3
              text-[10px]
              font-black
              text-[#25352D]
              shadow-[0_5px_15px_rgba(28,78,50,.035)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:border-[#94BAA5]
              hover:bg-[#F0F8F4]
              hover:text-[#087B4B]
              hover:shadow-[0_10px_25px_rgba(21,104,64,.10)]
            "
          >

            <Icon
              name="download"
              size={14}
              className="
                transition-transform
                duration-300
                group-hover:-translate-y-0.5
              "
            />

            Download Report

          </button>

        </div>

      </div>

    </section>
  );
}

/* =========================================================
   DECISION SNAPSHOT
   ========================================================= */

function DecisionSnapshot({
  onNavigate,
  onOpenWhy,
}) {
  const metrics = [
    {
      id: 'feasibility',
      icon: 'percent',
      label: 'Feasibility',
      value: '78',
      subtitle: 'Good feasibility',
      action: 'Why this score?',
      tone: 'green',
    },
    {
      id: 'market',
      icon: 'trend',
      label: 'Market Opportunity',
      value: 'High',
      subtitle: 'Strong local demand',
      action: 'Why this?',
      tone: 'green',
    },
    {
      id: 'risk',
      icon: 'shield',
      label: 'Risk Level',
      value: 'Low',
      subtitle: 'Stable environment',
      action: 'View risks',
      tone: 'green',
    },
    {
      id: 'scheme',
      icon: 'target',
      label: 'Scheme Match',
      value: '98%',
      subtitle: 'Excellent fit',
      action: 'View matches',
      tone: 'green',
    },
    {
      id: 'execution',
      icon: 'clock',
      label: 'Execution Progress',
      value: '38%',
      subtitle: 'Day 18 of 60',
      action: 'View plan',
      tone: 'blue',
    },
    {
      id: 'funding',
      icon: 'wallet',
      label: 'Funding Readiness',
      value: '72%',
      subtitle: 'Moderate gap',
      action: 'View details',
      tone: 'orange',
    },
  ];

  const handleAction = (id) => {
    if (id === 'feasibility') {
      if (typeof onOpenWhy === 'function') {
        onOpenWhy();
      }
      return;
    }

    if (id === 'market') {
      onNavigate?.('market');
      return;
    }

    if (id === 'risk') {
      onNavigate?.('risk');
      return;
    }

    if (id === 'scheme') {
      onNavigate?.('scheme');
      return;
    }

    if (id === 'execution') {
      onNavigate?.('action-plan');
      return;
    }

    if (id === 'funding') {
      onNavigate?.('financial');
    }
  };

  const tone = {
    green: {
      iconBg:
        'bg-gradient-to-br from-[#ECF9F2] to-[#E1F5E9]',
      icon:
        'text-[#07834E]',
      value:
        'text-[#07834E]',
      dot:
        'bg-[#55B98B]',
      button:
        'border-[#C5E2D1] bg-[#F5FBF7] text-[#087B4B] hover:border-[#8FBEA4] hover:bg-[#EAF7F0]',
    },

    blue: {
      iconBg:
        'bg-gradient-to-br from-[#EEF5FF] to-[#E7F0FD]',
      icon:
        'text-[#246BCE]',
      value:
        'text-[#246BCE]',
      dot:
        'bg-[#78A7E5]',
      button:
        'border-[#CFDEF4] bg-[#F7FAFF] text-[#2468BA] hover:border-[#99B8E0] hover:bg-[#EDF5FF]',
    },

    orange: {
      iconBg:
        'bg-gradient-to-br from-[#FFF5E9] to-[#FFF0DF]',
      icon:
        'text-[#D97706]',
      value:
        'text-[#D97706]',
      dot:
        'bg-[#E4A15E]',
      button:
        'border-[#F0DEC5] bg-[#FFFAF5] text-[#C66D0A] hover:border-[#E4B977] hover:bg-[#FFF3E1]',
    },
  };

  return (
    <section
      className="
        overflow-hidden
        rounded-[27px]
        border
        border-[#DDE8E2]
        bg-white/95
        shadow-[0_13px_38px_rgba(25,76,49,.055)]
        backdrop-blur-xl
      "
    >

      {/* heading */}

      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-[#E9F0EC]
          px-5
          py-4
          sm:px-6
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-gradient-to-br
              from-[#ECF9F2]
              to-[#E0F4E8]
              text-[#07834E]
            "
          >
            <Icon
              name="spark"
              size={17}
            />
          </div>

          <div>

            <p
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.14em]
                text-[#07834E]
              "
            >
              Decision Snapshot
            </p>

            <p
              className="
                mt-0.5
                text-[9px]
                text-[#78867F]
              "
            >
              Your business at a glance
            </p>

          </div>

        </div>

        <button
          type="button"
          onClick={() =>
            onNavigate?.('feasibility')
          }
          className="
            group
            hidden
            items-center
            gap-2
            rounded-lg
            px-2.5
            py-1.5
            text-[9px]
            font-black
            text-[#087B4B]
            transition-all
            duration-300
            hover:bg-[#F1F8F4]
            sm:flex
          "
        >
          View full assessment

          <Icon
            name="arrow"
            size={11}
            className="
              transition-transform
              duration-300
              group-hover:translate-x-1
            "
          />
        </button>

      </div>

      {/* ===================================================
          DESKTOP
          =================================================== */}

      <div
        className="
          hidden
          xl:grid
          xl:grid-cols-6
        "
      >

        {metrics.map(
          (item, index) => {
            const s =
              tone[item.tone];

            return (
              <div
                key={item.id}
                className={`
                  relative
                  min-w-0
                  px-5
                  py-6
                  transition-all
                  duration-300
                  hover:bg-[#FCFEFD]
                  ${
                    index !==
                    metrics.length - 1
                      ? 'border-r border-[#E7EEEA]'
                      : ''
                  }
                `}
              >

                {/* indicator */}
                <span
                  className={`
                    absolute
                    right-5
                    top-6
                    h-1.5
                    w-1.5
                    rounded-full
                    ${s.dot}
                  `}
                />

                <div
                  className="
                    flex
                    gap-3.5
                  "
                >

                  {/* icon */}

                  <div
                    className={`
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-[14px]
                      ${s.iconBg}
                      ${s.icon}
                      shadow-[0_5px_14px_rgba(24,84,53,.035)]
                      transition-all
                      duration-300
                      hover:scale-105
                    `}
                  >
                    <Icon
                      name={item.icon}
                      size={20}
                    />
                  </div>

                  {/* text */}

                  <div className="min-w-0">

                    <p
                      className="
                        text-[10px]
                        font-black
                        uppercase
                        tracking-[0.05em]
                        text-[#74827B]
                      "
                    >
                      {item.label}
                    </p>

                    <p
                      className={`
                        mt-1.5
                        text-[27px]
                        font-black
                        leading-none
                        tracking-[-0.045em]
                        ${s.value}
                      `}
                    >
                      {item.value}
                    </p>

                    <p
                      className="
                        mt-1.5
                        whitespace-nowrap
                        text-[10px]
                        text-[#78867F]
                      "
                    >
                      {item.subtitle}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        handleAction(
                          item.id
                        )
                      }
                      className={`
                        group
                        mt-3
                        inline-flex
                        items-center
                        gap-2
                        whitespace-nowrap
                        rounded-xl
                        border
                        px-3.5
                        py-2
                        text-[10px]
                        font-black
                        shadow-[0_4px_12px_rgba(25,79,51,.035)]
                        transition-all
                        duration-300
                        hover:-translate-y-0.5
                        hover:shadow-[0_8px_20px_rgba(25,79,51,.08)]
                        active:translate-y-0
                        ${s.button}
                      `}
                    >
                      {item.action}

                      <Icon
                        name="arrow"
                        size={10}
                        className="
                          transition-transform
                          duration-300
                          group-hover:translate-x-1
                        "
                      />
                    </button>

                  </div>

                </div>

              </div>
            );
          }
        )}

      </div>

      {/* ===================================================
          TABLET / MOBILE
          =================================================== */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:hidden
        "
      >

        {metrics.map(
          (item, index) => {
            const s =
              tone[item.tone];

            return (
              <div
                key={item.id}
                className={`
                  ${
                    index <
                    metrics.length - 2
                      ? 'border-b border-[#E8EFEB]'
                      : ''
                  }
                  ${
                    index % 2 === 0
                      ? 'sm:border-r sm:border-[#E8EFEB]'
                      : ''
                  }
                `}
              >

                <div
                  className="
                    relative
                    p-5
                  "
                >

                  <span
                    className={`
                      absolute
                      right-5
                      top-5
                      h-1.5
                      w-1.5
                      rounded-full
                      ${s.dot}
                    `}
                  />

                  <div className="flex gap-3.5">

                    <div
                      className={`
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-[14px]
                        ${s.iconBg}
                        ${s.icon}
                      `}
                    >
                      <Icon
                        name={item.icon}
                        size={20}
                      />
                    </div>

                    <div>

                      <p
                        className="
                          text-[10px]
                          font-black
                          uppercase
                          tracking-wide
                          text-[#74827B]
                        "
                      >
                        {item.label}
                      </p>

                      <p
                        className={`
                          mt-1
                          text-[26px]
                          font-black
                          leading-none
                          ${s.value}
                        `}
                      >
                        {item.value}
                      </p>

                      <p
                        className="
                          mt-1
                          text-[10px]
                          text-[#78867F]
                        "
                      >
                        {item.subtitle}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          handleAction(
                            item.id
                          )
                        }
                        className={`
                          mt-3
                          inline-flex
                          items-center
                          gap-2
                          rounded-xl
                          border
                          px-3
                          py-2
                          text-[9px]
                          font-black
                          ${s.button}
                        `}
                      >

                        {item.action}

                        <Icon
                          name="arrow"
                          size={10}
                        />

                      </button>

                    </div>
                  </div>
                </div>

              </div>
            );
          }
        )}

      </div>

      {/* mobile link */}

      <div
        className="
          border-t
          border-[#E9EFEC]
          px-5
          py-3
          sm:hidden
        "
      >

        <button
          type="button"
          onClick={() =>
            onNavigate?.('feasibility')
          }
          className="
            group
            flex
            items-center
            gap-2
            text-[9px]
            font-black
            text-[#087B4B]
          "
        >
          View full assessment

          <Icon
            name="arrow"
            size={10}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </button>

      </div>

    </section>
  );
}

/* =========================================================
   MAIN DASHBOARD PAGE
   ========================================================= */

export default function DashboardPage({
  currentProfile: propProfile,
  onNavigate,
  onOpenWhy,
}) {
  const {
    currentProfile: contextProfile,
    updateProfile,
  } = useWorkspace();

  const [
    isChangeBusinessOpen,
    setIsChangeBusinessOpen,
  ] = useState(false);

  /* =======================================================
     PROFILE
     ======================================================= */

  const profile = {
    ...(propProfile || contextProfile || {}),

    name:
      propProfile?.name ||
      contextProfile?.name ||
      'Apex Precision Engineering (Demo)',

    category:
      propProfile?.category ||
      contextProfile?.category ||
      'Manufacturing',

    location:
      propProfile?.location ||
      contextProfile?.location ||
      'Pune, Maharashtra',

    investmentRange:
      propProfile?.investmentRange ||
      contextProfile?.investmentRange ||
      '₹8L – ₹45L',

    assessmentDate:
      propProfile?.assessmentDate ||
      contextProfile?.assessmentDate ||
      '17 May 2025',

    image:
      propProfile?.image ||
      contextProfile?.image ||
      propProfile?.imageUrl ||
      contextProfile?.imageUrl ||
      null,
  };

  /* =======================================================
     FINANCIAL DATA
     ======================================================= */

  const financialOutlookData = {
    projectCost:
      '₹ 14.50 L',

    ownCapital:
      '₹ 2.20 L',

    ownCapitalPct:
      '(15%)',

    loanAmount:
      '₹ 12.30 L',

    outstandingLoan:
      '₹ 11.85 L',

    outstandingLoanPct:
      '(96% of loan)',

    emiMonthly:
      '₹ 24,500',

    interestRate:
      '9.25% p.a.',
  };

  const paymentTrackData = {
    moneyIn:
      '₹ 1,85,000',

    moneyOut:
      '₹ 1,22,750',

    upcomingDue:
      '₹ 48,750',
  };

  /* =======================================================
     NAVIGATION
     ======================================================= */

  const handleNavigate = (
    destination
  ) => {
    if (
      typeof onNavigate ===
      'function'
    ) {
      onNavigate(destination);
    }
  };

  /* =======================================================
     BUSINESS UPDATE
     ======================================================= */

  const handleSelectBusiness = (
    newProfile
  ) => {
    if (
      typeof updateProfile ===
      'function'
    ) {
      updateProfile(newProfile);
    }

    setIsChangeBusinessOpen(false);
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div
      className="
        w-full
        max-w-[1600px]
        mx-auto
        space-y-4
        sm:space-y-5
        pb-8
        animate-fadeIn
      "
    >

      {/* ===================================================
          PREMIUM BUSINESS HERO
          =================================================== */}

      <DashboardHero
        profile={profile}
        onOpenChangeBusiness={() =>
          setIsChangeBusinessOpen(true)
        }
        onNavigate={handleNavigate}
        onOpenWhy={onOpenWhy}
      />

      {/* ===================================================
          DECISION SNAPSHOT
          =================================================== */}

      <DecisionSnapshot
        onNavigate={handleNavigate}
        onOpenWhy={onOpenWhy}
      />

      {/* ===================================================
          PRIORITY CENTER
          =================================================== */}

      <section
        className="
          relative
          overflow-hidden
          rounded-[22px]
          border
          border-[#064C39]
          bg-gradient-to-r
          from-[#003D2D]
          via-[#04533D]
          to-[#073F32]
          px-5
          py-4
          shadow-[0_12px_30px_rgba(0,70,47,.18)]
        "
      >

        {/* decorative glow */}

        <div
          className="
            pointer-events-none
            absolute
            -right-8
            -top-16
            h-40
            w-40
            rounded-full
            border
            border-[#43D7A2]/20
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            right-[-35px]
            top-[-45px]
            h-32
            w-32
            rounded-full
            border
            border-[#43D7A2]/10
          "
        />

        <div
          className="
            relative
            grid
            grid-cols-1
            gap-4
            lg:grid-cols-[1.05fr_1fr_1fr_1fr]
            lg:items-center
          "
        >

          {/* title */}

          <div className="text-white">

            <div
              className="
                flex
                items-center
                gap-2
                text-[#51E4AE]
              "
            >
              <Icon
                name="spark"
                size={14}
              />

              <span
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.13em]
                "
              >
                Priority Center
              </span>
            </div>

            <p
              className="
                mt-1.5
                text-[12px]
                font-bold
              "
            >
              3 things need your attention
            </p>

          </div>

          {/* item 1 */}

          <button
            type="button"
            onClick={() =>
              handleNavigate('action-plan')
            }
            className="
              group
              flex
              items-center
              gap-3
              rounded-xl
              px-2
              py-2
              text-left
              transition-all
              duration-300
              hover:bg-white/[0.04]
            "
          >

            <span
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-[#35D099]/50
                bg-[#0C6B50]
                text-[16px]
                font-black
                text-white
                shadow-[0_0_18px_rgba(35,220,151,.08)]
              "
            >
              01
            </span>

            <span>

              <span
                className="
                  block
                  text-[10px]
                  font-black
                  text-white
                "
              >
                PMEGP Application
              </span>

              <span
                className="
                  mt-1
                  block
                  text-[9px]
                  text-[#B8D9CE]
                "
              >
                Due in 6 days ·
                <b className="ml-1 text-[#FDBA74]">
                  High priority
                </b>
              </span>

              <span
                className="
                  mt-1.5
                  inline-flex
                  items-center
                  gap-1
                  text-[8px]
                  font-black
                  text-[#8DEACB]
                "
              >
                Continue

                <Icon
                  name="arrow"
                  size={9}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </span>

            </span>

          </button>

          {/* item 2 */}

          <button
            type="button"
            onClick={() =>
              handleNavigate('financial')
            }
            className="
              group
              flex
              items-center
              gap-3
              rounded-xl
              px-2
              py-2
              text-left
              transition-all
              duration-300
              hover:bg-white/[0.04]
            "
          >

            <span
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-[#E9A340]/50
                bg-[#754719]
                text-[16px]
                font-black
                text-white
              "
            >
              02
            </span>

            <span>

              <span
                className="
                  block
                  text-[10px]
                  font-black
                  text-white
                "
              >
                Funding Gap
              </span>

              <span
                className="
                  mt-1
                  block
                  text-[9px]
                  text-[#B8D9CE]
                "
              >
                ₹6.50L additional
                funding required
              </span>

              <span
                className="
                  mt-1.5
                  inline-flex
                  items-center
                  gap-1
                  text-[8px]
                  font-black
                  text-[#DCEBDD]
                "
              >
                Explore options

                <Icon
                  name="arrow"
                  size={9}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </span>

            </span>

          </button>

          {/* item 3 */}

          <button
            type="button"
            onClick={() =>
              handleNavigate('market')
            }
            className="
              group
              flex
              items-center
              gap-3
              rounded-xl
              px-2
              py-2
              text-left
              transition-all
              duration-300
              hover:bg-white/[0.04]
            "
          >

            <span
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-[#3A82DB]/55
                bg-[#104777]
                text-[16px]
                font-black
                text-white
              "
            >
              03
            </span>

            <span>

              <span
                className="
                  block
                  text-[10px]
                  font-black
                  text-white
                "
              >
                Market Validation
              </span>

              <span
                className="
                  mt-1
                  block
                  text-[9px]
                  text-[#B8D9CE]
                "
              >
                Strong demand
                detected in your area
              </span>

              <span
                className="
                  mt-1.5
                  inline-flex
                  items-center
                  gap-1
                  text-[8px]
                  font-black
                  text-[#DCEBDD]
                "
              >
                View evidence

                <Icon
                  name="arrow"
                  size={9}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </span>

            </span>

          </button>

        </div>

      </section>

      {/* ===================================================
          MARKET + INSIGHTS
          =================================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-4
          sm:gap-5
          lg:grid-cols-12
          items-stretch
        "
      >

        {/* market */}

        <div
          className="
            lg:col-span-8
            flex
            flex-col
          "
        >

          <MarketInsightSection
            currentProfile={profile}
            onNavigate={handleNavigate}
            className="flex-1"
          />

        </div>

        {/* insights */}

        <div
          className="
            lg:col-span-4
            flex
            flex-col
          "
        >

          <VittanayaInsightsCard
            currentProfile={profile}
            onNavigate={handleNavigate}
            className="flex-1"
          />

        </div>

      </div>

      {/* ===================================================
          FINANCIAL COMMAND CENTER
          =================================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-4
          sm:gap-5
          lg:grid-cols-12
          items-stretch
        "
      >

        <div
          className="
            lg:col-span-6
            flex
            flex-col
          "
        >

          <FinancialOutlookCard
            financialData={
              financialOutlookData
            }
            onNavigate={handleNavigate}
            className="flex-1"
          />

        </div>

        <div
          className="
            lg:col-span-6
            flex
            flex-col
          "
        >

          <PaymentFinancialTrackCard
            paymentData={
              paymentTrackData
            }
            onNavigate={handleNavigate}
            className="flex-1"
          />

        </div>

      </div>

      {/* ===================================================
          FOOTER
          =================================================== */}

      <DashboardFooter
        lastUpdated="17 May 2025 10:30 AM"
      />

      {/* ===================================================
          BUSINESS CHANGE MODAL
          =================================================== */}

      <BusinessChangeModal
        isOpen={
          isChangeBusinessOpen
        }
        onClose={() =>
          setIsChangeBusinessOpen(false)
        }
        currentProfile={profile}
        onSelectBusiness={
          handleSelectBusiness
        }
      />

    </div>
  );
} 