import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { Responsive, useContainerWidth } from "react-grid-layout";

type GridTabContentProps = {
  layout: any;
  onLayoutChange: (layout: any, allLayouts: any) => void;
  children: ReactNode;
};

export const GridItemWrapper = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function GridItemWrapper(
  { children, ...props },
  ref,
) {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});

export function GridTabContent({ layout, onLayoutChange, children }: GridTabContentProps) {
  const { width, containerRef, mounted } = useContainerWidth();

  return (
    <div ref={containerRef} style={{ height: "100%", width: "100%", position: "relative" }}>
      {mounted && width > 0 && (
        <Responsive
          width={width}
          layouts={layout}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={30}
          containerPadding={[0, 8]}
          onLayoutChange={onLayoutChange}
          dragConfig={{ handle: ".ant-card-head, .hub-banner-drag" }}
        >
          {children}
        </Responsive>
      )}
    </div>
  );
}