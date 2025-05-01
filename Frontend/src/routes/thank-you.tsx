import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/thank-you')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/thank-you"!</div>
}
