import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import './OverviewTab.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip);

const gridConfig = { color: '#e8e6e1', lineWidth: 0.5 };
const tickConfig = { color: '#6b6860', font: { size: 11, family: "'DM Mono', monospace" } };

export default function OverviewTab() {
  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [12000, 19500, 8000, 25000, 15000, 97750],
      backgroundColor: '#1a1916',
      borderRadius: 4,
      borderSkipped: false
    }]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: gridConfig, ticks: tickConfig, border: { color: '#e8e6e1' } },
      y: {
        grid: gridConfig,
        ticks: { ...tickConfig, callback: (v) => '$' + v.toLocaleString() },
        border: { color: '#e8e6e1' }
      }
    }
  };

  const donutData = {
    labels: ['Electronics', 'Furniture', 'Other'],
    datasets: [{
      data: [97, 2, 1],
      backgroundColor: ['#1a1916', '#888780', '#d5d3ce'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: { legend: { display: false } }
  };

  return (
    <div className="tab-panel active">
      {/* KPIs */}
      <div className="kpi-grid">
        <div className="card">
          <div className="kpi-label">Revenue / Chiffre d'affaires</div>
          <div className="kpi-value mono">$97,750</div>
        </div>
        <div className="card">
          <div className="kpi-label">Orders / Commandes</div>
          <div className="kpi-value mono">1</div>
        </div>
        <div className="card">
          <div className="kpi-label">Products / Produits</div>
          <div className="kpi-value mono">4</div>
        </div>
        <div className="card">
          <div className="kpi-label">Customers / Clients</div>
          <div className="kpi-value mono">2</div>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="two-col">
        <div className="card">
          <div className="card-title">Weekly Sales / Ventes hebdomadaires</div>
          <div className="chart-wrap">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="card">
          <div className="card-title">Products / Produits</div>
          <div className="product-list">
            <div className="product-item">
              <div>
                <span className="product-name">Laptop DZ Pro</span>
                <span className="badge blue">Electronics</span>
              </div>
              <span className="product-price mono">$97,500</span>
            </div>
            <div className="product-item">
              <div>
                <span className="product-name">test product</span>
                <span className="badge blue">Electronics</span>
              </div>
              <span className="product-price mono">$0</span>
            </div>
            <div className="product-item">
              <div>
                <span className="product-name">Office Chair X</span>
                <span className="badge amber">Furniture</span>
              </div>
              <span className="product-price mono">$250</span>
            </div>
            <div className="product-item">
              <div>
                <span className="product-name">Desk Lamp Pro</span>
                <span className="badge gray">Other</span>
              </div>
              <span className="product-price mono">$0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="card" style={{ maxWidth: '480px' }}>
        <div className="card-title">Sales by Category / Ventes par catégorie</div>
        <div className="donut-row">
          <div className="donut-wrap">
            <Doughnut data={donutData} options={donutOptions} />
          </div>
          <div className="donut-legend">
            <div className="legend-item">
              <div className="legend-dot" style={{ backgroundColor: '#1a1916' }}></div>
              Electronics — 97%
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ backgroundColor: '#888780' }}></div>
              Furniture — 2%
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ backgroundColor: '#d5d3ce' }}></div>
              Other — 1%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
