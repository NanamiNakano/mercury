"use client"

import { Button } from "@fluentui/react-components"

export function Loading() {
  return (
    <p>
      Loading...
    </p>
  )
}

interface hasErrorProps {
  onRetry?: Function
}

export function HasError({ onRetry = null }: hasErrorProps) {
  return (
    <div>
      <p>
        Error loading data.
      </p>
      {onRetry != null
      && (
        <Button onClick={async () => {
          await onRetry()
        }}
        >
          Retry
        </Button>
      )}
    </div>
  )
}
