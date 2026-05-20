import threading
from stocks import run_stocks
from KeyUpdaterSIM1 import run_KeyUpdaterSIM1
from KeyUpdaterSIM2 import run_KeyUpdaterSIM2
from get_names import run_get_names
from get_hist_data import run_get_hist_data
from market_status import run_market_status, market_status
import time
from datetime import datetime

def print_to_txt_file(filename, message):
    with open(filename, 'a') as file:
        file.write(datetime.now().strftime("%Y-%m-%d %H:%M:%S")+": "+message + '\n')
# log_file_path = "C:\\Users\\zephy\\Documents\\ports-backend\\python_scripts\\run.txt"
log_file_path = r"run.txt"
# Step 0 run get_market_status.py

# Step 1 run get_names.py non-threadeed - Coded
# this will add new stocks to the table n_stocks

# Step 2 run KeyUpdaterSIM1 and KeyUpdaterSIM2 threaded - Coded

# Step 3 run stocks.py non-threaded - Coded
# This will only update the table n_stocks

# Step 4 run get_hist_data.py non-threaded
# this will add row for every stock in the table n_stock_data 
# at 9pm every day
print_to_txt_file(log_file_path, "Starting Run")

print_to_txt_file(log_file_path, "Getting Market Status")
threading.Thread(target=run_market_status).start()

# while True:
#     if market_status(0, 5):
#         break
# print("Getting Names")
# print_to_txt_file(log_file_path, "Getting Names")
# threading.Thread(target=run_get_names).start()
# thread.start()

# while thread.is_alive():
#     if market_status():
#         print("Get Names Failed")
#         break
#     time.sleep(1)  
print_to_txt_file(log_file_path, "Getting Keys")
threading.Thread(target=run_KeyUpdaterSIM1).start()
threading.Thread(target=run_KeyUpdaterSIM2).start()

time.sleep(1)

print_to_txt_file(log_file_path, "Updating Stocks")
run_stocks()
print_to_txt_file(log_file_path, "Updating Stocks Ended")


print_to_txt_file(log_file_path, "Sleeping for 5 hours")
time.sleep(60*60*5)

print_to_txt_file(log_file_path, "Getting Historical Data")
run_get_hist_data()


