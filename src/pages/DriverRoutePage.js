"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
  Box,
  Text,
  Button,
  Select,
  VStack,
  HStack,
  useToast,
  Spinner,
  Card,
  CardBody,
  Badge,
  Flex,
  Heading,
  useColorModeValue,
  Container,
  Stat,
  StatLabel,
  StatNumber,
  Avatar,
  Progress,
  IconButton,
  Tooltip,
} from "@chakra-ui/react"
import { useJsApiLoader } from "@react-google-maps/api"
import MapWithRoute from "../components/MapWithRoute"
import {
  getRouteById,
  markOrderCompleted,
  startRoute,
  stopRoute,
  reportTracking,
  removeOrderFromRoute,
  addOrderToRoute,
  getEligibleOrders,
} from "../services/RouteService"

export default function DriverRoutePage() {
  const { routeId } = useParams()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [encodedPolyline, setEncodedPolyline] = useState("")
  const [orders, setOrders] = useState([])
  const [routeStarted, setRouteStarted] = useState(false)
  const [watchId, setWatchId] = useState(null)
  const [pendingOrders, setPendingOrders] = useState([])
  const [selectedOrderId, setSelectedOrderId] = useState("")
  const [isOptimized, setIsOptimized] = useState(false)

  // HQ coordinates
  const HQ = { lat: 46.517151, lng: 24.5223398 }

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear(to-br, blue.50, purple.50, pink.50)",
    "linear(to-br, gray.900, purple.900, blue.900)",
  )
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.200")
  const accentColor = useColorModeValue("blue.500", "blue.300")

  // Load Google Maps JS API once
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY,
    libraries: ["places"],
  })

  // Build a mobile-friendly Google Maps directions URL for entire route
  function buildMobileRouteURL() {
    const pts = [HQ, ...orders.map((o) => ({ lat: o.lat, lng: o.lng })), HQ]
    return `https://www.google.com/maps/dir/${pts.map((p) => `${p.lat},${p.lng}`).join("/")}`
  }

  // Fetch the route details from backend
  const refreshRoute = () => {
    if (!routeId) return
    setLoading(true)
    getRouteById(routeId)
      .then((data) => {
        setEncodedPolyline(data.polyline)
        setOrders(data.orders)
        setRouteStarted(data.isStarted)
        setIsOptimized(false) // trigger re-optimize
      })
      .catch(() => {
        toast({ status: "error", title: "Could not load route" })
      })
      .finally(() => setLoading(false))
  }

  // Initial load: route + eligible orders
  useEffect(() => {
    refreshRoute()
    getEligibleOrders().then(setPendingOrders).catch(console.error)
  }, [routeId])

  // GPS tracking when route is started
  useEffect(() => {
    if (routeStarted && routeId && navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (pos) => reportTracking(routeId, pos.coords.latitude, pos.coords.longitude).catch(console.error),
        (err) => console.error("GPS error", err),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
      )
      setWatchId(id)
    }
    return () => {
      if (watchId != null) navigator.geolocation.clearWatch(watchId)
    }
  }, [routeStarted, routeId])

  // Optimize order array using the Maps JS API once
  useEffect(() => {
    if (!isLoaded || isOptimized || orders.length === 0) return
    const service = new window.google.maps.DirectionsService()
    service.route(
      {
        origin: HQ,
        destination: HQ,
        waypoints: orders.map((o) => ({ location: { lat: o.lat, lng: o.lng }, stopover: true })),
        optimizeWaypoints: true,
        travelMode: "DRIVING",
      },
      (resp, status) => {
        if (status === "OK" && resp.routes.length) {
          const order = resp.routes[0].waypoint_order
          setOrders(order.map((i) => orders[i]))
          setIsOptimized(true)
        }
      },
    )
  }, [isLoaded, orders, isOptimized, HQ])

  // Handlers
  const handleStart = () => {
    startRoute(routeId)
      .then(() => {
        setRouteStarted(true)
        toast({ status: "success", title: "🚀 Route started! Safe driving!" })
      })
      .catch(() => toast({ status: "error", title: "Failed to start route" }))
  }

  const handleStop = () => {
    stopRoute(routeId)
      .then(() => {
        setRouteStarted(false)
        toast({ status: "success", title: "⏹️ Route stopped successfully" })
      })
      .catch(() => toast({ status: "error", title: "Failed to stop route" }))
  }

  const handleMarkCompleted = (oid) => {
    markOrderCompleted(routeId, oid)
      .then(() => {
        setOrders((prev) => prev.map((o) => (o.id === oid ? { ...o, isCompleted: true } : o)))
        toast({ status: "success", title: "✅ Order completed! Great job!" })
      })
      .catch(() => toast({ status: "error", title: "Could not mark done" }))
  }

  const handleRemove = (oid) => {
    removeOrderFromRoute(routeId, oid)
      .then(() => {
        toast({ status: "success", title: "🗑️ Order removed from route" })
        refreshRoute()
      })
      .catch(() => toast({ status: "error", title: "Could not remove order" }))
  }

  const handleAdd = () => {
    if (!selectedOrderId) return
    addOrderToRoute(routeId, selectedOrderId)
      .then(() => {
        toast({ status: "success", title: "➕ Order added to route!" })
        setSelectedOrderId("")
        refreshRoute()
      })
      .catch(() => toast({ status: "error", title: "Could not add order" }))
  }

  const completedOrders = orders.filter((o) => o.isCompleted).length
  const totalOrders = orders.length
  const progressPercentage = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0

  if (loading) {
    return (
      <Box minH="100vh" bgGradient={bgGradient} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" />
          <Text fontSize="lg" fontWeight="medium" color={textColor}>
            Loading your route...
          </Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW="7xl" py={8}>
        {/* Header Section */}
        <Card mb={6} bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden">
          <Box h="4px" bgGradient="linear(to-r, blue.400, purple.400, pink.400)" />
          <CardBody p={8}>
            <Flex justify="space-between" align="center" mb={6}>
              <VStack align="start" spacing={2}>
                <HStack>
                  <Text fontSize="3xl">🚚</Text>
                  <Heading size="xl" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                    Driver Dashboard
                  </Heading>
                </HStack>
                <HStack>
                  <Badge
                    colorScheme={routeStarted ? "green" : "yellow"}
                    size="lg"
                    px={3}
                    py={1}
                    rounded="full"
                    textTransform="capitalize"
                  >
                    {routeStarted ? "🟢 Active Route" : "⏸️ Route Paused"}
                  </Badge>
                  <Text color={textColor}>Route #{routeId}</Text>
                </HStack>
              </VStack>

              <VStack align="end" spacing={2}>
                <Stat textAlign="right">
                  <StatLabel color={textColor}>Progress</StatLabel>
                  <StatNumber fontSize="2xl" color="green.500">
                    {completedOrders}/{totalOrders}
                  </StatNumber>
                </Stat>
                <Progress
                  value={progressPercentage}
                  colorScheme="green"
                  size="lg"
                  borderRadius="full"
                  w="150px"
                  bg="gray.200"
                />
              </VStack>
            </Flex>

            {/* Control Buttons */}
            <HStack spacing={4} justify="center">
              {!routeStarted ? (
                <Button
                  leftIcon={<Text fontSize="xl">▶️</Text>}
                  colorScheme="green"
                  size="lg"
                  onClick={handleStart}
                  bgGradient="linear(to-r, green.400, green.600)"
                  _hover={{
                    bgGradient: "linear(to-r, green.500, green.700)",
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
                  Start Route
                </Button>
              ) : (
                <Button
                  leftIcon={<Text fontSize="xl">⏹️</Text>}
                  colorScheme="red"
                  size="lg"
                  onClick={handleStop}
                  bgGradient="linear(to-r, red.400, red.600)"
                  _hover={{
                    bgGradient: "linear(to-r, red.500, red.700)",
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
                  Stop Route
                </Button>
              )}

              {orders.length > 0 && (
                <Button
                  as="a"
                  href={buildMobileRouteURL()}
                  target="_blank"
                  rel="noopener noreferrer"
                  leftIcon={<Text fontSize="xl">🗺️</Text>}
                  colorScheme="purple"
                  size="lg"
                  bgGradient="linear(to-r, purple.400, purple.600)"
                  _hover={{
                    bgGradient: "linear(to-r, purple.500, purple.700)",
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
                  Navigate Full Route
                </Button>
              )}
            </HStack>
          </CardBody>
        </Card>

        {/* Map Section */}
        {orders.length > 0 && isLoaded ? (
          <Card mb={6} bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden">
            <CardBody p={8}>
              <HStack mb={6}>
                <Text fontSize="2xl">🗺️</Text>
                <Heading size="lg">Route Overview</Heading>
              </HStack>
              <Box borderRadius="2xl" overflow="hidden" shadow="lg">
                <MapWithRoute
                  encodedPolyline={encodedPolyline}
                  stops={orders.map((o) => ({ lat: o.lat, lng: o.lng }))}
                  headquarters={HQ}
                />
              </Box>
            </CardBody>
          </Card>
        ) : (
          <Card mb={6} bg={cardBg} shadow="xl" borderRadius="2xl">
            <CardBody p={8} textAlign="center">
              <VStack spacing={4}>
                <Text fontSize="4xl">🗺️</Text>
                <Text fontSize="lg" color={textColor}>
                  No stops to display on the map
                </Text>
                <Text color="gray.500">Add some orders to see your route!</Text>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Stops List */}
        <Card mb={6} bg={cardBg} shadow="xl" borderRadius="2xl">
          <CardBody p={8}>
            <HStack mb={6}>
              <Text fontSize="2xl">📍</Text>
              <Heading size="lg">Your Stops ({orders.length})</Heading>
            </HStack>

            <VStack spacing={4} align="stretch">
              {orders.map((order, idx) => (
                <Card
                  key={order.id}
                  bg={order.isCompleted ? "green.50" : "white"}
                  borderWidth="2px"
                  borderColor={order.isCompleted ? "green.200" : "gray.200"}
                  shadow="md"
                  borderRadius="xl"
                  _hover={{
                    shadow: "lg",
                    transform: "translateY(-2px)",
                    transition: "all 0.2s",
                  }}
                >
                  <CardBody p={6}>
                    <Flex justify="space-between" align="center">
                      <HStack spacing={4}>
                        <Avatar
                          size="lg"
                          bg={order.isCompleted ? "green.500" : "blue.500"}
                          color="white"
                          name={`${idx + 1}`}
                          fontSize="xl"
                          fontWeight="bold"
                        />
                        <VStack align="start" spacing={1}>
                          <HStack>
                            <Badge colorScheme="blue" px={2} py={1} borderRadius="full">
                              Order #{order.orderNumber || order.id}
                            </Badge>
                            {order.isCompleted && (
                              <Badge colorScheme="green" px={2} py={1} borderRadius="full">
                                ✅ Completed
                              </Badge>
                            )}
                          </HStack>
                          <Text fontSize="lg" fontWeight="bold" color={textColor}>
                            {order.customer || "Customer"}
                          </Text>
                          <VStack align="start" spacing={1}>
                            <Text color="gray.500" fontSize="sm">
                              📍 {order.address}
                            </Text>
                            {order.apartmentNumber && (
                              <Badge colorScheme="purple" px={2} py={1} borderRadius="full" fontSize="xs">
                                🏢 Apartment {order.apartmentNumber}
                              </Badge>
                            )}
                          </VStack>
                          <Text color="green.500" fontWeight="bold">
                            💰 {order.price} RON
                          </Text>
                        </VStack>
                      </HStack>

                      <VStack spacing={2}>
                        <HStack spacing={2}>
                          <Tooltip label="Call Customer">
                            <IconButton
                              as="a"
                              href={`tel:${order.phone}`}
                              icon={<Text fontSize="lg">📞</Text>}
                              colorScheme="green"
                              size="sm"
                              borderRadius="full"
                              _hover={{ transform: "scale(1.1)" }}
                            />
                          </Tooltip>

                          <Tooltip label="Get Directions">
                            <IconButton
                              as="a"
                              href={`https://www.google.com/maps/dir/?api=1&destination=${order.lat},${order.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              icon={<Text fontSize="lg">🧭</Text>}
                              colorScheme="purple"
                              size="sm"
                              borderRadius="full"
                              _hover={{ transform: "scale(1.1)" }}
                            />
                          </Tooltip>

                          {!order.isCompleted && (
                            <Tooltip label="Mark as Completed">
                              <IconButton
                                icon={<Text fontSize="lg">✅</Text>}
                                colorScheme="blue"
                                size="sm"
                                borderRadius="full"
                                onClick={() => handleMarkCompleted(order.id)}
                                _hover={{ transform: "scale(1.1)" }}
                              />
                            </Tooltip>
                          )}

                          <Tooltip label="Remove from Route">
                            <IconButton
                              icon={<Text fontSize="lg">🗑️</Text>}
                              colorScheme="orange"
                              size="sm"
                              borderRadius="full"
                              onClick={() => handleRemove(order.id)}
                              _hover={{ transform: "scale(1.1)" }}
                            />
                          </Tooltip>
                        </HStack>
                      </VStack>
                    </Flex>
                  </CardBody>
                </Card>
              ))}

              {orders.length === 0 && (
                <Card bg="gray.50" borderRadius="xl" borderWidth="2px" borderStyle="dashed" borderColor="gray.300">
                  <CardBody p={8} textAlign="center">
                    <VStack spacing={3}>
                      <Text fontSize="4xl">📦</Text>
                      <Text fontSize="lg" color="gray.600" fontWeight="medium">
                        No stops on this route yet
                      </Text>
                      <Text color="gray.500">Add some orders below to get started!</Text>
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Add Order Section */}
        <Card bg={cardBg} shadow="xl" borderRadius="2xl">
          <CardBody p={8}>
            <HStack mb={6}>
              <Text fontSize="2xl">➕</Text>
              <Heading size="lg">Add New Stop</Heading>
            </HStack>

            <HStack spacing={4}>
              <Select
                placeholder="Select a pending order..."
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                size="lg"
                borderRadius="xl"
                bg="white"
                _focus={{ borderColor: accentColor, shadow: "outline" }}
              >
                {pendingOrders
                  .filter((order) => !orders.some((routeOrder) => routeOrder.id === order.id))
                  .map((order) => (
                    <option key={order.id} value={order.id}>
                      #{order.orderNumber || order.id} | {order.customer || `Customer #${order.customerId}`} | 📍{" "}
                      {order.address || order.deliveryAddress} | 💰 {order.price || "N/A"} RON
                    </option>
                  ))}
              </Select>
              <Button
                leftIcon={<Text fontSize="xl">➕</Text>}
                colorScheme="teal"
                size="lg"
                onClick={handleAdd}
                isDisabled={!selectedOrderId}
                bgGradient="linear(to-r, teal.400, teal.600)"
                _hover={{
                  bgGradient: "linear(to-r, teal.500, teal.700)",
                  transform: "translateY(-2px)",
                  shadow: "xl",
                }}
                transition="all 0.2s"
                borderRadius="xl"
                px={8}
                fontWeight="bold"
              >
                Add to Route
              </Button>
            </HStack>

            {pendingOrders.filter((order) => !orders.some((routeOrder) => routeOrder.id === order.id)).length === 0 && (
              <Text color="gray.500" textAlign="center" mt={4}>
                {pendingOrders.length === 0
                  ? "No pending orders available to add"
                  : "All pending orders are already in this route"}
              </Text>
            )}
            <Text fontSize="sm" color="gray.500" mt={2}>
              Debug: {pendingOrders.length} total pending,{" "}
              {pendingOrders.filter((order) => !orders.some((routeOrder) => routeOrder.id === order.id)).length}{" "}
              available to add
            </Text>
          </CardBody>
        </Card>
      </Container>
    </Box>
  )
}
