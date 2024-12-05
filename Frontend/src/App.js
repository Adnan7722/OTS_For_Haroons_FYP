import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const columnNames = {
  orderReceived: 'Order Received',
  cuttingGiven: 'Cutting Given',
  cuttingReceived: 'Cutting Received',
  stitchingGiven: 'Stitching Given',
  stitchingReceived: 'Stitching Received',
  sentToBranch: 'Sent to Branch',
};

const columnMapping = {
  orderReceived: 1,
  cuttingGiven: 2,
  cuttingReceived: 3,
  stitchingGiven: 4,
  stitchingReceived: 5,
  sentToBranch: 6,
};

const Button = ({ children, onClick, variant = 'default', size = 'md' }) => (
  <button className={`button ${variant} ${size}`} onClick={onClick}>
    {children}
  </button>
);

const Input = ({ type, placeholder, value, onChange }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className="input"
  />
);

const Select = ({ value, onChange, options, placeholder }) => (
  <select value={value} onChange={onChange} className="select">
    <option value="">{placeholder}</option>
    {options.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{title}</h2>
        {children}
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

const Task = ({ task, moveTaskToNext, showDetails, onRemove }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="task"
  >
    <p className="task-id">Order ID: {task.orderID}</p>
    <div className="task-actions">
      {task.columnId === 'sentToBranch' ? (
        <>
          <Button onClick={() => showDetails(task)} variant="outline" size="sm">
            Details
          </Button>
          <Button onClick={() => onRemove(task.orderID)} variant="destructive" size="sm">
            Remove
          </Button>
        </>
      ) : (
        <>
          <Button onClick={() => showDetails(task)} variant="outline" size="sm">
            Details
          </Button>
          <Button onClick={() => moveTaskToNext(task)} variant="default" size="sm">
            Move
          </Button>
        </>
      )}
    </div>
  </motion.div>
);

const Column = ({ columnId, tasks, moveTaskToNext, searchTerm, showDetails, onRemove }) => {
  const filteredTasks = tasks.filter((task) =>
    task.orderID && task.orderID.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="column">
      <h2>{columnNames[columnId]}</h2>
      <div className="task-list">
        <AnimatePresence>
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <Task
                key={`${task.orderID}-${columnId}`}
                task={{ ...task, columnId }}
                moveTaskToNext={moveTaskToNext}
                showDetails={showDetails}
                onRemove={onRemove}
              />
            ))
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="no-tasks"
            >
              No tasks available
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const PieChart = ({ tasks }) => {
  const taskCount = Object.fromEntries(
    Object.entries(tasks).map(([key, value]) => [columnNames[key], value.length])
  );

  const data = {
    labels: Object.keys(taskCount),
    datasets: [
      {
        data: Object.values(taskCount),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return <Pie data={data} />;
};

const OrderTracking = () => {
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
  const [showMovePopup, setShowMovePopup] = useState(false);
  const selectedTaskRef = useRef(null);
  const [masterName, setMasterName] = useState('');
  const [karigarName, setKarigarName] = useState('');
  const [branch, setBranch] = useState('');
  const [gatePassNo, setGatePassNo] = useState('');
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [taskDetails, setTaskDetails] = useState(null);

  const masterNames = [
    "Ismail Sb", "Sajid Sb", "Ashfaq Sb", "Mubashir Sb",
    "Bilal Khussa", "Dilwar Turban", "Mahad Shoes"
  ];

  const karigarNames = [
    "Ehsan Sb", "Pervaiz", "Usman", "H. Shahbaz", "Mansoor",
    "Azhar", "Farman", "Amjad Sb", "Waqas", "Zeeshan",
    "Nisar Khan", "Tufail", "Ajmal", "Khurram", "Arif",
    "Shahbaz S/S", "Usman S/S", "Awais Shoes",
    "Bilal Khussa", "Dilwar Turban", "Ismail Sb",
    "Sajid Sb", "Mahad Shoes"
  ];

  const productNames = [
    "Sherwani",
    "Prince Coat",
    "Pant Coat",
    "Waist Coat",
    "Shalwar Suit",
    "Kurta Trouser",
    "Sherwani Kurta",
    "Kurta",
    "Trouser",
    "Shalwar",
    "Tuxedo",
    "Dress Shirt",
    "Tie",
    "Bow Tie",
    "Khussa",
    "Turban",
    "Shoes",
    "Pocket Square",
    "Shawl",
    "Tuxedo Shirt",
    "Pant",
    "Mala",
    "Coat",
    "3pc Waist Coat",
    "2pc Coat",
    "2pc Pant",
    "Prince Suit",
    "Tuxedo Coat",
    "Thobe",
    "Tuxedo Belt",
    "Lengha",
    "Top Blouse",
    "Dupatta",
    "Patiala Shalwar"
  ];


  const branches = ["Emporium", "Fortress F1", "Warehouse"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          ordersReceivedData,
          cuttingGivenData,
          cuttingReceivedData,
          stitchingGivenData,
          stitchingReceivedData,
          sentToBranchData
        ] = await Promise.all([
          axios.get('http://localhost:5000/GET_ORF'),
          axios.get('http://localhost:5000/GET_CG'),
          axios.get('http://localhost:5000/GET_CR'),
          axios.get('http://localhost:5000/GET_SG'),
          axios.get('http://localhost:5000/GET_SR'),
          axios.get('http://localhost:5000/GET_STB')
        ]);

        setTasks({
          orderReceived: ordersReceivedData.data || [],
          cuttingGiven: cuttingGivenData.data || [],
          cuttingReceived: cuttingReceivedData.data || [],
          stitchingGiven: stitchingGivenData.data || [],
          stitchingReceived: stitchingReceivedData.data || [],
          sentToBranch: sentToBranchData.data || []
        });
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchData();
  }, []);

  const showDetails = async (task) => {
    try {
      let response;
      switch (task.columnId) {
        case 'orderReceived':
          response = await axios.get(`http://localhost:5000/GET_ORF/${task.orderID}`);
          break;
        case 'cuttingGiven':
          response = await axios.get(`http://localhost:5000/GET_CG/${task.orderID}`);
          break;
        case 'cuttingReceived':
          response = await axios.get(`http://localhost:5000/GET_CR/${task.orderID}`);
          break;
        case 'stitchingGiven':
          response = await axios.get(`http://localhost:5000/GET_SG/${task.orderID}`);
          break;
        case 'stitchingReceived':
          response = await axios.get(`http://localhost:5000/GET_SR/${task.orderID}`);
          break;
        case 'sentToBranch':
          response = await axios.get(`http://localhost:5000/GET_STB/${task.orderID}`);
          break;
        default:
          throw new Error('Unknown column');
      }
      const sanitizedData = sanitizeResponse(response.data);
      setTaskDetails(sanitizedData);
      setShowDetailsPopup(true);
    } catch (error) {
      console.error('Error fetching task details:', error);
      alert('Failed to fetch task details');
    }
  };

  const sanitizeResponse = (data) => {
    const { _id, __v, ...rest } = data;

    return Object.entries(rest).reduce((acc, [key, value]) => {
      if (key.includes('Date') && value) {
        const date = new Date(value);
        acc[key] = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      } else if (typeof value === 'boolean') {
        acc[key] = value ? 'Yes' : 'No';
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});
  };

  const removeTask = async (orderID) => {
    try {
      await axios.delete(`http://localhost:5000/DELETE_STB/${orderID}`);
      setTasks((prevTasks) => ({
        ...prevTasks,
        sentToBranch: prevTasks.sentToBranch.filter(task => task.orderID !== orderID),
      }));
    } catch (error) {
      console.error('Error removing task:', error);
      alert('Failed to remove task');
    }
  };

  const handleAddNewOrder = async () => {
    if (!newOrderDetails.id || !newOrderDetails.productName || !newOrderDetails.fabric || !newOrderDetails.embroidery) {
      alert('Please fill out all fields.');
      return;
    }

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

    try {
      const response = await axios.post('http://localhost:5000/', newOrder);
      if (response.status === 201) {
        setTasks((prevTasks) => ({
          ...prevTasks,
          orderReceived: [...prevTasks.orderReceived, newOrder],
        }));
      } else {
        alert('Error adding order: Server responded but not as expected');
      }
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Error saving order');
    }

    setNewOrderDetails({ id: '', productName: '', fabric: '', embroidery: '' });
    setShowForm(false);
  };

  const moveTaskToNext = (task) => {
    selectedTaskRef.current = task;

    if (tasks.cuttingGiven.some(t => t.orderID === task.orderID)) {
      confirmMoveTask(columnMapping.cuttingGiven);
    } else {
      setShowMovePopup(true);
    }
  };

  const confirmMoveTask = async (currentColumnId) => {
    const selectedTask = selectedTaskRef.current;
    

    if (!selectedTask) {
      alert('No task selected for moving.');
      return;
    }

    try {
      let updatedTask;
      let sourceColumn;
      let targetColumn;

      switch (currentColumnId) {
        case columnMapping.orderReceived:
          sourceColumn = 'orderReceived';
          targetColumn = 'cuttingGiven';
          updatedTask = await moveTaskBetweenColumns('GET_ORF', 'DELETE_ORF', 'POST_CG', selectedTask.orderID, { masterName });
          break;
        case columnMapping.cuttingGiven:
          sourceColumn = 'cuttingGiven';
          targetColumn = 'cuttingReceived';
          updatedTask = await moveTaskBetweenColumns('GET_CG', 'DELETE_CG', 'POST_CR', selectedTask.orderID);
          break;
        case columnMapping.cuttingReceived:
          sourceColumn = 'cuttingReceived';
          targetColumn = 'stitchingGiven';
          updatedTask = await moveTaskBetweenColumns('GET_CR', 'DELETE_CR', 'POST_SG', selectedTask.orderID, { karigarName });
          break;
        case columnMapping.stitchingGiven:
          sourceColumn = 'stitchingGiven';
          targetColumn = 'stitchingReceived';
          updatedTask = await moveTaskBetweenColumns('GET_SG', 'DELETE_SG', 'POST_SR', selectedTask.orderID);
          break;
        case columnMapping.stitchingReceived:
          sourceColumn = 'stitchingReceived';
          targetColumn = 'sentToBranch';
          updatedTask = await moveTaskBetweenColumns('GET_SR', 'DELETE_SR', 'POST_STB', selectedTask.orderID, { branch, gatePassNo });
          await axios.post('http://localhost:5000/ADD_MASTER_ORDER', updatedTask);
          break;
        default:
          throw new Error('Invalid current column ID');
      }

      setTasks((prevTasks) => ({
        ...prevTasks,
        [targetColumn]: [...prevTasks[targetColumn], updatedTask],
        [sourceColumn]: prevTasks[sourceColumn].filter(task => task.orderID !== selectedTask.orderID)
      }));

      setShowMovePopup(false);
      setMasterName('');
      setKarigarName('');
      setBranch('');
      setGatePassNo('');
      selectedTaskRef.current = null;

    } catch (error) {
      console.error(error);
      alert('Error moving task');
    }
  };

  const moveTaskBetweenColumns = async (getEndpoint, deleteEndpoint, postEndpoint, orderID, additionalData = {}) => {
    const response = await axios.get(`http://localhost:5000/${getEndpoint}/${orderID}`);
    const existingOrder = response.data;

    await axios.delete(`http://localhost:5000/${deleteEndpoint}`, { data: { orderID } });

    const updatedTask = { ...existingOrder, ...additionalData };
    await axios.post(`http://localhost:5000/${postEndpoint}`, updatedTask);

    return updatedTask;
  };

  const downloadMasterOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/download-master-orders', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'master_orders.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading master orders:', error);
      alert('Failed to download master orders');
    }
  };

  return (
    <div className="container">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="title"
      >
        Haroons Designer - Order Tracking
      </motion.h1>
      
      <div className="actions">
        
        <Button onClick={() => setShowForm(true)}>
          Add New Order
        </Button>
        <Input
          type="text"
          placeholder="Search by Order ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />


        <Button onClick={() => setIsChartVisible(!isChartVisible)}>
          {isChartVisible ? 'Close' : 'Show'} Chart
        </Button>
        
        <Button onClick={downloadMasterOrders}>
          Download Master Orders
        </Button>
        
      </div>
     

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add New Order">
        <Input
          type="text"
          placeholder="Order ID"
          value={newOrderDetails.id}
          onChange={(e) => setNewOrderDetails({ ...newOrderDetails, id: e.target.value })}
        />
    

        <Select
          value={newOrderDetails.productName}
          onChange={(e) => setNewOrderDetails({ ...newOrderDetails, productName: e.target.value })}
          options={productNames}
          placeholder="Select a Product"
        />

        <Select
          value={newOrderDetails.fabric}
          onChange={(e) => setNewOrderDetails({ ...newOrderDetails, fabric: e.target.value })}
          options={['yes', 'no']}
          placeholder="Fabric"
        />
        <Select
          value={newOrderDetails.embroidery}
          onChange={(e) => setNewOrderDetails({ ...newOrderDetails, embroidery: e.target.value })}
          options={['yes', 'no']}
          placeholder="Embroidery"
        />
        <Button onClick={handleAddNewOrder}>Confirm</Button>
      </Modal>

      <Modal isOpen={isChartVisible} onClose={() => setIsChartVisible(false)} title="Order Status Overview">
        <PieChart tasks={tasks} />
      </Modal>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="kanban-board"
      >
        {Object.keys(tasks).map((columnId) => (
          <Column
            key={columnId}
            columnId={columnId}
            tasks={tasks[columnId]}
            moveTaskToNext={moveTaskToNext}
            searchTerm={searchTerm}
            showDetails={showDetails}
            onRemove={removeTask}
          />
        ))}
      </motion.div>

      <Modal isOpen={showMovePopup} onClose={() => setShowMovePopup(false)} title="Move Task">
        {(() => {
          const currentColumnId = Object.keys(columnMapping).find(columnId => tasks[columnId].some(t => t.orderID === selectedTaskRef.current?.orderID));

          switch (currentColumnId) {
            case 'orderReceived':
              return (
                <Select
                  value={masterName}
                  onChange={(e) => setMasterName(e.target.value)}
                  options={masterNames}
                  placeholder="Select Master Name"
                />
              );
            case 'cuttingReceived':
              return (
                <Select
                  value={karigarName}
                  onChange={(e) => setKarigarName(e.target.value)}
                  options={karigarNames}
                  placeholder="Select Karigar Name"
                />
              );
            case 'stitchingReceived':
              return (
                <>
                  <Select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    options={branches}
                    placeholder="Select Branch"
                  />
                  <Input
                    type="text"
                    placeholder="Gate Pass No."
                    value={gatePassNo}
                    onChange={(e) => setGatePassNo(e.target.value)}
                  />
                </>
              );
            default:
              return null;
          }
        })()}
       <Button
        onClick={() => {

          const currentColumnId = Object.keys(columnMapping).find(columnId => tasks[columnId].some(t => t.orderID === selectedTaskRef.current?.orderID));

          if (currentColumnId==='orderReceived' && !masterName)  {
            alert("Please select Master Name!");
            return;
          }

        else if(currentColumnId==='cuttingReceived' &&  !karigarName)
          {
            alert("Please select Karigar Name!");
            return;


          }
          
          else if(currentColumnId==='stitchingReceived' && ( !branch || !gatePassNo ) )
            {
              alert("Please select all fields!");
  
              return;
  
            }


          confirmMoveTask(
            columnMapping[
              Object.keys(columnMapping).find(columnId =>
                tasks[columnId].some(t => t.orderID === selectedTaskRef.current?.orderID)
              )
            ]
          );
        }}
      >
        Confirm Move
      </Button>
      </Modal>

      <Modal isOpen={showDetailsPopup} onClose={() => setShowDetailsPopup(false)} title="Task Details">
        {taskDetails ? (
          <div className="task-details">
            {Object.entries(taskDetails).map(([key, value]) => (
              <div key={key} className="detail-item">
                <span className="detail-label">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                <span className="detail-value">{value}</span>
              </div>
            ))}
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </Modal>
    </div>
  );
};

export default OrderTracking;