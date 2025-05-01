import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/offers/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/offers/"!</div>
}
