"use client"

import { useEffect, useState } from "react"
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Box,
  Card,
  CardBody,
  Badge,
  VStack,
  HStack,
  Text,
  useColorModeValue,
  Container,
  Spinner,
  Button,
  Stat,
  StatLabel,
  StatNumber,
  Flex,
} from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear(to-br, blue.50, purple.50, pink.50)",
    "linear(to-br, gray.900, purple.900, blue.900)",
  )
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.200")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  useEffect(() => {
    fetch("https://localhost:7223/api/orders/my", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((r) => r.json())
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

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

  const totalSpent = orders.reduce((sum, order) => {
    return sum + (order.items?.reduce((itemSum, item) => itemSum + item.price, 0) || 0)
  }, 0)

  const completedOrders = orders.filter((o) => o.status?.toLowerCase() === "completed").length

  if (loading) {
    return (
      <Box minH="100vh" bgGradient={bgGradient} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" />
          <Text fontSize="lg" fontWeight="medium" color={textColor}>
            Loading your orders...
          </Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW="7xl" py={8}>
        {/* Header Section */}
        <Card mb={8} bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden">
          <Box h="4px" bgGradient="linear(to-r, blue.400, purple.400, pink.400)" />
          <CardBody p={8}>
            <Flex justify="space-between" align="center" mb={6}>
              <VStack align="start" spacing={2}>
                <HStack>
                  <Text fontSize="4xl">🛍️</Text>
                  <Heading size="2xl" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                    My Orders
                  </Heading>
                </HStack>
                <Text color={textColor} fontSize="lg">
                  Track and manage all your laundry orders
                </Text>
              </VStack>

              <HStack spacing={8}>
                <Stat textAlign="center">
                  <StatLabel color={textColor}>Total Orders</StatLabel>
                  <StatNumber fontSize="2xl" color="blue.500">
                    {orders.length}
                  </StatNumber>
                </Stat>
                <Stat textAlign="center">
                  <StatLabel color={textColor}>Completed</StatLabel>
                  <StatNumber fontSize="2xl" color="green.500">
                    {completedOrders}
                  </StatNumber>
                </Stat>
                <Stat textAlign="center">
                  <StatLabel color={textColor}>Total Spent</StatLabel>
                  <StatNumber fontSize="2xl" color="purple.500">
                    {totalSpent.toFixed(2)} RON
                  </StatNumber>
                </Stat>
              </HStack>
            </Flex>

            <HStack spacing={4} justify="center">
              <Button
                leftIcon={<Text fontSize="xl">➕</Text>}
                colorScheme="teal"
                size="lg"
                onClick={() => navigate("/create-order")}
                bgGradient="linear(to-r, teal.400, teal.600)"
                _hover={{
                  bgGradient: "linear(to-r, teal.500, teal.700)",
                  transform: "translateY(-2px)",
                  shadow: "xl",
                }}
                transition="all 0.2s"
                borderRadius="full"
                px={8}
                py={6}
                fontSize="lg"
                fontWeight="bold"
              >
                Create New Order
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Orders Table */}
        <Card bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden">
          <CardBody p={0}>
            {orders.length === 0 ? (
              <Box p={12} textAlign="center">
                <VStack spacing={6}>
                  <Text fontSize="8xl">📦</Text>
                  <Heading size="lg" color={textColor}>
                    No orders yet
                  </Heading>
                  <Text color="gray.500" fontSize="lg">
                    Create your first laundry order to get started!
                  </Text>
                  <Button
                    leftIcon={<Text fontSize="xl">🚀</Text>}
                    colorScheme="teal"
                    size="lg"
                    onClick={() => navigate("/create-order")}
                    borderRadius="full"
                    px={8}
                    py={4}
                    fontSize="lg"
                    fontWeight="bold"
                  >
                    Create First Order
                  </Button>
                </VStack>
              </Box>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size="lg">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th borderColor={borderColor} color="blue.500" fontSize="md" fontWeight="bold">
                        Order Details
                      </Th>
                      <Th borderColor={borderColor} color="blue.500" fontSize="md" fontWeight="bold">
                        Status
                      </Th>
                      <Th borderColor={borderColor} color="blue.500" fontSize="md" fontWeight="bold" isNumeric>
                        Total Amount
                      </Th>
                      <Th borderColor={borderColor} color="blue.500" fontSize="md" fontWeight="bold">
                        Date
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {orders.map((order) => {
                      const orderTotal = order.items?.reduce((sum, item) => sum + item.price, 0) || 0
                      return (
                        <Tr
                          key={order.id}
                          onClick={() => navigate(`/my-orders/${order.id}`)}
                          cursor="pointer"
                          _hover={{
                            bg: "blue.50",
                            transform: "scale(1.01)",
                            transition: "all 0.2s",
                          }}
                          transition="all 0.2s"
                        >
                          <Td borderColor={borderColor} py={4}>
                            <HStack spacing={3}>
                              <Text fontSize="xl">📋</Text>
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold" color="blue.500" fontSize="lg">
                                  Order #{order.id}
                                </Text>
                                <Text color="gray.500" fontSize="sm">
                                  {order.items?.length || 0} items
                                </Text>
                              </VStack>
                            </HStack>
                          </Td>
                          <Td borderColor={borderColor}>
                            <Badge
                              colorScheme={getStatusColor(order.status)}
                              px={3}
                              py={1}
                              borderRadius="full"
                              fontSize="sm"
                              fontWeight="bold"
                            >
                              {getStatusIcon(order.status)} {order.status}
                            </Badge>
                          </Td>
                          <Td borderColor={borderColor} isNumeric>
                            <Text fontWeight="bold" color="green.500" fontSize="lg">
                              {orderTotal.toFixed(2)} RON
                            </Text>
                          </Td>
                          <Td borderColor={borderColor}>
                            <Text color={textColor}>{new Date(order.receivedDate).toLocaleDateString()}</Text>
                          </Td>
                        </Tr>
                      )
                    })}
                  </Tbody>
                </Table>
              </Box>
            )}
          </CardBody>
        </Card>
      </Container>
    </Box>
  )
}
