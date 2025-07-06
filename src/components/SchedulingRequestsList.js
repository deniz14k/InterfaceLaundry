"use client"

import { useState, useEffect } from "react"
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Badge,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  Heading,
  Divider,
} from "@chakra-ui/react"
import { getOrderSchedulingRequests } from "../services/schedulingService"
import SchedulingStatusBadge from "./SchedulingStatusBadge"

export default function SchedulingRequestsList({ orderId, onNewRequest }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Color mode values
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.200")

  useEffect(() => {
    loadRequests()
  }, [orderId])

  const loadRequests = async () => {
    if (!orderId) return

    setLoading(true)
    setError("")

    try {
      const data = await getOrderSchedulingRequests(orderId)
      setRequests(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getRequestTypeIcon = (type) => {
    return type === "Pickup" ? "🏠" : "🚚"
  }

  if (loading) {
    return (
      <Card bg={cardBg} borderRadius="xl">
        <CardBody p={6} textAlign="center">
          <Spinner size="lg" color="blue.500" />
          <Text mt={4} color={textColor}>
            Loading scheduling requests...
          </Text>
        </CardBody>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="lg">
        <AlertIcon />
        {error}
      </Alert>
    )
  }

  return (
    <Card bg={cardBg} borderRadius="xl" shadow="md">
      <CardBody p={6}>
        <VStack spacing={4} align="stretch">
          {/* Header */}
          <HStack justify="space-between">
            <HStack>
              <Text fontSize="2xl">📅</Text>
              <Heading size="md" color={textColor}>
                Scheduling Requests
              </Heading>
            </HStack>
            <Button
              leftIcon={<Text fontSize="lg">➕</Text>}
              colorScheme="blue"
              size="sm"
              onClick={onNewRequest}
              borderRadius="full"
            >
              New Request
            </Button>
          </HStack>

          {requests.length === 0 ? (
            <Card bg="gray.50" borderRadius="lg" borderWidth="2px" borderStyle="dashed">
              <CardBody p={8} textAlign="center">
                <VStack spacing={3}>
                  <Text fontSize="4xl">📅</Text>
                  <Text fontSize="lg" color="gray.600" fontWeight="medium">
                    No scheduling requests yet
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Click "New Request" to schedule pickup or delivery
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          ) : (
            <VStack spacing={3} align="stretch">
              {requests.map((request, index) => (
                <Card
                  key={request.id}
                  bg={request.status === "Confirmed" ? "green.50" : "white"}
                  borderWidth="2px"
                  borderColor={
                    request.status === "Confirmed"
                      ? "green.200"
                      : request.status === "Rejected"
                        ? "red.200"
                        : "gray.200"
                  }
                  borderRadius="lg"
                >
                  <CardBody p={4}>
                    <VStack spacing={3}>
                      <HStack justify="space-between" w="full">
                        <HStack spacing={3}>
                          <Text fontSize="xl">{getRequestTypeIcon(request.requestType)}</Text>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" color={textColor}>
                              {request.requestType} Request #{request.id}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              Created {new Date(request.createdAt).toLocaleDateString()}
                            </Text>
                          </VStack>
                        </HStack>
                        <SchedulingStatusBadge status={request.status} compact />
                      </HStack>

                      <Divider />

                      <HStack justify="space-between" w="full">
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" color="gray.500">
                            Requested Time
                          </Text>
                          <Text fontWeight="medium" color={textColor}>
                            {new Date(request.requestedDateTime).toLocaleString()}
                          </Text>
                        </VStack>

                        {request.timeSlot && (
                          <VStack align="end" spacing={1}>
                            <Text fontSize="sm" color="gray.500">
                              Time Slot
                            </Text>
                            <Badge colorScheme="blue" px={2} py={1} borderRadius="full">
                              {request.timeSlot.displayTime}
                            </Badge>
                          </VStack>
                        )}
                      </HStack>

                      {request.customerNotes && (
                        <Box w="full">
                          <Text fontSize="sm" color="gray.500" mb={1}>
                            Your Notes:
                          </Text>
                          <Text
                            fontSize="sm"
                            color={textColor}
                            bg="blue.50"
                            p={2}
                            borderRadius="md"
                            borderLeft="4px solid"
                            borderColor="blue.400"
                          >
                            {request.customerNotes}
                          </Text>
                        </Box>
                      )}

                      {request.staffNotes && (
                        <Box w="full">
                          <Text fontSize="sm" color="gray.500" mb={1}>
                            Staff Response:
                          </Text>
                          <Text
                            fontSize="sm"
                            color={textColor}
                            bg="orange.50"
                            p={2}
                            borderRadius="md"
                            borderLeft="4px solid"
                            borderColor="orange.400"
                          >
                            {request.staffNotes}
                          </Text>
                        </Box>
                      )}

                      {request.confirmedAt && (
                        <HStack w="full" justify="space-between">
                          <Text fontSize="sm" color="gray.500">
                            Confirmed: {new Date(request.confirmedAt).toLocaleString()}
                          </Text>
                          {request.confirmedBy && (
                            <Text fontSize="sm" color="gray.500">
                              by {request.confirmedBy}
                            </Text>
                          )}
                        </HStack>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  )
}
