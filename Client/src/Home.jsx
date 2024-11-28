import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PieChart, Pie, Cell } from "recharts";

function Home() {
  // State to hold the chart data
  // const [chartData, setChartData] = useState([]);
  const [chartData, setChartData] = useState([]);

  // Sample data for Pie Chart (replace with real data)
  // const [pieData, setPieData] = useState([]);
  const [pieData, setPieData] = useState([
    { name: "Nitrogen", value: 60 },
    { name: "Phosphorus", value: 25 },
    { name: "Potassium", value: 15 },
  ]);

  // Sample table data (replace with real data)
  const [tableData, setTableData] = useState([]);
  const [crops, setCrops] = useState([]);

  // Establish socket connection
  useEffect(() => {
    const socket = io("http://localhost:5000");
    socket.on("new_data", (data) => {
      console.log(data);
      const soil_data = JSON.parse(data.data);
      console.log(soil_data);
      const prediction = data.prediction;
      const latestData = {
        time: new Date().toLocaleTimeString(), // Updating time for each new data
        N: soil_data.nitrogen,
        P: soil_data.phosphorus,
        K: soil_data.potassium,
        temperature: soil_data.temperature,
        humidity: soil_data.humidity,
        pH: soil_data.pHValue,
        moisture: soil_data.moisture,
        crop: prediction, // Latest crop prediction
      };

      console.log(latestData);

      // Update chartData to show only the latest 5 entries
      setChartData((prevData) => {
        const newData = [...prevData, latestData];
        return newData.length > 5 ? newData.slice(newData.length - 5) : newData;
      });

      // Update pie chart data
      setPieData([
        { name: "Nitrogen", value: soil_data.nitrogen },
        { name: "Phosphorus", value: soil_data.phosphorus },
        { name: "Potassium", value: soil_data.potassium },
      ]);

      // Update table data conditionally
      setTableData((prevTableData) => {
        // Compare the latest data with the last entry in tableData based on specific properties
        const lastEntry = prevTableData[prevTableData.length - 1];
        if (
          !lastEntry || // Add if tableData is empty
          lastEntry.N !== latestData.N ||
          lastEntry.P !== latestData.P ||
          lastEntry.K !== latestData.K ||
          lastEntry.temperature !== latestData.temperature ||
          lastEntry.humidity !== latestData.humidity ||
          lastEntry.moisture !== latestData.moisture
        ) {
          // Add the latestData only if it's different
          return [...prevTableData, latestData];
        }
        return prevTableData; // No update if data is the same
      });
    });

    // Clean up the connection
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (tableData.length > 0) {
      const lastEntry = tableData[tableData.length - 1];
  
      // Ensure `lastEntry` is valid
      if (lastEntry) {
        const filteredKeys = Object.keys(lastEntry).filter(
          (key) => key !== "time" && key !== "crop"
        );
  
        // Create a new object with the filtered keys
        const filteredData = filteredKeys.reduce((obj, key) => {
          obj[key] = lastEntry[key];
          return obj;
        }, {});
  
        axios
          .post(
            "https://crop-prediction-iot.onrender.com/predict",
            filteredData,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
          .then((response) => {
            setCrops(response.data); // Assuming the data contains an array of top 3 crops
          })
          .catch((error) =>
            console.error("Error fetching crop recommendations:", error)
          );
      }
    }
  }, [tableData]);
  

  const COLORS = ["#82ca9d", "#8884d8", "#ffc658"];

  return (
    <main className="main-container">
      <div className="main-title">
        <h3>DASHBOARD</h3>
      </div>

      <div className="charts">
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
              <Bar dataKey="N" fill="#82ca9d" name="Nitrogen" />
              <Bar dataKey="P" fill="#8884d8" name="Phosphorus" />
              <Bar dataKey="K" fill="#ffc658" name="Potassium" />
              <Bar dataKey="temperature" fill="#ff8042" name="Temperature" />
              <Bar dataKey="humidity" fill="#8dd1e1" name="Humidity" />
              <Bar dataKey="pH" fill="#a4de6c" name="pH" />
              <Bar dataKey="moisture" fill="#d0ed57" name="Moisture" />
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
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend
                layout="vertical" // Can also be "horizontal"
                align="right" // Position of the legend: "left", "center", "right"
                verticalAlign="middle" // Vertical positioning: "top", "middle", "bottom"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="table-container">
        <h4>Environmental Data and Best Crop</h4>
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Nitrogen (N)</th>
              <th>Phosphorus (P)</th>
              <th>Potassium (K)</th>
              <th>Temperature (°C)</th>
              <th>Humidity (%)</th>
              <th>Moisture (mm)</th>
              <th>pH</th>
              <th>Best Crop</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index}>
                <td>{row.time}</td>
                <td>{row.N}</td>
                <td>{row.P}</td>
                <td>{row.K}</td>
                <td>{row.temperature}</td>
                <td>{row.humidity}</td>
                <td>{row.moisture}</td>
                <td>{row.pH}</td>
                <td>{row.crop}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-container">
        <h4>Recommended Crops and Probabilities</h4>
        <table className="data-table">
          <thead>
            <tr>
              <th>Crop</th>
              <th>Probability (%)</th>
            </tr>
          </thead>
          <tbody>
            {crops.map((crop, index) => (
              <tr key={index}>
                <td>{crop.label}</td>
                <td>{(crop.probability * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default Home;
