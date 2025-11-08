"use client"

import CreateOrderForm from "../CreateOrderForm"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Heading,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  useColorModeValue,
  Container,
  Button,
} from "@chakra-ui/react"

function CreateOrderPage() {
  const navigate = useNavigate()

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear(to-br, blue.50, purple.50, pink.50)",
    "linear(to-br, gray.900, purple.900, blue.900)",
  )
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.200")

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW="4xl" py={8}>
        {/* Header Section */}
        <Card mb={8} bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden">
          <Box h="4px" bgGradient="linear(to-r, blue.400, purple.400, pink.400)" />
          <CardBody p={8}>
            <VStack spacing={6}>
              <HStack>
                <Text fontSize="3xl">➕</Text>
                <Heading size="xl" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                  Create New Order
                </Heading>
              </HStack>
              <Button
                leftIcon={<Text fontSize="xl">←</Text>}
                onClick={() => navigate(-1)}
                colorScheme="blue"
                variant="ghost"
                size="lg"
                _hover={{ transform: "translateX(-4px)", transition: "all 0.2s" }}
                borderRadius="full"
                px={6}
              >
                Back
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Create Form */}
        <Card bg={cardBg} shadow="xl" borderRadius="2xl">
          <CardBody p={8}>
            <CreateOrderForm onOrderCreated={() => navigate("/")} />
          </CardBody>
        </Card>
      </Container>
    </Box>
  )
}

export default CreateOrderPage
