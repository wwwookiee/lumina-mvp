"use client"
import Layout from '@/components/Layout/Layout'
import { Flex, Text, Heading } from '@chakra-ui/react'


export default function page() {
  return (
    <Layout>
      <Flex direction="column" alignContent="center" width="50%" margin="0 auto">
        <Heading as="h1" size="xl" mb="1rem">Admin</Heading>
      </Flex>
    </Layout>
  )
}
