"use client"
import Layout from '@/components/Layout/Layout'
import Stake from '@/components/Stake/Stake'
import { Flex } from '@chakra-ui/react'

export default function Staking() {
  return (
    <Layout>
      <Flex direction="column" alignContent="center" width="50%" margin="0 auto">
        <Stake />
      </Flex>
    </Layout>
  )
}