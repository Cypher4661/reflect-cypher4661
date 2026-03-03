import { range } from "d3-array";
import { scaleLinear } from "d3-scale";
import { useMemo } from "react";

const padding = 2;
const stroke = 3;
const minor = stroke * 2;
const formatDefault = (v: number) => v.toLocaleString();

function createMajorTicks(count: number) {
  const gaps = count - 1;

  if (count > 80 && gaps % 10 === 0) {
    return range(0, count, 10);
  }

  if (count > 40 && gaps % 5 === 0) {
    return range(0, count, gaps / 5);
  }

  if (count > 20 && gaps % 4 === 0) {
    return range(0, count, gaps / 4);
  }

  if (gaps % 3 === 0) {
    return range(0, count, gaps / 3);
  }

  if (gaps % 2 === 0) {
    return range(0, count, gaps / 2);
  }

  return [0, count - 1];
}

export type GaugeLinearProps = {
  className?: string;
  /** Component width in pixels */
  width: number;
  /** Component height in pixels */
  height: number;
  /** Value */
  value: number | undefined;
  /** Minimum value corresponding to the start of the domain */
  min: number;
  /** Maximum value corresponding to the end of the domain */
  max: number;
  /** Major ticks visibility */
  majorTicksVisible?: boolean;
  /** Major ticks label visibility */
  majorLabelsVisible?: boolean;
  /** Label size */
  labelSize?: number;
  /** Formats numeric values */
  format?: (v: number) => string | undefined;
  /** Orientation */
  orientation?: "horizontal" | "vertical";
};

export const GaugeLinear = ({
  className,
  width,
  height,
  value,
  min,
  max,
  majorTicksVisible = false,
  majorLabelsVisible = false,
  labelSize = 14,
  format = formatDefault,
  orientation = "horizontal",
}: GaugeLinearProps) => {
  const horizontal = orientation === "horizontal";

  // determine number of minor ticks
  const count = Math.floor(((horizontal ? width : height) - 2 * padding + stroke) / minor);
  const scale = useMemo(
    () =>
      scaleLinear()
        .range([min, max])
        .domain([0, count - 1]),
    [count, min, max]
  );

  const tickAtValue = value != null ? scale.invert(value) : undefined;
  const ticks = useMemo(() => range(0, count), [count]);
  const major = useMemo(() => createMajorTicks(count), [count]);

  const size = (horizontal ? height : width) - 2 * padding;
  const majorTicksSize = size - (majorLabelsVisible ? labelSize + (horizontal ? padding : 2 * padding) : 0);
  const minorTicksSize = majorTicksSize - (majorTicksVisible ? 6 : 0);

  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      width={`${width}px`}
      height={`${height}px`}>
      <g
        className="fill-none"
        strokeLinecap="round"
        transform={`translate(${padding}, ${padding})`}>
        {ticks.map((t) => {
          const offset = (horizontal ? t : count - 1 - t) * minor;
          const tickSize = majorTicksVisible && major.includes(t) ? majorTicksSize : minorTicksSize;

          return (
            <line
              key={`_${t}`}
              className={tickAtValue != null && t <= tickAtValue ? undefined : "stroke-slate-700"}
              x1={horizontal ? offset : 0}
              x2={horizontal ? offset : tickSize}
              y1={horizontal ? 0 : offset}
              y2={horizontal ? tickSize : offset}
              strokeWidth={stroke}
            />
          );
        })}
      </g>
      {majorTicksVisible && majorLabelsVisible && (
        <g
          className="fill-foreground stroke-none font-mono"
          textAnchor={horizontal ? "middle" : "start"}
          dominantBaseline={horizontal ? "text-before-edge" : "middle"}
          transform={`translate(${padding}, ${padding})`}>
          {major.map((t) => {
            const offset = (horizontal ? t : count - 1 - t) * minor;
            const shift = majorTicksSize + (horizontal ? padding : 2 * padding);

            return (
              <text
                textAnchor={horizontal ? (t === 0 ? "start" : t === count - 1 ? "end" : undefined) : undefined}
                dx={horizontal ? (t === 0 ? -2 : t === count - 1 ? 2 : undefined) : undefined}
                dy={horizontal ? undefined : t === 0 ? 2 : t === count - 1 ? -2 : undefined}
                dominantBaseline={
                  horizontal
                    ? undefined
                    : t === 0
                      ? "text-after-edge"
                      : t === count - 1
                        ? "text-before-edge"
                        : undefined
                }
                key={`_${t}`}
                x={horizontal ? offset : shift}
                y={horizontal ? shift : offset}>
                {format(scale(t))}
              </text>
            );
          })}
        </g>
      )}
    </svg>
  );
};
