"use client"

//React
import { useState, useEffect } from 'react'

//Chakra UI
import {
  Heading,
  Flex,
  Text,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tag,
  TagLabel
} from '@chakra-ui/react'

// Ethers
import { ethers } from 'ethers'

// WAGMI
import { readContract, prepareWriteContract, writeContract } from '@wagmi/core'
import { useAccount, useWaitForTransaction } from 'wagmi'

//components
import NotConnected from '@/components/NotConnected/NotConnected'
import LumiBalance from '@/components/LumiBalance/LumiBalance'

//contract
import Contract from '../../public/Lumina.json'
import Token from '../../public/LuminaToken.json'

const Read = () => {

  // Contract Address
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_LUMINA
  const tokenAddress = process.env.NEXT_PUBLIC_CONTRACT_LUMITOKEN

  // Wallet informations
  const { isConnected, address } = useAccount()

  // `toast` init
  const toast = useToast()

  // Chakra UI modal
  const { isOpen, onOpen, onClose } = useDisclosure()

  // UseStates``
  const [balance, setBalance] = useState(0)
  const [title, setTitle] = useState('')
  const [domain, setDomain] = useState('')
  const [researches, setResearches] = useState([])
  const [allowance, setAllowance] = useState(0)
  const [readingPermissions, setReadingPermissions] = useState([])
  const [readingFees, setReadingFees] = useState("30")
  const [researchId, setResearchId] = useState(0)

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
        args : [contractAddress, ethers.parseEther(readingFees)]
      });
      await writeContract(request)
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

  const getPublishedResearches = async() => {
    try {
      const data = await readContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: 'getPublishedResearches',
        account: address
      });
      setResearches(data)
    }
    catch(err) {
      console.log(err)
    }
  }

  const getReadingPermissions = async() => {
    try {
      const data = await readContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: 'getReadingPermissions',
        account: address
      });
      setReadingPermissions(data)
    }
    catch(err) {
      console.log(err)
    }
  }

  const modalhandler = async (id) => {
    
    setResearchId(id)

    if(readingPermissions.includes(id)){
      setDomain(researches[id].domain)
      setTitle(researches[id].title)
      onOpen()
    }else{
      readingResearch()
    }
  }

  const readingResearch = async() => {
    await (ethers.parseEther(readingFees) > ethers.parseEther(allowance) ? (approve()) : (null))
    try {
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: 'readingResearch',
        account: address,
        args : [researchId]
      });
      await writeContract(request)
      getAllowance()
      getUserBalance()
      getReadingPermissions()
      toast({
        title: 'Success',
        description: 'Reding permission granted!',
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
        getPublishedResearches()
        getAllowance()
        getReadingPermissions()
      }
  }, [isConnected, address])

  return (
    <>
      { isConnected ? (
        <>
          <LumiBalance balance={balance}/>
          <Flex direction="column" margin="0 auto" width="80%">
            <Heading as="h3" size="lg">Read a research</Heading>

            <TableContainer mt="2rem">
              <Table variant='simple'>
                <TableCaption>Published researches</TableCaption>
                <Thead>
                  <Tr>
                    <Th>Domain</Th>
                    <Th>Title</Th>
                    <Th>Read cost ({readingFees} LUMI)</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {
                    researches.map((item) => (
                      <Tr key={item.id}>
                        <Td>{item.domain}</Td>
                        <Td>{item.title}</Td>
                        <Td align="right"><Button ml="0.5rem" size="xs" colorScheme='whatsapp' onClick={() => modalhandler(item.id)}>Read</Button></Td>
                      </Tr>
                    ))
                  }
                </Tbody>
              </Table>
            </TableContainer>
          </Flex>

        </>
      ):(
        <NotConnected/>
      )}
      <Modal onClose={onClose} size="full" isOpen={isOpen}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader p="5rem 5rem 2rem">{title}</ModalHeader>
              <ModalCloseButton />
              <ModalBody p="0 5rem">
                <Tag size="md"  variant='outline' colorScheme='blue'>
                  <TagLabel>{domain}</TagLabel>
                </Tag>
                <Text mt="2rem">Le Lorem Ipsum est simplement du faux texte employé dans la composition et la mise en page avant impression. Le Lorem Ipsum est le faux texte standard de l'imprimerie depuis les années 1500, quand un imprimeur anonyme assembla ensemble des morceaux de texte pour réaliser un livre spécimen de polices de texte. Il n'a pas fait que survivre cinq siècles, mais s'est aussi adapté à la bureautique informatique, sans que son contenu n'en soit modifié. Il a été popularisé dans les années 1960 grâce à la vente de feuilles Letraset contenant des passages du Lorem Ipsum, et, plus récemment, par son inclusion dans des applications de mise en page de texte, comme Aldus PageMaker.</Text>
              </ModalBody>
              <ModalFooter>
                <Button onClick={onClose}>Close</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
    </>
  )
}

export default Read