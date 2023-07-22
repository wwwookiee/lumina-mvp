"use client"

//React
import { useState, useEffect } from 'react'

//Chakra UI
import {Heading, Flex, useToast, Input, Button, Card, CardHeader, CardBody, Stack, StackDivider, Box, Text} from '@chakra-ui/react'

//Next
import Link from 'next/link'

// Ethers
import { ethers } from 'ethers'

// WAGMI
import { readContract, prepareWriteContract, writeContract } from '@wagmi/core'
import { useAccount, useWaitForTransaction } from 'wagmi'

//components
import Layout from '@/components/Layout/Layout'
import NotConnected from '@/components/NotConnected/NotConnected'
import LumiBalance from '@/components/LumiBalance/LumiBalance'

//contract
import Contract from '../../../backend/artifacts/contracts/Lumina.sol/Lumina.json'

const Swap = () => {

  // Contract Address
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_LUMINA

  // Wallet informations
  const { isConnected, address } = useAccount()

  // `toast` init
  const toast = useToast()

  // UseStates
  const [amountEth, setAmountEth] = useState(0)
  const [balance, setBalance] = useState(0)
  const [priceEth, setPriceEth] = useState(0)

  const getUserBalance = async() => {
    try {
      const data = await readContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: 'getUserBalance',
        account: address,
        args : [address]
      });
      setBalance(ethers.formatEther(data).toString())
    }
    catch(err) {
      console.log(err)
    }
  }

  const getLatestPrice = async() => {
    try {
      const data = await readContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: 'getLatestPrice',
        account: address
      });

      setPriceEth((data).toString())
      }
    catch(err) {
      console.log(err)
    }
  }

  const swap = async() => {
    try {
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: 'swap',
        account: address,
        value: ethers.parseEther(amountEth)
      });
      await writeContract(request)
      getUserBalance()
      toast({
        title: 'Ethers swapped!',
        //description: 'You swapped ' + voterAddress,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
    }
    catch(err) {
      console.log(err)
      toast({
        title: 'Error!',
        description: err.details || 'An error occured.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  useEffect(() => {
    if(isConnected){
        getUserBalance()
        getLatestPrice()
    }
  }, [isConnected])

  return (
    <Layout>
      { isConnected ? (
        <>
          <LumiBalance balance={balance}/>
          <Flex direction="column" margin="0 auto" width="600px">
            <Heading as="h3" size="lg">Enter the amount of ethers to swapp</Heading>
            <Flex  mt="1rem">
              <Input mr="0.5rem" placeholder="amount of ethers" onChange={e => setAmountEth(e.target.value)}/>
              <Button mr="0.5rem" colorScheme='whatsapp' onClick={() => swap()}>Swap</Button>
            </Flex>

            <Card mt="2rem">

              <CardBody>
                <Stack divider={<StackDivider />} spacing='4'>
                  <Box>
                    <Heading size='xs'>
                      Lumi to USD exchange rate
                    </Heading>
                    <Text pt='2' fontSize='sm'>
                      1 LUMI = 1 USD (fixed rate)
                    </Text>
                  </Box>
                  <Box>
                    <Heading size='xs'>
                      Lumi to ETH exchange rate
                    </Heading>
                    <Text pt='2' fontSize='sm'>
                    You will receive {amountEth * priceEth} Lumi
                    </Text>
                  </Box>
                </Stack>
              </CardBody>
            </Card>

          </Flex>
        </>
      ):(
        <NotConnected/>
      )}
    </Layout>
  )
}

export default Swap