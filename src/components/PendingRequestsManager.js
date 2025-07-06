"use client"

import { useState } from "react"
import {
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Badge,
  Button,
  useColorModeValue,
  SimpleGrid,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Switch,
  useToast,
  Box,
  Tooltip,
  IconButton,
} from "@chakra-ui/react"
import { confirmSchedulingRequest, sendSchedulingNotification } from "../services/schedulingService"

export default function PendingRequestsManager({ requests, onRequestProcessed, onRefresh }) {
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [confirmData, setConfirmData] = useState({
    isConfirmed: true,
    alternativeDateTime: "",
    staffNotes: "",
    confirmedBy: "Staff", // You might want to get this from auth context
  })

  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  // Color mode values
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.200")

  const handleRequestClick = (request) => {
    setSelectedRequest(request)
    setConfirmData({
      isConfirmed: true,
      alternativeDateTime: "",
      staffNotes: "",
      confirmedBy: "Staff",
    })
    onOpen()
  }

  const handleConfirmRequest = async () => {
    if (!selectedRequest) return

    setIsProcessing(true)

    try {
      const requestData = {
        requestId: selectedRequest.id,
        isConfirmed: confirmData.isConfirmed,
        alternativeDateTime: confirmData.alternativeDateTime || null,
        staffNotes: confirmData.staffNotes || null,
        confirmedBy: confirmData.confirmedBy,
      }

      console.log("Confirming request with data:", requestData)

      const result = await confirmSchedulingRequest(requestData)

      console.log("Confirmation result:", result)

      // ✅ SUCCESS - Show success message
      toast({
        status: "success",
        title: `✅ Request ${confirmData.isConfirmed ? "Approved" : "Rejected"}!`,
        description: `Scheduling request #${selectedRequest.id} has been ${confirmData.isConfirmed ? "confirmed" : "rejected"}. Customer will receive SMS notification.`,
        duration: 5000,
      })

      // ✅ Call the callback to remove from list
      if (onRequestProcessed) {
        onRequestProcessed(result)
      }

      // ✅ Close modal
      onClose()
      setSelectedRequest(null)
    } catch (error) {
      console.error("Error processing request:", error)

      // ❌ ACTUAL ERROR - Show error message
      toast({
        status: "error",
        title: "❌ Failed to process request",
        description: error.message || "Please try again",
        duration: 5000,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSendNotification = async (requestId, messageType) => {
    try {
      await sendSchedulingNotification(requestId, messageType)
      toast({
        status: "success",
        title: "📱 Notification sent",
        description: "Customer has been notified via SMS",
        duration: 3000,
      })
    } catch (error) {
      toast({
        status: "error",
        title: "Failed to send notification",
        description: error.message,
      })
    }
  }

  const getRequestTypeIcon = (type) => {
    return type === "Pickup" ? "🏠" : "🚚"
  }

  const getUrgencyLevel = (request) => {
    const now = new Date()
    const requestTime = new Date(request.requestedDateTime)
    const createdTime = new Date(request.createdAt)

    const hoursUntilRequest = (requestTime - now) / (1000 * 60 * 60)
    const hoursOld = (now - createdTime) / (1000 * 60 * 60)

    if (hoursUntilRequest <= 4) return { level: "critical", color: "red", text: "URGENT - < 4h" }
    if (hoursUntilRequest <= 24) return { level: "high", color: "orange", text: "High - < 24h" }
    if (hoursOld > 2) return { level: "overdue", color: "yellow", text: "Overdue - > 2h old" }
    return { level: "normal", color: "green", text: "Normal" }
  }

  const sortedRequests = [...requests].sort((a, b) => {
    const urgencyA = getUrgencyLevel(a)
    const urgencyB = getUrgencyLevel(b)

    const urgencyOrder = { critical: 0, high: 1, overdue: 2, normal: 3 }

    if (urgencyOrder[urgencyA.level] !== urgencyOrder[urgencyB.level]) {
      return urgencyOrder[urgencyA.level] - urgencyOrder[urgencyB.level]
    }

    return new Date(a.createdAt) - new Date(b.createdAt)
  })

  if (requests.length === 0) {
    return (
      <Card bg="gray.50" borderRadius="xl" borderWidth="2px" borderStyle="dashed">
        <CardBody p={12} textAlign="center">
          <VStack spacing={4}>
            <Text fontSize="5xl">🎉</Text>
            <Text fontSize="xl" color="gray.600" fontWeight="bold">
              All caught up!
            </Text>
            <Text color="gray.500">No pending scheduling requests at the moment</Text>
            <Button
              leftIcon={<Text fontSize="lg">🔄</Text>}
              onClick={onRefresh}
              colorScheme="blue"
              variant="outline"
              size="lg"
              borderRadius="full"
            >
              Refresh
            </Button>
          </VStack>
        </CardBody>
      </Card>
    )
  }

  return (
    <>
      <VStack spacing={4} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="bold" color={textColor}>
            {requests.length} Pending Request{requests.length !== 1 ? "s" : ""}
          </Text>
          <Button
            leftIcon={<Text fontSize="lg">🔄</Text>}
            onClick={onRefresh}
            colorScheme="blue"
            variant="outline"
            size="sm"
            borderRadius="full"
          >
            Refresh
          </Button>
        </HStack>

        {/* Requests List */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
          {sortedRequests.map((request) => {
            const urgency = getUrgencyLevel(request)

            return (
              <Card
                key={request.id}
                bg={cardBg}
                borderWidth="2px"
                borderColor={`${urgency.color}.200`}
                borderRadius="xl"
                cursor="pointer"
                _hover={{
                  shadow: "lg",
                  transform: "translateY(-2px)",
                  borderColor: `${urgency.color}.400`,
                }}
                transition="all 0.2s"
                onClick={() => handleRequestClick(request)}
              >
                <CardBody p={6}>
                  <VStack spacing={4}>
                    {/* Header */}
                    <HStack justify="space-between" w="full">
                      <HStack spacing={3}>
                        <Text fontSize="2xl">{getRequestTypeIcon(request.requestType)}</Text>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold" color={textColor}>
                            {request.requestType} Request #{request.id}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            Order #{request.orderId}
                          </Text>
                        </VStack>
                      </HStack>
                      <Badge colorScheme={urgency.color} px={2} py={1} borderRadius="full" fontSize="xs">
                        {urgency.text}
                      </Badge>
                    </HStack>

                    <Divider />

                    {/* Customer Info */}
                    <HStack justify="space-between" w="full">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">
                          Customer
                        </Text>
                        <Text fontWeight="medium" color={textColor}>
                          {request.customerName}
                        </Text>
                        <Text fontSize="sm" color="blue.500">
                          📞 {request.customerPhone}
                        </Text>
                      </VStack>

                      <VStack align="end" spacing={1}>
                        <Text fontSize="sm" color="gray.500">
                          Requested Time
                        </Text>
                        <Text fontWeight="medium" color={textColor} textAlign="right">
                          {new Date(request.requestedDateTime).toLocaleDateString()}
                        </Text>
                        <Text fontSize="sm" color={textColor}>
                          {new Date(request.requestedDateTime).toLocaleTimeString()}
                        </Text>
                      </VStack>
                    </HStack>

                    {/* Time Slot Info */}
                    {request.timeSlot && (
                      <Box w="full">
                        <Text fontSize="sm" color="gray.500" mb={1}>
                          Time Slot:
                        </Text>
                        <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                          {request.timeSlot.displayTime} ({request.timeSlot.availableSlots} spots left)
                        </Badge>
                      </Box>
                    )}

                    {/* Customer Notes */}
                    {request.customerNotes && (
                      <Box w="full">
                        <Text fontSize="sm" color="gray.500" mb={1}>
                          Customer Notes:
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

                    {/* Action Buttons */}
                    <HStack spacing={2} w="full">
                      <Button
                        leftIcon={<Text fontSize="sm">✅</Text>}
                        colorScheme="green"
                        size="sm"
                        flex={1}
                        onClick={(e) => {
                          e.stopPropagation()
                          setConfirmData((prev) => ({ ...prev, isConfirmed: true }))
                          handleRequestClick(request)
                        }}
                      >
                        Approve
                      </Button>

                      <Button
                        leftIcon={<Text fontSize="sm">❌</Text>}
                        colorScheme="red"
                        size="sm"
                        flex={1}
                        onClick={(e) => {
                          e.stopPropagation()
                          setConfirmData((prev) => ({ ...prev, isConfirmed: false }))
                          handleRequestClick(request)
                        }}
                      >
                        Reject
                      </Button>

                      <Tooltip label="Send SMS">
                        <IconButton
                          icon={<Text fontSize="sm">📱</Text>}
                          colorScheme="blue"
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSendNotification(request.id, "Update")
                          }}
                        />
                      </Tooltip>
                    </HStack>

                    {/* Created Time */}
                    <Text fontSize="xs" color="gray.400" alignSelf="start">
                      Created: {new Date(request.createdAt).toLocaleString()}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            )
          })}
        </SimpleGrid>
      </VStack>

      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{confirmData.isConfirmed ? "Approve" : "Reject"} Scheduling Request</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            {selectedRequest && (
              <VStack spacing={4} align="stretch">
                {/* Request Summary */}
                <Card bg="gray.50" borderRadius="lg">
                  <CardBody p={4}>
                    <VStack spacing={2}>
                      <Text fontWeight="bold">
                        {selectedRequest.requestType} Request #{selectedRequest.id}
                      </Text>
                      <Text>Customer: {selectedRequest.customerName}</Text>
                      <Text>Phone: {selectedRequest.customerPhone}</Text>
                      <Text>Requested: {new Date(selectedRequest.requestedDateTime).toLocaleString()}</Text>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Approval/Rejection Toggle */}
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="approval-switch" mb="0" flex={1}>
                    {confirmData.isConfirmed ? "✅ Approve Request" : "❌ Reject Request"}
                  </FormLabel>
                  <Switch
                    id="approval-switch"
                    colorScheme="green"
                    isChecked={confirmData.isConfirmed}
                    onChange={(e) => setConfirmData((prev) => ({ ...prev, isConfirmed: e.target.checked }))}
                  />
                </FormControl>

                {/* Alternative Time (for approvals) */}
                {confirmData.isConfirmed && (
                  <FormControl>
                    <FormLabel>Alternative Time (Optional)</FormLabel>
                    <Input
                      type="datetime-local"
                      value={confirmData.alternativeDateTime}
                      onChange={(e) => setConfirmData((prev) => ({ ...prev, alternativeDateTime: e.target.value }))}
                    />
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      Leave empty to confirm the original requested time
                    </Text>
                  </FormControl>
                )}

                {/* Staff Notes */}
                <FormControl>
                  <FormLabel>{confirmData.isConfirmed ? "Notes to Customer (Optional)" : "Rejection Reason"}</FormLabel>
                  <Textarea
                    value={confirmData.staffNotes}
                    onChange={(e) => setConfirmData((prev) => ({ ...prev, staffNotes: e.target.value }))}
                    placeholder={
                      confirmData.isConfirmed
                        ? "Any additional notes for the customer..."
                        : "Please explain why this request cannot be accommodated..."
                    }
                    rows={3}
                  />
                </FormControl>

                {/* Confirmed By */}
                <FormControl>
                  <FormLabel>Staff Member</FormLabel>
                  <Input
                    value={confirmData.confirmedBy}
                    onChange={(e) => setConfirmData((prev) => ({ ...prev, confirmedBy: e.target.value }))}
                    placeholder="Your name"
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme={confirmData.isConfirmed ? "green" : "red"}
              onClick={handleConfirmRequest}
              isLoading={isProcessing}
              loadingText="Processing..."
            >
              {confirmData.isConfirmed ? "✅ Approve Request" : "❌ Reject Request"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
