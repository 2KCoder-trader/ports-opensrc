import statsmodels.api as sm


token = ''
with open('/home/ubuntu/test/ports-backend/spring-boot/ports/token.txt', 'r') as file:
    token = file.read()
    print(token)

