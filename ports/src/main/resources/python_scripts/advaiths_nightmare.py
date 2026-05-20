import base64

# Convert image to Base64
with open("C:/Users/advai/Downloads/unc.png", "rb") as image_file:
    base64_string = base64.b64encode(image_file.read()).decode('utf-8')

print(base64_string)