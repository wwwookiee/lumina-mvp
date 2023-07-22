"use client"
import Layout from '@/components/Layout/Layout'
import Read from '@/components/Read/Read'
import { Flex} from '@chakra-ui/react'


export default function Reading() {
  return (
    <Layout>
      <Flex direction="column" alignContent="center" width="80%" margin="0 auto">
        <Read />
      </Flex>
    </Layout>
  )
}
