"use client"
import { Flex, Text } from '@chakra-ui/react'

const Footer = () => {
  return (
    <Flex
        justifyContent="center"
        alignItems="center"
        p="2rem"
        h="100vh"
    >
        <Text>All rights reserved &copy; Lumina {new Date().getFullYear()}</Text>
    </Flex>

  )
}

export default Footer