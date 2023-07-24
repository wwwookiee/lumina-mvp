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
import Contract from '../../public/Lumina.json'
import Token from '../../public/LuminaToken.json'

const Stake = () => {

  // Contract Address
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_LUMINA
  const tokenAddress = process.env.NEXT_PUBLIC_CONTRACT_LUMITOKEN

  // Wallet informations
  const { isConnected, address } = useAccount()

  // `toast` init
  const toast = useToast()

  // UseStates
  const [amountEth, setAmountEth] = useState(0)
  const [amountLumi, setAmountLumi] = useState(0)
  const [balance, setBalance] = useState(0)
  const [stakedEth, setStakedEth] = useState(0)
  const [stakedLumi, setStakedLumi] = useState(0)
  const [isStaking, setIsStaking] = useState(false)
  const [rewards, setRewards] = useState(0)
  const [allowance, setAllowance] = useState(0)

  const getAllowance = async() => {
    try {
        const data = await readContract({
          address: tokenAddress,
          abi: Token.abi,
          functionName: 'allowance',
          account: address,
          args : [address, contractAddress]
        });
        setAllowance(ethers.formatEther(data).toString())
      }
      catch(err) {
        console.log(err)
      }
    }

  const approve = async() => {
    try {
      const { request } = await prepareWriteContract({
        address: tokenAddress,
        abi: Token.abi,
        functionName: 'approve',
        account: address,
        args : [contractAddress, ethers.parseEther(amountLumi)]
      });
      await writeContract(request)
      getAllowance()
    }
    catch(err) {
      console.log(err)
    }
  }

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

  const getStakingData = async() => {
    try {
      const data = await readContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: 'getStakingData',
        account: address,
        args : [address]
      });
      setStakedEth(ethers.formatEther(data.amountEth).toString())
      setStakedLumi(ethers.formatEther(data.amountLumi).toString())
      setIsStaking(data.isStaking)
      setRewards(ethers.formatEther(data.reward).toString())
    }
    catch(err) {
      console.log(err)
    }
  }

  const stake = async() => {
    await (ethers.parseEther(amountLumi) > ethers.parseEther(allowance) ? (approve()) : (null))
    try {
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: 'stake',
        account: address,
        value: ethers.parseEther(amountEth),
        args : [ethers.parseEther(amountLumi)]
      });
      await writeContract(request)
      getStakingData()
      getUserBalance()
      getAllowance()
      toast({
        title: 'Tokens staked!',
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

  const unstake = async() => {
    try {
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: 'unstake',
        account: address,
      });
      await writeContract(request)
      getStakingData()
      getUserBalance()
      getAllowance()
      toast({
        title: 'Tokens unstaked!',
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

  const claimRewards = async() => {
    try {
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: 'claimRewards',
        account: address,
      });
      await writeContract(request)
      getStakingData()
      getUserBalance()
      getAllowance()
      toast({
        title: 'Reward Tokens claimed!',
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
      getStakingData()
      getAllowance()
    }
  }, [isConnected, address])

  return (
    <>
      { isConnected ? (
        <>
          <LumiBalance balance={balance}/>
          <Flex direction="column" margin="0 auto" width="600px">
            <Heading as="h3" size="lg">Enter the amount of ethers <br/>and Lumina to stake</Heading>
            {!isStaking ? (
              <Flex  direction="column" mt="1rem">
                <Input placeholder="amount of Ethers" onChange={e => setAmountEth(e.target.value)}/>
                <Input mt="1rem" placeholder="amount of Lumina" onChange={e => setAmountLumi(e.target.value)}/>
              </Flex>
            ):(null)}
            <Flex  mt="1rem" justifyContent="flex-end">
              {!isStaking && <Button mr="0.5rem" colorScheme='whatsapp' onClick={() => stake()}>Stake</Button>}
            </Flex>

            <Card mt="2rem">

              <CardBody>
                <Stack divider={<StackDivider />} spacing='4'>
                  <Box>
                    <Heading size='xs'>
                     You are currently staking
                    </Heading>
                    <Flex  mt="1rem" justifyContent="space-between">
                      <Text pt='2' fontSize='sm'>
                        {stakedEth} ETH and {stakedLumi} Lumi
                      </Text>
                      {isStaking && <Button colorScheme='whatsapp' onClick={() => unstake()}>Unstake</Button>}
                    </Flex>
                  </Box>
                  <Box>
                    <Heading size='xs'>
                      Rewards {rewards}
                    </Heading>
                    <Flex  mt="1rem" justifyContent="space-between">
                      {rewards > 0 ? (
                        <Text pt='2' fontSize='sm'>
                          You can claim {rewards} LUMI
                        </Text>
                      ) : (
                        <Text pt='2' fontSize='sm'>
                          You don't have rewards to claim
                        </Text>
                      )}

                      {rewards > 0 && <Button colorScheme='whatsapp' onClick={() => claimRewards()}>Claim</Button>}
                    </Flex>
                  </Box>
                </Stack>
              </CardBody>
            </Card>

          </Flex>
        </>
      ):(
        <NotConnected/>
      )}
    </>
  )
}

export default Stake