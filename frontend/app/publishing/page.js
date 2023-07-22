"use client"
import Layout from '@/components/Layout/Layout'
import Publication from '@/components/Publication/Publication'
import { Flex } from '@chakra-ui/react'

export default function Publishing() {
  return (
    <Layout>
      <Flex direction="column" alignContent="center" width="50%" margin="0 auto">
        <Publication />
      </Flex>
    </Layout>
  )
}   