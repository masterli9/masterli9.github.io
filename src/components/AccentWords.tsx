import { Fragment } from 'react'

export interface AccentWordPart {
  text: string
  color?: 'pink' | 'blue'
}

export function AccentWords({ parts }: { parts: ReadonlyArray<AccentWordPart> }) {
  return parts.map(({ text, color }, index) => (
    <Fragment key={`${text}-${index}`}>
      {index > 0 ? ' ' : null}
      <span className={color === 'pink' ? 'text-signal-pink' : color === 'blue' ? 'text-cobalt' : undefined}>{text}</span>
    </Fragment>
  ))
}
