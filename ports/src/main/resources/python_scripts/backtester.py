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
import psycopg2
from risk_num_calc import cunt
import plotly.graph_objects as go



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


def cock(tickers, shares, lors, sectorticker):
    
    risknum, stockydata = cunt(tickers, shares, lors, sectorticker)
    
    # Initialize portfolio value and daily P&L list
    initial_investment = 100
    daily_pnls = []
    cumulative_pnls = [initial_investment]

    # Calculate initial portfolio value
    initial_portfolio_value = sum(shares[j] * stockydata[ticker][0] for j, ticker in enumerate(tickers))
    initial_portfolio_value = sum((shares[j] * stockydata[ticker][0]) * (-1 if lors[j] == 0 else 1) for j, ticker in enumerate(tickers))

    # Calculate daily portfolio values and cumulative P&L
    for i in range(1, len(stockydata[tickers[0]])):
        daily_portfolio_value = sum(shares[j] * stockydata[ticker][i] for j, ticker in enumerate(tickers))
        daily_portfolio_value = sum((shares[j] * stockydata[ticker][i]) * (-1 if lors[j] == 0 else 1) for j, ticker in enumerate(tickers))
        daily_pnl = daily_portfolio_value - initial_portfolio_value
        daily_pnl_perc = (daily_portfolio_value - initial_portfolio_value) / initial_portfolio_value 
        daily_pnls.append(daily_pnl)
        #cumulative_pnls.append(cumulative_pnls[-1] + daily_pnl)
        cumulative_pnls.append(cumulative_pnls[-1] + cumulative_pnls[-1] * daily_pnl_perc)
        initial_portfolio_value = daily_portfolio_value

    # Convert portfolio values to a pandas Series
    portfolio_values = pd.Series(cumulative_pnls)

    # Calculate daily returns
    daily_returns = portfolio_values.pct_change().dropna()

    # Calculate annualized return
    annret = ((cumulative_pnls[-1] - initial_investment) / initial_investment) / 2
    monthret = annret / 12

    # Calculate maximum drawdown
    running_max = portfolio_values.cummax()
    drawdown = (portfolio_values - running_max) / running_max
    maxdrawdown = drawdown.min()

    # Calculate Sharpe ratio (assuming risk-free rate is 0)
    sharpy = np.mean(daily_returns) / np.std(daily_returns) * np.sqrt(252)

    # Print the calculated values
    print(round(monthret*100, 2), "<- Average Monthly Return (%)")
    print(round(annret*100,2), "<- Annualized Return (%)")
    print(round(abs(maxdrawdown)*100, 1), "<- Maximum Drawdown (%)")
    print(round(sharpy, 2), "<- Sharpe Ratio")

    #print(cumulative_pnls)
    plt.plot(cumulative_pnls)
    plt.xlabel('Days')
    plt.ylabel('Total Value')
    plt.title('$100 Backtested Over 2 Years')
    plt.show()


    # Create the figure
    values = cumulative_pnls
    fig = go.Figure()

    # Add the main trace
    fig.add_trace(go.Scatter(
        x=list(range(len(values))),
        y=values,
        mode='lines+markers',
        name='Data',
        marker=dict(size=0.1, opacity=1)  # Adjust marker size and opacity
    ))

    # Customize the hover template to lighten the graph to the right and fill the area to the left
    fig.update_traces(
        # hovertemplate='%{y}'
        hovertemplate='<b>Value:</b> %{y}<extra></extra>',
        line=dict(color='blue', width=2)
    )

    # Customize layout for interactive highlighting
    fig.update_layout(
        hovermode='x unified',
        shapes=[dict(
            type='rect',
            xref='x',
            yref='paper',
            x0=0,
            y0=0,
            x1=0,
            y1=1,
            fillcolor='lightblue',
            opacity=0.5,
            layer='below',
            line_width=0,
        )]
    )

    # Add a hover event to adjust the rectangle
    fig.update_layout(
        hoverlabel=dict(
            bgcolor="white",
            font_size=16,
            font_family="Rockwell"
        )
    )

    # Show the plot
    fig.show()

    return round(annret*100,2),round(abs(maxdrawdown)*100, 1),round(sharpy, 2), round(monthret*100, 2),cumulative_pnls,risknum
    

# if __name__ == '__main__':
#     tickers = ["GOOGL", "GME", "TSLA"]
#     shares = [3, 15, 5]
#     #lors is long or short, 0 if short 1 if long
#     lors = [1, 0, 1]
#     sector = 9

#     # tickers = ["GOOGL"]
#     # shares = [1]
#     # #lors is long or short, 0 if short 1 if long
#     # lors = [1]
#     # sector = 9

#     sectortickers = ["SPY", "XLE", "XLB", "XLI", "XLU", "XLV", "XLF", "XLY", "XLP", "XLK", "XLV", "XLRE"]
#     sectorticker = sectortickers[sector]

#     print("starting")
#     #time.sleep(5)
#     cock(tickers, shares, lors, sectorticker)