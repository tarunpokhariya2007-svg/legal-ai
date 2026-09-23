import * as React from "react"
import {
  motion,
  useInView,
  type HTMLMotionProps,
  type Variants,
} from "motion/react"

type InViewProps = HTMLMotionProps<"div"> & {
  variants?: Variants
  viewOptions?: Parameters<typeof useInView>[1]
}

const InView = React.forwardRef<HTMLDivElement, InViewProps>(
  (
    {
      children,
      variants,
      viewOptions = {
        once: true,
        margin: "0px 0px -100px 0px",
      },
      initial = "hidden",
      animate,
      ...props
    },
    ref
  ) => {
    const localRef = React.useRef<HTMLDivElement>(null)

    const isInView = useInView(localRef, {
      once: viewOptions.once ?? true,
      margin: viewOptions.margin,
      amount: viewOptions.amount,
    })

    React.useImperativeHandle(ref, () => localRef.current as HTMLDivElement)

    return (
      <motion.div
        ref={localRef}
        initial={initial}
        animate={animate ?? (isInView ? "visible" : "hidden")}
        variants={
          variants ?? {
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
          }
        }
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

InView.displayName = "InView"

export { InView }
