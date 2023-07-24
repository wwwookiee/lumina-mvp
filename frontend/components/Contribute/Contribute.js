"use client"

//React
import { useState, useEffect } from 'react'

//Chakra UI
import {
  Heading, Flex, useToast, Input, Button, Text, Tag, TagLabel,  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure
} from '@chakra-ui/react'

// Ethers
import { ethers } from 'ethers'

//Unique id generator
import { v4 as uuidv4 } from 'uuid';

// WAGMI
import { readContract, prepareWriteContract, writeContract } from '@wagmi/core'
import { useAccount, useWaitForTransaction } from 'wagmi'

//components
import NotConnected from '@/components/NotConnected/NotConnected'

//contract
import Contract from '../../public//Lumina.json'

const Contribute = () => {

  // Contract Address
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_LUMINA

  // Wallet informations
  const { isConnected, address } = useAccount()

  // `toast` init
  const toast = useToast()

  // Chakra UI modal
  const { isOpen, onOpen, onClose } = useDisclosure()

  // UseStates
  const [domain, setDomain] = useState('')
  const [references, setReferences] = useState('')
  const [researches, setResearches] = useState([])
  const [title, setTitle] = useState('')
  const [researchDomain, setResearchDomain] = useState('')
  const [researchId, setResearchId] = useState(null)

  const contributorApplication = async() => {
    try {
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: 'contributorApplication',
        account: address,
        args : [domain, references]
      });
      await writeContract(request)
      toast({
        title: 'Application sent!',
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


  const validateResearch = async(_id) => {
    try {
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: 'validateResearch',
        account: address,
        args : [_id]
      });
      await writeContract(request)
      getResearches()
      toast({
        title: 'Success!',
        description: 'Research validated & published',
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

  const rejectResearch = async(_id) => {
    try {
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: 'rejectResearch',
        account: address,
        args : [_id]
      });
      await writeContract(request)
      getResearches()
      toast({
        title: 'Oh! ',
        description: 'Research rejected',
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

  const getResearches = async() => {
    try {
      const data = await readContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: 'getResearches',
        account: address
      });

      setResearches(data.map(
        event => ({
          id : event.id,
          title: event.title,
          domain: event.domain,
          budget: event.budget,
          contributor: event.contributor,
          isPublished: event.isPublished,
          isRejected: event.isRejected
        })
      ))
      console.log(researches)
    }
    catch(err) {
      console.log(err)
    }
  }

  const modalhandler = async (id) => {
    
    setResearchId(id)
    setResearchDomain(researches[id].domain)
    setTitle(researches[id].title)
    onOpen()

  }
  

  useEffect(() => {
    if(isConnected){
      getResearches()
    }
  }, [isConnected, address])

  return (
    <>
      { isConnected ? (
        <>
          <Flex direction="column" margin="0 auto" width="600px">
            <Heading as="h3" size="lg">Contributor application</Heading>
            <Text mt="1rem">You can contribute to the project by peer reviewing publications & get rewarded</Text>
            <Flex  direction="column" mt="1rem">
              <Text m="1rem 0">Domain of expertise</Text>
              <Input placeholder="ex: Biology" onChange={e => setDomain(e.target.value)}/>
              <Text m="1rem 0">Link to your references (CV, LinkedIn, etc.)</Text>
              <Input placeholder="ex: https://www.linkedin.com/in/jordandivita/" onChange={e => setReferences(e.target.value)}/>
            </Flex>
            <Flex  mt="1rem" justifyContent="flex-end">
              <Button mr="0.5rem" colorScheme='whatsapp' onClick={() => contributorApplication()}>Apply</Button>
            </Flex>
          </Flex>

          <Flex direction="column" margin="0 auto" width="600px">
            <Heading as="h3" size="lg">Reviewing</Heading>
            <Text mt="1rem">Peer review assigned to you</Text>
            { console.log(researches) }
            <Flex  mt="1rem" justifyContent="flex-center">
              {
                researches.map((item) => {
                  if(item.contributor == address.toString() && item.isPublished == false && item.isRejected == false){
                    return  <Flex key={uuidv4()}><Text>{item.title + " - " + item.domain }</Text>
                              <Button ml="0.5rem" size="xs" onClick={() => modalhandler(item.id)}>Read</Button>
                              <Button ml="0.5rem" size="xs" colorScheme='whatsapp' onClick={() => validateResearch(item.id)}>Validate</Button>
                              <Button ml="0.5rem" size="xs" colorScheme='red' onClick={() => rejectResearch(item.id)}>Reject</Button>
                            </Flex>
                  }
                })
              }
            </Flex>
          </Flex>
          <Modal onClose={onClose} size="full" isOpen={isOpen}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader p="5rem 5rem 2rem">{title}</ModalHeader>
              <ModalCloseButton />
              <ModalBody p="0 5rem">
                <Tag size="md"  variant='outline' colorScheme='blue'>
                  <TagLabel>{researchDomain}</TagLabel>
                </Tag>
                <Text mt="2rem">Le Lorem Ipsum est simplement du faux texte employé dans la composition et la mise en page avant impression. Le Lorem Ipsum est le faux texte standard de l'imprimerie depuis les années 1500, quand un imprimeur anonyme assembla ensemble des morceaux de texte pour réaliser un livre spécimen de polices de texte. Il n'a pas fait que survivre cinq siècles, mais s'est aussi adapté à la bureautique informatique, sans que son contenu n'en soit modifié. Il a été popularisé dans les années 1960 grâce à la vente de feuilles Letraset contenant des passages du Lorem Ipsum, et, plus récemment, par son inclusion dans des applications de mise en page de texte, comme Aldus PageMaker.</Text>
              </ModalBody>
              <ModalFooter>
                <Button onClick={onClose}>Close</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      ):(
        <NotConnected/>
      )}
    </>
  )
}

export default Contribute