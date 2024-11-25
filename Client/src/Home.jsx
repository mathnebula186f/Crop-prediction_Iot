import React, { useState, useEffect } from 'react';
import { BsFillArchiveFill } from 'react-icons/bs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';

function Home() {
  // Sample data for Bar Chart (replace with real data)
  const [chartData, setChartData] = useState([
    { time: '10:00', nitrogen: 50, phosphorus: 20, potassium: 30 },
    { time: '11:00', nitrogen: 60, phosphorus: 25, potassium: 35 },
    { time: '12:00', nitrogen: 55, phosphorus: 22, potassium: 28 },
    { time: '13:00', nitrogen: 70, phosphorus: 30, potassium: 40 },
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

  // Fetch real data from Wowki API (example, replace with actual API calls)
  useEffect(() => {
    async function fetchData() {
      // Simulated API call
      // const response = await fetch('API_URL');
      // const data = await response.json();
      // Update chart and table data with fetched values
      // setChartData(data.chartData);
      // setTableData(data.tableData);
    }
    fetchData();
  }, []);

  // Define pie chart colors
  const COLORS = ['#82ca9d', '#8884d8', '#ffc658'];

  return (
    <main className='main-container'>
      <div className='main-title'>
        <h3>DASHBOARD</h3>
      </div>

      <div className='charts'>
  <div>
    <h4>Real-Time NPK Monitoring</h4>
    <ResponsiveContainer width="100%" height={400}>

        
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" label={{ value: "Time", position: "insideBottom", offset: -5 }} />
        <YAxis label={{ value: "Levels", angle: -90, position: "insideLeft" }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="nitrogen" fill="#82ca9d" name="Nitrogen" />
        <Bar dataKey="phosphorus" fill="#8884d8" name="Phosphorus" />
        <Bar dataKey="potassium" fill="#ffc658" name="Potassium" />
      </BarChart>
    </ResponsiveContainer>
  </div>

  <div>
    <h4>Pie Chart: NPK Distribution</h4>
    <ResponsiveContainer width="95%" height={400}>
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