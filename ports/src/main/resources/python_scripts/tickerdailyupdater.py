from pprint import pprint
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.cm as cm
import statsmodels.api as sm
from math import floor
import math
import statsmodels
from statsmodels.tsa.stattools import coint
from sklearn import linear_model
import time
from SpeedRunner import market_status
import SpeedRunner
import threading
import requests
from KeyUpdater import headers
import SpeedRunner
from datetime import date, datetime, timedelta
from time import gmtime, strftime
import pytz
from risk_num_calc import cunt
import psycopg2
from decimal import Decimal
from tabulate import tabulate
import pandas_market_calendars as mcal

pd.set_option('display.max_rows', None)  # Adjust as needed
pd.set_option('display.max_columns', None)  # Adjust based on your DataFrame


def get_data(ticker,barsback):
    
    url = f"https://api.tradestation.com/v3/marketdata/barcharts/{ticker}"
    params = {
        "interval": 1,
        "unit": "Daily",
        "barsback": f'{barsback}',
        "sessiontemplate":'USEQ24Hour'
    }

    response = requests.request("GET", url, params=params, headers=headers())
    #print(response.json())
    bars = response.json()['Bars']
    closes = SpeedRunner.process_data(bars)['Close'][1:]

    #print(closes)

    return closes.values

def tradingdaysnum():
    # Get the NYSE calendar
    nyse = mcal.get_calendar('NYSE')

    # Define the start and end dates
    start_date = pd.Timestamp.today() - pd.DateOffset(years=2)
    end_date = pd.Timestamp.today()

    # Get the trading schedule between the start and end dates
    schedule = nyse.schedule(start_date=start_date, end_date=end_date)

    # Calculate the number of trading days
    number_of_trading_days = len(schedule)

    # Print the result
    #print("trading day num", number_of_trading_days)

    return(number_of_trading_days)


def oioiue(tickers, sectortickers):
    stockydata = {}

    number_of_trading_days = tradingdaysnum()

    for sectorticker in sectortickers:
        marketdata = get_data(sectorticker, number_of_trading_days)
        stockydata[sectorticker] = marketdata
        time.sleep(5)
        print(sectorticker)

    for stock in tickers: 
        stockdata = get_data(stock, number_of_trading_days)
        stockydata[stock] = stockdata
        time.sleep(5)
        print(stock)

    #print(stockydata)

    return stockydata
    


if __name__ == '__main__':
    importedtickers = ["GOOGL", "GME", "TSLA", "TSLA", "GOOGL", "MSFT"]
    unique_tickers = list(set(importedtickers))

    #print(unique_tickers)

    sectortickers = ["SPY", "XLE", "XLB", "XLI", "XLU", "XLV", "XLF", "XLY", "XLP", "XLK", "XLV", "XLRE"]

    print("starting")
    #time.sleep(10)
    oioiue(unique_tickers, sectortickers)



# conn = psycopg2.connect(database="zephyr_capital",
#     host=os.environ.get("DB_HOST", "localhost"),
#     user="postgres",
#     password=os.environ.get("DB_PASSWORD", ""),
#     port="5432") 

# cursor = conn.cursor()
# cursor.execute(f"SELECT * FROM ports.portfolios")
# rtr = cursor.fetchall()

# print(rtr)
#     #rtr is the 2d array