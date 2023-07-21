import { ConnectButton } from '@rainbow-me/rainbowkit'
import React from 'react'
import { Flex, Image, Box } from '@chakra-ui/react'

const Header = () => {
  return (
    <Flex
        justifyContent="space-between"
        alignItems="center"
        p="2rem"
        borderBottom="1px"
        borderColor='gray.200'
    >
      <Box w="200px" h="50%">
        <Image
          //boxSize="200px"
          objectFit="content"
          src="/logo.png"
          alt="logo"
        />
      </Box>
      
      <ConnectButton />
    </Flex>
  )
}

export default Header