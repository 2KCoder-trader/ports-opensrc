import React, {useEffect, useState} from 'react';
import style from './creation_graph.module.css';
import { Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import Grid from '@mui/joy/Grid';

Chart.register(...registerables);

function aggregateData(labels, data) {
    const aggregatedLabels = [];
    const aggregatedValues = [];
    for (let i = 0; i < labels.length; i++) {
      const date = new Date(labels[i]*1000);
      // const interval = date.toDateString();
      aggregatedLabels.push(date);
      aggregatedValues.push(data[i]);
    }
    
    
    return { aggregatedLabels, aggregatedValues };
  }
  
  
  function CreationGraph({ dataa, labels }) {
    const aggregatedData = aggregateData(labels, dataa);
    const dateLabels = aggregatedData.aggregatedLabels;
    const dataValues = aggregatedData.aggregatedValues;
 
    const data = {
      labels: dateLabels,
      datasets: [
        {
          label: 'Sample Data',
          data: dataValues,
          fill: false,
          backgroundColor: '#1B263B',
          borderColor: '#1B263B', // Default border color
          pointRadius: 0,
          pointBackgroundColor: '#1B263B',
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
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day', // Adjust the unit as needed (e.g., 'minute', 'hour', 'day', 'month')
            displayFormats: {
                day: 'MMM d, yy', // Format for the x-axis labels
              }, // Adjust the display format as needed (e.g., 'MMM D, YYYY')
               // Adjust the unit step size as needed
          },
          ticks: {
            color: '#1B263B',
            font: (context) => {
              const width = context.chart.width;
              let size = Math.round(width / 75);
              size = size > 20 ? 20 : size; // Set a maximum font size
              size = size < 8 ? 8 : size; // Set a minimum font size
              return {
                size: size,
              };
            },
          },
          grid: {
            color: '#949494',
            borderColor: 'red',
            drawBorder: false, // Remove the border line on the right
            // borderDash: [0, 0], // Customize the grid line style
            drawOnChartArea: false, // Remove the grid lines within the chart area
            drawTicks: false, // Remove the ticks on the grid lines
            lineWidth: 2,
          },
        },
        y: {
          grid: {
            color: '#949494',
              borderColor: 'red',
              drawBorder: false, // Remove the border line on the top
              // borderDash: [0, 0], // Customize the grid line style
              drawOnChartArea: false, // Remove the grid lines within the chart area
              drawTicks: false, // Remove the ticks on the grid lines
              lineWidth: 2,

            },
            ticks:{
              display: false,
            }
        },
      }
}
    return (
      <div className={style.graphContainer}>
        <Line data={data} options={options} className="canvas" />
      </div>
    );
  };

function CreationData({values}){
  const [data, setData] = useState({ values: [], labels: [] });
  const [annualReturn, setAnnualReturn] = useState('');
  const [risk, setRisk] = useState('');
  const [sharpeRatio, setSharpeRatio] = useState('');
  const [maxDrawdown, setMaxDrawdown] = useState('');
  const [pnl, setPnl] = useState('');

  useEffect(() => {
  
    if (Object.keys(values).length === 0) {
      setData({values: [], labels: []});
      setAnnualReturn('');
      setRisk('');
      setSharpeRatio('');
      setMaxDrawdown('');
      setPnl('');
      return;
    }
      
      setData({values: values["Value Hist"], labels: values["Date Hist"]});
      setAnnualReturn(values["Annual Return"]);
      setRisk(values["Risk"]);
      setSharpeRatio(values["Sharpe Ratio"]);
      setMaxDrawdown(values["Max Drawdown"]);
      setPnl(values["PNL"]);
  }, [values]);


  function colorCode(value, type){
    let color;
    let new_value;
    if (value > 0){
      color = 'green';
      if (type === 'percent'){
        new_value = '+' + value + '%';
      } else if (type === 'dollar') {
        new_value = '+$' + value;
      }
    } else if (value < 0) {
      color = 'red';
      if (type === 'percent') {

        new_value = value + '%';
      } else if (type === 'dollar') {
        new_value = '-$'+ value.toString().slice(1);
      }
    } else {
      color = '#1B263B';
    }
    return <span style={{color: color}}>{new_value}</span>;
  }
  const InfoIcon = ({ title }) => (
    <Tooltip
      title={title}
      arrow
      leaveDelay={0}
      placement="left" // Position the tooltip to the left
    >
      <InfoOutlinedIcon
        sx={{
          fontSize: '1.3vw',
          color: '#949494',
          marginRight: '5px',
          marginBottom: '.2vw',
        }}
      />
    </Tooltip>
  );

  return (
    <div className={style.super}>
      <CreationGraph dataa={data.values} labels={data.labels} />
      <div className={style.info_container}>
        <Grid container justifyContent="space-evenly" spacing={1}>
          <Grid item xs={8}><div className={style.info_label}>Annual Return:</div></Grid>
          <Grid item xs={4}><div className={style.info_data}>{colorCode(annualReturn,'percent')}</div></Grid>
          <Grid item xs={8}><div className={style.info_label}>Risk:</div></Grid>
          <Grid item xs={4}><div className={style.info_data}>{risk}</div></Grid>
          <Grid item xs={8}><div className={style.info_label}>Sharpe Ratio:</div></Grid>
          <Grid item xs={4}><div className={style.info_data}>{sharpeRatio}</div></Grid>
          <Grid item xs={8}><div className={style.info_label}>Max Drawdown:</div></Grid>
          <Grid item xs={4}><div className={style.info_data}>{maxDrawdown}</div></Grid>
          <Grid item xs={8}><div className={style.info_label}>PNL:</div></Grid>
          <Grid item xs={4}><div className={style.info_data}>{colorCode(pnl,'percent')}</div></Grid>
        </Grid>
      </div>
    </div>
  );

}

export default CreationData;