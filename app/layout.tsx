"use client"
import { FluentProvider, webLightTheme } from "@fluentui/react-components"
import "react-contexify/ReactContexify.css"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Mercury</title>
        {process.env.NODE_ENV === "development" && (
          <script
            src="https://unpkg.com/react-scan/dist/auto.global.js"
            async
          />
        )}
      </head>
      <body
        style={{
          margin: "0",
          height: "100vh",
          position: "relative",
        }}
      >
        <FluentProvider theme={webLightTheme}>
          <div style={{ width: "98%", padding: "1rem", margin: "0 auto" }}>{children}</div>
        </FluentProvider>
      </body>
    </html>
  )
}

// export default dynamic(() => Promise.resolve(RootLayout), {
//   ssr: false,
// })
