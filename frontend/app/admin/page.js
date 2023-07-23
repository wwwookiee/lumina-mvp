"use client"

//components
import AdminPanel from '@/components/AdminPanel/AdminPanel'
import Layout from '@/components/Layout/Layout'

import { Flex, Text, Heading } from '@chakra-ui/react'


export default function Admin() {
  return (
    <Layout>
      <Flex direction="column" alignContent="center" width="80%" margin="0 auto">
        <Heading as="h1" size="xl" mb="1rem">AdminPanel</Heading>
        <AdminPanel />
      </Flex>
    </Layout>
  )
}
