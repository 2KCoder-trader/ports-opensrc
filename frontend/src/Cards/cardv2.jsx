import React, { useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Line } from "react-chartjs-2";
import Button from "@mui/material/Button";
import SecureStorage from 'react-secure-storage';
import { getPort, view } from "../user.js";
import { useNavigate } from "react-router-dom";

function RiskBar({ props }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "5px",
      }}
    >
      <Typography
        sx={{
          color: "black",
          fontSize: "12px",
        }}
      >
        0
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "136px",
          height: "10px",
          border: "1px solid #26317A",
          borderRadius: "3px",
        }}
      >
        <Box
          sx={{
            width: `calc(${props.risk / 5} * 136px)`,
            height: "12px",
            background:
              "linear-gradient(90.04deg, #080823 0.03%, #03045E 212.11%)",
            borderRadius: "3px",
            textAlign: "right",
            fontSize: "8px",
            fontWeight: "700",
            color: "white",
            paddingRight: "2px",
          }}
        >
          {props.risk}
        </Box>
      </Box>
      <Typography
        sx={{
          color: "black",
          fontSize: "12px",
        }}
      >
        5
      </Typography>
    </Box>
  );
}

function colorCode(value, type) {
  let color;
  let new_value;
  if (value >= 0) {
    color = "#22c55e"; // Bright green
    if (type === "percent") {
      new_value = "+" + value + "%";
    } else if (type === "dollar") {
      new_value = "+$" + value;
    }
  } else if (value < 0) {
    color = "#ef0000"; // Much brighter red
    if (type === "percent") {
      new_value = value + "%";
    } else if (type === "dollar") {
      new_value = "-$" + value.toString().slice(1);
    }
  } else {
    color = "#1B263B";
  }
  return <span style={{ color: color, fontWeight: "600" }}>{new_value}</span>;
}

function Card({ id }) {
  const navigate = useNavigate();

  const [graph, setGraph] = React.useState("lifetime");
  const [values, setValues] = React.useState([]);
  const [labels, setLabels] = React.useState([]);
  const [props, setProps] = React.useState({});
  
  useEffect(() => {
    const fetchData = async () => {
      const data = await getPort(id);
      setProps(data.port);
      setValues(data.graph.cardAggAllData);
      setLabels(data.graph.cardAggAllLabels);
    };
    fetchData();
  }, [id]);


  function handleClick() {  
    view(props.id);
    navigate(`/port/${props.id}`);
      
  }

  function handleProfile(username,id) {
    // console.log(id)
    SecureStorage.setItem('u_id',username)
    console.log(SecureStorage.getItem('u_id'))
    navigate(`/profile/${username}/${id}`);
  }





const collegeTag = false;

if (collegeTag && collegeTag.image) {
    // 
} else {
    
}

  // 

  return (
    <Box
    onClick={handleClick}
      sx={{
        width: "221px",
        backgroundColor: "white",
        height: "271px",
        boxShadow: "0px 0px 3px 0px #00000080",
        borderRadius: "10px",
        padding: "7px",
        transition: "0.3s ease",
        
        "&:hover": {
      boxShadow: "0px 0px 6px 0px #00000080",
      transform: "scale(1.1)",

        },
      }}
    >
      <Typography
        sx={{
          fontSize: "16px",
          height: "20px",
          fontWeight: "700",
          color: "#080823",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {props.title}
      </Typography>
      <Typography
        sx={{
          fontSize: "10px",
          fontWeight: "400",
          color: "#080823",
        }}
      >
        {props.status}
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "5px",
        }}
      >
        <Typography
          sx={{
            fontSize: "13px",
            color: "#61616E",
            cursor: "pointer"
          }}
          onClick={(e) => {
            e.stopPropagation(); // Prevent global click event
            handleProfile(props.authorName,props.authorId); // Call the specific profile handler
          }}
        >
          {props.authorName ? props.authorName : (<div styles={{padding: "30px"}}>Loading...</div>)}
        </Typography>
        <Box sx = {{
          display: "flex",
          gap: "5px",
        }}>
{/* {Object.keys(author).length > 0 &&
  author.tags
    .filter((role) => role.type === "college")
    .map((role) => (
      <img
        src={`data:image/jpeg;base64,${role.image}`}
        alt={role.name}
        style={{
          display: "inline-block",
          width: "30px",
          height: "30px",
          margin: "5px",
          objectFit: "cover",
        }}
      />
    ))} */}


        </Box>
      </Box>
      <Box
        sx={{
          // border: "1px solid #00000040",
          // borderRadius: "10px",
          display: "flex",
          width: "200px",
          height: "142px",
          alignItems: "center",
          justifyContent: "end",
          flexDirection: "column",
        }}
      >
        
          <LineGraph y={values} x={labels} graph={graph} lineColor={"#26317A"} />
        

        {/* <Box
          sx={{
            justifyContent: "space-between",
            display: "flex",
            width: "100%",
            padding: "15px",
            paddingTop: "2px",
            paddingBottom: "2px",
          }}
        >
          <Button
            sx={{
              display: "flex",
              border: "1px solid #080823",
              borderRadius: "8px",
              color: graph === "today" ? "white" : "#080823",
              backgroundColor: graph === "today" ? "#080823" : "none",
              fontWeight: "600",
              fontSize: "13px",
              width: "78px",
              height: "22px",
              textTransform: "none",
              textAlign: "center",
              alignItems: "center",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setGraph("today")}
            }
              
          >
            Today
          </Button>
          <Button
            sx={{
              display: "flex",
              border: "1px solid #080823",
              borderRadius: "8px",
              color: graph === "lifetime" ? "white" : "#080823",
              backgroundColor: graph === "lifetime" ? "#080823" : "none",
              fontWeight: "600",
              fontSize: "13px",
              width: "78px",
              height: "22px",
              textTransform: "none",
              textAlign: "center",
              alignItems: "center",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setGraph("lifetime")}
            }
          >
            Lifetime
          </Button>
        </Box> */}
      </Box>
      <Box
        sx={{
          justifyContent: "space-between",
          display: "flex",
          width: "100%",
          // padding: "7px",
          // paddingBottom: "0px",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            color: "black",
            fontSize: "12px",
            transition: "0.3s ease",
          }}
        >
          Annual Return
        </Typography>

        <Typography
          sx={{
            fontSize: "17px",
            fontWeight: "700",
            paddingRight: "13px",
          }}
        >
          {colorCode(props.annualReturn, "percent")}
        </Typography>
      </Box>
      <Box
        sx={{
          justifyContent: "space-between",
          display: "flex",
          width: "100%",
          // padding: "7px",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            color: "black",
            fontSize: "12px",
          }}
        >
          Risk
        </Typography>

        <RiskBar props={props} />
      </Box>
    </Box>
  );
}

const data = {
  title: "Title of Port",
  status: "Public",
  username: "username",
  dailyPnL: 20,
  annualReturn: 30,
  tag: "TAG",
  risk: 3,
  valuesDaily: [10, 20, 15, 25, 20, 25, 20, 20],
  indexesDaily: [1, 2, 3, 4, 5, 6, 7, 8],
  valuesLifetime: [100, 200, 300, 150, 250, 250, 200, 100],
  indexesLifetime: [1, 2, 3, 4, 5, 6, 7, 8],
};

function DisplayCards() {
  const [cards, setCards] = React.useState([]);
  React.useEffect(() => {
    const fetchData = async () => {
      // const data = await getPortIds("personal",16);
      const data = {}
      setCards(data);
    };
    fetchData();
  }, []);

return cards.map((card) => {
  card.tag = "TAG";
  card.status = card.status[0].toUpperCase() + card.status.slice(1);
  return <PersonalCard props={card} />;
});


}

const LineGraph = ({ x, y, graph, lineColor }) => {
  // Ensure `x` has at least 20 elements, padded with nulls if necessary
  let filtered_x = x;
  // if (graph == "today" && x.length > 0) {
  //   const lastIndexDate = new Date(x[x.length - 1])
  //   const now = new Date();
  //   const totalIndexes = x.length;
  //   const currentDayAt430PM = new Date(
  //     now.getFullYear(),
  //     now.getMonth(),
  //     now.getDate(),
  //     16, // 4 PM in 24-hour format
  //     30, // 30 minutes
  //     0, // 0 seconds
  //     0 // 0 milliseconds
  //   );
  //   const currentDayAt930AM = new Date(
  //     now.getFullYear(),
  //     now.getMonth(),
  //     now.getDate(),
  //     9, // 9 AM in 24-hour format
  //     30, // 30 minutes
  //     0, // 0 seconds
  //     0 // 0 milliseconds
  //   );
  //   const totalTimeGap = currentDayAt430PM - currentDayAt930AM;
  //   const timeGap = (currentDayAt430PM - lastIndexDate) / totalTimeGap;
  //   filtered_x = x.concat(new Array(Math.floor(totalIndexes/timeGap)).fill(null));
  // }

  // Data for the graph
  const data = {
    labels: filtered_x,
    datasets: [
      {
        label: "Sample Line",
        data: y, // Replace with your own data points
        borderColor: lineColor, // Line color
        borderWidth: 3, // Line width
        fill: false,
        pointRadius: 0, // No points displayed
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allow the chart to stretch to its container
    plugins: {
      legend: {
        display: false, // Remove legend
      },
      tooltip: {
        enabled: false, // Disable tooltips
      },
    },
    hover: {
      mode: null, // Disable hover interactions
    },
    interaction: {
      mode: null, // Disable interaction modes
    },
    scales: {
      x: {
        display: false, // Remove x-axis
        beginAtZero: false, // Start x-axis at 0
      },
      y: {
        display: false, // Remove y-axis
        beginAtZero: false, // Start y-axis at 0
        // max: Math.max(...y) + Math.max(...y)*.0005, 
        // min: Math.min(...y) - Math.max(...y)*.0005, 
      },
    },
    layout: {
      padding: 0, // Remove extra padding
    },
    elements: {
      line: {
        tension: 0, // Remove bezier curves for a straight line
      },
    },
  };

  return (
    <div style={{ position: "relative", display: "flex", width: "100%", height: "80%", padding: "6px" }}>
      <Line data={data} options={options} />
    </div>
  );
};

// export default DisplayCards;

function PersonalCard({id}){
  const navigate = useNavigate();
  
  const [values, setValues] = React.useState([]);
  const [labels, setLabels] = React.useState([]);
  const [props, setProps] = React.useState({});
  
  useEffect(() => {
    const fetchData = async () => {
      const data = await getPort(id);
      setProps(data.port);
      setValues(data.graph.cardAggAllData);
      setLabels(data.graph.cardAggAllLabels);
    };
    fetchData();
  }, [id]);





  console.log()

const handleCardClick = () => {
  view(props.id);
  navigate(`/port/${props.id}`);
}
  

  return(
    <Box
    zIndex={10}
  sx={{
    width: "380px",
    height: "115px",
    borderRadius: "10px",
    boxShadow: "0px 0px 3px 0px #00000080",
    padding: "7px",
    backgroundColor: "#080823",
    transition: "0.3s ease",
    display: "flex",
    flexDirection: "row",
    zIndex: 10, 
    position: "relative", // Enables zIndex to work
    "&:hover": {
      boxShadow: "0px 0px 6px 0px #00000080",
      transform: "scale(1.1)",
      zIndex: 10, // Ensures the card appears above its container
    },
  }}
  onClick={handleCardClick}
>
      <Box>
            <Typography
        sx={{
          fontSize: "15px",
          width: "85px",
          height: "19px",
          fontWeight: "700",
          color: "#FFFFFF",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {props.title}
      </Typography>
        <Typography
          sx={{
            fontSize: "13px",
            color: "#BCBCBC",
          }}
        >
          {props.authorName}
        </Typography>
            <Box
        sx={{
          borderRadius: "10px",
          display: "flex",
          width: "220px",
          height: "68px",
          alignItems: "center",
          justifyContent: "end",
          flexDirection: "column",
        }}
      >
          <LineGraph y={values} x={labels} graph={"today"} lineColor={"#FFFFFF"} />
        </Box>
        </Box>
        
        <Box sx = {{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          padding: "7px",
          
        }}>
          <Typography
        sx={{
          fontSize: "10px",
          fontWeight: "400",
          color: "#FFFFFF",
          textAlign: "right",
          transform: "translate(3px,-12px)",

        }}
      >
        {props.status}
      </Typography>
      <Box sx = {{
        position: "relative",
        height: "120%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}>
      <Box sx = {{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
      }}>
        <Typography
          sx={{
            color: "#FFFFFF",
            fontSize: "12px",
          }}
        >
          Daily Change
        </Typography>
        <Typography sx = {{
          fontSize: "14px",
          fontWeight: "500",
        }}>
          {colorCode(props.annualReturn, "percent")}
        </Typography>
      </Box>
      <Box sx = {{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          
        }}>
      <Typography
          sx={{
            color: "#FFFFFF",
            fontSize: "12px",
          }}
        >
          Value
        </Typography>
        <Typography sx = {{
          fontSize: "14px",
          fontWeight: "500",
          color: "#FFFFFF"
        }}>
          ${props.lastValue}
        </Typography>
        </Box>
        <Box sx = {{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
      }}>
        <Typography
          sx={{
            color: "#FFFFFF",
            fontSize: "12px",
            lineHeight: "14px",
          }}
        >
          Risk Index
        </Typography>
        <Typography sx = {{
          fontSize: "14px",
          fontWeight: "500",
          color: "#FFFFFF"
        }}>
          {props.risk}
        </Typography>
        </Box>
        </Box>
        </Box>
    </Box>
  );

};

function DummyPersonalCard(){
  return (
    <Box
    zIndex={10}
  sx={{
    width: "380px",
    height: "115px",
    borderRadius: "10px",
    padding: "7px",
    backgroundColor: "#F6F5F5",
    transition: "0.3s ease",
    display: "flex",
    flexDirection: "row",
    zIndex: 10, 
    position: "relative", // Enables zIndex to work
  }}
/>
  )
}

export { Card, PersonalCard, DisplayCards, RiskBar, colorCode, DummyPersonalCard };