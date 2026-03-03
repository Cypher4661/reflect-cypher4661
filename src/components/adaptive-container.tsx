import { useElementSize } from "../hooks/useElementSize";

export interface AdaptiveContainerProps extends Omit<React.ComponentProps<"div">, "children"> {
  children: ({ width, height }: { width: number; height: number }) => React.ReactNode;
}

/** Container that observes its own dimensions. */
export const AdaptiveContainer = ({ className, children, ...props }: AdaptiveContainerProps) => {
  const { ref, width, height } = useElementSize();
  return (
    <div
      ref={ref}
      className={className}
      {...props}>
      {children({ width: width ?? 0, height: height ?? 0 })}
    </div>
  );
};
