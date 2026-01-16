import React from "react"

import { cn } from "@/lib/utils"

type Props = React.SVGProps<SVGSVGElement>

const User = ({ className, ...props }: Props) => {
  const headClasses =
    "transition-transform duration-300 ease-out [transform-box:fill-box] [transform-origin:center] group-hover/menu-item:-translate-y-0.5 group-hover/menu-item:scale-105"
  const bodyClasses =
    "transition-transform duration-300 ease-out [transform-box:fill-box] [transform-origin:center] group-hover/menu-item:translate-y-0.5"

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
        className={headClasses}
        d="M17 8.5C17 5.73858 14.7614 3.5 12 3.5C9.23858 3.5 7 5.73858 7 8.5C7 11.2614 9.23858 13.5 12 13.5C14.7614 13.5 17 11.2614 17 8.5Z"
      />
      <path
        className={bodyClasses}
        d="M19 20.5C19 16.634 15.866 13.5 12 13.5C8.13401 13.5 5 16.634 5 20.5"
      />
    </svg>
  )
}

export default User
