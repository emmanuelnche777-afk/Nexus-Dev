import { Hexagon } from "lucide-react";

type EcoNode = {
  icon: React.ReactNode;
  name: string;
  flow: string;
};

type EcosystemDiagramProps = {
  hubLabel: string;
  nodes: EcoNode[];
};

const POSITIONS = [
  "left-1/2 top-0 -translate-x-1/2",
  "right-0 top-1/2 -translate-y-1/2",
  "left-1/2 bottom-0 -translate-x-1/2",
  "left-0 top-1/2 -translate-y-1/2",
];

const PATHS = [
  "M50,12 Q86,16 88,50",
  "M88,50 Q84,84 50,88",
  "M50,88 Q16,84 12,50",
  "M12,50 Q14,16 50,12",
];

export default function EcosystemDiagram({
  hubLabel,
  nodes,
}: EcosystemDiagramProps) {
  return (
    <>
      <div className="relative mx-auto hidden aspect-square w-full max-w-[38rem] md:block">
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          {PATHS.map((d) => (
            <path
              key={d}
              d={d}
              fill="none"
              stroke="rgba(69,175,225,0.35)"
              strokeWidth="0.45"
              strokeLinecap="round"
              className="eco-path"
            />
          ))}
          {PATHS.map((d, i) => (
            <circle key={`dot-${i}`} r="1.4" fill="#5cdefe">
              <animateMotion
                dur="5s"
                begin={`${i * 1.25}s`}
                repeatCount="indefinite"
                path={d}
              />
            </circle>
          ))}
        </svg>

        {nodes.map((node, i) => (
          <div
            key={node.name}
            className={`absolute ${POSITIONS[i]} z-10 w-40 rounded-xl border border-nexus-cyan/25 bg-nexus-navy-deep/90 p-3 text-center shadow-lg shadow-black/20 backdrop-blur`}
          >
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-nexus-navy to-nexus-cyan/60 text-nexus-cyan-bright">
              {node.icon}
            </div>
            <p className="text-xs font-bold leading-tight text-nexus-white">
              {node.name}
            </p>
            <p className="mt-1 text-[11px] font-medium text-nexus-cyan-bright/90">
              {node.flow}
            </p>
          </div>
        ))}

        <div className="absolute left-1/2 top-1/2 z-10 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <span className="hub-ring" />
          <span className="hub-ring hub-ring-delay" />
          <div className="flex h-full w-full flex-col items-center justify-center rounded-full border border-nexus-cyan/50 bg-gradient-to-br from-nexus-navy-deep to-nexus-dark shadow-[0_0_45px_rgba(69,175,225,0.35)]">
            <Hexagon className="h-6 w-6 text-nexus-cyan-bright" />
            <p className="mt-1 px-2 text-center text-[11px] font-bold uppercase tracking-wider text-nexus-white">
              {hubLabel}
            </p>
          </div>
        </div>
      </div>

      <ol className="relative mx-auto flex max-w-md flex-col gap-5 md:hidden">
        <span className="absolute bottom-4 left-[21px] top-4 w-px bg-gradient-to-b from-nexus-cyan/60 via-nexus-cyan/25 to-nexus-cyan/60" />
        {nodes.map((node) => (
          <li key={node.name} className="relative flex items-start gap-4 pl-1">
            <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-nexus-cyan/40 bg-nexus-navy-deep text-nexus-cyan-bright">
              {node.icon}
            </div>
            <div className="rounded-xl border border-nexus-cyan/20 bg-nexus-navy-deep/70 p-3">
              <p className="text-sm font-bold text-nexus-white">{node.name}</p>
              <p className="mt-0.5 text-xs font-medium text-nexus-cyan-bright/90">
                {node.flow}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
