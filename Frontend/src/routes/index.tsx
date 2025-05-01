import { createFileRoute } from '@tanstack/react-router'
import Carousel from '../components/Carousel'
import Services from '../components/Services'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <Carousel />
      <Services /> 
    </>
  )
}
