"use client"

import { Badge, HStack, Text, Tooltip } from "@chakra-ui/react"

export default function SchedulingStatusBadge({ status, scheduledTime, compact = false }) {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "none":
        return {
          colorScheme: "gray",
          icon: "📋",
          text: "No Scheduling",
          description: "No pickup/delivery scheduled",
        }
      case "requested":
        return {
          colorScheme: "yellow",
          icon: "⏳",
          text: "Pending",
          description: "Scheduling request pending confirmation",
        }
      case "confirmed":
        return {
          colorScheme: "green",
          icon: "✅",
          text: "Confirmed",
          description: "Pickup/delivery time confirmed",
        }
      case "inprogress":
        return {
          colorScheme: "blue",
          icon: "🚚",
          text: "In Progress",
          description: "Driver is on the way",
        }
      case "completed":
        return {
          colorScheme: "purple",
          icon: "🎉",
          text: "Completed",
          description: "Pickup/delivery completed",
        }
      default:
        return {
          colorScheme: "gray",
          icon: "❓",
          text: status || "Unknown",
          description: "Unknown scheduling status",
        }
    }
  }

  const config = getStatusConfig(status)

  if (compact) {
    return (
      <Tooltip label={config.description}>
        <Badge colorScheme={config.colorScheme} px={2} py={1} borderRadius="full" fontSize="xs">
          {config.icon} {config.text}
        </Badge>
      </Tooltip>
    )
  }

  return (
    <HStack spacing={2}>
      <Badge colorScheme={config.colorScheme} px={3} py={1} borderRadius="full" fontSize="sm" fontWeight="bold">
        {config.icon} {config.text}
      </Badge>
      {scheduledTime && status !== "none" && (
        <Text fontSize="sm" color="gray.500">
          {new Date(scheduledTime).toLocaleString()}
        </Text>
      )}
    </HStack>
  )
}
