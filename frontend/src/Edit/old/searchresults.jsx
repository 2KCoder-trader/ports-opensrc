

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { PortDraft } from '../../user';



const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search stocks..."
      className={styles.searchInput}
    />
  );
};

// Stock Component for Search Results
const Stock = ({ symbol, fullName, percent, price, volume, onClick }) => {
  const formatValue = (value, type) => {
    if (value === 0) return <span>{value}</span>;
    
    const color = value > 0 ? 'green' : 'red';
    const prefix = value > 0 ? '+' : '';
    const displayValue = type === 'percent' 
      ? `${prefix}${value}%`
      : type === 'dollar'
      ? `${prefix}$${Math.abs(value)}`
      : value;
    
    return <span style={{ color }}>{displayValue}</span>;
  };

  return (
    <div className={styles.stock_grid} onClick={onClick}>
      <div className={styles.stock_label}>{symbol}</div>
      <div className={styles.stock_label}>{fullName}</div>
      <div className={styles.stock_label}>{formatValue(percent, 'percent')}</div>
      <div className={styles.stock_label}>${price}</div>
      <div className={styles.stock_label}>{volume}</div>
    </div>
  );
};

// SearchResults Component
const SearchResults = ({ searchQuery, setSearchQuery, data, selectedStocks, setSelectedStocks }) => {
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (searchQuery && Array.isArray(data)) {
      const query = searchQuery.toLowerCase().trim();
      const selectedSymbols = selectedStocks.map(stock => stock.stock);
      
      const filtered = data.filter(row => {
        const fullName = (row.fullName || '').toLowerCase();
        const symbol = (row.symbol || '').toLowerCase();
        return (symbol.includes(query) || fullName.includes(query)) 
          && !selectedSymbols.includes(row.symbol);
      });

      setFilteredData(filtered);
    } else {
      setFilteredData([]);
    }
  }, [data, searchQuery, selectedStocks]);

  const handleAddClick = (stock) => {
    setSearchQuery('');
    const newStock = {
      stock: stock.symbol,
      price: stock.price,
      percent: '',
      position: 'long'
    };
    setSelectedStocks(prev => [...prev, newStock]);
  };

  if (!searchQuery?.trim()) return null;

  return (
    <div className={styles.search_results_wrap}>
      <div className={styles.search_headers}>
        <div className={styles.stock_grid_header}>
          <div className={styles.stock_label}>Symbol</div>
          <div className={styles.stock_label}>Name</div>
          <div className={styles.stock_label}>Change</div>
          <div className={styles.stock_label}>Price</div>
          <div className={styles.stock_label}>Volume</div>
        </div>
      </div>
      <div className={styles.search_results}>
        {filteredData.slice(0, 20).map((stock, index) => (
          <Stock
            key={index}
            {...stock}
            onClick={() => handleAddClick(stock)}
          />
        ))}
      </div>
    </div>
  );
};
export default SearchResults; 