

import React , {useState , useEffect} from 'react';
import styles from './port_draft.module.css';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import TextField from '@mui/material/TextField';
import { GiConsoleController } from 'react-icons/gi';


function ToggleButtons({position, setPosition}) {
    const handlePosition = (event, newPosition) => {
        // if (newPosition !== null) {
        setPosition(newPosition);
        //   }
        
    };
  
    return (
      <ToggleButtonGroup
        size= "small"
        value={position}
        exclusive
        onChange={handlePosition}
        aria-label="postion type"
        sx={{
            borderRadius: 0, // Remove border radius from ToggleButtonGroup
          }}
        className={styles.ss_toggle}
      >
        <ToggleButton value="long" sx={{
             color: 'white',
             fontSize: '10px', // Adjust the font size to make the buttons smaller
             padding: '0px 0px', // Adjust the padding to make the buttons smaller
             minWidth: '40px',
             borderColor: 'white',
             '&.Mui-selected': {
            backgroundColor: 'white', // Change this to your desired selected color
            color: '#1B263B', // Change text color if needed
            '&:hover': {
              backgroundColor: 'white', // Change this to your desired selected color
              color: '#1B263B', // Change text color if needed
            }, 
            }
             }}>LONG</ToggleButton>
     
      </ToggleButtonGroup>
    );
  }

  const SelectedStock = ({ 
    index, 
    symbol, 
    price, 
    percent, 
    position,
    onDelete,
    onPercentChange,
    onPositionChange
  }) => {
    const handlePercentChange = (e) => {
      const value = e.target.value;
      if (/^\d*\.?\d{0,1}$/.test(value)) {
        onPercentChange(index, value);
      }
    };
  
    return (
      <div className={styles.selected_stock}>
        <div className={styles.ss_front}>{symbol}</div>
        <div className={styles.ss_middle}>${parseFloat(price).toFixed(2)}</div>
        <div className={styles.ss_toggle}>
          <select 
            value={position} 
            onChange={(e) => onPositionChange(index, e.target.value)}
            className={styles.position_select}
          >
            <option value="long">LONG</option>
           
          </select>
        </div>
        <div className={styles.ss_back}>
          <input
            type="text"
            value={percent}
            onChange={handlePercentChange}
            className={styles.percent_input}
          />%
        </div>
        <div className={styles.ss_delete} onClick={() => onDelete(symbol)}>X</div>
      </div>
    );
  };
  
  // PortDraft Component
  const PortDraft = ({ data, selectedStocks, setSelectedStocks }) => {
    const [modified, setModified] = useState(false);
  
    useEffect(() => {
      if (selectedStocks.length === 0) {
        setModified(false);
        return;
      }
  
      // Update stock prices
      const updatedStocks = selectedStocks.map(stock => {
        const matchingData = data.find(d => d.symbol === stock.stock);
        return {
          ...stock,
          price: matchingData?.price || stock.price
        };
      });
  
      // Calculate percentages if not modified
      if (!modified) {
        const percentage = (100 / selectedStocks.length).toFixed(1);
        const remainder = (100 - (percentage * (selectedStocks.length - 1))).toFixed(1);
        
        const distributedStocks = updatedStocks.map((stock, index) => ({
          ...stock,
          percent: index === 0 ? remainder : percentage
        }));
        
        setSelectedStocks(distributedStocks);
      } else {
        setSelectedStocks(updatedStocks);
      }
    }, [selectedStocks.length, data, modified]);
  
    const handleDelete = (symbol) => {
      setSelectedStocks(prev => prev.filter(stock => stock.stock !== symbol));
    };
  
    const handlePercentChange = (index, value) => {
      setModified(true);
      setSelectedStocks(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], percent: value };
        return updated;
      });
    };
  
    const handlePositionChange = (index, position) => {
      setSelectedStocks(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], position };
        return updated;
      });
    };
  
    return (
      <div className={styles.background}>
        <div className={styles.list_wrap}>
          {selectedStocks.length > 0 && (
            <div className={styles.port_draft_headers}>
              <div className={styles.stock_label}>Symbol</div>
              <div className={styles.stock_label}>Price</div>
              <div className={styles.stock_label}>Position</div>
              <div className={styles.stock_label}>Weight</div>
            </div>
          )}
          <div className={styles.list}>
            {selectedStocks.map((stock, index) => (
              <SelectedStock
                key={index}
                index={index}
                symbol={stock.stock}
                price={stock.price}
                percent={stock.percent}
                position={stock.position}
                onDelete={handleDelete}
                onPercentChange={handlePercentChange}
                onPositionChange={handlePositionChange}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };
  export default PortDraft;
