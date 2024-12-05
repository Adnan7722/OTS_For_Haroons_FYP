import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import './App.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function Task({ task, moveTaskToNext }) {
  return (
    <div className="task" key={task.orderID}>
      <p>Order ID: {task.orderID}</p>
      <button onClick={() => moveTaskToNext(task)}>Move to Next</button>
    </div>
  );
}

function Column({ columnId, tasks, moveTaskToNext, searchTerm }) {
  const filteredTasks = tasks.filter((task) => {
    if (!searchTerm) {
      return true;
    }
    return task.orderID && task.orderID.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="column">
      <h2>{columnId}</h2>
      <PerfectScrollbar style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <Task key={`${task.orderID}-${columnId}`} task={task} moveTaskToNext={moveTaskToNext} />
          ))
        ) : (
          <div>No tasks available</div>
        )}
      </PerfectScrollbar>
    </div>
  );
}

function PieChart({ tasks }) {
  const taskCount = {
    orderReceived: tasks.orderReceived.length,
    cuttingGiven: tasks.cuttingGiven.length,
    cuttingReceived: tasks.cuttingReceived.length,
    stitchingGiven: tasks.stitchingGiven.length,
    stitchingReceived: tasks.stitchingReceived.length,
    sentToBranch: tasks.sentToBranch.length,
  };

  const data = {
    labels: Object.keys(taskCount),
    datasets: [
      {
        data: Object.values(taskCount),
        backgroundColor: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#8A2BE2'],
        hoverBackgroundColor: ['#FF6666', '#FFB84D', '#FFFF66', '#66FF66', '#6666FF', '#9B59B6'],
      },
    ],
  };

  return <Pie data={data} />;
}

function App() {
  const [tasks, setTasks] = useState({
    orderReceived: [],
    cuttingGiven: [],
    cuttingReceived: [],
    stitchingGiven: [],
    stitchingReceived: [],
    sentToBranch: [],
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newOrderDetails, setNewOrderDetails] = useState({ id: '', productName: '', fabric: '', embroidery: '' });
  const [isChartVisible, setIsChartVisible] = useState(false);

  // Handle adding a new order


  const handleAddNewOrder = async () => {
    if (!newOrderDetails.id || !newOrderDetails.productName || !newOrderDetails.fabric || !newOrderDetails.embroidery) {
      alert('Please fill out all fields.');
      return;
    }
    // Check if the order ID already exists
    if (Object.values(tasks).flat().some((task) => task.orderID === newOrderDetails.id)) {
      alert('Order ID already exists. Please enter a unique Order ID.');
      return;
    }
  
    const newOrder = {
      orderID: newOrderDetails.id,
      productName: newOrderDetails.productName,
      fabric: newOrderDetails.fabric,
      EMB: newOrderDetails.embroidery,
    };
  
    console.log(newOrder)
    // Save the new order to the backend (example API call)
    try {
      const response = await axios.post('http://localhost:5000/', newOrder, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.status === 201) {
        setTasks((prevTasks) => ({
          ...prevTasks,
          orderReceived: [...prevTasks.orderReceived, newOrder],
        }));
        alert('Order added successfully');
      } else {
        alert('Error adding order server hitted but not responded (APP.js)');
      }
    } catch (error) {
      alert('Error saving order -catch (APP.js)');
    }
  
    // Reset form
    setNewOrderDetails({ id: '', productName: '', fabric: '', embroidery: '' });
    setShowForm(false); // Close the form
  };
  

  const moveTaskToNext = (task) => {
    const columnIds = Object.keys(tasks);
    const currentColumnId = columnIds.find((columnId) =>
      tasks[columnId].some((taskInColumn) => taskInColumn.orderID === task.orderID)
    );

    // Prevent moving from the last column (sentToBranch)
    if (currentColumnId === 'sentToBranch') return;

    // Define the column order for task progression
    const columnOrder = [
      'orderReceived',
      'cuttingGiven',
      'cuttingReceived',
      'stitchingGiven',
      'stitchingReceived',
      'sentToBranch',
    ];

    // Get the index of the current column and calculate the next column
    const currentIndex = columnOrder.indexOf(currentColumnId);
    const nextColumnId = columnOrder[currentIndex + 1];

    // Update the tasks state
    const updatedTasks = { ...tasks };

    // Remove the task from the current column
    updatedTasks[currentColumnId] = updatedTasks[currentColumnId].filter(
      (taskInColumn) => taskInColumn.orderID !== task.orderID
    );

    // Add the task to the next column
    updatedTasks[nextColumnId] = [...updatedTasks[nextColumnId], task];

    // Set the updated state
    setTasks(updatedTasks);
  };

  return (
    <div>
      <h1>Order Tracking</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: '#f5f5f5', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', position: 'sticky', top: 0, zIndex: 1000 }}>
        {/* Add New Order Button */}
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease, transform 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#2980b9';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#3498db';
            e.target.style.transform = 'scale(1)';
          }}
        >
          Add New Order
        </button>

        {/* Search Bar */}
        <div style={{ width: '40%' }}>
          <input
            type="text"
            placeholder="Search by Order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
              transition: 'box-shadow 0.3s ease',
            }}
            onFocus={(e) => (e.target.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.2)')}
            onBlur={(e) => (e.target.style.boxShadow = '0px 2px 4px rgba(0, 0, 0, 0.1)')}
          />
        </div>

        {/* Show/Hide Chart Button */}
        <button
          onClick={() => setIsChartVisible(!isChartVisible)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4bc0c0',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease, transform 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#3ba9a9';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#4bc0c0';
            e.target.style.transform = 'scale(1)';
          }}
        >
          {isChartVisible ? 'Close Chart' : 'Show Chart'}
        </button>
      </div>

      {/* Pie Chart Popup */}
      {isChartVisible && (
        <div
          className="pie-chart-popup"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '300px',
            height: '300px',
            backgroundColor: '#fff',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            padding: '20px',
            zIndex: '9999',
            overflow: 'hidden',
          }}
        >
          <PieChart tasks={tasks} />
          <button
            onClick={() => setIsChartVisible(false)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'transparent',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            
          </button>
        </div>
      )}

      {/* Add Order Form (Modal) */}
      {showForm && (
        <div
          className="form-container"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '20px',
            backgroundColor: '#fff',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            zIndex: 10000,
          }}
        >
          <h3>Add New Order</h3>
          <input
            type="text"
            value={newOrderDetails.id}
            onChange={(e) => setNewOrderDetails({ ...newOrderDetails, id: e.target.value })}
            placeholder="Order ID"
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', marginBottom: '10px' }}
          />
          <input
            type="text"
            value={newOrderDetails.productName}
            onChange={(e) => setNewOrderDetails({ ...newOrderDetails, productName: e.target.value })}
            placeholder="Product Name"
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', marginBottom: '10px' }}
          />
          <label>Fabric (Yes/No):</label>
          <select
            value={newOrderDetails.fabric}
            onChange={(e) => setNewOrderDetails({ ...newOrderDetails, fabric: e.target.value })}
            style={{ padding: '10px', marginBottom: '10px' }}
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>

          <label>Embroidery (Yes/No):</label>
          <select
            value={newOrderDetails.embroidery}
            onChange={(e) => setNewOrderDetails({ ...newOrderDetails, embroidery: e.target.value })}
            style={{ padding: '10px', marginBottom: '20px' }}
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>

          <div>
            <button onClick={handleAddNewOrder} style={{ marginRight: '10px' }}>Confirm</button>
            <button onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="kanban-board">
        {Object.keys(tasks).map((columnId) => (
          <Column
            key={columnId}
            columnId={columnId}
            tasks={tasks[columnId]}
            moveTaskToNext={moveTaskToNext}
            searchTerm={searchTerm}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
