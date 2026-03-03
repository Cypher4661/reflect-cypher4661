import { range } from "d3-array";
import { scaleLinear } from "d3-scale";
import { useMemo } from "react";

const radius = 100;
const shadow = 0.91;
const radians = (v: number) => (v * Math.PI) / 180;
const x = (v: number) => radius * Math.sin(radians(v - 180));
const y = (v: number) => -radius * Math.cos(radians(v - 180));

const formatDefault = (v: number) => v.toLocaleString();

export type GaugeRadialProps = {
  className?: string;
  /** Value */
  value: number;
  /** Minimum value corresponding to the start of the domain */
  min: number;
  /** Maximum value corresponding to the end of the domain */
  max: number;
  /** Start angle in degrees */
  start?: number;
  /** Stop angle in degrees */
  stop?: number;
  /** Minor step in degrees */
  minor?: number;
  /** Major step in degrees */
  major?: number;
  /** Formats numeric values */
  format?: (v: number) => string | undefined;
};

export const GaugeRadial = ({
  className,
  value,
  min,
  max,
  start = 45,
  stop = 315,
  minor = 1.5,
  major = 45,
  format = formatDefault,
}: GaugeRadialProps) => {
  const scale = useMemo(() => scaleLinear().range([start, stop]).domain([min, max]), [start, stop, min, max]);
  const ticks = useMemo(() => range(start, stop + minor, minor), [start, stop, minor]);
  const scaledValue = scale(Math.max(min, Math.min(value, max)));

  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
      <g transform={`translate(${radius}, ${radius})`}>
        <g
          className="fill-none"
          strokeLinecap="round">
          {ticks.map((v) => (
            <line
              key={`_${v}`}
              className={v <= scaledValue ? undefined : "stroke-slate-700"}
              x1={0}
              x2={0}
              y1={radius - 1}
              y2={radius - 7 - (v % major === 0 ? 4 : 0)}
              transform={`rotate(${v})`}
            />
          ))}
        </g>
        <g
          className="fill-foreground stroke-none font-mono"
          textAnchor="middle">
          {ticks
            .filter((v) => v % major === 0)
            .map((v) => (
              <text
                key={`_${v}`}
                x={0.8 * x(v)}
                y={0.8 * y(v) + 1.5}>
                {format(scale.invert(v))}
              </text>
            ))}
        </g>
        <path
          d={`M 0 0 L ${shadow * x(start)} ${shadow * y(start)} A ${shadow * radius} ${shadow * radius} 0 ${scaledValue - start < 180 ? 0 : 1} 1 ${shadow * x(scaledValue)} ${shadow * y(scaledValue)} Z`}
          className="opacity-10"
        />
      </g>
    </svg>
  );
};
