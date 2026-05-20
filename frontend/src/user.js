import SecureStorage from 'react-secure-storage';
import React from 'react';
import CryptoJS from 'crypto-js';
import { getData, storeData } from './indexDB';




// npm doesnt auto update the env variables so u hv to rerun like the backend
const url = process.env.REACT_APP_API_URL;

const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;





class FieldDecryptionUtil {
  constructor(secretKey) {
    this.secretKey = CryptoJS.enc.Utf8.parse(secretKey);
  }
    decryptFields(encryptedJsonString) {
    try {
      // Parse the JSON string to get the encrypted fields map
      const encryptedFields = JSON.parse(encryptedJsonString);
      const decryptedObject = {};

      // Decrypt each field
      for (const [fieldName, encryptedValue] of Object.entries(encryptedFields)) {
        if (encryptedValue) {
          const decryptedValue = this.decryptField(encryptedValue);
          
          // Try to parse the decrypted value as JSON in case it was an object/array
          try {
            decryptedObject[fieldName] = JSON.parse(decryptedValue);
          } catch {
            // If not valid JSON, use the string value
            decryptedObject[fieldName] = decryptedValue;
          }
        }
      }

      return decryptedObject;
    } catch (error) {
      console.error('Error decrypting fields:', error);
      throw error;
    }
  }



  



  decryptField(encryptedValue) {
    try {
      // Convert the base64 string to CryptoJS format
      const ciphertext = CryptoJS.enc.Base64.parse(encryptedValue);
      
      // Decrypt the data
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: ciphertext },
        this.secretKey,
        {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7
        }
      );
      
      // Convert to UTF-8 string
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Error decrypting field:', error);
      throw error;
    }
  }
}


function decrypt(encryptedData) {
  const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
  const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

const decryptionUtil = new FieldDecryptionUtil(SECRET_KEY);


async function loginUser(username, password,recaptchaToken) {
  let isLoggedIn = false;

    const response = await fetch(`${url}/ports/user/verifyuser?recaptchaToken=${recaptchaToken}`, {
    method: 'POST',
    credentials:'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })  .then(response => response.json())
  .then(data => {
    console.log("login data",data);
    SecureStorage.setItem('userId', data.id);
    SecureStorage.setItem('isMyPortsOpen', true);

    isLoggedIn = true;
  })
  // Check the response status
  return isLoggedIn;

}

async function googleLogin(response,recaptchaToken) {

 
  await fetch(`${url}/ports/user/google-signin?request=${response}&recaptchaToken=${recaptchaToken}`, {
    method: 'POST',
    credentials:'include',
    headers: {
      'Content-Type': 'application/json',
    }
  })
  .then(response => response.json())
  .then(data => {
   
    
    SecureStorage.setItem('secureToken', data.token);
    SecureStorage.setItem('username', data.username);

  })
  .catch(error => console.error('Error:', error));


  if (SecureStorage.getItem('userToken')) {
    SecureStorage.setItem('userToken', true);
    return true;
  }
  else{
    return false;
  }
  
}


async function olginuser(username, password,recaptchaToken) {

  let  responsddfe = "";
  await fetch(`${url}/ports/user/loginuser?recaptchaToken=${recaptchaToken}`, {
    method: 'POST',
    credentials:'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
  .then(response => response.json())
  .then(data => {
    responsddfe=  data.message;

  })
  .catch(error => console.error('Error:', error));
  if (responsddfe === "Email verified") {
    
    return true;
  }
  else{
    return false;
  }
  
}
async function sendConfirmationEmail(email, userId) {
  const token = getToken();
  let  responsddfe = "";
  await fetch(`${url}/ports/user/SendEmail?email=${email}&userId=${userId}`, {
    method: 'POST',
    credentials:'include',
    headers: {
      'Content-Type': 'application/json',
   
    },
  })
  .then(response => response.json())
  .then(data => {
    responsddfe=  data.message;

  })
  .catch(error => console.error('Error:', error));
  if (responsddfe === "Email Sent") {
    
    return true;
  }
  else{
    return false;
  }
  
}


async function sendforgotEmail(email, username) {
  const token = getToken();
  try {
    const response = await fetch(`${url}/ports/user/sendForgotEmail?email=${email}&Username=${username}`, {
      method: 'POST',
      credentials:'include',
      headers: {
        'Content-Type': 'application/json',
    
      },
    });

    const data = await response.json();
    if (data.message === "Email Sent") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error:', error);
    return false; // Optionally return false in case of error
  }
}

async function verifyConfirmationCode(username, verificationCode) {

  const token = getToken();
  let  responsddfe = "";
  await fetch(`${url}/ports/user/verifyEmail?username=${username}&verificationCode=${verificationCode}`, {
    method: 'POST',
    credentials:'include',
    headers: {
      'Content-Type': 'application/json',
      
    },
  })
  .then(response => response.json())
  .then(data => {
    responsddfe=  data.message;

  })
  .catch(error => console.error('Error:', error));
  if (responsddfe === "Good verification code.") {
    
    return true;
  }
  else{
    return false;
  }
  
}

async function verifyForgotConfirmationCode(username, verificationCode) {

  const token = getToken();
  let  responsddfe = "";
  await fetch(`${url}/ports/user/verifyForgotPassword?username=${username}&verificationCode=${verificationCode}`, {
    method: 'POST',
    credentials:'include',
    headers: {
      'Content-Type': 'application/json'
    },
  })
  .then(response => response.json())
  .then(data => {
    responsddfe=  data.message;

  })
  .catch(error => console.error('Error:', error));
  if (responsddfe === "Good verification code.") {
    
    return true;
  }
  else{
    return false;
  }
  
}


async function verify2FA(email, verificationCode) {
  await fetch(`${url}/ports/user/verifyLogo?username=${email}&verificationCode=${verificationCode}`, {
    method: 'POST',
    credentials:'include',
    headers: {
      'Content-Type': 'application/json', 
    },
  })
  .then(response => response.json())
  .then(data => {
    SecureStorage.setItem('secureToken', data.token);


   

  })
  .catch(error => console.error('Error:', error));
  if (SecureStorage.getItem('secureToken')) {
    SecureStorage.setItem('userToken', true);
    return true;
  }
  else{
    return false;
  }
  
}




async function verifyEmail(email, verificationCode) {

  return fetch(`${url}/ports/user/verify?email=${email}&verificationCode=${verificationCode}`, {
    method: 'POST',
    credentials:'include',
    headers: {
      'Content-Type': 'application/json', // Ensure the content type is JSON
    },
  })
  .then(response => {
    if (!response.ok) {

      throw new Error('Verification failed!');
    }
    return response.text(); // Use .text() to get response body as string
  })
  .catch(error => {
    alert(error.message);
    return false;
  });
}
async function uploadImage(file,id) {
  const formData = new FormData();
  formData.append('image', file); // Replace fileInput with your file input element
  formData.append('id', id);
  return fetch(`${url}/ports/user/image`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
    .then(async response => {
      if (!response.ok) {
        const errorMessage = await response.text(); // Await the response text for errors
        console.error(errorMessage);
        throw new Error('Verification failed!');
      }
      return response.text();
    })
    .catch(error => {
      alert(error.message);
      return false;
    });
  };
  

  async function uploadBio(bio,id) {

    return fetch(`${url}/ports/user/bio?bio=${bio}&id=${id}`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(async response => {
        if (!response.ok) { 
          const errorMessage = await response.text(); // Await the response text for errors
          console.error(errorMessage);
          throw new Error('Verification failed!');
        }
        return response.text();
      })
      .catch(error => {
        alert(error.message);
        return false;
      });
    };
    async function uploadLinkedIn(Linkedin,id) {

      return fetch(`${url}/ports/user/Linkedin?Linkedin=${Linkedin}&id=${id}`, {
        method: 'POST',
        credentials: 'include',
      })
        .then(async response => {
          if (!response.ok) { 
            const errorMessage = await response.text(); // Await the response text for errors
            console.error(errorMessage);
            throw new Error('Verification failed!');
          }
          return response.text();
        })
        .catch(error => {
          alert(error.message);
          return false;
        });
      };

function makeAuthenticatedRequest() {
  const token = SecureStorage.getItem('userToken');
  fetch('${url}/protected', {
    method: 'GET',
    credentials:'include',
    headers: {
   
    },
  })
  .then(response => response.json())
  .catch(error => console.error('Error:', error));
}

function getBalance(id) {
  const token = getToken();
  return fetch(`${url}/ports/user/getTotalBalance?id=${id}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      // Add any necessary headers
    },
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.text(); // Read the response body as text
  })
  .then(encryptedData => {
    try {
   
      const decryptedData = decrypt(encryptedData); // Use your decrypt function

      return parseFloat(decryptedData); // Convert it to a float and return
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw error;
    }
  })
  .catch(error => {
    console.error('Error fetching balance:', error);
    throw error;
  });
}

// function getBalance(id) {
//   const token = getToken();
//   return fetch(`${url}/ports/user/getTotalBalance?id=${id}`,{
//     method: 'GET',
//     credentials:'include',
//     headers: {
    
//     },
//   })
//     .then(response => response.text())
//     .catch(error => {
//       console.error('Error fetching users:', error);
//       throw error;
//     });
// }
function getCash(id) {
  const token = getToken();
  return fetch(`${url}/ports/user/getCash?id=${id}`,{
    method: 'GET',
    credentials:'include',
    headers: {
    
    },
  })
    .then(response => response.text()).then(encryptedData => {
      try {
     
        const decryptedData = decrypt(encryptedData); // Use your decrypt function

        return decryptedData;
      } catch (error) {
        console.error('Error decrypting data:', error); 
        throw error;
      }
    })
    .catch(error => {
      console.error('Error fetching users:', error);
      throw error;
    });
}


// Helper function to get the token from local storage
function getToken() {
  const userToken = SecureStorage.getItem('secureToken');

  return userToken;
}

// Fetch functions with updated URLs and headers

// add encrypting
function getPrices(symbols) {
  const symbolsParam = symbols.join(',');

  return fetch(`${url}/ports/stocks/getPrices?symbols=${symbolsParam}`, {
    method: 'GET',
    credentials:'include',
    headers: {
    
    },
  })
   .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
}




async function getStocks(update = false) {

  let data = await getData("getAllStocks");
  if (update) {
    data = {};
  }
  
  if (Object.keys(data).length !== 0) {
    data = decryptionUtil.decryptFields(data); 
    return data.stocks; 
  }
  else{
  data = await fetch(`${url}/ports/stocks/getAllStocks`, {
    credentials:'include',
    headers: {
    
    },
  })
  .then(response => response.text())
}
  await storeData("getAllStocks",data);
  console.log("stock data:",data);
  data = decryptionUtil.decryptFields(data);
  
  return data.stocks;
        
       
}

function getTop5Stocks() {
  return fetch(`${url}/ports/stocks/getTop5`, {
    credentials:'include',
    headers: {
    
    },
  })
  .then(response => {
    
    return  response.json() })
        
       
}

function getLoginUsers(username) {
  const token = getToken();



  return fetch(`${url}/ports/user/getOneUsers?Username=${username}`, {
    credentials:'include',
    headers: {
    },
  })
    .then(response => response.text()).then(encryptedData => {
      try {
      
        const decryptedData = decryptionUtil.decryptFields(encryptedData); // Use your decrypt function
       
        return decryptedData; // Convert it to a float and return
      } catch (error) {
        console.error('Error decrypting data:', error);
        throw error;
      }
    })
    .catch(error => {
     
      console.error('Error fetching users:', error);
      throw error;
    });
}






function changeVis(id) {
  const token = getToken();
  return fetch(`${url}/ports/Portfolio/Vis?port_id=${id}`, {
    method: 'POST',
    credentials:'include',
    headers: {
      'Content-Type': 'application/json',
   
    },
  })
    .then(response => response.text());
}




function createUser(username, password, email,bio,tags,linkedin) {
  const token = getToken();

  const tagArray = Array.isArray(tags) ? tags : tags?.split(',').filter(Boolean) || [];
  
  const encodedTags = tagArray.map(tag => encodeURIComponent(tag)).join(',');


  const TAG_MAPPING = {
    "NYU - MFG": "2",
    "Purdue - Boiler Quant": "3",
    "Johns Hopkins Salant Investing Group": "5",
    "Purdue - Investment Group": "7",
    "UNC - Carolina investment group": "8"
  };

  const tagIds = tagArray
  .map(tag => tag.trim()) // Trim whitespace
  .map(tag => TAG_MAPPING[tag])
  .filter(id => id !== undefined);



  return fetch(`${url}/ports/user/saveUsers?tags=${tagIds.join(',')}`, {
    method: 'POST',
    credentials:'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password, email,bio,linkedin }),
  })
  .then(response => response.text()).then(encryptedData => {
    try {
 
      const decryptedData = decryptionUtil.decryptFields(encryptedData); 
    
      return decryptedData; 
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw error;
    }
  });
}
async function changeUsername(userId, username) {
  const token = getToken();
  return fetch(`${url}/ports/user/changeUsername?userId=${userId}&Username=${username}`, {
    method: 'POST',
    credentials:'include',
    headers: {
   
    },
  })
  .then(response => {
    if (response.status === 500) {
      throw new Error("Failed to update username!");
    }
    return response.text();
  })
  .then(data => {
   
    return data;
  })
  .catch(error => {
    alert(error.message);
  });
}

async function changeEmail(userId, email) {
  const token = getToken();
  
  return fetch(`${url}/ports/user/changeEmail?userId=${userId}&email=${email}`, {
    method: 'POST',
    credentials:'include',
    headers: {
   
    },
  })
  .then(response => {
    if (response.status === 500) {
      throw new Error("Failed to update email!");
    }
    return response.text();
  })
  .then(data => {
    
  })
  .catch(error => {
    alert(error.message);
  });
}

async function changePassword(userId, newPassword, oldPassword) {
  const token = getToken();
  return fetch(`${url}/ports/user/changePassword?userId=${userId}&password=${newPassword}&oldpassword=${oldPassword}`, {
    method: 'POST',
    credentials:'include',
    headers: {
    
    },
  })
  .then(response => {
    if (response.status === 401) {
      throw new Error("Invalid old password!");
    }
    if (response.status === 500) {
      throw new Error("Failed to update password!");
    }
    return response.text();
  })
  .then(data => {
    
  })
  .catch(error => {
    alert(error.message);
  });
}
async function forgorPassword(email, password,verificationCode) {
  const token = getToken();
  return fetch(`${url}/ports/user/ForgotPass?email=${email}&password=${password}&verificationCode=${verificationCode}`, {
    method: 'POST',
    credentials:'include',
    headers: {
  
    },
  })
  .then(response => {
    
  })
  .then(data => {
    
  })
  .catch(error => {
    alert(error.message);
  });
}



function createEmail(recipient, msgBody, subject, attachment) {
  const token = getToken();
  return fetch(`${url}/ports/email/send`, {
    method: 'POST',
    credentials:'include',
    headers: {
      'Content-Type': 'application/json',
   
    },
    body: JSON.stringify({ recipient, msgBody, subject,attachment }),
  })
    .then(response => response.text());
}


function createUserPortfolios(user_id, portfolio_id, amount) {
  const token = getToken();
  return fetch('${url}/port.user_ports', {
    method: 'POST',
    credentials:'include',
    headers: {
      'Content-Type': 'application/json',
    
    },
    body: JSON.stringify({ user_id, portfolio_id, amount }),
  })
    .then(response => response.text());
}

async function createPort(name, author, stocks, percentages, description, position_types,sector,id) {
  const token = getToken();
 
  const timestampInMilliseconds = Date.now();
  const data = {
    title: name,
    author: author,
    stocks: stocks.split(' '),
    percentages: percentages.split(' '),
    description: description,
    positionTypes: position_types.split(' '),
    id: id,
    sector: sector
  };  
  const jsonString = JSON.stringify(data);
  const encodedJsonString = encodeURIComponent(jsonString);




   return await fetch(`${url}/ports/Portfolio/create`, {
    method: 'POST',
    credentials:'include',
    headers: {

      'Content-Type': 'application/json',
    },
    body: jsonString,
  }).then(response => response.text())
  

}







function updateUser(username, newUsername, newPassword) {
  return fetch(`${url}/port.users/${username}`, {
    method: 'PUT',
    credentials:'include',
    headers: {
      'Content-Type': 'application/json',
  
    },
    body: JSON.stringify({ username: newUsername, password: newPassword }),
  })
    .then(response => response.json());
}





  





function DeletePort(port_id) {
  return fetch(`${url}/ports/Portfolio/deleteTemps`, {
    method: 'DELETE',
    credentials:'include',
    headers: {
     
    },
  })
    .then(response => response.text());
}
function Delete(port_id) {
  return fetch(`${url}/ports/Portfolio/delete?portId=${port_id}&secret=insert_company_secret_here`, {
    method: 'DELETE',
    credentials:'include',
    headers: {

    },
  })
    .then(response => response.text());
}
// handleRequestApproval










function getUserById(userId) {
  const token = getToken();

  return fetch(`${url}/ports/user/getUserById?id=${userId}`, {
    method: 'GET',
    credentials:'include',
    headers: {
     
    },
  })
    .then(response => response.text()).then(encryptedData => {
      try {
        const decryptedData = decryptionUtil.decryptFields(encryptedData); 
        return decryptedData; 
      } catch (error) {
        console.error('Error decrypting data:', error);
        throw error;
      }
    })
  }
function portDraftVisual(portData) {
  const token = getToken();
  return fetch(`${url}/ports/Portfolio/getPortView`, {
    method: 'POST',
    credentials:'include',
    headers: {
    
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(portData),
    
  })
    .then(response => response.text()).then(encryptedData => {
      try {
     
        const decryptedData = decryptionUtil.decryptFields(encryptedData); 
        return decryptedData; 
      } catch (error) {
        console.error('Error decrypting data:', error);
        throw error;
      }
    })

  }



  function getInvesting(id) {
    const token = getToken();
    return fetch(`${url}/ports/user/getInvesting?id=${id}`,{
      method: 'GET',
      credentials:'include',
      headers: {
       
      },
    })
      .then(response => response.text()).then(encryptedData => {
        try {
         
          const decryptedData = decrypt(encryptedData); // Use your decrypt function
    
          return decryptedData;
        } catch (error) {
          console.error('Error decrypting data:', error); 
          throw error;
        }
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        throw error;
      });
  }


  async function requestEditPort(stocks, percentages, id) {
    const token = getToken();
   
    const timestampInMilliseconds = Date.now();
    const data = {
      stocks: stocks.split(' '),
      percentages: percentages.split(' '),
    };  
    const jsonString = JSON.stringify(data);
  
     await fetch(`${url}/ports/Portfolio/requestEditPort?portId=${id}`, {
      method: 'POST',
      credentials:'include',
      headers: {
  
        'Content-Type': 'application/json',
      },
      body: jsonString,
    }).then(response => response.text())
  }

  function editPort(id) {
    const token = getToken();
    fetch(`${url}/ports/Portfolio/editPort?portId=${id}`,{
      method: 'POST',
      credentials:'include',
      headers: {
       
      },
    })
  }


  
  function deleteuser(id) {
    const token = getToken();
    return fetch(`${url}/ports/user/deleteuser?id=${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
        },
    });
}

function resendVerificationCode(id) {
  const token = getToken();
  return fetch(`${url}/ports/user/resendverification?id=${id}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
      },
  });
}



// return a list of port ids


  async function searchPublicPortIds(searchQuery, orderBy, direction,page, update = false) {
    console.log("searchPublicPortIds",searchQuery, orderBy, direction,page);

    // Create a base query object
    const params = new URLSearchParams({
      searchQuery,
      orderBy,
      orderDirection: direction,
      page,
    });
    let data = await getData("searchPublicQuery");
    if (update) {
      data = {};
    }
    // Construct the full URL with the query string
    const fullUrl = `${url}/ports/Portfolio/searchPublicPortIds?${params.toString()}`;

    if (Object.keys(data).length !== 0) {
      data = decryptionUtil.decryptFields(data); 
      return data.content;
    } else{
  
    data = await fetch(fullUrl, {
      method: 'GET',
      credentials: 'include',
    }).then(response => response.text())
  }
  console.log("saved Data",data); 
  await storeData("searchPublicQuery",data);
  data = decryptionUtil.decryptFields(data);
  console.log("saved Data",data); 
  return data.content;

}
  

// Personal page

// function searchPersonalPorts(searchQuery, orderBy, direction,page,userId){
//     // Create a base query object

//     if(userId === null) {
      
//       userId =  SecureStorage.getItem('userId');
//     }
//     const params = new URLSearchParams({
//       searchQuery,
//       orderBy,
//       orderDirection: direction,
//       page,
//       userId: userId,
//     });
  
  
//     // Construct the full URL with the query string
//     const fullUrl = `${url}/ports/Portfolio/searchPersonalPorts?${params.toString()}`;
  
//     return fetch(fullUrl, {
//       method: 'GET',
//       credentials: 'include',
//     }).then(response => response.text()).then(encryptedData => {
//       try {
     
//         const decryptedData = decryptionUtil.decryptFields(encryptedData); 
//         return decryptedData; 
//       } catch (error) {
//         console.error('Error decrypting data:', error);
//         throw error;
//       }
//     })
//   }
  async function searchPersonalPortIds(searchQuery, orderBy, direction,page,userId,update = false){
    // Create a base query object
    let data = await getData("searchPersonalQuery");
    if (update) {
      data = {};
    }
    if(userId === null) {
      
      userId =  SecureStorage.getItem('userId');
    }
    const params = new URLSearchParams({
      searchQuery,
      orderBy,
      orderDirection: direction,
      page,
      userId: userId,
    });
    
  
  
    // Construct the full URL with the query string
    const fullUrl = `${url}/ports/Portfolio/searchPersonalPortIds?${params.toString()}`;
    if (Object.keys(data).length !== 0) {
      data = decryptionUtil.decryptFields(data);
      return data.content;
    } else{
    data = await fetch(fullUrl, {
      method: 'GET',
      credentials: 'include',
    }).then(response => response.text())
  }


  await storeData("searchPersonalQuery",data);

  data = decryptionUtil.decryptFields(data);
  return data.content;
}

  function searchInvestPorts(searchQuery, orderBy, direction,page){
    // Create a base query object
    const params = new URLSearchParams({
      searchQuery,
      orderBy,
      orderDirection: direction,
      page,
      userId: SecureStorage.getItem('userId'),
    });
  
  
    // Construct the full URL with the query string
    const fullUrl = `${url}/ports/investments/searchInvestPorts?${params.toString()}`;
  
    return fetch(fullUrl, {
      method: 'GET',
      credentials: 'include',
    }).then(response => response.text()).then(encryptedData => {
      try {
     
        const decryptedData = decryptionUtil.decryptFields(encryptedData); 
        return decryptedData; 
      } catch (error) {
        console.error('Error decrypting data:', error);
        throw error;
      }
    })
  }

// Pending page

function getPendingPorts(){
    const fullUrl = `${url}/ports/Portfolio/getPendingPorts`;
  
    return fetch(fullUrl, {
      method: 'GET',
      credentials: 'include',
    }).then(response => response.text()).then(encryptedData => {
      try {
     
        const decryptedData = decryptionUtil.decryptFields(encryptedData); 
        return decryptedData; 
      } catch (error) {
        console.error('Error decrypting data:', error);
        throw error;
      }
    })
  }

  


  function getProfilePortfolios(userId){
    const fullUrl = `${url}/ports/Portfolio/getProfilePortfolios?userId=${userId}`;
  
    return fetch(fullUrl, {
      method: 'GET',
      credentials: 'include',
    }).then(response => response.text()).then(encryptedData => {
      try {
     
        const decryptedData = decryptionUtil.decryptFields(encryptedData); 
        return decryptedData; 
      } catch (error) {
        console.error('Error decrypting data:', error);
        throw error;
      }
    })
  }

// Port page
// return the port object
async function getPort(port_id, update = false) {
  let userId = SecureStorage.getItem('userId');
  console.log("getPort",port_id,userId);

  let data = await getData("getPort"+port_id);
  if (update) {
    data = {};
  }
  // console.log("saved Data",port_id,data);
  if (Object.keys(data).length !== 0) {
    data = decryptionUtil.decryptFields(data);
    return data;
  } else{
    data = await fetch(`${url}/ports/Portfolio/getPort?portId=${port_id}&userId=${userId}`, {
    method: 'GET',
    credentials:'include',
    headers: {
      
    },
  })
    .then(response => response.text())

    await storeData("getPort"+port_id,data);
    data = decryptionUtil.decryptFields(data);
    return data;
  }
}

async function getExtraPortData(port_id, update = false) {
  const userId = SecureStorage.getItem('userId');
  let data = await getData("getExtraPortData"+port_id);
  if (update) {
    data = {};
  }
  if (Object.keys(data).length !== 0) {
    data = decryptionUtil.decryptFields(data);
    return data;
  }
  else{
    data = await fetch(`${url}/ports/Portfolio/getExtraPortData?portId=${port_id}&userId=${userId}`, {
      method: 'GET',
      credentials:'include',
      headers: {
        
      },
    })
      .then(response => response.text())
}
    await storeData("getExtraPortData"+port_id,data);
    data = decryptionUtil.decryptFields(data);
    return data;
  }



function setToPending(portId) {
  return fetch(`${url}/ports/Portfolio/setToPending?portId=${portId}`, {
    method: 'POST',
    credentials:'include',
    headers: {
   
    },
  })
    .then(response => response.text());


}

function approvePort(portId) {
  return fetch(`${url}/ports/Portfolio/setToPublic?portId=${portId}`, {
    method: 'POST',
    credentials:'include',
    headers: {
     
    },
  })
    .then(response => response.text());


}

function rejectPort(portId) {
  // TODO need to add a reason
  return fetch(`${url}/ports/Portfolio/setToPrivate?portId=${portId}`, {
    method: 'POST',
    credentials:'include',
    headers: {
    
    },
  })
    .then(response => response.text());
}





async function getNewsData() {


  return fetch(`${url}/ports/News/getnews`, {
    method: 'GET',
    credentials:'include',
    headers: {
    
    },
  })
    .then(response => response.json());
}


  // const response = await fetch(`https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=financial_markets&apikey=${process.env.REACT_APP_ALPHAVANTAGE_KEY}`);
  // const data = await response.json();
  
  // return data.feed.map(item => {
  //   // Convert sentiment label to numeric value
  //   const sentimentMap = {
  //     'Somewhat-Bullish': 1,
  //     'Bullish': 1,
  //     'Somewhat-Bearish': -1,
  //     'Bearish': -1,
  //     'Neutral': 0
  //   };
    
  //   // Convert time format from "20250122T043144" to "HH:mm"
  //   const timePublished = item.time_published;
  //   const hour = timePublished.substring(8, 10);
  //   const minute = timePublished.substring(10, 12);
  //   const formattedTime = `${hour}:${minute}`;
    
  //   return {
  //     id: Date.now() + Math.random(), // Generate unique id
  //     time: formattedTime,
  //     source: item.source.toUpperCase(),
  //     headline: item.title,
  //     sentiment: sentimentMap[item.overall_sentiment_label] || 0
  //   };
  // });
// }

function investPort(portfolio_id, user_id, amount) {
  return fetch(`${url}/ports/investments/Invest?port_id=${portfolio_id}&user_id=${user_id}&money_input=${amount}`, {
    method: 'POST',
    credentials:'include',
    headers: {
      'Content-Type': 'application/json',
    
  
    },
    body: JSON.stringify({ portfolio_id, user_id, amount }),
  })
  .then(response => response.text()).then(encryptedData => {
    try {
      const decryptedData = decryptionUtil.decryptFields(encryptedData); 
      return decryptedData; 
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw error;
    }
  })
}

function canEditPort(portId){
  return fetch(`${url}/ports/Portfolio/canEditPort?portId=${portId}`, {
    method: 'GET',
    credentials:'include',
    
  })
    .then(response => response.text()).then(encryptedData => decryptionUtil.decryptFields(encryptedData))
}




function getGeneratedPort(prompt){
  console.log("getGeneratedPort",prompt);
 return fetch(`${url}/ports/openai/getGeneratedPort`,
  {
    method: 'POST',
    credentials:'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  })  .then(response => response.text())
  .then(data => {
    data = decryptionUtil.decryptFields(data);
    return data.content;
  })

}



async function getLeaderboards(update = false) {
  let data = await getData("getLeaderboards");
  if (update) {
    data = {};
  }
  if (Object.keys(data).length !== 0) {
    data = decryptionUtil.decryptFields(data);
    return data;
  } else{
    data = await fetch(`${url}/ports/user/getLeaderboards`, {
      method: 'GET',
      credentials:'include',
    })
      .then(response => response.text())
  }
  await storeData("getLeaderboards",data);
  data = decryptionUtil.decryptFields(data);
  return data;
}

  // function getUserLeaderboard(){
  //   return fetch(`${url}/ports/user/getUserLeaderboard`, {
  //     method: 'GET',
  //     credentials:'include',
      
  //   })
  //     .then(response => response.text()).then(encryptedData => decryptionUtil.decryptFields(encryptedData))
  // }




  //   function getInvestmentLeaderboard(){
  //     return fetch(`${url}/ports/user/getInvestmentLeaderboard`, {
  //       method: 'GET',
  //       credentials:'include',
        
  //     })
  //       .then(response => response.text()).then(encryptedData => decryptionUtil.decryptFields(encryptedData))
  //   }


  //     function getClubLeaderboard(){
  //       return fetch(`${url}/ports/user/getClubLeaderboard`, {
  //         method: 'GET',
  //         credentials:'include',
          
  //       })
  //         .then(response => response.text()).then(encryptedData => decryptionUtil.decryptFields(encryptedData))
  //     }





  // function getSocialInfo(userId,portId){
  //   console.log("getting social info {} {}",userId,portId);
  //   return fetch(`${url}/ports/activity/getSocialInfo?userId=${userId}&portId=${portId}`, {
  //     method: 'GET',
  //     credentials:'include',
  //   }).then(response => response.text()).then(encryptedData => decryptionUtil.decryptFields(encryptedData))
  // }
function like(userId,portId){
  fetch(`${url}/ports/activity/like?userId=${userId}&portId=${portId}`, {
    method: 'POST',
    credentials:'include',
  })
}

function favorite(userId,portId){
  fetch(`${url}/ports/activity/favorite?userId=${userId}&portId=${portId}`, {
    method: 'POST',
    credentials:'include',
  })

}
function getFavoritesPorts(userId,){
  return fetch(`${url}/ports/activity/getFavoritesPorts?userId=${userId}`, {
    method: 'GET',
    credentials:'include',
  }).then(response => response.text()).then(encryptedData => decryptionUtil.decryptFields(encryptedData))

}

function comment(userId,portId,comment){
  fetch(`${url}/ports/activity/comment?userId=${userId}&portId=${portId}&comment=${comment}`, {
    method: 'POST',
    credentials:'include',
  })

}

function getComments(portId){
  return fetch(`${url}/ports/activity/getPortComments?portId=${portId}`, {
    method: 'GET',
    credentials:'include',
  }).then(response => response.text()).then(encryptedData => decryptionUtil.decryptFields(encryptedData)).then(data => data.content)
}
function view(portId){
  fetch(`${url}/ports/Portfolio/viewed?portId=${portId}`, {
    method: 'POST',
    credentials:'include',
  })
}


export { getBalance ,
  getUserById,
  createUser, 
  changeVis, 
  createEmail, 
  updateUser,
  createPort,
  createUserPortfolios,
  getStocks,
  loginUser,
  makeAuthenticatedRequest,
  changeUsername,
  changePassword,
  changeEmail,
  DeletePort,
  olginuser,
  verify2FA,
  deleteuser,
  Delete,
  getLoginUsers,
  getCash,
  googleLogin,
  portDraftVisual,
  verifyEmail,
  sendConfirmationEmail,
  verifyConfirmationCode,
  sendforgotEmail,
  verifyForgotConfirmationCode,
  forgorPassword,
  getPrices,
  uploadImage,
  uploadBio,
  getInvesting,
  uploadLinkedIn,
  requestEditPort,
  editPort,
  resendVerificationCode,
  getNewsData,
  getPendingPorts,
  getPort,
  setToPending,
  approvePort,
  rejectPort,
  investPort,
  canEditPort,
  // getUserLeaderboard,
  // getInvestmentLeaderboard,
  // getClubLeaderboard,
  searchInvestPorts,
  getTop5Stocks,
  getProfilePortfolios,
  // getSocialInfo,
  like,
  favorite,
  getFavoritesPorts,
  comment,
  getComments,
  view,
  searchPublicPortIds,
  searchPersonalPortIds,
  getExtraPortData,
  getLeaderboards,
  getGeneratedPort
 };