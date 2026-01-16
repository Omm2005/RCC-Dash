import React from "react"

import { cn } from "@/lib/utils"

type Props = React.SVGProps<SVGSVGElement>

const Users = ({ className, ...props }: Props) => {
  const frontHeadClasses =
    "transition-transform duration-300 ease-out [transform-box:fill-box] [transform-origin:center] will-change-transform scale-[1.04] group-hover/menu-item:scale-[0.96] group-hover/menu-item:-translate-y-0.5"
  const backHeadClasses =
    "transition-transform duration-300 ease-out delay-75 [transform-box:fill-box] [transform-origin:center] will-change-transform scale-[0.96] group-hover/menu-item:scale-[1.04] group-hover/menu-item:-translate-y-0.25"
  const frontBodyClasses =
    "transition-transform duration-300 ease-out delay-100 [transform-box:fill-box] [transform-origin:center] will-change-transform scale-[1.03] group-hover/menu-item:scale-[0.97] group-hover/menu-item:translate-y-0.5"
  const backBodyClasses =
    "transition-transform duration-300 ease-out delay-150 [transform-box:fill-box] [transform-origin:center] will-change-transform scale-[0.97] group-hover/menu-item:scale-[1.03] group-hover/menu-item:translate-y-0.25"

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        className={frontHeadClasses}
        d="M13 11C13 8.79086 11.2091 7 9 7C6.79086 7 5 8.79086 5 11C5 13.2091 6.79086 15 9 15C11.2091 15 13 13.2091 13 11Z"
      />
      <path
        className={backHeadClasses}
        d="M11.0386 7.55773C11.0131 7.37547 11 7.18927 11 7C11 4.79086 12.7909 3 15 3C17.2091 3 19 4.79086 19 7C19 9.20914 17.2091 11 15 11C14.2554 11 13.5584 10.7966 12.9614 10.4423"
      />
      <path
        className={frontBodyClasses}
        d="M15 21C15 17.6863 12.3137 15 9 15C5.68629 15 3 17.6863 3 21"
      />
      <path
        className={backBodyClasses}
        d="M21 17C21 13.6863 18.3137 11 15 11"
      />
    </svg>
  )
}

export default Users
