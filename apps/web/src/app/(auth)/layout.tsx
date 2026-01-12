import React from 'react'

type Props = {
    children: React.ReactNode;
}

const layout = ({children}: Props) => {
  return (
    <main className="h-screen w-screen flex justify-center items-center">
            {children}
    </main>
  )
}

export default layout