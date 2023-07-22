"use client"
import Layout from '@/components/Layout/Layout'
import { Flex, Text, Heading } from '@chakra-ui/react'

export default function Home() {
  return (
    <Layout>
      <Flex direction="column" alignContent="center" width="50%" margin="0 auto">
        <Heading as="h1" size="xl" mb="1rem">Lumina</Heading>
        <Text>Lumina, an innovative initiative, has set forth commendable goals that aim to support scientists in their journey towards successful publication while also advocating for fair retribution for all contributors involved in the publication process. In the ever-evolving landscape of scientific research, Lumina stands as a guiding light, seeking to enhance the visibility and impact of scholarly work while ensuring fairness and transparency.</Text>
      </Flex>
    </Layout>
  )
}
