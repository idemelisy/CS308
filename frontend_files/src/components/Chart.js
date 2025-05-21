import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Chart = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [chartData, setChartData] = useState(null);

  const fetchChart = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    const formattedStart = `${startDate}T00:00:00Z`;
    const formattedEnd = `${endDate}T23:59:59Z`;

    try {
      const res = await fetch(`http://localhost:8080/sales-managers/get-chart?start_date=${formattedStart}&end_date=${formattedEnd}`);
      if (!res.ok) throw new Error("Failed to fetch chart data.");
      const data = await res.json();

      setChartData({
        labels: ["Revenue", "Cost", "Profit"],
        datasets: [
          {
            label: "USD ($)",
            data: [data.revenue, data.cost, data.profit],
            backgroundColor: ["#36A2EB", "#FF6384", "#4CAF50"],
          },
        ],
      });
    } catch (err) {
      console.error("Chart fetch error:", err);
      alert("Failed to load chart data.");
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Revenue / Profit Chart</h1>

      <div style={{ marginBottom: "2rem" }}>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ marginRight: "1rem", padding: "0.5rem" }}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ marginRight: "1rem", padding: "0.5rem" }}
        />
        <button
          onClick={fetchChart}
          style={{ padding: "0.5rem 1rem", backgroundColor: "#ff912b", color: "white", border: "none", borderRadius: "4px" }}
        >
          Generate Chart
        </button>
      </div>

      {chartData && (
        <div style={{ width: "60%", margin: "0 auto" }}>
          <Bar data={chartData} />
        </div>
      )}
    </div>
  );
};

export default Chart;
