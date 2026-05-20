import React, { useState, useEffect } from 'react';
import s from './detail.module.css';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { formatISO } from 'date-fns';
import 'chartjs-adapter-date-fns';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import jsonData from '../sample.json';
import { getChartData, getStocksPerc, getMarketStatus,Delete } from '../../user';
import LoadModal from '../New_Home/loading_modal';
import moment from 'moment-timezone';
import StockDropDown from './StockDropDown';
import { TemplateMakeAPort } from '../New_Make_A_Port/page';
import MakeAPort from '../../Edit/Edit'
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/joy/Grid';
import SecureStorage from 'react-secure-storage';
import { Tooltip } from '@mui/material';
import { getDetail, getUserById,createEmail, changeVis, requestApproval, AdvaithcreatePort,getLoginUsers,getportEdit} from '../../user'; 
Chart.register(...registerables);
// IgrFinancialChartModule.register();


function aggregateData(labels, data, unit, index) {
  let newIndex = index;
  const aggregatedData = {};
  let indexInterval;
  if(labels.length != 0){
  const indexDate = new Date(labels[index] * 1000);
  
  if (unit === 'day') {
    indexInterval = new Date(indexDate.getFullYear(), indexDate.getMonth(), indexDate.getDate(),16).toISOString();
  } else if (unit === 'hour') {
    indexInterval = new Date(indexDate.getFullYear(), indexDate.getMonth(), indexDate.getDate(), indexDate.getHours()).toISOString();
  } else if (unit === 'minute') {
    indexInterval = new Date(indexDate.getFullYear(), indexDate.getMonth(), indexDate.getDate(), indexDate.getHours(), indexDate.getMinutes()).toISOString();
  }
}
  
  labels.forEach((timestamp, index) => {
    const date = new Date(timestamp * 1000);
    let interval;
    if (unit === 'day') {
      interval = new Date(date.getFullYear(), date.getMonth(), date.getDate(),16).toISOString();
    } else if (unit === 'hour') {
      interval = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).toISOString();
    } else if (unit === 'minute') {
      interval = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()).toISOString();
    }
    
    if (!aggregatedData[interval]) {
      aggregatedData[interval] = { value: 0 };
    }
    
    aggregatedData[interval].value = data[index];
  });

  
  const aggregatedLabels = [];
  const aggregatedValues = [];
  for (const interval in aggregatedData) {
    aggregatedLabels.push(new Date(interval));
    aggregatedValues.push(aggregatedData[interval].value); // Average value for the day
  }
  if(indexInterval){
    newIndex = aggregatedLabels.map(date => date.toISOString()).indexOf(indexInterval);
  }
  
  
  return { aggregatedLabels, aggregatedValues, newIndex };
}


function LineGraph({ data, index, labels, unit }) {
  const aggregatedData = aggregateData(labels, data, unit, index);
  const dateLabels = aggregatedData.aggregatedLabels;
  const dataValues = aggregatedData.aggregatedValues;
  const newIndex = aggregatedData.newIndex;
  const datas = {
    labels: dateLabels,
    datasets: [
      {
        label: 'Back Test Data',
        data: dataValues,
        fill: false,
        // backgroundColor: '#949494',
        // borderColor: '#1B263B', // Default border color
        segment: {
          borderColor: (context) => {
            return context.p0DataIndex < newIndex ? "#949494" : '#1B263B';
          },
        },
          pointBackgroundColor: (context) => {
            return context.dataIndex === dataValues.length - 1 ? '#1B263B' : "#949494";
          },
          pointRadius: (context) => {
            return context.dataIndex === dataValues.length - 1 ? 5 : 0; // Make the last point radius bigger
          },
          pointBorderWidth: 0,
          pointBorderColor: 'transparent',
          
        cubicInterpolationMode: 'monotone',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        labels: {
          color: '#1B263B',
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: function (context) {
            const date = new Date(context[0].parsed.x);
            if (unit === 'day') {
              return date.toLocaleDateString()
            } else{
              return date.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
              });
            }
            
          },
          label: function (context) {
            const label = context.dataIndex < newIndex ? 'BackTest Data' : 'Live Data';
            const value = context.raw;
            return `${label}: ${value.toFixed(2)}`;
          },
          labelColor: function(context) {
            return {
              borderColor: context.dataIndex < newIndex ? "#949494" : '#1B263B',
              backgroundColor: context.dataIndex < newIndex ? "#949494" : '#1B263B',
            };
          }
        },
      },
    },
    // interaction: {
    //   mode: 'x',
    //   intersect: false,
    //   axis: 'xy',
    // },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: unit, // Adjust the unit as needed (e.g., 'minute', 'hour', 'day', 'month')
          tooltipFormat: 'PP', // Format for the tooltip
          displayFormats: {
            month: 'MMM yyyy',
            day: 'MMM d', // Format for the x-axis labels
            hour: 'd h a',
            minute: 'h:mm a',
            month: 'MMM yyyy',
          },
        },
        ticks: {
          callback: function(value, index, values) {
            const date = new Date(value);
            // get the day of the week
            const day = date.getDay();
            const hours = date.getHours();
            const minutes = value.getMinutes();
            // Filter out times between 4:30 PM and 9:30 AM
            if ((hours > 9 || (hours === 9 && minutes >= 30)) && (hours < 16)) {
              if (day === 0 || day === 6) {
                return null;
              } else {
                return value.toLocaleTimeString(); // Adjust this to your preferred time format
              }// Adjust this to your preferred time format
            }
            return null;
          }
        },
        title: {
          display: false,
          text: 'Date',
          color: '#1B263B',
        },
        ticks: {
          color: '#1B263B',
        },
      },
      y: {
        ticks: {
          display: true,
          text: 'Value',
          color: '#1B263B',
        },
        grid: {
          color: '#949494',
          borderColor: 'red',
        },
      },
    },
  };
  return (
    <div className={s.graphContainer}>
      <Line data={datas} options={options} className="canvas" />
    </div>
  );
};



function GrayedGraph({ data, index, labels, unit }) {
  const aggregatedData = aggregateData(labels, data, unit, index);
  const dateLabels = aggregatedData.aggregatedLabels;
  const dataValues = aggregatedData.aggregatedValues;
  const newIndex = aggregatedData.newIndex;
  const datas = {
    labels: dateLabels,
    datasets: [
      {
        label: 'Back Test Data',
        data: dataValues,
        fill: false,
        backgroundColor: '#949494',
        borderColor: '#949494',
        pointBackgroundColor: '#949494',
         // Default border color
          pointRadius: (context) => {
            return context.dataIndex === dataValues.length - 1 ? 5 : 0; // Make the last point radius bigger
          },
          pointBorderWidth: 0,
          pointBorderColor: 'transparent',
          
        cubicInterpolationMode: 'monotone',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        labels: {
          color: '#1B263B',
        },
      },
    },
    // interaction: {
    //   mode: 'x',
    //   intersect: false,
    //   axis: 'xy',
    // },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: unit, // Adjust the unit as needed (e.g., 'minute', 'hour', 'day', 'month')
          tooltipFormat: 'PP', // Format for the tooltip
          displayFormats: {
            month: 'MMM yyyy',
            day: 'MMM d', // Format for the x-axis labels
            hour: 'd h a',
            minute: 'h:mm a',
            month: 'MMM yyyy',
          },
        },
        ticks: {
          callback: function(value, index, values) {
            const date = new Date(value);
            // get the day of the week
            const day = date.getDay();
            const hours = date.getHours();
            const minutes = value.getMinutes();
            // Filter out times between 4:30 PM and 9:30 AM
            if ((hours > 9 || (hours === 9 && minutes >= 30)) && (hours < 16)) {
              if (day === 0 || day === 6) {
                return null;
              } else {
                return value.toLocaleTimeString(); // Adjust this to your preferred time format
              }// Adjust this to your preferred time format
            }
            return null;
          }
        },
        title: {
          display: true,
          text: 'Date',
          color: '#1B263B',
        },
        ticks: {
          color: '#1B263B',
        },
      },
      y: {
        ticks: {
          display: false,
          text: 'Value',
          color: '#1B263B',
        },
        grid: {
          color: '#949494',
          borderColor: 'red',
        },
      },
    },
  };
  return (
    <div className={s.graphContainer}>
      <Line data={datas} options={options} className="canvas" />
    </div>
  );
};

const InfoIcon = ({ title }) => (
  <Tooltip
    title={title}
    arrow
    leaveDelay={0}
    placement="left" // Position the tooltip to the left
  >
    <InfoOutlinedIcon
      sx={{
        fontSize: '20px',
        color: '#949494',
        marginRight: '5px',
      }}
    />
  </Tooltip>
);
const EditPendingPage = ({
  author,
  status,
  number_of_stocks,
  total_pnl,
  today_pnl,
  risk,
  max_drawdown,
  total_price,
  expense_ratio,
  start_value,
  description,
  investing,
  handleInvest,
  handleDivest,
  handleDenied,
  amount,
  setAmount,
  handleRequestApproval,
  error,
  reserve,
  roles,
  investment_date,
  creation_date,
  publish_date
}) => {





  function colorCode(value, type) {
    let color;
    let new_value;
    if (value > 0) {
      color = 'green';
      if (type === 'percent') {
        new_value = '+' + value + '%';
      } else if (type === 'dollar') {
        new_value = '+$' + value;
      }
    } else if (value < 0) {
      color = 'red';
      if (type === 'percent') {
        new_value = value + '%';
      } else if (type === 'dollar') {
        new_value = '-$' + value.toString().slice(1);
      }
    } else {
      color = '#1B263B';
    }
    return <span style={{ color: color }}>{new_value}</span>;
  }

  const [oldPort, setOldPort] = useState(null);
  const [newPort, setNewPort] = useState(null);
  const [loading, setLoading] = useState(true);
  const current_page = SecureStorage.getItem("Current Page");
  
  // Separate states for each portfolio
  const [selectedTimeframeOld, setSelectedTimeframeOld] = useState('1D');
  const [selectedTimeframeNew, setSelectedTimeframeNew] = useState('1D');
  const [priceHistOld, setPriceHistOld] = useState([]);
  const [priceHistNew, setPriceHistNew] = useState([]);
  const [dateObjectHistOld, setDateObjectHistOld] = useState([]);
  const [dateObjectHistNew, setDateObjectHistNew] = useState([]);
  const timeframes = ['1D', '5D', '1M', '6M', '1Y', 'MAX'];
  const [indexOld, setIndexOld] = useState(0);
  const [indexNew, setIndexNew] = useState(0);
  const [unitOld, setUnitOld] = useState('minute');
  const [unitNew, setUnitNew] = useState('minute');
  
  const [isOwner, setIsOwner] = useState(false);
  const [showStocks, setShowStocks] = useState(false);
  const [stockItems, setStockItems] = useState([]);
  const [editing, setEditing] = useState(false);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [totalPnl, setTotalPnl] = useState(0);
  const navigate = useNavigate();

  const handleApproved = async () => {
    // await getLoginUsers(author)
    // .then(f => {
    //   createEmail(f['email'],`Thank you for submitting your port “${author}” for review! Your port has been approved and is now public on the website.`,`${f['username']} Port Approval - ${author}`)
    // })
    // .catch(error => {
    //   console.error('Error fetching users:', error);
    // });

    const por = await getportEdit(SecureStorage.getItem('edit_port_id'));
    
    const s = por.stocks.join(" ");
    const pa = por.initPercentages.join(" ");
    const gad = por.positionTypes.join(" ");
    await  AdvaithcreatePort(por.title, por.author.username,s, pa, por.description, gad ,SecureStorage.getItem('original_port_id'),);
    await Delete(SecureStorage.getItem('edit_port_id'));
    SecureStorage.setItem("edit_pend",false);
    navigate("/secret_home")
  }


  
  const processChartData = (chartData, setDateObjectHist, setPriceHist, setIndex, timeframe) => {
    const dateObjectHist = [];
    const priceHist = [];
    
    for (let i = 0; i < chartData.date_hist.length; i++) {
      const dateStr = chartData.date_hist[i];
      const valueStr = chartData.value_hist[i];
      let dateObj = new Date(dateStr * 1000);
      
      dateObjectHist.push(dateObj);
      priceHist.push(parseFloat(valueStr));
    }
    
    setDateObjectHist(chartData.date_hist);
    setPriceHist(priceHist);
    const index = chartData.date_hist.indexOf(start_value);
    setIndex(index === -1 ? 0 : index);
    
    return timeframe === '1D' ? 'minute' 
         : timeframe === '5D' ? 'hour'
         : 'day';
  };

  useEffect(() => {
    const fetchChartData = async (portId, selectedTimeframe, isOld) => {
      const chart_data = await getChartData(
        current_page === 'My Ports' ? 'invest' : 'port',
        portId,
        SecureStorage.getItem('user_id'),
        selectedTimeframe
      );

      const unit = processChartData(
        chart_data,
        isOld ? setDateObjectHistOld : setDateObjectHistNew,
        isOld ? setPriceHistOld : setPriceHistNew,
        isOld ? setIndexOld : setIndexNew,
        selectedTimeframe
      );

      if (isOld) {
        setUnitOld(unit);
      } else {
        setUnitNew(unit);
      }
    };

    const oldPortId = SecureStorage.getItem('original_port_id');
    const newPortId = SecureStorage.getItem('edit_port_id');

    if (oldPortId) fetchChartData(oldPortId, selectedTimeframeOld, true);
    if (newPortId) fetchChartData(newPortId, selectedTimeframeNew, false);

  }, [selectedTimeframeOld, selectedTimeframeNew]);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const oldPortId = SecureStorage.getItem('original_port_id');
        const newPortId = SecureStorage.getItem('edit_port_id');
        
        const oldPortData = await getDetail('general', oldPortId, 0);
        const newPortData = await getDetail('general', newPortId, 0);
        
        setOldPort(oldPortData);
        setNewPort(newPortData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, []);

  const PortfolioColumn = ({ data, title, priceHist, dateObjectHist, selectedTimeframe, setSelectedTimeframe, index, unit }) => {
    if (!data) return null;
    
    return (
      <>
        <div>
          {priceHist.length > 0 && (
            <div className={s.timeframeContainer}>
              {timeframes.map((timeframe) => (
                <div
                  key={timeframe}
                  className={`${s.timeframeItem} ${selectedTimeframe === timeframe ? s.selected : ''}`}
                  onClick={() => setSelectedTimeframe(timeframe)}
                >
                  {timeframe}
                </div>
              ))}
            </div>
          )}
          {priceHist.length > 0 ? (
            <div className={s.graph}>
              {reserve != 0 && total_price == 0 ? (
                <GrayedGraph data={priceHist} labels={dateObjectHist} index={index} unit={unit} />
              ) : (
                <LineGraph data={priceHist} labels={dateObjectHist} index={index} unit={unit} />
              )}
            </div>
          ) : (
            <div className={s.no_graph}>PENDING</div>
          )}
        </div>

        <div className={s.portfolioColumn}>
          <h2 className={s.columnTitle}>{title}</h2>
          <div className={s.content_container}>
            <div className={s.quick_info_grid}>
              <div className={s.quick_info_label}>
                <InfoIcon title="Author of the portfolio"/>
                AUTHOR
              </div>
              <div className={s.quick_info_value}>
                {data.author}
                <div className={s.roles}>{data.roles}</div>
              </div>

              <div className={s.quick_info_label}>
                <InfoIcon title="Number of stocks in portfolio"/>
                STOCKS
              </div>
              <div className={s.quick_info_value}>{data.number_of_stocks}</div>

              <div className={s.quick_info_label}>
                <InfoIcon title="Current portfolio value"/>
                VALUE
              </div>
              <div className={s.quick_info_value}>${data.total_price}</div>

              <div className={s.quick_info_label}>
                <InfoIcon title="Annual return percentage"/>
                ANNUAL RETURN
              </div>
              <div className={s.quick_info_value}>
                {data.total_pnl && colorCode(data.total_pnl.toFixed(1), 'percent')}
              </div>

              <div className={s.quick_info_label}>
                <InfoIcon title="Daily price change"/>
                DAILY CHANGE
              </div>
              <div className={s.quick_info_value}>
                {data.today_pnl && colorCode(data.today_pnl, 'dollar')}
              </div>

              <div className={s.quick_info_label}>
                <InfoIcon title="Risk assessment score"/>
                RISK INDEX
              </div>
              <div className={s.quick_info_value}>{data.risk}/5</div>

              <div className={s.quick_info_label}>
                <InfoIcon title="Portfolio creation date"/>
                CREATION DATE
              </div>
              <div className={s.quick_info_value}>{data.creation_date}</div>

              <div className={s.quick_info_label_last}>
                <InfoIcon title="Portfolio expense ratio"/>
                EXPENSE RATIO
              </div>
              <div className={s.quick_info_value_last}>{data.expense_ratio}%</div>
            </div>
            <div className={s.description_container}>
              <textarea 
                className={s.desc} 
                value={data.description} 
                readOnly
              ></textarea>
            </div>
          </div>
        </div>
      </>
    );
  };

  if (loading) {
    return <LoadModal />;
  }

  return (
    <div className={s.editPendingContainer}>
      <div className={s.editPendingHeader}>
        <h1>Portfolio Edit Comparison</h1>
        <p>Review the changes between the original and edited portfolio</p>
      </div>
      <div className={s.comparisonContainer}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <PortfolioColumn 
              data={oldPort} 
              title="Original Portfolio"
              priceHist={priceHistOld}
              dateObjectHist={dateObjectHistOld}
              selectedTimeframe={selectedTimeframeOld}
              setSelectedTimeframe={setSelectedTimeframeOld}
              index={indexOld}
              unit={unitOld}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <PortfolioColumn 
              data={newPort} 
              title="Edited Portfolio"
              priceHist={priceHistNew}
              dateObjectHist={dateObjectHistNew}
              selectedTimeframe={selectedTimeframeNew}
              setSelectedTimeframe={setSelectedTimeframeNew}
              index={indexNew}
              unit={unitNew}
            />
          </Grid>
        </Grid>
        <div className={s.button_container}>
            {current_page === 'Secret' ? <button className={s.button} onClick={handleApproved}>APPROVE</button> : 
            <button className={s.button} onClick={handleInvest}>BUY</button>}
            {current_page === "My Ports" && (
              <button className={s.button} onClick={handleDivest}>SELL</button>
            )}
            {current_page === "Secret" && (
              <button className={s.button} onClick={handleDenied}>DENY</button>
            )}
          </div>
      </div>
    </div>
  );
};



function Detail({ author, 
  status, 
  number_of_stocks, 
  total_pnl, today_pnl, 
  risk, max_drawdown, 
  total_price, 
  expense_ratio, 
  start_value, 
  description, 
  investing, 
  handleInvest, 
  handleDivest, 
  amount, 
  setAmount, 
  handleRequestApproval, 
  handleApproved, 
  handleDenied, 
  loading,
error,
reserve,
roles,
investment_date,
creation_date,
publish_date


}) {
  const current_page = SecureStorage.getItem("Current Page");
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [priceHist, setPriceHist] = useState([]);
  const [dateObjectHist, setDateObjectHist] = useState([]);
  const timeframes = ['1D', '5D', '1M', '6M', '1Y', 'MAX'];
  const [index, setIndex] = useState(0);
  const [unit, setUnit] = useState('minute');
  const [isOwner, setIsOwner] = useState(false);
  const [showStocks, setShowStocks] = useState(false);
  const [stockItems, setStockItems] = useState([]);
  const [editing , setEditing] = useState(false);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [totalPnl, setTotalPnl] = useState(0);
  const navigate = useNavigate();

  class StockItem {
    constructor(date, open) {
      this.date = date;
      this.open = open;
    }
  }

  
  const Felete = async () => {
    await Delete(SecureStorage.getItem('port_id'));
    navigate('/home')
  }
  useEffect( () => {



    setTotalPnl(100*((total_price/(total_price-total_pnl))**(1/2)-1));
    const checkOwner = async() => {
      if(SecureStorage.getItem('username') == author){
        setStockItems(await getStocksPerc(SecureStorage.getItem('port_id')));
        setIsOwner(true);
      }
    }
    const fetchIsMarketOpen = async () => {
      const marketStatus = await getMarketStatus();
      setIsMarketOpen(marketStatus);
    }

    const fetchChartData = async () => {
      let chart_data;
    if(current_page === 'My Ports'){
      chart_data = await getChartData(SecureStorage.getItem('port_id'), selectedTimeframe);
    }else{
      chart_data = await getChartData(SecureStorage.getItem('port_id'), selectedTimeframe);
    }
 
    const dateObjectHist = [];
    const priceHist = [];
 
 

    chart_data.forEach(entry => {
      dateObjectHist.push(entry[0]);
      priceHist.push(entry[1]);
  });

    setDateObjectHist(dateObjectHist);
    setPriceHist(priceHist);
    if(index == -1){
      if(start_value == 0){
        setIndex(0);
      }
      setIndex(0);
    } else{
      setIndex(index);
    }
  };
  fetchChartData();
  checkOwner();
  fetchIsMarketOpen();
    


  }, [total_price,selectedTimeframe]);
  
  const handleshowStocks = () => {
    setShowStocks(!showStocks);
  }
  const handleEdit = () => {
    //navigate('/portfolioManager')
    setEditing(!editing);
  }

    
  

  if (roles == null){
    roles = [];
  }
  const rolesStrFmt = roles.map((role) => {
    return(
    
    <React.Fragment>
        <span className={s.role}>{role}</span>
    </React.Fragment>
    );
  });

  function colorCode(value, type){
    let color;
    let new_value;
    if (value > 0){
      color = 'green';
      if (type === 'percent'){
        new_value = '+' + value + '%';
      }else if (type === 'dollar'){
        new_value = '+$' + value;
      }
    }
    else if (value < 0){
      color = 'red';
      if (type === 'percent'){

        new_value = value + '%';
      }else if (type === 'dollar'){
        new_value = '-$'+ value.toString().slice(1);
      }
    }else{
      color = '#1B263B';
    }
    return <span style={{color: color}}>{new_value}</span>;
  }

  

  if (SecureStorage.getItem('edit_pend')) {
 
    return (
      <EditPendingPage 
        author={author}
        status={status}
        number_of_stocks={number_of_stocks}
        total_pnl={total_pnl}
        today_pnl={today_pnl}
        risk={risk}
        max_drawdown={max_drawdown}
        total_price={total_price}
        expense_ratio={expense_ratio}
        start_value={start_value}
        description={description}
        investing={investing}
        amount={amount}
        setAmount={setAmount}
        handleRequestApproval={handleRequestApproval}
        handleApproved={handleApproved}
        handleDenied={handleDenied}
        error={error}
        reserve={reserve}
        roles={roles}
        investment_date={investment_date}
        creation_date={creation_date}
        publish_date={publish_date}
      />
    );
  } else  {
    
  }

  return (
    <>
    {loading && <LoadModal />}
    <div className={s.background}>

         

           {/* <SideMenu/> */}

      
      <Grid container spacing={2} sx={{ flexGrow: 1, paddingLeft: '10px', paddingRight: '10px' }}>
      
      {/* <div className={s.grid_container}> */}
      <Grid item md={6} sm={12}>
        <div>
        {priceHist.length > 0 && (<div className={s.timeframeContainer}>
      {timeframes.map((timeframe) => (
        <div
          key={timeframe}
          className={`${s.timeframeItem} ${selectedTimeframe === timeframe ? s.selected : ''}`}
          onClick={() => setSelectedTimeframe(timeframe)}
        >
          {timeframe}
        </div>
      ))}
    </div>)}
    {priceHist.length > 0 ? (<div className={s.graph}>
      {reserve != 0 && total_price == 0 ? (<GrayedGraph data={priceHist} labels={dateObjectHist} index={index} unit={unit} />) : (<LineGraph data={priceHist} labels={dateObjectHist} index={index} unit={unit} />)}
      {/* <LineGraph data={priceHist} labels={dateObjectHist} index={index} unit={unit} /> */}
            </div>) : <div className={s.no_graph}>PENDING</div>}
        </div>
      </Grid>
      <Grid item md={6} sm={12} sx={{
        display: 'flex',
        justifyContent: 'center',
      }}>
        <div className={s.content_container}>
          <div className={s.quick_info_grid}>
            <div className={s.quick_info_label}><InfoIcon 
            title="creator of the port tags DEV = a developer of ports PHD = phd in related fied of business/finance, MBA = masters in busines, 7 = Series 7 License"
            />AUTHOR</div>
            <div className={s.quick_info_value}>{author}<div className={s.roles}>{rolesStrFmt}</div></div>
            {current_page === 'My Ports' &&
              <div className={s.quick_info_label}>STATUS</div>
              
            }
            {current_page === 'My Ports' &&
              <div className={s.quick_info_value}>{status}</div>
            }
            {/* isOwner &&  */}
            <>
             <div className={s.quick_info_label}><InfoIcon title= "the companies that are being invested within the port"/>{isOwner && (<div className={s.stock_button_m} onClick={handleshowStocks}>{showStocks ? '▼' : '►'}</div>)} STOCKS</div></>
            <div className={s.quick_info_value}>{number_of_stocks}</div>



            {showStocks&&(<StockDropDown data ={stockItems}/>)}
            <div className={s.quick_info_label}><InfoIcon title = "This is NOT the price of the portfolio to invest but more a perspective of how much the portfolio has grown starting from 100$"/>VALUE</div>
            <div className={s.quick_info_value}>${total_price}</div>
            <div className={s.quick_info_label}><InfoIcon title = "this rough estimation of percent growth per year using backtest data"/>ANNUAL RETURN</div>
            <div className={s.quick_info_value}>{colorCode(totalPnl.toFixed(1),'percent')}</div>
            <div className={s.quick_info_label}><InfoIcon title = "change this represents the change in percent from its value last market close to the current time"/>DAILY CHANGE</div>
            <div className={s.quick_info_value}>{colorCode(today_pnl,'dollar')}</div>
            <div className={s.quick_info_label}><InfoIcon title = "A score that determines the volatility of the particular portfolio"/>RISK INDEX</div>
            <div className={s.quick_info_value}>{risk}/5</div>
            {/* <div className={s.quick_info_label}>MAX DRAWDOWN</div>
            <div className={s.quick_info_value}>${max_drawdown}</div> */}
            <div className={s.quick_info_label}><InfoIcon title = ""/>CREATION DATE</div>
            <div className={s.quick_info_value}>{creation_date}</div>
            {investment_date &&(<><div className={s.quick_info_label}><InfoIcon title = ""/>INVESTMENT DATE</div>
            <div className={s.quick_info_value}>{investment_date}</div></>)}
            {publish_date && (<><div className={s.quick_info_label}><InfoIcon title = ""/>PUBLISH DATE</div>
            <div className={s.quick_info_value}>{publish_date}</div></>)}
            <div className={s.quick_info_label_last}><InfoIcon title = ""/>EXPENSE RATIO</div>
            <div className={s.quick_info_value_last}>{expense_ratio}%</div>
          </div>
          <div className={s.action_container}>
          {/* <div>Invest Amount</div> */}
           <div className={s.input_container}>{/*$<input className={s.input} value={amount} onChange={(e) => setAmount(e.target.value)}></input>  */}
          {reserve != 0 && (
              <div className={s.reserve}>
                {reserve > 0 ? `BUYING ${reserve.toFixed(2)} @ OPEN (9:30 EST)` : `SELLING ${(-reserve).toFixed(2)} @ OPEN (9:30 EST)`}
                
                </div>
            )}
            </div>
          <div className={s.button_container}>
            {current_page === 'Secret' ? <button className={s.button} onClick={handleApproved}>APPROVE</button> : 
            <button className={s.button} onClick={handleInvest}>BUY</button>}
            {current_page === "My Ports" && (
              <button className={s.button} onClick={handleDivest}>SELL</button>
            )}
            {current_page === "Secret" && (
              <button className={s.button} onClick={handleDenied}>DENY</button>
            )}
          </div>
          
          {/* <div>{error}</div> */}
          <textarea className={s.desc} value={description} readOnly></textarea>
          {status == "PRIVATE" && <button className={s.button} onClick={handleRequestApproval}>REQUEST TO GO PUBLIC</button>}
          {roles.includes('DEV') && isOwner && <button className={s.button} onClick={handleEdit}>{!editing ? "ENTER " : "EXIT "}EDIT MODE</button>}
          {isOwner && <button className={s.button} onClick={Felete}>Delete Port</button>}
        </div>
        </div>
        </Grid>
      {/* </div> */}
      </Grid>
      {editing && (<MakeAPort index={true}/>)}
    </div>
    </>
  );
}

export default Detail;
