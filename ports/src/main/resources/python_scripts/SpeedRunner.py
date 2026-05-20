import math
import time
import yfinance as yf
import numpy as np
import multiprocessing
import pandas as pd
import requests
import json
from KeyUpdater import headers, get_access_token, reset_key
from datetime import datetime, timedelta
import threading
import pytz
import pandas_market_calendars as mcal
import datetime as dt
import os




# Step 1: pick 10 stocks to trade simontanously
# Step 2: tick for loop
# Step 3: gets the previous and current close
# Step 4: cur - prev > 0 and prev - prev2 > 0 only shorts make profit
# Step if its below openning price
# Step 5: stop triggers at beginning of the next day


# open rate the amount of open orders versus total orders
# if __name__ == '__main__':

def get_positions(tick):
    url = "https://sim-api.tradestation.com/v3/brokerage/accounts/SIM1145924M/positions"
    response = requests.request("GET", url, headers=headers())
    positions = response.json()['Positions']
    if positions:
        for position in positions:
            if position['Symbol'] == tick:
                return [True, int(position['Quantity'])]
        return [False]
    else:
        return [False]


def manage_order(order_id, time_limit):
    stream_url = f"https://sim-api.tradestation.com/v3/brokerage/stream/accounts/SIM1145924M/orders/{order_id}"
    timer = datetime.now()
    response = requests.request("GET", stream_url, headers=headers(), stream=True)
    for line in response.iter_lines():
        if line:
            print((datetime.now() - timer).total_seconds())
            if (datetime.now() - timer).total_seconds() > time_limit:
                cancel_url = f"https://sim-api.tradestation.com/v3/orderexecution/orders/{order_id}"
                requests.request("DELETE", cancel_url, headers=headers())
                time.sleep(.5)
                url = f"https://sim-api.tradestation.com/v3/brokerage/accounts/SIM1145924M/orders/{order_id}"
                response = requests.request("GET", url, headers=headers())
                if response.json()['Orders'][0]['Status'] == 'OUT':
                    return [False]
                elif response.json()['Orders'][0]['Status'] == 'FLL':
                    return [True, response.json()['Orders'][0]]
                line = json.loads(line)
                if 'Status' in line:
                    if line['Status'] == 'FLL':
                        return [True, line]

def cur_info(ticker):
    url = f"https://api.tradestation.com/v3/marketdata/quotes/{ticker}"
    while True:
        response = requests.request("GET", url, headers=headers())
        if 'Message' in response.json():
            reset_key()
            continue
        try:
            info = response.json()['Quotes'][0]
            check= {
                'Ask':float(info['Ask']),
                'Bid':float(info['Bid']),
                'Close': float(info['Last']),
            }
        except Exception:
            pass
def split_list_into_groups_of_100(lst):
    # Calculate the number of groups
    num_groups = len(lst) // 100 + (1 if len(lst) % 100 != 0 else 0)

    # Initialize an empty list to store the groups
    groups = []

    # Iterate over the range of the number of groups
    for i in range(num_groups):
        # Calculate the start and end indices for the current group
        start = i * 100
        end = (i + 1) * 100

        # Append the current group to the list of groups
        groups.append(lst[start:end])

    return groups
def group_position(tickers_info):
    symbols = list(tickers_info['Symbol'])
    sym_groups = split_list_into_groups_of_100(symbols)
    threads = []
    for symbols in sym_groups:
        thread = threading.Thread(target=group_position_part2,args=(tickers_info[tickers_info['Symbol'].isin(symbols)],))
        thread.start()
        threads.append(thread)
    for thread in threads:
        thread.join()

def group_position_part2(df):
    order_info = {}
    symbols = list(df['Symbol'])
    for symbol in symbols:
        order_info[symbol] = {"OrderID":"","Bid":0.0,"Ask":0.0}
    positions = {}
    url = "https://sim-api.tradestation.com/v3/brokerage/accounts/SIM1145924M/positions"
    response = requests.request("GET", url, headers=headers())
    for position in response.json()['Positions']:
        positions[position['Symbol']] = str(abs(int(position['Quantity'])))
    time_limit = time.time()+120
    while True:
        symbols_copy = symbols
        for symbol in symbols_copy:
            if order_info[symbol]["OrderID"] == 'closed':
                symbols.remove(symbol)
        if len(symbols) == 0:
            break
        url = "https://api.tradestation.com/v3/marketdata/stream/quotes/" + ",".join(symbols)
        try:
            response = requests.request("GET", url, headers=headers(), stream=True)
            for line in response.iter_lines():
                if line:
                    line = json.loads(line)
                    if 'Error' in line:
                        if line['Error'] == 'DualLogon':
                            reset_key()
                            raise requests.exceptions.ChunkedEncodingError
                    print(time_limit - time.time())
                    if time.time() > time_limit:
                        for symbol in symbols:
                            sym_df = df[df['Symbol'] == symbol]
                            action = sym_df.iloc[0]['Action']
                            order_id = order_info[symbol]['OrderID']
                            if action == 'BUY' or action == 'SELLSHORT':
                                url = "https://sim-api.tradestation.com/v3/orderexecution/orders/" + order_id
                                response = requests.request("DELETE", url, headers=headers())
                                print(response.text)
                            else:
                                if action == 'BUYTOCOVER':
                                    url = "https://sim-api.tradestation.com/v3/orderexecution/orders/" + order_id
                                    payload = {
                                        "LimitPrice": str(order_info[symbol]['Ask'])
                                    }
                                    response = requests.request("PUT", url, json=payload, headers=headers())
                                    time.sleep(2)
                                    print(response.text)
                                    order_id = "closed"
                                elif action == 'SELL':
                                    url = "https://sim-api.tradestation.com/v3/orderexecution/orders/" + order_id
                                    payload = {
                                        "LimitPrice": str(order_info[symbol]['Bid'])
                                    }
                                    response = requests.request("PUT", url, json=payload, headers=headers())
                                    time.sleep(2)
                                    print(response.text)
                        return
                    if "Message" in line:
                        reset_key()
                        raise requests.exceptions.ChunkedEncodingError
                    if "Symbol" not in line:
                        continue
                    # print(line['Symbol'])
                    try:
                        order_info[line['Symbol']]['Ask'] = round(float(line['Ask']),2)
                    except Exception:
                        order_info[line['Symbol']]['Ask'] = 0
                    if order_info[line['Symbol']]['Ask'] == 0:
                        continue
                    try:
                        order_info[line['Symbol']]['Bid'] = round(float(line['Bid']), 2)
                    except Exception:
                        order_info[line['Symbol']]['Bid'] = 0
                    if order_info[line['Symbol']]['Bid'] == 0:
                        continue
                    order_id = order_info[line['Symbol']]['OrderID']
                    if order_id == "closed":
                        raise requests.exceptions.ChunkedEncodingError
                    sym_df = df[df['Symbol']==line['Symbol']]
                    action = sym_df.iloc[0]['Action']
                    if line['Symbol'] in positions:
                        quantity = positions[line['Symbol']]
                    else:
                        quantity = sym_df.iloc[0]['Quantity']
                    if action == 'BUY' or action == 'BUYTOCOVER':
                        limit = round(order_info[line['Symbol']]['Bid'] + .01, 2)
                    elif action == 'SELL' or action == 'SELLSHORT':
                        limit = round(order_info[line['Symbol']]['Ask'] - .01, 2)
                    if order_id != "":
                        url = "https://sim-api.tradestation.com/v3/orderexecution/orders/" + order_id
                        payload = {
                            "LimitPrice": str(limit)
                        }
                        response = requests.request("PUT", url, json=payload, headers=headers())
                        print(response.text, " Limit: ", limit)
                        if 'Error' in response.json():
                            if response.json()['Error'] == 'Forbidden':
                                continue
                            else:
                                print("Opened/Closed Position ", line['Symbol'])
                                order_id = "closed"


                    else:
                        url = "https://sim-api.tradestation.com/v3/orderexecution/orders"
                        payload = {
                            "AccountID": "SIM1145924M",
                            "Symbol": line['Symbol'],
                            "Quantity": str(quantity),
                            "OrderType": "Limit",
                            "LimitPrice": str(limit),
                            "TradeAction": action,
                            "TimeInForce": {
                                "Duration": "GCP"
                            },
                            "Route": "Intelligent"
                        }
                        response = requests.request("POST", url, json=payload, headers=headers())
                        order_id = response.json()['Orders'][0]['OrderID']
                        print(response.text, " Limit: ", limit)
                    order_info[line['Symbol']]['OrderID'] = order_id
        except requests.exceptions.ChunkedEncodingError:
            continue
        break

def ee_position(ticker,action,quantity,filename = ""):
    time_len = time.time() + 60
    order_id = ""
    while True:
        data = cur_info(ticker)
        if action == 'BUY' or action == 'BUYTOCOVER':
            limit = round(data['Bid']+.01,2)
        else:
            limit = round(data['Ask']-.01,2)
        if order_id != "":
            url = "https://sim-api.tradestation.com/v3/orderexecution/orders/"+order_id
            payload = {
                "LimitPrice": str(limit)
            }
            response = requests.request("PUT", url, json=payload, headers=headers())
            print(response.text," Limit: ",limit)
            if 'Error' in response.json():
                if response.json()['Error'] == 'Forbidden':
                    continue
                else:
                    print("Opened Position ", ticker)
                    break
            if time.time() > time_len:
                if action == 'BUY' or action == 'SELLSHORT':
                    url = "https://sim-api.tradestation.com/v3/orderexecution/orders/"+order_id
                    response = requests.request("DELETE", url, headers=headers())
                    print(response.text)
                    break
                else:
                    if action == 'BUYTOCOVER':
                        url = "https://sim-api.tradestation.com/v3/orderexecution/orders/" + order_id
                        payload = {
                            "LimitPrice": str(round(data['Ask'],2))
                        }
                        response = requests.request("PUT", url, json=payload, headers=headers())
                        time.sleep(2)
                        print(response.text)
                        break
                    elif action == 'SELL':
                        url = "https://sim-api.tradestation.com/v3/orderexecution/orders/" + order_id
                        payload = {
                            "LimitPrice": str(round(data['Bid'],2))
                        }
                        response = requests.request("PUT", url, json=payload, headers=headers())
                        time.sleep(2)
                        print(response.text)
                        break
        else:
            url = "https://sim-api.tradestation.com/v3/orderexecution/orders"
            payload = {
                "AccountID": "SIM1145924M",
                "Symbol": ticker,
                "Quantity": str(quantity),
                "OrderType": "Limit",
                "LimitPrice":str(limit),
                "TradeAction": action,
                "TimeInForce": {
                    "Duration": "GCP"
                },
                "Route": "Intelligent"
            }
            response = requests.request("POST", url, json=payload, headers=headers())
            order_id = response.json()['Orders'][0]['OrderID']
            print(response.text," Limit: ",limit)
        time.sleep(1)
    if filename:
        df = pd.read_csv(filename,index_col=[0])
        pd.concat([df, pd.DataFrame({"Order_ID":order_id,"TimeStamp":str(datetime.now())},index=[0])],ignore_index=True).to_csv(filename)
    return order_id

def close_postionsv2(ticker = None):
    threads = []
    url = "https://sim-api.tradestation.com/v3/brokerage/accounts/SIM1145924M/positions"
    if ticker:
        if type(ticker) is list:
            params = {
                'symbol': ','.join(ticker)
            }
        else:
            params = {
                'symbol': ticker
            }
        response = requests.request("GET", url, params=params, headers=headers())
    else:
        response = requests.request("GET", url, headers=headers())
    positions = response.json()['Positions']
    for position in positions:
        if position["AssetType"] != 'STOCK':
            continue
        if position['LongShort'] == 'Long':
            close_action = 'SELL'
        else:
            close_action = 'BUYTOCOVER'
        thread = threading.Thread(target=ee_position,
                                  args=(position['Symbol'], close_action, abs(int(position['Quantity']))))
        thread.start()
        threads.append(thread)

    for thread in threads:
        thread.join()

def close_positions(filename='', quotes=None):
    if quotes:
        params = {
            'symbol': ','.join(quotes)
        }
        url = "https://sim-api.tradestation.com/v3/brokerage/accounts/SIM1145924M/positions"
        response = requests.request("GET", url, params=params, headers=headers())
    else:
        url = "https://sim-api.tradestation.com/v3/brokerage/accounts/SIM1145924M/positions"
        response = requests.request("GET", url, headers=headers())
    for position in response.json()['Positions']:
        if position["AssetType"] != 'STOCK':
            continue
        quantity = str(abs(int(position['Quantity'])))
        symbol = position['Symbol']
        if position['LongShort'] == 'Long':
            close_action = 'Sell'
        else:
            close_action = 'BuytoCover'
        url = "https://sim-api.tradestation.com/v3/orderexecution/orders"
        payload = {
            "AccountID": "SIM1145924M",
            "Symbol": symbol,
            "Quantity": quantity,
            "OrderType": "Market",
            "TradeAction": close_action,
            "TimeInForce": {
                "Duration": "DAY"
            },
            "Route": "Intelligent"
        }
        response = requests.request("POST", url, json=payload, headers=headers())
        print(response.text)
        if filename != '':
            process_order(filename, [response.json()['Orders'][0]['OrderID']])


def refresh_list():
    nasdaq = requests.get("http://ftp.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt")
    nyse = requests.get("http://www.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt")
    file = open("../ticker_list.txt", "w")
    file.write(str(nasdaq.text))
    file.write(str(nyse.text))
    file.close()
    nasdaq = pd.read_csv("../ticker_list.txt", sep="|")
    num_cores = multiprocessing.cpu_count()
    p = list()
    try:
        with multiprocessing.Pool(processes=num_cores) as pool:
            # Use pool.map to apply the method to each chunk in parallel
            p = pool.map(filter_list, list(nasdaq["Symbol"]))
    except Exception:
        pass
    p = [item for item in p if item is not None]
    filtered_list = pd.DataFrame(columns=["Symbol"])
    filtered_list["Symbol"] = p
    filtered_list.to_csv("filtered_list.csv", index=False)

    # filter the list for any bad tickers


def filter_list(sym):
    try:
        info_sym = yf.Ticker(sym)
        return sym
    except Exception as e:
        print(e)
        return


def get_shares(perc, sym):
    # max_perc, low_perc,
    url = "https://sim-api.tradestation.com/v3/brokerage/accounts/SIM1145924M/balances"

    response = requests.request("GET", url, headers=headers())
    print(response.text)
    balance = float(response.json()['Balances'][0]['Equity'])
    stock_budget = balance * perc
    return str(int(np.floor(stock_budget / yf.Ticker(sym).info['currentPrice'])))


def market_status(beg=0, end=0):
    tz = pytz.timezone('UTC')
    nyse = mcal.get_calendar('NYSE')
    script_directory = os.path.dirname(os.path.abspath(__file__))
    schedule = pd.read_csv(script_directory+'/schedule.csv',index_col=[0])
    if str(datetime.now().date()) != schedule.index[0]:
        schedule = nyse.schedule(start_date=str(dt.date.today()), end_date=str(dt.date.today()))
        if schedule.empty:
            return False
        schedule.to_csv('schedule.csv')
    else:
        schedule['market_open'] = pd.to_datetime(schedule['market_open'])
        schedule['market_close'] = pd.to_datetime(schedule['market_close'])
    index = schedule.index[0]
    if (schedule.loc[index, 'market_open'] + timedelta(minutes=beg)) > datetime.now(pytz.utc):
        return False
    elif (schedule.loc[index, 'market_close'] - timedelta(minutes=end)) < datetime.now(pytz.utc):
        return False
    else:
        return True


def process_data(data):
    df = pd.DataFrame()
    for bar in data:
        new_index = len(df)
        df.loc[new_index, 'High'] = float(bar['High'])
        df.loc[new_index, 'Low'] = float(bar['Low'])
        df.loc[new_index, 'Close'] = float(bar['Close'])
        df.loc[new_index, 'Open'] = float(bar['Open'])
        df.loc[new_index, 'TimeStamp'] = datetime.strptime(bar['TimeStamp'], "%Y-%m-%dT%H:%M:%SZ")
        df.loc[new_index, 'TotalVolume'] = float(bar['TotalVolume'])
        df.loc[new_index, 'DownTicks'] = bar['DownTicks']
        df.loc[new_index, 'DownVolume'] = bar['DownVolume']
        df.loc[new_index, 'TotalTicks'] = bar['TotalTicks']
        df.loc[new_index, 'UpTicks'] = bar['UpTicks']
        df.loc[new_index, 'UpVolume'] = bar['UpVolume']
    return df





def process_order(filename, index = 0):
    orders = pd.read_csv(filename, index_col=[0])
    orders = orders.loc[index:]
    orders = list(orders["OrderID"])
    length = len(orders)
    length_r = math.ceil(length/50)
    final_ord_l = list()
    for i in range(0,length_r):
        left = length-i*50
        if left >= 50:
            ord_l = orders[i*50:i*50+50]
        else:
            ord_l = orders[i*50: i*50+left]
        url = f"https://sim-api.tradestation.com/v3/brokerage/stream/accounts/SIM1145924M/orders/{','.join(map(str,ord_l))}"
        response = requests.request("GET", url, headers=headers(), stream=True)

        for line in response.iter_lines():
            if line:
                line = json.loads(line)
                if "StreamStatus" in line:
                    break
                final_ord_l.append(line)
    df = pd.DataFrame()
    for order in final_ord_l:
        quantity = int(order['Legs'][0]['ExecQuantity'])
        try:
            exec_price = float(order['Legs'][0]['ExecutionPrice'])
        except Exception:
            pass
        orderid = int(order["OrderID"])
        order_exec = order['Legs'][0]['BuyOrSell']
        order_type = order['OrderType']
        status = order['Status']
        symbol = order['Legs'][0]['Symbol']
        opened = datetime.strptime(order['OpenedDateTime'], "%Y-%m-%dT%H:%M:%SZ")
        if "ClosedDateTime" in order:
            closed = datetime.strptime(order['ClosedDateTime'], "%Y-%m-%dT%H:%M:%SZ")
        if "ConditionalOrders" in order:
            relationship = order['ConditionalOrders'][0]['Relationship']
            r_orderid = int(order['ConditionalOrders'][0]['OrderID'])
        new_row_index = len(df)
        df.loc[new_row_index, 'ExecQuantity'] = quantity
        df.loc[new_row_index, 'OrderID'] = orderid
        try:
            df.loc[new_row_index, 'ExecutionPrice'] = exec_price
        except Exception:
            pass
        df.loc[new_row_index, 'BuyOrSell'] = order_exec
        df.loc[new_row_index, 'OrderType'] = order_type
        df.loc[new_row_index, 'Status'] = status
        df.loc[new_row_index, 'Symbol'] = symbol
        df.loc[new_row_index, 'OpenedDateTime'] = opened
        # if "ConditionalOrders" in order:
        #     df.loc[new_row_index, 'Relationship'] = relationship
        #     df.loc[new_row_index, 'R_OrderID'] = r_orderid
        #     df['R_OrderID'] = df['R_OrderID'].apply(lambda x: round(x))
        if "ClosedDateTime" in order:
            df.loc[new_row_index, 'ClosedDateTime'] = closed
        df['OrderID'] = df['OrderID'].apply(lambda x: round(x))
        df['ExecQuantity'] = df['ExecQuantity'].apply(lambda x: round(x))
    return df



def delete_json_files(path="."):
    for root, dirs, files in os.walk(path):
        for file in files:
            if file.endswith(".json"):
                file_path = os.path.join(root, file)
                try:
                    os.remove(file_path)
                    print(f"Deleted: {file_path}")
                except Exception as e:
                    print(f"Error deleting {file_path}: {e}")


if __name__ == '__main__':
    close_positions()
    # print(pd.read_csv('algo2_data.csv'))
    # delete_json_files()
    pass
    print(market_status(1,1))
    pass

