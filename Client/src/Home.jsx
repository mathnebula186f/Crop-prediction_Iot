import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import io from 'socket.io-client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {PieChart, Pie, Cell} from 'recharts';

function Home() {
  // State to hold the chart data
  const [chartData, setChartData] = useState([
    { time: "10:00", nitrogen: 50, phosphorus: 20, potassium: 30, temperature: 25, humidity: 60, ph: 6.5, rainfall: 100, crop: 'Wheat' },
    { time: "11:00", nitrogen: 60, phosphorus: 25, potassium: 35, temperature: 26, humidity: 65, ph: 6.6, rainfall: 120, crop: 'Maize'},
    { time: "12:00", nitrogen: 55, phosphorus: 22, potassium: 28, temperature: 27, humidity: 62, ph: 6.7, rainfall: 140, crop: 'Cotton' },
    {time: "13:00", nitrogen: 70, phosphorus: 30, potassium: 40, temperature: 28, humidity: 68, ph: 6.8, rainfall: 160, crop: 'Corn' },
    { time: "11:00", nitrogen: 60, phosphorus: 25, potassium: 35, temperature: 26, humidity: 65, ph: 6.6, rainfall: 120, crop: 'Maize'},
    { time: "12:00", nitrogen: 55, phosphorus: 22, potassium: 28, temperature: 27, humidity: 62, ph: 6.7, rainfall: 140, crop: 'Cotton' },
    { time: "13:00", nitrogen: 70, phosphorus: 30, potassium: 40, temperature: 28, humidity: 68, ph: 6.8, rainfall: 160, crop: 'Corn' },
  ]);
  // Sample data for Pie Chart (replace with real data)
  const [pieData, setPieData] = useState([
    { name: 'Nitrogen', value: 60 },
    { name: 'Phosphorus', value: 25 },
    { name: 'Potassium', value: 15 },
  ]);

  // Sample table data (replace with real data)
  const [tableData, setTableData] = useState([
    { timestamp: '2024-11-25 10:00', nitrogen: 50, phosphorus: 20, potassium: 30, temp: 25, humidity: 60, rainfall: 0, crops: ['Wheat', 'Maize', 'Barley'] },
    { timestamp: '2024-11-25 11:00', nitrogen: 60, phosphorus: 25, potassium: 35, temp: 26, humidity: 62, rainfall: 5, crops: ['Rice', 'Sugarcane', 'Cotton'] },
    { timestamp: '2024-11-25 12:00', nitrogen: 55, phosphorus: 22, potassium: 28, temp: 24, humidity: 58, rainfall: 3, crops: ['Corn', 'Soybean', 'Sorghum'] },
  ]);

  // Establish socket connection
  // useEffect(() => {
  //   const socket = io('http://localhost:5000');
  //   socket.on('data', data => {
  //     const latestData = {
  //       time: new Date().toLocaleTimeString(), // Updating time for each new data
  //       nitrogen: data.N,
  //       phosphorus: data.P,
  //       potassium: data.K,
  //       temperature: data.temperature,
  //       humidity: data.humidity,
  //       ph: data.ph,
  //       rainfall: data.rainfall,
  //       crop: data.label // Latest crop prediction
  //     };

  //     // Update chartData to show only the latest 5 entries
  //     setChartData(prevData => {
  //       const newData = [...prevData, latestData];
  //       return newData.length > 5 ? newData.slice(newData.length - 5) : newData;
  //     });

  //     // Update pie chart data
  //     setPieData([
  //       { name: 'Nitrogen', value: data.N },
  //       { name: 'Phosphorus', value: data.P },
  //       { name: 'Potassium', value: data.K }
  //     ]);

  //     // Update table data conditionally
  //     if (JSON.stringify(tableData[tableData.length - 1]) !== JSON.stringify(latestData)) {
  //       setTableData([...tableData, latestData]);
  //     }
  //   });

  //   // Clean up the connection
  //   return () => socket.disconnect();
  // }, [tableData]);

  // // Fetch crop recommendations from the cloud API
  // useEffect(() => {
  //   axios.get('https://api.yourdomain.com/crops/recommendations')
  //     .then(response => {
  //       setCrops(response.data); // Assuming the data contains an array of top 3 crops
  //     })
  //     .catch(error => console.error('Error fetching crop recommendations:', error));
  // }, []);

  const COLORS = ['#82ca9d', '#8884d8', '#ffc658'];

  return (
    <main className='main-container'>
      <div className='main-title'>
        <h3>DASHBOARD</h3>
      </div>

      <div className='charts'>
    <div>
      <h4>Real-Time NPK Monitoring</h4>
      <ResponsiveContainer width="150%" height={400}>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 80,
            
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            label={{ value: "Time", position: "insideBottom", offset: -5 }}
          />
          <YAxis
            label={{ value: "Levels", angle: -90, position: "insideLeft" }}
          />
          <Tooltip />
          
          <Legend />
          <Bar dataKey="nitrogen" fill="#82ca9d" name="Nitrogen" />
          <Bar dataKey="phosphorus" fill="#8884d8" name="Phosphorus" />
          <Bar dataKey="potassium" fill="#ffc658" name="Potassium" />
          <Bar dataKey="temperature" fill="#ff8042" name="Temperature" />
          <Bar dataKey="humidity" fill="#8dd1e1" name="Humidity" />
          <Bar dataKey="ph" fill="#a4de6c" name="pH" />
          <Bar dataKey="rainfall" fill="#d0ed57" name="Rainfall" />
          <Bar dataKey="crop" fill="#ff4592" name="Crop" />
          
        </BarChart>
      </ResponsiveContainer>

    </div>

  <div>
    <h4>Pie Chart: NPK Distribution</h4>
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={150}
          fill="#8884d8"
          label
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
         <Legend
        layout="vertical"   // Can also be "horizontal"
        align="right"       // Position of the legend: "left", "center", "right"
        verticalAlign="middle"  // Vertical positioning: "top", "middle", "bottom"
      />
      </PieChart>
    </ResponsiveContainer>
  </div>
</div>
   
      <div className='table-container'>
      <h4>Environmental Data and Best Crops</h4>
      <table className='data-table'>

          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Nitrogen (N)</th>
              <th>Phosphorus (P)</th>
              <th>Potassium (K)</th>
              <th>Temperature (°C)</th>
              <th>Humidity (%)</th>
              <th>Rainfall (mm)</th>
              <th>Best Crops</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index}>
                <td>{row.timestamp}</td>
                <td>{row.nitrogen}</td>
                <td>{row.phosphorus}</td>
                <td>{row.potassium}</td>
                <td>{row.temp}</td>
                <td>{row.humidity}</td>
                <td>{row.rainfall}</td>
                <td>{row.crops.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default Home;