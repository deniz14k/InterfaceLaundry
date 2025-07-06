"use client"

import { useEffect, useState, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Spinner,
  Card,
  CardBody,
  Badge,
  Flex,
  VStack,
  HStack,
  Divider,
  useColorModeValue,
  Container,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Avatar,
  Progress,
} from "@chakra-ui/react"
import { LoadScript, GoogleMap, Marker, DirectionsService } from "@react-google-maps/api"
import { AuthContext } from "../contexts/authContext"
import { itemProgressService } from "../services/itemProgressService"
import { getRouteById as fetchRoute } from "../services/RouteService"

const MAP_LIBRARIES = ["places"]

export default function MyOrderDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [orders, setOrders] = useState([])
  const [order, setOrder] = useState(null)
  const [routeId, setRouteId] = useState(null)
  const [routeStarted, setRouteStarted] = useState(false)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [progressData, setProgressData] = useState({})
  const [driverLoc, setDriverLoc] = useState(null)
  const [stops, setStops] = useState([])
  const [eta, setEta] = useState("")
  const [loading, setLoading] = useState(true)

  // Load item progress data
  useEffect(() => {
    if (order?.id && order?.items?.length) {
      const stats = itemProgressService.getCompletionStats(order.id, order.items.length)
      setProgressData(stats)

      // Refresh progress every 10 seconds
      const interval = setInterval(() => {
        const updatedStats = itemProgressService.getCompletionStats(order.id, order.items.length)
        setProgressData(updatedStats)
      }, 10000)

      return () => clearInterval(interval)
    }
  }, [order?.id, order?.items?.length])

  const DRIVER_PHONE = "+40123456789"

  // Color mode values for dark/light theme
  const bgGradient = useColorModeValue(
    "linear(to-br, blue.50, purple.50, pink.50)",
    "linear(to-br, gray.900, purple.900, blue.900)",
  )
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.200")

  // 1️⃣ Load my order (once)
  useEffect(() => {
    fetch(`https://localhost:7223/api/orders/my/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Order not found")
        return r.json()
      })
      .then((o) => {
        setOrder(o)
        setRouteId(o.routeId)
        setRouteStarted(o.routeStarted)
      })
      .catch(() => navigate("/my-orders"))
      .finally(() => setLoading(false))
  }, [id, navigate])

  // 2️⃣ Every 5 s: refresh both driver position & stops list
  useEffect(() => {
    if (!routeStarted || !routeId) return

    const timer = setInterval(() => {
      // fetch latest driver location
      fetch(`https://localhost:7223/api/tracking/${routeId}/latest`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
        .then((r) => (r.status === 204 ? null : r.ok ? r.json() : Promise.reject()))
        .then((loc) => loc && setDriverLoc({ lat: loc.lat, lng: loc.lng }))
        .catch(console.error)

      // fetch the up-to-date stops (so new orders show up)
      fetchRoute(routeId)
        .then((r) => setStops(r.orders))
        .catch(console.error)
    }, 5000)

    return () => clearInterval(timer)
  }, [routeStarted, routeId])

  // 3️⃣ DirectionsService callback to compute cumulative ETA
  const handleFullRoute = (response, status) => {
    if (status !== "OK" || !response.routes.length) return
    const legs = response.routes[0].legs
    const idx = stops.findIndex((s) => s.id === order.id)
    if (idx < 0) return

    // 1️⃣ Sum up drive time for legs 0 → idx
    const travelSecs = legs.slice(0, idx + 1).reduce((sum, leg) => sum + leg.duration.value, 0)

    // 2️⃣ Add a 5-minute (300s) service buffer for each completed stop
    const serviceSecs = idx * 5 * 60

    const totalSecs = travelSecs + serviceSecs

    // 3️⃣ Compute arrival clock time
    const arrival = new Date(Date.now() + totalSecs * 1000)
    const hh = arrival.getHours().toString().padStart(2, "0")
    const mm = arrival.getMinutes().toString().padStart(2, "0")

    // 4️⃣ Display it!
    setEta(`${hh}:${mm}`)
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

  if (loading || !order) {
    return (
      <Box minH="100vh" bgGradient={bgGradient} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" />
          <Text fontSize="lg" fontWeight="medium" color={textColor}>
            Loading your delicious order...
          </Text>
        </VStack>
      </Box>
    )
  }

  const isDelivery = order.serviceType === "PickupDelivery"
  const custLatLng = isDelivery && {
    lat: order.deliveryLatitude,
    lng: order.deliveryLongitude,
  }

  const totalAmount = order.items.reduce((sum, i) => sum + i.price, 0)

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW="6xl" py={8}>
        {/* Header Section */}
        <Card mb={6} bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden">
          <CardBody>
            <Flex justify="space-between" align="center" mb={4}>
              <Button
                leftIcon={<span>←</span>}
                onClick={() => navigate(-1)}
                colorScheme="blue"
                variant="ghost"
                size="lg"
                _hover={{ transform: "translateX(-4px)", transition: "all 0.2s" }}
              >
                Back
              </Button>
              <Text fontSize="lg" fontWeight="medium" color={textColor}>
                Welcome back,{" "}
                <Text as="span" color="blue.500" fontWeight="bold">
                  {user.name}
                </Text>
                ! 👋
              </Text>
            </Flex>
          </CardBody>
        </Card>

        {/* Order Header Card */}
        <Card mb={6} bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden">
          <CardBody>
            <Flex justify="space-between" align="center" mb={6}>
              <VStack align="start" spacing={2}>
                <Heading size="xl" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text" fontWeight="extrabold">
                  Order #{order.id}
                </Heading>
                <HStack>
                  <Text fontSize="2xl">{getStatusIcon(order.status)}</Text>
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
                </HStack>
              </VStack>

              <Stat textAlign="right">
                <StatLabel color={textColor}>Total Amount</StatLabel>
                <StatNumber fontSize="3xl" color="green.500" fontWeight="bold">
                  {totalAmount} RON
                </StatNumber>
              </Stat>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              <VStack align="start" spacing={2}>
                <Text fontWeight="bold" color="blue.500">
                  📅 Received
                </Text>
                <Text color={textColor}>{new Date(order.receivedDate).toLocaleString()}</Text>
              </VStack>

              {order.completedDate && (
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold" color="green.500">
                    ✅ Completed
                  </Text>
                  <Text color={textColor}>{new Date(order.completedDate).toLocaleString()}</Text>
                </VStack>
              )}

              {isDelivery && (
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold" color="purple.500">
                    📍 Delivery Address
                  </Text>
                  <VStack align="start" spacing={1}>
                    <Text color={textColor}>{order.deliveryAddress}</Text>
                    {order.apartmentNumber && (
                      <Badge colorScheme="purple" px={2} py={1} borderRadius="full" fontSize="sm">
                        🏢 Apartment {order.apartmentNumber}
                      </Badge>
                    )}
                  </VStack>
                </VStack>
              )}
            </SimpleGrid>

            {order.observation && (
              <>
                <Divider my={4} />
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold" color="orange.500">
                    📝 Special Notes
                  </Text>
                  <Text
                    color={textColor}
                    bg="orange.50"
                    p={3}
                    borderRadius="lg"
                    borderLeft="4px solid"
                    borderColor="orange.400"
                  >
                    {order.observation}
                  </Text>
                </VStack>
              </>
            )}
          </CardBody>
        </Card>

        {/* Items Section with Progress */}
        <Card mb={6} bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden">
          <CardBody>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="lg" color="purple.500">
                🛍️ Order Items ({order.items.length})
              </Heading>
              {progressData.total > 0 && (
                <VStack align="end" spacing={1}>
                  <Text fontSize="sm" color="gray.500">
                    Progress: {progressData.completed}/{progressData.total}
                  </Text>
                  <Progress
                    value={progressData.percentage}
                    colorScheme={progressData.percentage === 100 ? "green" : "blue"}
                    size="sm"
                    borderRadius="full"
                    w="120px"
                  />
                </VStack>
              )}
            </Flex>

            {progressData.total > 0 && (
              <Card bg="blue.50" borderRadius="lg" mb={4} borderWidth="1px" borderColor="blue.200">
                <CardBody p={4}>
                  <HStack justify="center" spacing={6}>
                    <VStack spacing={1}>
                      <Text fontSize="2xl" fontWeight="bold" color="green.500">
                        {progressData.completed}
                      </Text>
                      <Text fontSize="xs" color="green.600" fontWeight="medium">
                        ✅ Completed
                      </Text>
                    </VStack>
                    <VStack spacing={1}>
                      <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                        {progressData.total - progressData.completed}
                      </Text>
                      <Text fontSize="xs" color="blue.600" fontWeight="medium">
                        ⏳ In Progress
                      </Text>
                    </VStack>
                    <VStack spacing={1}>
                      <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                        {progressData.percentage}%
                      </Text>
                      <Text fontSize="xs" color="purple.600" fontWeight="medium">
                        📊 Complete
                      </Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            )}

            <Box overflowX="auto">
              <Table variant="simple" size="lg">
                <Thead>
                  <Tr bg="gray.50">
                    <Th fontSize="md" color="gray.600">
                      Status
                    </Th>
                    <Th fontSize="md" color="gray.600">
                      Type
                    </Th>
                    <Th fontSize="md" color="gray.600">
                      Dimensions
                    </Th>
                    <Th fontSize="md" color="gray.600" isNumeric>
                      Price (RON)
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {order.items.map((item, index) => {
                    const isCompleted = itemProgressService.isItemCompleted(order.id, index)
                    return (
                      <Tr
                        key={item.id}
                        bg={isCompleted ? "green.50" : "white"}
                        _hover={{
                          bg: isCompleted ? "green.100" : "blue.50",
                          transform: "scale(1.01)",
                          transition: "all 0.2s",
                        }}
                        borderRadius="lg"
                        borderWidth="2px"
                        borderColor={isCompleted ? "green.200" : "transparent"}
                      >
                        <Td>
                          <HStack spacing={2}>
                            {isCompleted ? (
                              <Badge colorScheme="green" px={2} py={1} borderRadius="full" fontSize="xs">
                                ✅ Done
                              </Badge>
                            ) : (
                              <Badge colorScheme="blue" px={2} py={1} borderRadius="full" fontSize="xs">
                                ⏳ Processing
                              </Badge>
                            )}
                          </HStack>
                        </Td>
                        <Td fontWeight="medium" color={textColor}>
                          <HStack>
                            <Text fontSize="lg">📦</Text>
                            <Text>{item.type}</Text>
                          </HStack>
                        </Td>
                        <Td color={textColor}>
                          {item.length && item.width ? (
                            <Badge colorScheme="blue" variant="subtle" px={2} py={1}>
                              {item.length}×{item.width}
                            </Badge>
                          ) : (
                            <Text color="gray.400">–</Text>
                          )}
                        </Td>
                        <Td isNumeric>
                          <Text fontWeight="bold" color="green.500" fontSize="lg">
                            {item.price} RON
                          </Text>
                        </Td>
                      </Tr>
                    )
                  })}
                </Tbody>
              </Table>
            </Box>

            {progressData.percentage === 100 && (
              <Card bg="green.50" borderRadius="lg" mt={4} borderWidth="2px" borderColor="green.200">
                <CardBody p={4} textAlign="center">
                  <VStack spacing={2}>
                    <Text fontSize="3xl">🎉</Text>
                    <Text fontSize="lg" fontWeight="bold" color="green.600">
                      All items completed!
                    </Text>
                    <Text color="green.500" fontSize="sm">
                      Your order is ready for pickup/delivery
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            )}
          </CardBody>
        </Card>

        {/* ETA and Map Section */}
        {isDelivery && routeStarted && driverLoc && custLatLng && stops.length > 0 && (
          <Card mb={6} bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden">
            <CardBody>
              <VStack spacing={6}>
                <HStack spacing={4} w="full" justify="center">
                  <Avatar size="lg" bg="blue.500" icon={<Text fontSize="2xl">🚚</Text>} />
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.500" fontWeight="medium">
                      Estimated Arrival Time
                    </Text>
                    <Heading size="xl" color="blue.500" fontFamily="mono">
                      {eta || "⏱️ Calculating..."}
                    </Heading>
                  </VStack>
                </HStack>

                <Progress value={75} colorScheme="blue" size="lg" borderRadius="full" w="full" bg="gray.100" />

                {process.env.REACT_APP_GOOGLE_MAPS_KEY ? (
                  <LoadScript
                    googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}
                    libraries={MAP_LIBRARIES}
                    onLoad={() => {
                      console.log("Google Maps loaded successfully")
                      setIsMapLoaded(true)
                    }}
                    onError={(error) => {
                      console.error("Google Maps failed to load:", error)
                    }}
                  >
                    <Box borderRadius="2xl" overflow="hidden" shadow="lg" w="full">
                      <GoogleMap
                        mapContainerStyle={{ width: "100%", height: "400px" }}
                        center={driverLoc}
                        zoom={12}
                        onLoad={() => console.log("Map component loaded")}
                      >
                        {/* Driver Pin - Blue Car Icon */}
                        <Marker
                          position={driverLoc}
                          title="Your Driver 🚚"
                          icon={{
                            url:
                              "data:image/svg+xml;charset=UTF-8," +
                              encodeURIComponent(`
                                <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="25" cy="25" r="22" fill="#1e40af" stroke="#ffffff" stroke-width="4"/>
                                  <circle cx="25" cy="25" r="18" fill="#3b82f6"/>
                                  <text x="25" y="32" text-anchor="middle" fill="white" font-size="20">🚚</text>
                                </svg>
                              `),
                            ...(typeof window !== "undefined" &&
                              window.google?.maps?.Size && {
                                scaledSize: new window.google.maps.Size(50, 50),
                                anchor: new window.google.maps.Point(25, 25),
                              }),
                          }}
                          {...(typeof window !== "undefined" &&
                            window.google?.maps?.Animation && {
                              animation: window.google.maps.Animation.BOUNCE,
                            })}
                        />

                        {/* Customer Pin - Green House Icon */}
                        {custLatLng && (
                          <Marker
                            position={custLatLng}
                            title="Your Delivery Location 🏠"
                            icon={{
                              url:
                                "data:image/svg+xml;charset=UTF-8," +
                                encodeURIComponent(`
                                  <svg width="45" height="45" viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="22.5" cy="22.5" r="20" fill="#16a34a" stroke="#ffffff" stroke-width="3"/>
                                    <circle cx="22.5" cy="22.5" r="16" fill="#22c55e"/>
                                    <text x="22.5" y="29" text-anchor="middle" fill="white" font-size="16">🏠</text>
                                  </svg>
                                `),
                              ...(typeof window !== "undefined" &&
                                window.google?.maps?.Size && {
                                  scaledSize: new window.google.maps.Size(45, 45),
                                  anchor: new window.google.maps.Point(22.5, 22.5),
                                }),
                            }}
                          />
                        )}
                      </GoogleMap>
                    </Box>

                    {/* Only show DirectionsService after map is loaded */}
                    {isMapLoaded && (
                      <DirectionsService
                        options={{
                          origin: driverLoc,
                          destination: {
                            lat: stops[stops.length - 1].lat,
                            lng: stops[stops.length - 1].lng,
                          },
                          travelMode: "DRIVING",
                          waypoints: stops
                            .slice(0, stops.length - 1)
                            .map((s) => ({ location: { lat: s.lat, lng: s.lng }, stopover: true })),
                          drivingOptions: {
                            departureTime: new Date(),
                            trafficModel: "bestguess",
                          },
                        }}
                        callback={handleFullRoute}
                      />
                    )}
                  </LoadScript>
                ) : (
                  <Box
                    height="400px"
                    bg="red.50"
                    borderRadius="2xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    border="2px dashed"
                    borderColor="red.200"
                  >
                    <VStack spacing={3}>
                      <Text fontSize="4xl">🗺️</Text>
                      <Text color="red.600" fontWeight="bold">
                        Google Maps API Key Missing
                      </Text>
                      <Text color="red.500" textAlign="center" fontSize="sm">
                        Please add REACT_APP_GOOGLE_MAPS_KEY to your environment variables
                      </Text>
                    </VStack>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Call Driver Section */}
        <Card bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden">
          <CardBody textAlign="center">
            <VStack spacing={4}>
              <Text fontSize="lg" fontWeight="medium" color={textColor}>
                Need to contact your driver?
              </Text>
              <Button
                as="a"
                href={`tel:${DRIVER_PHONE}`}
                size="lg"
                colorScheme="green"
                leftIcon={<Text fontSize="xl">📞</Text>}
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
                Call Driver Now
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Route Not Started Message */}
        {isDelivery && !routeStarted && (
          <Card mt={6} bg="orange.50" borderColor="orange.200" borderWidth="1px">
            <CardBody textAlign="center">
              <VStack spacing={3}>
                <Text fontSize="4xl">⏳</Text>
                <Text fontSize="lg" color="orange.600" fontWeight="medium">
                  Your driver is preparing for the journey
                </Text>
                <Text color="orange.500">We'll notify you as soon as they hit the road!</Text>
              </VStack>
            </CardBody>
          </Card>
        )}
      </Container>
    </Box>
  )
}
