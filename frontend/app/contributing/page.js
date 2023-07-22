"use client"
import Layout from '@/components/Layout/Layout'
import Contribute from '@/components/Contribute/Contribute'
import { Flex } from '@chakra-ui/react'

export default function Contributing() {
  return (
    <Layout>
      <Flex direction="column" alignContent="center" width="50%" margin="0 auto">
        <Contribute />
      </Flex>
    </Layout>
  )
}