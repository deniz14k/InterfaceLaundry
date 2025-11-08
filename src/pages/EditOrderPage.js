"use client"

import { useEffect, useState } from "react"
import { getOrderById } from "../services/ordersService"
import EditOrderForm from "../EditOrderForm"
import { useParams, useNavigate } from "react-router-dom"
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
  Spinner,
  Button,
  Badge,
  useToast,
} from "@chakra-ui/react"

function EditOrderPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear(to-br, blue.50, purple.50, pink.50)",
    "linear(to-br, gray.900, purple.900, blue.900)",
  )
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.200")

  useEffect(() => {
    getOrderById(id)
      .then((orderData) => {
        setOrder(orderData)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Failed to load order:", error)
        toast({
          status: "error",
          title: "Failed to load order",
          description: "The order could not be found or loaded",
        })
        navigate("/")
      })
  }, [id, navigate, toast])

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "yellow"
      case "ready":
        return "blue"
      case "completed":
        return "green"
      case "cancelled":
        return "red"
      default:
        return "gray"
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "⏳"
      case "ready":
        return "📦"
      case "completed":
        return "✅"
      case "cancelled":
        return "❌"
      default:
        return "📋"
    }
  }

  if (loading) {
    return (
      <Box minH="100vh" bgGradient={bgGradient} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6}>
          <Box
            bg="white"
            p={8}
            borderRadius="2xl"
            shadow="2xl"
            bgGradient="linear(to-r, blue.400, purple.500)"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="4xl" color="white">
              ✏️
            </Text>
          </Box>
          <VStack spacing={3}>
            <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" />
            <Text fontSize="xl" fontWeight="bold" color={textColor}>
              Loading Order Details
            </Text>
            <Text color="gray.500" textAlign="center">
              Preparing the edit interface for Order #{id}
            </Text>
          </VStack>
        </VStack>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW="6xl" py={8}>
        {/* Header Section */}
        <Card mb={8} bg={cardBg} shadow="2xl" borderRadius="2xl" overflow="hidden">
          <Box h="6px" bgGradient="linear(to-r, blue.400, purple.400, pink.400)" />
          <CardBody p={10}>
            <VStack spacing={8}>
              {/* Title Section */}
              <VStack spacing={4} textAlign="center">
                <Box
                  bg="orange.500"
                  p={4}
                  borderRadius="2xl"
                  bgGradient="linear(to-r, orange.400, red.500)"
                  shadow="xl"
                  _hover={{
                    transform: "scale(1.05)",
                    transition: "all 0.2s",
                  }}
                  transition="all 0.2s"
                >
                  <Text fontSize="4xl" color="white">
                    ✏️
                  </Text>
                </Box>
                <VStack spacing={2}>
                  <Heading
                    size="2xl"
                    bgGradient="linear(to-r, orange.400, red.500)"
                    bgClip="text"
                    fontWeight="extrabold"
                  >
                    Edit Order #{id}
                  </Heading>
                  <Text color={textColor} fontSize="xl" fontWeight="medium">
                    Modify order details, update items, and manage status
                  </Text>
                </VStack>
              </VStack>

              {/* Order Status Badge */}
              {order && (
                <HStack spacing={4}>
                  <Badge
                    colorScheme={getStatusColor(order.status)}
                    px={4}
                    py={2}
                    borderRadius="full"
                    fontSize="lg"
                    fontWeight="bold"
                  >
                    {getStatusIcon(order.status)} {order.status}
                  </Badge>
                  <Text color={textColor} fontSize="lg">
                    Customer:{" "}
                    <Text as="span" fontWeight="bold" color="blue.500">
                      #{order.customerId}
                    </Text>
                  </Text>
                </HStack>
              )}

              {/* Navigation */}
              <HStack spacing={4}>
                <Button
                  leftIcon={<Text fontSize="xl">←</Text>}
                  onClick={() => navigate("/")}
                  colorScheme="blue"
                  variant="ghost"
                  size="lg"
                  _hover={{
                    transform: "translateX(-4px)",
                    bg: "blue.50",
                    transition: "all 0.2s",
                  }}
                  transition="all 0.2s"
                  borderRadius="full"
                  px={8}
                  py={6}
                  fontSize="lg"
                  fontWeight="bold"
                >
                  Back to Orders
                </Button>

                {order && (
                  <Button
                    leftIcon={<Text fontSize="xl">👁️</Text>}
                    onClick={() => navigate(`/order/${id}`)}
                    colorScheme="purple"
                    variant="outline"
                    size="lg"
                    _hover={{
                      bg: "purple.50",
                      borderColor: "purple.400",
                      transform: "translateY(-2px)",
                      shadow: "lg",
                    }}
                    transition="all 0.2s"
                    borderRadius="full"
                    px={8}
                    py={6}
                    fontSize="lg"
                    fontWeight="bold"
                  >
                    View Details
                  </Button>
                )}
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Edit Form Section */}
        {order ? (
          <Card bg={cardBg} shadow="2xl" borderRadius="2xl" overflow="hidden">
            <Box h="4px" bgGradient="linear(to-r, orange.400, red.400, pink.400)" />
            <CardBody p={8}>
              <VStack spacing={8}>
                <HStack w="full" justify="center">
                  <VStack spacing={2}>
                    <HStack>
                      <Text fontSize="2xl">📝</Text>
                      <Heading size="lg" color={textColor}>
                        Order Editor
                      </Heading>
                    </HStack>
                
                  </VStack>
                </HStack>

                <EditOrderForm
                  order={order}
                  onUpdated={() => {
                    toast({
                      status: "success",
                      title: "🎉 Order updated successfully!",
                      description: "All changes have been saved",
                    })
                    navigate("/")
                  }}
                  onCancel={() => {
                    toast({
                      //status: "info",
                     // title: "Edit cancelled",
                     // description: "No changes were made to the order",
                    })
                    navigate("/")
                  }}
                />
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <Card bg={cardBg} shadow="2xl" borderRadius="2xl" overflow="hidden">
            <CardBody p={12}>
              <VStack spacing={8}>
                <Box bg="red.500" p={6} borderRadius="2xl" bgGradient="linear(to-r, red.400, pink.500)" shadow="xl">
                  <Text fontSize="5xl" color="white">
                    ❌
                  </Text>
                </Box>
                <VStack spacing={4}>
                  <Heading size="xl" color="red.500" fontWeight="bold">
                    Order Not Found
                  </Heading>
                  <Text color={textColor} fontSize="lg" textAlign="center" maxW="md">
                    The order you're trying to edit could not be found. It may have been deleted or the ID is incorrect.
                  </Text>
                </VStack>
                <HStack spacing={4}>
                  <Button
                    leftIcon={<Text fontSize="lg">🏠</Text>}
                    colorScheme="blue"
                    size="lg"
                    onClick={() => navigate("/")}
                    borderRadius="full"
                    px={8}
                    py={6}
                    fontSize="lg"
                    fontWeight="bold"
                    _hover={{
                      transform: "translateY(-2px)",
                      shadow: "lg",
                    }}
                    transition="all 0.2s"
                  >
                    Return to Orders
                  </Button>
                  <Button
                    leftIcon={<Text fontSize="lg">🔍</Text>}
                    colorScheme="purple"
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/create")}
                    borderRadius="full"
                    px={8}
                    py={6}
                    fontSize="lg"
                    fontWeight="bold"
                    _hover={{
                      bg: "purple.50",
                      transform: "translateY(-2px)",
                      shadow: "lg",
                    }}
                    transition="all 0.2s"
                  >
                    Create New Order
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        )}
      </Container>
    </Box>
  )
}

export default EditOrderPage
