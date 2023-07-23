"use client"
import Layout from '@/components/Layout/Layout'
import Swap from '@/components/Swap/Swap'
import { Flex } from '@chakra-ui/react'

export default function Swapping() {
  return (
    <Layout>
      <Flex direction="column" alignContent="center" width="50%" margin="0 auto">
        <Swap />
      </Flex>
    </Layout>
  )
}