"use client"

//React
import { useState, useEffect } from 'react'

//Chakra UI
import {Flex, Text} from '@chakra-ui/react'

//Next
import Link from 'next/link'

// ethers
import { ethers } from 'ethers'

// WAGMI
import { readContract } from '@wagmi/core'
import { useAccount } from 'wagmi'

//contract
import Contract from '../../../backend/artifacts/contracts/Lumina.sol/Lumina.json'

const LumiBalance = ({balance}) => {

  return (
    <Flex p="2rem" margin="0 auto" width="100%" justifyContent="flex-end">
        <Flex mt="1rem">
        <Text><strong>Lumi : { Number(balance).toFixed(2) }</strong></Text>
        </Flex>
    </Flex>
  )
}

export default LumiBalance