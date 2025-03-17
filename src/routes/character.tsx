import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/character')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/character"!</div>
}
