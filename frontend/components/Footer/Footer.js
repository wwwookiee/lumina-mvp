import React from 'react'
import { Flex, Text } from '@chakra-ui/react'

const Footer = () => {
  return (
    <Flex
        justifyContent="center"
        alignItems="center"
        p="2rem"
    >
        <Text>All rights reserved &copy; Alyra {new Date().getFullYear()}</Text>
    </Flex>

  )
}

export default Footer