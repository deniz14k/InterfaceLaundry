"use client"

import { useState, useEffect, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Box,
  Container,
  Heading,
  Text,
  Card,
  CardBody,
  VStack,
  HStack,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  Badge,
  useToast,
} from "@chakra-ui/react"
import { AuthContext } from "../contexts/authContext"
import SchedulingRequestForm from "../components/SchedulingRequestForm"
import SchedulingRequestsList from "../components/SchedulingRequestsList"
import SchedulingStatusBadge from "../components/SchedulingStatusBadge"

export default function ScheduleOrderPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const toast = useToast()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showSchedulingForm, setShowSchedulingForm] = useState(false)

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear(to-br, blue.50, purple.50, pink.50)",
    "linear(to-br, gray.900, purple.900, blue.900)",
  )
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.200")

  useEffect(() => {
    loadOrder()
  }, [orderId])

  const loadOrder = async () => {
    if (!orderId) {
      setError("Order ID is required")
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`https://localhost:7223/api/orders/my/${orderId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })

      if (!response.ok) {
        throw new Error("Order not found or access denied")
      }

      const orderData = await response.json()
      setOrder(orderData)
    } catch (err) {
      setError(err.message)
      console.error("Error loading order:", err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "yellow"
      case "in_progress":
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
      case "in_progress":
        return "🚚"
      case "completed":
        return "✅"
      case "cancelled":
        return "❌"
      default:
        return "📦"
    }
  }

  if (loading) {
    return (
      <Box minH="100vh" bgGradient={bgGradient} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" />
          <Text fontSize="lg" fontWeight="medium" color={textColor}>
            Loading order details...
          </Text>
        </VStack>
      </Box>
    )
  }

  if (error || !order) {
    return (
      <Box minH="100vh" bgGradient={bgGradient}>
        <Container maxW="4xl" py={8}>
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">Unable to load order</Text>
              <Text fontSize="sm">{error || "Order not found"}</Text>
            </VStack>
          </Alert>
          <Button mt={4} onClick={() => navigate("/my-orders")} colorScheme="blue">
            Back to My Orders
          </Button>
        </Container>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW="4xl" py={8}>
        {/* Header */}
        <Card mb={6} bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden">
          <CardBody p={8}>
            <VStack spacing={6}>
              <HStack>
                <Button
                  leftIcon={<span>←</span>}
                  onClick={() => navigate("/my-orders")}
                  colorScheme="blue"
                  variant="ghost"
                  size="lg"
                  _hover={{ transform: "translateX(-4px)", transition: "all 0.2s" }}
                  borderRadius="full"
                />
                <VStack spacing={2}>
                  <HStack>
                    <Text fontSize="3xl">📅</Text>
                    <Heading size="xl" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                      Schedule Your Service
                    </Heading>
                  </HStack>
                  <Text color={textColor} textAlign="center">
                    Manage pickup and delivery scheduling for your order
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Order Summary */}
        <Card mb={6} bg={cardBg} shadow="xl" borderRadius="2xl">
          <CardBody p={6}>
            <VStack spacing={4}>
              <HStack justify="space-between" w="full">
                <VStack align="start" spacing={2}>
                  <Heading size="lg" color={textColor}>
                    Order #{order.id}
                  </Heading>
                  <HStack>
                    <Text fontSize="xl">{getStatusIcon(order.status)}</Text>
                    <Badge
                      colorScheme={getStatusColor(order.status)}
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="sm"
                      fontWeight="bold"
                    >
                      {order.status}
                    </Badge>
                    <SchedulingStatusBadge
                      status={order.schedulingStatus}
                      scheduledTime={order.scheduledPickupTime || order.scheduledDeliveryTime}
                      compact
                    />
                  </HStack>
                </VStack>

                <VStack align="end" spacing={1}>
                  <Text fontSize="sm" color="gray.500">
                    Total Amount
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">
                    {order.items?.reduce((sum, item) => sum + item.price, 0) || 0} RON
                  </Text>
                </VStack>
              </HStack>

              <HStack justify="space-between" w="full">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.500">
                    Service Type
                  </Text>
                  <Badge colorScheme="purple" px={3} py={1} borderRadius="full">
                    {order.serviceType === "PickupDelivery" ? "🚚 Pickup & Delivery" : "🏠 Pickup Only"}
                  </Badge>
                </VStack>

                <VStack align="end" spacing={1}>
                  <Text fontSize="sm" color="gray.500">
                    Created
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    {new Date(order.receivedDate).toLocaleDateString()}
                  </Text>
                </VStack>
              </HStack>

              {order.deliveryAddress && (
                <VStack align="start" spacing={1} w="full">
                  <Text fontSize="sm" color="gray.500">
                    Delivery Address
                  </Text>
                  <Text color={textColor}>📍 {order.deliveryAddress}</Text>
                  {order.apartmentNumber && (
                    <Badge colorScheme="blue" px={2} py={1} borderRadius="full" fontSize="xs">
                      🏢 Apartment {order.apartmentNumber}
                    </Badge>
                  )}
                </VStack>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Scheduling Section */}
        <Card bg={cardBg} shadow="xl" borderRadius="2xl">
          <CardBody p={8}>
            <VStack spacing={6}>
              <HStack justify="space-between" w="full">
                <HStack>
                  <Text fontSize="2xl">📅</Text>
                  <Heading size="lg" color="purple.500">
                    Scheduling Management
                  </Heading>
                </HStack>
                {!showSchedulingForm && (
                  <Button
                    leftIcon={<Text fontSize="lg">➕</Text>}
                    colorScheme="blue"
                    onClick={() => setShowSchedulingForm(true)}
                    borderRadius="full"
                    size="lg"
                    bgGradient="linear(to-r, blue.400, blue.600)"
                    _hover={{
                      bgGradient: "linear(to-r, blue.500, blue.700)",
                      transform: "translateY(-2px)",
                      shadow: "xl",
                    }}
                    transition="all 0.2s"
                  >
                    New Scheduling Request
                  </Button>
                )}
              </HStack>

              {showSchedulingForm ? (
                <SchedulingRequestForm
                  orderId={order.id}
                  customerPhone={user.phoneNumber || order.phone || ""}
                  customerName={user.name || order.customerName || ""}
                  onRequestCreated={(newRequest) => {
                    setShowSchedulingForm(false)
                    toast({
                      status: "success",
                      title: "🎉 Scheduling request submitted!",
                      description: "We'll confirm your time slot shortly via SMS",
                      duration: 5000,
                    })
                  }}
                  onCancel={() => setShowSchedulingForm(false)}
                />
              ) : (
                <SchedulingRequestsList orderId={order.id} onNewRequest={() => setShowSchedulingForm(true)} />
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Help Section */}
        <Card mt={6} bg="blue.50" borderRadius="xl" borderWidth="2px" borderColor="blue.200">
          <CardBody p={6}>
            <VStack spacing={4}>
              <HStack>
                <Text fontSize="2xl">💡</Text>
                <Heading size="md" color="blue.700">
                  How Scheduling Works
                </Heading>
              </HStack>

              <VStack spacing={2} align="start" w="full">
                <HStack>
                  <Text fontSize="lg">1️⃣</Text>
                  <Text fontSize="sm" color="blue.600">
                    <strong>Choose your preferred time</strong> from available slots or request a custom time
                  </Text>
                </HStack>
                <HStack>
                  <Text fontSize="lg">2️⃣</Text>
                  <Text fontSize="sm" color="blue.600">
                    <strong>We'll confirm within 2 hours</strong> and send you an SMS notification
                  </Text>
                </HStack>
                <HStack>
                  <Text fontSize="lg">3️⃣</Text>
                  <Text fontSize="sm" color="blue.600">
                    <strong>Track your service</strong> in real-time on the day of pickup/delivery
                  </Text>
                </HStack>
              </VStack>

              <Alert status="info" borderRadius="lg" bg="blue.100" borderColor="blue.300">
                <AlertIcon color="blue.500" />
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" fontWeight="bold" color="blue.700">
                    Need help or have special requirements?
                  </Text>
                  <Text fontSize="sm" color="blue.600">
                    Call us at <strong>+40 123 456 789</strong> or add notes to your scheduling request
                  </Text>
                </VStack>
              </Alert>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  )
}
