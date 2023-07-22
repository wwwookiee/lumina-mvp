"use client"
import { Flex, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react'

const NotConnected = () => {
  return (
    <Flex width="50%" margin="0 auto">
      <Alert status='warning'>
        <AlertIcon />
        Please connect your Wallet.
      </Alert>
    </Flex>

  )
}

export default NotConnected