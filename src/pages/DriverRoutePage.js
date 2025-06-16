// src/pages/DriverRoutePage.js

import React, { useEffect, useState } from 'react';
import MapWithRoute from '../components/MapWithRoute';
import { getRouteForDate } from '../services/ordersService';
import dayjs from 'dayjs';

const DriverRoutePage = () => {
  const [route, setRoute] = useState(null);
  const [error, setError] = useState(null);
  const today = dayjs().format('YYYY-MM-DD');

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const data = await getRouteForDate(today);
        setRoute(data.routes[0]);
      } catch (err) {
        setError('Route could not be loaded.');
        console.error(err);
      }
    };

    fetchRoute();
  }, [today]);

  if (error) return <p>{error}</p>;
  if (!route) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Driver Route for {today}</h1>
      <MapWithRoute route={route} />
    </div>
  );
};

export default DriverRoutePage;
