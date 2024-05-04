"use client"
import { FluentProvider, webLightTheme } from "@fluentui/react-components"
import dynamic from "next/dynamic"

function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Mercury</title>
      </head>
      <body
        style={{
          margin: "0",
          height: "100vh",
        }}
      >
        <FluentProvider theme={webLightTheme}>
          <div style={{ width: "98%", padding: "1rem", margin: "0 auto" }}>{children}</div>
        </FluentProvider>
      </body>
    </html>
  )
}

export default dynamic(() => Promise.resolve(RootLayout), {
  ssr: false,
})
