"use client"

import { Card, CardBody, VStack, HStack, Text, Button, useColorModeValue, Progress } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import SchedulingStatusBadge from "./SchedulingStatusBadge"

export default function SchedulingStatusCard({ order, compact = false }) {
  const navigate = useNavigate()

  // Color mode values
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.200")

  const getSchedulingProgress = (status) => {
    switch (status?.toLowerCase()) {
      case "none":
        return 0
      case "requested":
        return 25
      case "confirmed":
        return 75
      case "inprogress":
        return 90
      case "completed":
        return 100
      default:
        return 0
    }
  }

  const getNextAction = (status) => {
    switch (status?.toLowerCase()) {
      case "none":
        return { text: "Schedule Service", action: "schedule", color: "blue" }
      case "requested":
        return { text: "Pending Confirmation", action: "view", color: "yellow" }
      case "confirmed":
        return { text: "View Schedule", action: "view", color: "green" }
      case "inprogress":
        return { text: "Track Service", action: "track", color: "blue" }
      case "completed":
        return { text: "Service Complete", action: "view", color: "purple" }
      default:
        return { text: "Schedule Service", action: "schedule", color: "blue" }
    }
  }

  const handleAction = () => {
    const nextAction = getNextAction(order.schedulingStatus)

    switch (nextAction.action) {
      case "schedule":
      case "view":
      case "track":
        navigate(`/schedule-order/${order.id}`)
        break
      default:
        navigate(`/my-orders/${order.id}`)
    }
  }

  const progress = getSchedulingProgress(order.schedulingStatus)
  const nextAction = getNextAction(order.schedulingStatus)

  if (compact) {
    return (
      <HStack spacing={3} w="full">
        <SchedulingStatusBadge
          status={order.schedulingStatus}
          scheduledTime={order.scheduledPickupTime || order.scheduledDeliveryTime}
          compact
        />
        <Button size="xs" colorScheme={nextAction.color} variant="outline" onClick={handleAction} borderRadius="full">
          {nextAction.text}
        </Button>
      </HStack>
    )
  }

  return (
    <Card bg={cardBg} borderRadius="lg" borderWidth="1px" borderColor="gray.200">
      <CardBody p={4}>
        <VStack spacing={3} align="stretch">
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" fontWeight="bold" color={textColor}>
                Scheduling Status
              </Text>
              <SchedulingStatusBadge
                status={order.schedulingStatus}
                scheduledTime={order.scheduledPickupTime || order.scheduledDeliveryTime}
              />
            </VStack>
            <Button size="sm" colorScheme={nextAction.color} onClick={handleAction} borderRadius="full">
              {nextAction.text}
            </Button>
          </HStack>

          {progress > 0 && (
            <VStack spacing={2} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="xs" color="gray.500">
                  Progress
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {progress}%
                </Text>
              </HStack>
              <Progress value={progress} colorScheme={nextAction.color} size="sm" borderRadius="full" />
            </VStack>
          )}

          {(order.scheduledPickupTime || order.scheduledDeliveryTime) && (
            <VStack align="start" spacing={1}>
              <Text fontSize="xs" color="gray.500">
                Scheduled Time:
              </Text>
              <Text fontSize="sm" color={textColor} fontWeight="medium">
                {new Date(order.scheduledPickupTime || order.scheduledDeliveryTime).toLocaleString()}
              </Text>
            </VStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  )
}
