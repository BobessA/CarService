import { createFileRoute } from '@tanstack/react-router'
import Carousel from '../components/Carousel'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Carousel />
}
