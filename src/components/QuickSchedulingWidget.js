"use client"

import { useState, useEffect } from "react"
import { Card, CardBody, VStack, HStack, Text, Button, Badge, useColorModeValue, Spinner } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"

export default function QuickSchedulingWidget({ customerId }) {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  // Color mode values
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.200")

  useEffect(() => {
    loadSchedulableOrders()
  }, [customerId])

  const loadSchedulableOrders = async () => {
    try {
      const response = await fetch("https://localhost:7223/api/orders/my", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })

      if (response.ok) {
        const allOrders = await response.json()
        // Filter orders that can be scheduled (not completed/cancelled and no confirmed scheduling)
        const schedulableOrders = allOrders.filter(
          (order) =>
            !["completed", "cancelled"].includes(order.status?.toLowerCase()) && order.schedulingStatus !== "completed",
        )
        setOrders(schedulableOrders.slice(0, 3)) // Show max 3 orders
      }
    } catch (error) {
      console.error("Error loading schedulable orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSchedulingUrgency = (order) => {
    if (order.schedulingStatus === "none") return { color: "blue", text: "Ready to Schedule" }
    if (order.schedulingStatus === "requested") return { color: "yellow", text: "Pending Confirmation" }
    if (order.schedulingStatus === "confirmed") return { color: "green", text: "Scheduled" }
    return { color: "gray", text: "No Action Needed" }
  }

  if (loading) {
    return (
      <Card bg={cardBg} borderRadius="xl" shadow="md">
        <CardBody p={6} textAlign="center">
          <Spinner size="md" color="blue.500" />
          <Text mt={2} fontSize="sm" color={textColor}>
            Loading scheduling options...
          </Text>
        </CardBody>
      </Card>
    )
  }

  if (orders.length === 0) {
    return (
      <Card bg={cardBg} borderRadius="xl" shadow="md">
        <CardBody p={6} textAlign="center">
          <VStack spacing={3}>
            <Text fontSize="3xl">📅</Text>
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              All Set!
            </Text>
            <Text fontSize="sm" color="gray.500">
              No orders need scheduling at the moment
            </Text>
          </VStack>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card bg={cardBg} borderRadius="xl" shadow="md">
      <CardBody p={6}>
        <VStack spacing={4} align="stretch">
          <HStack>
            <Text fontSize="2xl">📅</Text>
            <VStack align="start" spacing={1}>
              <Text fontSize="lg" fontWeight="bold" color={textColor}>
                Quick Scheduling
              </Text>
              <Text fontSize="sm" color="gray.500">
                {orders.length} order{orders.length !== 1 ? "s" : ""} ready for scheduling
              </Text>
            </VStack>
          </HStack>

          <VStack spacing={3} align="stretch">
            {orders.map((order) => {
              const urgency = getSchedulingUrgency(order)

              return (
                <Card
                  key={order.id}
                  bg="gray.50"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="gray.200"
                  cursor="pointer"
                  _hover={{
                    shadow: "sm",
                    borderColor: "blue.300",
                  }}
                  transition="all 0.2s"
                  onClick={() => navigate(`/schedule-order/${order.id}`)}
                >
                  <CardBody p={4}>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="bold" color={textColor}>
                          Order #{order.id}
                        </Text>
                        <Badge colorScheme={urgency.color} px={2} py={1} borderRadius="full" fontSize="xs">
                          {urgency.text}
                        </Badge>
                      </VStack>
                      <Button
                        size="xs"
                        colorScheme="blue"
                        variant="outline"
                        borderRadius="full"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/schedule-order/${order.id}`)
                        }}
                      >
                        Schedule
                      </Button>
                    </HStack>
                  </CardBody>
                </Card>
              )
            })}
          </VStack>

          <Button
            colorScheme="blue"
            variant="outline"
            size="sm"
            onClick={() => navigate("/my-orders")}
            borderRadius="full"
          >
            View All Orders
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
}
