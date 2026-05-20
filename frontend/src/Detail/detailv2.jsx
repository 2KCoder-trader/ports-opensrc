import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackArrow from "./back_arrow.png";
import * as Mui from "@mui/material";
import {
  getPort,
  getLiveIndex,
  setToPending,
  investPort,
  approvePort,
  rejectPort,
  createEmail,
  getExtraPortData
} from "../user.js";
import {
  getSocialInfo,
  like,
  favorite,
  comment,
  getComments,
} from "../user.js";
import { Line } from "react-chartjs-2";
import SecureStorage from "react-secure-storage";
import { colorCode, RiskBar } from "../Cards/cardv2";
import { Delete } from "../user.js";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import RefreshIcon from '@mui/icons-material/Refresh';
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import SectorPercentages from "./components/SectorPercentages.tsx";

const adminUserIds = [16, 15, 51];

function LineGraph({ data, index, labels, unit }) {
  if (data === undefined || labels === undefined) {
    return <div>Loading...</div>;
  }

  const datas = {
    labels: labels,
    datasets: [
      {
        label: "Portfolio Performance",
        data: data,
        fill: {
          target: 'origin',
          above: 'rgba(255, 255, 255, 0.1)',  // Light white fill above the line
          below: 'rgba(255, 255, 255, 0.05)'  // Lighter fill below the line
        },
        segment: {
          borderColor: (context) => {
            return context.p0DataIndex < index ? 
              'rgba(255, 255, 255, 0.6)' :     // More visible white for backtest
              'rgba(255, 255, 255, 0.9)';      // Bright white for live data
          },
          borderWidth: 2,
        },
        pointBackgroundColor: (context) => {
          const dataIndex = context.dataIndex;
          if (dataIndex === data.length - 1) return "#ffffff";  // Last point
          if (dataIndex === index - 1) return "#b8b8b8";       // Last backtest point
          return "transparent";                                 // Hide other points
        },
        pointRadius: (context) => {
          const dataIndex = context.dataIndex;
          if (dataIndex === data.length - 1) return 6;  // Larger last point
          if (dataIndex === index - 1) return 4;        // Medium size for last backtest point
          return 0;                                     // Hide other points
        },
        pointBorderWidth: 2,
        pointBorderColor: "#111152",
        tension: 0.4, // Smoother line
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: "nearest",
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#111152',
        bodyColor: '#111152',
        borderColor: '#ffffff',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (context) => {
            const date = new Date(context[0].parsed.x * 1000);
            if (unit === "day") {
              return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
            } else {
              return date.toLocaleString("en-US", {
                weekday: 'long',
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });
            }
          },
          label: (context) => {
            const label = context.dataIndex < index ? "Backtest" : "Live";
            const value = context.raw.toFixed(2);
            return `${label}: $${value}`;
          }
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    scales: {
      x: {
        type: "time",
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
          padding: 10,
          color: "#ffffff",
          font: {
            size: 12,
            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
          },
          callback: (value) => {
            const date = new Date(value * 1000);
            if (unit === "minute") {
              return date.toLocaleString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true
              });
            } else if (unit === "hour") {
              return date.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                hour12: true
              });
            } else {
              return date.toLocaleString("en-US", {
                month: "short",
                day: "numeric"
              });
            }
          },
        },
      },
      y: {
        position: 'right',
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
        },
        ticks: {
          padding: 10,
          color: "#ffffff",
          font: {
            size: 12,
            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
          },
          callback: (value) => `$${value.toFixed(2)}`
        },
      },
    },
  };

  return (
    <Mui.Box
      sx={{
        width: "100%",
        maxWidth: "900px",
        minHeight: "350px",
        padding: "20px",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
      }}
    >
      <Line data={datas} options={options} className="canvas" />
    </Mui.Box>
  );
}

function DescriptionField({ description }) {
  return (
    <Mui.Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }}
    >
      <Mui.Typography 
        sx={{ 
          color: "#e0d5f3",
          fontSize: "18px",
          fontWeight: "500"
        }}
      >
        Description
      </Mui.Typography>
      <Mui.Box
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          borderRadius: "12px",
          padding: "20px",
          color: "#ffffff",
          fontSize: "16px",
          lineHeight: "1.6",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.12)",
          }
        }}
      >
        {description}
      </Mui.Box>
    </Mui.Box>
  );
}

function DisplaySocial({ id,data, rerender,setRerender }) {
  // const [data, setData] = React.useState({});
  // const [rerender, setRerender] = React.useState(0);
  // useEffect(() => {
  //   const fetchSocial = async () => {
  //     console.log(
  //       "first fetching social {} {} ",
  //       SecureStorage.getItem("userId"),
  //       id
  //     );
  //     const data = await getSocialInfo(SecureStorage.getItem("userId"), id);
  //     setData(data);
  //   };
  //   fetchSocial();
  // }, [id, rerender]);

  const handleLikeClicked = async () => {
    await like(SecureStorage.getItem("userId"), id);
    // 
    // setRerender(rerender + 1);-
  };
  const handleFavoriteClicked = async () => {
    await favorite(SecureStorage.getItem("userId"), id);
    // need to do an unpdate process here or in the function with posts
    // setRerender(rerender + 1);
  };
  const handleRefreshClicked = async () => {
    console.log("refreshing data: ", id);
    await getPort(id, true);
    await getExtraPortData(id,true);
    setRerender(rerender + 1);
  };


  return (
    Object.keys(data).length > 0 && (
      <div style={{ display: "flex", gap: "10px" }}>
        <Mui.IconButton
          onClick={handleFavoriteClicked}
          sx={{
            color: "#080823",
            fontSize: "35px",
          }}
        >
          {data.favoriteStatus ? (
            <StarIcon fontSize="inherit" />
          ) : (
            <StarBorderIcon fontSize="inherit" />
          )}
        </Mui.IconButton>

        <Mui.IconButton
          onClick={handleLikeClicked}
          sx={{
            color: "#080823",
            fontSize: "35px",
          }}
        >
          {data.likeStatus ? (
            <ThumbUpAltIcon fontSize="inherit" />
          ) : (
            <ThumbUpOffAltIcon fontSize="inherit" />
          )}
        </Mui.IconButton>
        <Mui.IconButton
          onClick={handleRefreshClicked}
          sx={{
            color: "#080823",
            fontSize: "35px",
          }}
        >
          <RefreshIcon fontSize="inherit" />
        </Mui.IconButton>
        
      </div>
    )
  );
}

const PortfolioModal = ({ isOpen, handleCreationClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backdropFilter: "blur(5px)",
        width: "100vw",
        height: "100vh",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "5px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "20px", padding: "20px" }}>
          This port is currently private. To make it public, click the publish
          button located at the top of the page
        </div>
        <div
          onClick={handleCreationClose}
          style={{
            textAlign: "center",
            border: "2px solid #1B263B",
            display: "inline-block",
            padding: "5px 15px",
            marginBottom: "10px",
            borderRadius: "5px",
            cursor: "pointer",
            backgroundColor: "white",
            color: "#1B263B",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#1B263B";
            e.target.style.color = "#F0F0F5";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "white";
            e.target.style.color = "#1B263B";
          }}
        >
          Back to Page
        </div>
      </div>
    </div>
  );
};

function Comments({ comments, id }) {
  // const [comments, setComments] = React.useState([]);

  // const commentExample = {
  //   user: "John Doe",
  //   date: "2021-10-10",
  //   text: "This is a comment",
  // };
  // React.useEffect(() => {
  //   const fetchComments = async () => {
  //     if (id) {
  //       console.log("fetching comments: ", id);
  //       const comments = await getComments(id);
  //       console.log("fetching comments: ", comments);
  //       setComments(comments);
  //     }
  //   };
  //   fetchComments();
  // }, [id]);

  const [commentDraft, setCommentDraft] = React.useState("");
  const handleCommentDraftChange = (event) => {
    setCommentDraft(event.target.value);
  };

  return (
    <Mui.Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: "40px",
        gap: "20px",
      }}
    >
      <Mui.Box
        sx={{
          width: "100%",
          maxWidth: "800px",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        <Mui.TextField
          placeholder="Write your comment here..."
          value={commentDraft}
          onChange={handleCommentDraftChange}
          sx={{
            width: "100%",
            ".MuiOutlinedInput-root": {
              minHeight: "100px",
              borderRadius: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              color: "#ffffff",
              transition: "all 0.3s ease",
              "& fieldset": {
                borderColor: "rgba(255, 255, 255, 0.2)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(255, 255, 255, 0.4)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "rgba(255, 255, 255, 0.6)",
              },
            },
            ".MuiInputBase-input": {
              color: "#ffffff",
              padding: "16px",
              fontSize: "16px",
              lineHeight: "1.5",
              "&::placeholder": {
                color: "rgba(255, 255, 255, 0.7)",
                opacity: 1,
              },
            },
          }}
          multiline
        />

        <Mui.Button
          onClick={() => comment(SecureStorage.getItem("userId"), id, commentDraft)}
          sx={{
            alignSelf: "flex-end",
            height: "44px",
            minWidth: "120px",
            borderRadius: "22px",
            backgroundColor: "#8b6dbe",
            color: "#ffffff",
            fontSize: "16px",
            fontWeight: "600",
            textTransform: "none",
            padding: "0 24px",
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: "#9d7fd0",
              transform: "translateY(-1px)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          Post
        </Mui.Button>
      </Mui.Box>
      {comments.map((comment) => {
        const formattedDate = new Date(comment.timestamp).toLocaleString(
          "en-US",
          {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          }
        );

        return (
          <Mui.Box
            key={comment.id}
            sx={{
              display: "flex",
              flexDirection: "column",
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "10px",
              marginBottom: "10px",
              backgroundColor: "#fff",
            }}
          >
            <Mui.Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "5px",
              }}
            >
              <Mui.Typography sx={{ fontWeight: "bold", fontSize: "14px" }}>
                {comment.username}
              </Mui.Typography>
              <Mui.Typography sx={{ fontSize: "12px", color: "#888" }}>
                {formattedDate}
              </Mui.Typography>
            </Mui.Box>
            <Mui.Typography sx={{ fontSize: "14px", lineHeight: "1.5" }}>
              {comment.comment}
            </Mui.Typography>
          </Mui.Box>
        );
      })}
    </Mui.Box>
  );
}

function PortInfo() {
  const userId = SecureStorage.getItem("userId");
  const navigate = useNavigate();
  const { id } = useParams();
  // id represents the id of the portfolio
  // type represents the type of the portfolio Public, Private, Pending
  const [reserve, setReserve] = React.useState(0);
  function handleProfile(username, id) {
    // console.log(id)
    SecureStorage.setItem("u_id", username);
    console.log(SecureStorage.getItem("u_id"));
    navigate(`/profile/${username}/${id}`);
  }
  const timeframes = ["1D", "1W", "1M", "1Y", "ALL"];
  const timeframesTOinterval = {
    "1D": "minute",
    "1W": "hour",
    "1M": "day",
    "1Y": "day",
    "ALL": "day",
  };
  const [comments, setComments] = React.useState([]);
  const [index, setIndex] = React.useState(0);
  const [selectedTimeframe, setSelectedTimeframe] = React.useState("ALL");
  console.log("selectedTimeframe: ", selectedTimeframe);
  const [data, setData] = React.useState({});
  const [graphData, setGraphData] = React.useState({});
  const [graphValues, setGraphValues] = React.useState([]);
  const [graphLabels, setGraphLabels] = React.useState([]);
  const [isAdmin, setIsAdmin] = React.useState(adminUserIds.includes(userId));
  const [isOwner, setIsOwner] = React.useState(false);
  const [showStockModal, setShowStockModal] = React.useState(false);
  const [showStockButton, setShowStockButton] = React.useState(true);
  const [showInvesting, setShowInvesting] = React.useState(false);
  const [showApproval, setShowApproval] = React.useState(false);
  const [isInvesting, setIsInvesting] = React.useState(false);
  const [showEditButton, setShowEditButton] = React.useState(false);
  const [rerender, setRerender] = React.useState(0);
  const [ratio, setRatio] = React.useState(1);
  const [showDeleteButton, setShowDeleteButton] = React.useState(false);
  const [author, setAuthor] = React.useState({});
  const [modalOpen, setModalOpen] = React.useState(true);
  const [sectorData, setSectorData] = React.useState([]);
  const [creationDate, setCreationDate] = React.useState(0);
  const [extraData, setExtraData] = React.useState({});

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };
  // const sectorData = [
  //     { name: 'Technology', percentage: 25 },
  //     { name: 'Healthcare', percentage: 20 },
  //     { name: 'Finance', percentage: 15 },
  //     { name: 'Consumer Goods', percentage: 10 },
  //     { name: 'Energy', percentage: 10 },
  //     { name: 'Utilities', percentage: 5 },
  //     { name: 'Real Estate', percentage: 5 },
  //     { name: 'Materials', percentage: 5 },
  //     { name: 'Industrials', percentage: 5 },
  //   ];
const sector_lst = ['technology', 'health_Care', 'financials', 'consumer_Staples', 'energy', 'utilities', 'real_Estate', 'materials', 'industrials'];


function getSectorData(portStocks) {
  console.log("portStocks: ", portStocks);
  let sectorData = {};
  for (const stock of portStocks) {
    console.log("stock: ", stock);
    if (stock.stockId.sector in sectorData) {
      sectorData[stock.stockId.sector] += stock.curPerc;
    } else {
      sectorData[stock.stockId.sector] = stock.curPerc;
    }
  }
  sectorData = Object.entries(sectorData).map(([key, value]) => ({
    name: key,
    percentage: value,
  }));
  return sectorData;
}

  const handleDelete = async () => {
    await Delete(id);
    navigate("/home");
  };
  const decodeHtmlEntities = (text) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    return doc.documentElement.textContent;
  };
  React.useEffect(() => {
    const fetchData = async () => {
      console.log("fetching userId: ", SecureStorage.getItem("userId"));
      let portData = await getPort(id);
      portData = portData.port
      decodeHtmlEntities(portData);
      setAuthor(portData.authorName);
      const extraPortData = await getExtraPortData(id);
      console.log("extraPortData: ", extraPortData);
      setExtraData(extraPortData);
      const sectorData = getSectorData(extraPortData.stocks);
      console.log("sectorData: ", sectorData);
      setSectorData(sectorData);
      setData(portData);
      // console.log("ratio2: ",portData.ratio);
      console.log("comments: ", extraPortData.comments);
      setComments(extraPortData.comments);
      setReserve(portData.reserve);
      setGraphLabels(extraPortData.graphData.aggATLabels);
      setGraphValues(extraPortData.graphData.aggATData);
      console.log("portData: ", portData);
      setIsOwner(userId === portData.authorId);
      const date = new Date(portData.creationDate * 1000);
      setCreationDate(date);
      if (portData.ratio !== 0) {
        console.log("ratio1: ", portData.ratio);
        setRatio(portData.ratio);
        setIsInvesting(true);
      }
    };

    fetchData();
    // const intervalId = setInterval(fetchData, 60000);

    // return () => clearInterval(intervalId);
  }, [id,rerender]);


  console.log("data: ", data);

  React.useEffect(() => {
    const fetchData = async () => {
      console.log("fetching data: ",graphData);
      if (selectedTimeframe === "ALL") {
        setGraphLabels(graphData.aggATLabels);
        setGraphValues(graphData.aggATdata);
      } else if (selectedTimeframe === "1Y") {
        setGraphLabels(graphData.agg1YLabels);
        setGraphValues(graphData.agg1YData);
      } else if (selectedTimeframe === "1M") {
        setGraphLabels(graphData.agg1MLabels);
        setGraphValues(graphData.agg1MData);
      } else if (selectedTimeframe === "1W") {
        setGraphLabels(graphData.agg1WLabels);
        setGraphValues(graphData.agg1WData);
      } else if (selectedTimeframe === "1D") {
        setGraphLabels(graphData.agg1DLabels);
        setGraphValues(graphData.agg1DData);
      }
    }
    if (Object.keys(graphData).length > 0) {
      fetchData();

    }

  },[selectedTimeframe]);


  React.useEffect(() => {
    if (isOwner && isAdmin) {
      setShowDeleteButton(true);
    }
    if (data.status) {
      console.log("isOwner: ", isOwner);
      console.log("isAdmin: ", isAdmin);
      console.log("status: ", data.status);
      if (data.status === "private" && !isOwner) {
        navigate("/home");
      }
      if (!isOwner) {
        setShowInvesting(true);
      }

      if (data.status === "pending") {
        if (!isOwner) {
          if (!isAdmin) {
            navigate("/home");
          }
        }

        if (isAdmin) {
          setShowApproval(true);
        }
      }
      if (isOwner || isAdmin) {
        setShowStockButton(true);
      }
      // if (data.status === "private" && isOwner){
      //   setShowEditButton(true);
      // }
    }
  }, [data, isOwner, isAdmin]);

  return (
    <Mui.Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#111152",
        color: "#ffffff",
        padding: "30px",
        overflow: "auto",
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          background: "#0d0d40",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#1d1d6b",
          borderRadius: "4px",
        },
        marginBottom: "0",
        minWidth: "900px",
      }}
    >
      {data.status === "private" && modalOpen && (
        <PortfolioModal isOpen={modalOpen} handleCreationClose={handleCloseModal} />
      )}
      {/* {showStockModal && (
        <StockModal stockData={data.portStocks} setShowStockModal={setShowStockModal} />
      )} */}

      <Mui.Box
        sx={{
          display: "flex",
          gap: "10px",
          zIndex: "1",
          backgroundColor: "#1d1d6b",
          padding: "15px",
          borderRadius: "12px",
          marginBottom: "20px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
        }}
      >
        <Mui.Button
          sx={{
            width: "149px",
            height: "39px",
            borderRadius: "10px",
            border: "1px solid #6b4d9e",
            backgroundColor: "rgba(107, 77, 158, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: "rgba(107, 77, 158, 0.2)",
            }
          }}
          onClick={() => navigate("/home")}
        >
          <img src={BackArrow} style={{ marginRight: "8px", filter: "brightness(0) invert(1)" }} />
          <Mui.Typography sx={{ color: "#fff", fontWeight: "700", fontSize: "20px" }}>
            Back
          </Mui.Typography>
        </Mui.Button>
        {data.status === "private" && (
          <Mui.Button
            sx={{
              width: "149px",
              height: "39px",
              borderRadius: "10px",
              border: "1px solid #6b4d9e",
              backgroundColor: "rgba(107, 77, 158, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(107, 77, 158, 0.2)",
              }
            }}
            onClick={() => setToPending(data.id)}
          >
            <Mui.Typography sx={{ color: "#fff", fontWeight: "700", fontSize: "20px" }}>
              Publish
            </Mui.Typography>
          </Mui.Button>
        )}
        {/* {showStockButton && (
          <Mui.Button
            sx={{
              width: "149px",
              height: "39px",
              borderRadius: "10px",
              border: "1px solid #6b4d9e",
              backgroundColor: "rgba(107, 77, 158, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(107, 77, 158, 0.2)",
              }
            }}
            onClick={() => setShowStockModal(true)}
          >
            <Mui.Typography sx={{ color: "#fff", fontWeight: "700", fontSize: "20px" }}>
              Stocks
            </Mui.Typography>
          </Mui.Button>
        )} */}

        {showEditButton && (
          <Mui.Button
            sx={{
              width: "149px",
              height: "39px",
              borderRadius: "10px",
              border: "1px solid #6b4d9e",
              backgroundColor: "rgba(107, 77, 158, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(107, 77, 158, 0.2)",
              }
            }}
            onClick={() => navigate(`/edit/${data.id}`)}
          >
            <Mui.Typography sx={{ color: "#fff", fontWeight: "700", fontSize: "20px" }}>
              Edit
            </Mui.Typography>
          </Mui.Button>
        )}

        {showDeleteButton && (
          <Mui.Button
            sx={{
              width: "149px",
              height: "39px",
              borderRadius: "10px",
              border: "1px solid #6b4d9e",
              backgroundColor: "rgba(107, 77, 158, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(107, 77, 158, 0.2)",
              }
            }}
            onClick={handleDelete}
          >
            <Mui.Typography sx={{ color: "#fff", fontWeight: "700", fontSize: "20px" }}>
              Delete
            </Mui.Typography>
          </Mui.Button>
        )}
        {data.id && <DisplaySocial data={extraData} id={data.id} rerender={rerender} setRerender={setRerender}/>}
      </Mui.Box>

      <Mui.Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#1d1d6b",
          borderRadius: "12px",
          padding: "30px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
        }}
      >
        <Mui.Typography
          sx={{
            color: "#ffffff",
            fontWeight: "700",
            fontSize: "35px",
            lineHeight: "42.7px",
            marginBottom: "10px",
            textShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          {data.title}
        </Mui.Typography>
        
        <Mui.Typography
          sx={{
            color: "#e0d5f3",  // Brightened from #b8a8d8
            fontSize: "18px",
            lineHeight: "22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "30px",
            cursor: "pointer",
            "&:hover": {
              color: "#ffffff",
            }
          }}
          onClick={() => handleProfile(data.authorName, data.authorId)}
        >
          By {data.authorName}
          <Mui.Box sx={{ display: "flex", gap: "5px", marginLeft: "10px" }}>
            {/* {Object.keys(author).length > 0 && author.tags.map((role) => (
              <Mui.Typography
                sx={{
                  backgroundColor: "#8b6dbe",  // Brightened from #6b4d9e
                  borderRadius: "5px",
                  padding: "2px 9px",
                  color: "#ffffff",
                  fontSize: "10px",
                  textTransform: "uppercase",
                  fontWeight: "600",
                }}
              >
                {role.name}
              </Mui.Typography>
            ))} */}
          </Mui.Box>
        </Mui.Typography>

        <Mui.Box
          sx={{
            display: "flex",
            width: "900px",
            justifyContent: "center",
            gap: "30px",
            marginBottom: "20px",
          }}
        >
          {/* {timeframes.map((timeframe) => (
            <Mui.Button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              sx={{
                color: selectedTimeframe === timeframe ? "#ffffff" : "#e0d5f3",
                backgroundColor: selectedTimeframe === timeframe ? "rgba(139, 109, 190, 0.4)" : "transparent",
                borderRadius: "8px",
                padding: "8px 16px",
                minWidth: "60px",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(139, 109, 190, 0.3)",
                  color: "#ffffff",
                },
              }}
            >
              {timeframe}
            </Mui.Button>
          ))} */}
        </Mui.Box>

        <LineGraph
          data={graphValues}
          labels={graphLabels}
          index={index}
          unit={timeframesTOinterval[selectedTimeframe]}
        />

        <Mui.Box sx={{ width: "90%", marginTop: "30px" }}>
          {showInvesting && (
            <InvestmentTabs
              reserve={reserve}
              portId={data.id}
              isInvesting={isInvesting}
              setRerender={setRerender}
              rerender={rerender}
            />
          )}
          {/* {showApproval && (
            <Approval portId={data.id} author={data.author} name={data.title} />
          )} */}
        </Mui.Box>

        <Mui.Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "40px",
            width: "90%",
            marginTop: "40px",
            padding: "20px",
            backgroundColor: "#111152",
            borderRadius: "12px",
          }}
        >
          <Mui.Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              padding: "20px",
              backgroundColor: "#1d1d6b",
              borderRadius: "12px",
            }}
          >
            <Detail name="Value" value={`$${data.lastValue}`} />
            <Detail name="Annual Return" value={colorCode(data.annualReturn, "percent")} />
            <Detail name="Daily Change" value={colorCode(data.dailyPnl, "dollar")} />
            <Detail name="Risk Index" value={
              <Mui.Box sx={{ transform: "scale(1.3)", transformOrigin: "right" }}>
                <RiskBar props={data} />
              </Mui.Box> 
            } />
            <Detail name="Expense Ratio" value={data.expenseRatio} />
            <Detail name="Sharpe Ratio" value={data.sharpeRatio} />
            <Detail name="Views" value={data.views} />
            <Detail name="Created" value={new Date(data.creationDate*1000).toLocaleDateString()} />
          </Mui.Box>

          <Mui.Box
            sx={{
              padding: "20px",
              backgroundColor: "#1d1d6b",
              borderRadius: "12px",
            }}
          >
            {/* <SectorPercentages sectors={sectorData} /> */}
          </Mui.Box>
        </Mui.Box>

        <Mui.Box
          sx={{
            width: "90%",
            marginTop: "40px",
            padding: "20px",
            backgroundColor: "#111152",
            borderRadius: "12px",
          }}
        >
          <DescriptionField description={data.description} />
        </Mui.Box>

        <Mui.Box
          sx={{
            width: "90%",
            marginTop: "40px",
            marginBottom: "40px",
          }}
        >
          <Comments comments={comments} id={data.id} />
        </Mui.Box>
      </Mui.Box>
    </Mui.Box>
  );
}

function InvestmentTabs({
  reserve,
  portId,
  isInvesting,
  setRerender,
  rerender,
}) {
  const [input, setInput] = React.useState("");
  const [action, setAction] = React.useState("buy");
  const [showSell, setShowSell] = React.useState(false);

  async function OrderConfirmPressed() {
    console.log("Order Confirm Pressed");
    if (action === "buy") {
      await investPort(
        portId,
        SecureStorage.getItem("userId"),
        Number.parseFloat(input)
      );
    } else {
      await investPort(
        portId,
        SecureStorage.getItem("userId"),
        -Number.parseFloat(input)
      );
    }
    setRerender(rerender + 1);
  }

  if ((reserve !== 0 || isInvesting) && !showSell) {
    setShowSell(true);
  }
  // const handleAmountChange = (event) => {
  //   if (/^\d*\.?\d*$/.test(event.target.value)) {
  //     setInput(event.target.value)
  //   }
  // }

  return (
    <>
      {reserve !== 0 && (
        <Mui.Typography
          sx={{
            color: "#4F1313",
            fontSize: "15px",
            justifySelf: "center",
            textAlign: "center",
          }}
        >
          {reserve > 0 ? "Buying" : "Selling"} ${Math.abs(reserve)} @ OPEN (9:30
          EST)
        </Mui.Typography>
      )}
      <Mui.Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          marginTop: "20px",
          gap: "20px"
        }}
      >
        <Mui.Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Mui.Button
            sx={{
              border: "2px solid #080823",
            borderRadius: "10px",
            backgroundColor: action === "buy" ? "#080823" : "transparent",
            justifyContent: "center",
            alignItems: "center",
            height: "42px",
            textTransform: "none",
            }}
            onClick={() => setAction("buy")}
          >
            <Mui.Typography
              sx={{
                color: action === "buy" ? "white" : "#080823",
                fontSize: "20px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Buy
            </Mui.Typography>
          </Mui.Button>
          {showSell && (
            <Mui.Button
              sx={{
                border: "2px solid #080823",
            borderRadius: "10px",
            backgroundColor: action === "sell" ? "#080823" : "transparent",
            height: "42px",
            justifyContent: "center",
            alignItems: "center",
            textTransform: "none",
              }}
              onClick={() => setAction("sell")}
            >
              <Mui.Typography
                sx={{
                  color: action === "sell" ? "white" : "#080823",
                  fontSize: "20px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Sell
              </Mui.Typography>
            </Mui.Button>
            
            
          )}
        </Mui.Box>
        <Mui.TextField
          id="outlined-basic"
          placeholder="$5 minimum"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          sx={{
            width: "397px",
            ".MuiOutlinedInput-root": {
              height: "42px",
              borderRadius: "10px",
              backgroundColor: "#ffffff",
              "& fieldset": {
                border: "1px solid rgba(255, 255, 255, 0.3)",
              },
              "&:hover fieldset": {
                border: "1px solid rgba(255, 255, 255, 0.5)",
              },
            },
            ".MuiInputBase-input": {
              padding: "8px",
              fontSize: "16px",
              color: "#080823",
              "&::placeholder": {
                color: "#080823",
                opacity: 0.7,
              },
            },
          }}
        />
        <Mui.Button
          sx={{
            backgroundColor: "#ffffff",
            borderRadius: "10px",
            height: "42px",
            width: "200px",
            color: "#080823",
            fontSize: "16px",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#f0f0f0",
            },
          }}
          onClick={OrderConfirmPressed}
        >
          Confirm {action === "buy" ? "Buy" : "Sell"} Order
        </Mui.Button>
      </Mui.Box>
    </>
  );
}

function StockModal({ stockData, setShowStockModal }) {
  return (
    <Mui.Box
      sx={{
        position: "absolute",
        background: "transparent",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // backdropFilter: 'blur(5px)',

        width: "100%",
        height: "100%",
        zIndex: "100",
      }}
      onClick={() => setShowStockModal(false)}
    >
      <Mui.Box
        sx={{
          background: "white",
          padding: "20px",
          borderRadius: "5px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          height: "400px",
          overflow: "auto",
          zIndex: "101",
        }}
      >
        {stockData.map((stock) => (
          <Mui.Typography
            sx={{
              fontSize: "20px",
              color: stock.status === "active" ? "#080823" : "red",
              marginBottom: "10px",
            }}
          >
            {stock.stockId.ticker} - {stock.curPerc.toFixed(2)}%
          </Mui.Typography>
        ))}
      </Mui.Box>
    </Mui.Box>
  );
}
function Approval({ portId, author, name }) {
  const [reason, setReason] = React.useState("");

  const handleApproveClick = async () => {
    // if(status === "pending"){

    await approvePort(portId);
    createEmail(
      author.email,
      `Thank you for submitting your port "${name}" for review! Your port has been approved and is now public on the website.`,
      `${author.username} Port Approval - ${name}`
    );
    //   } else{
    //     await editPort(portId);
    //     await dailyUpdatePortfolio(portId);
    //   }
  };
  const handleRejectClick = async () => {
    await rejectPort(portId);
    createEmail(
      author.email,
      `Thank you for submitting your port "${name}" for review! We regret to inform you that this port has been rejected for the following reason: "${reason}". Feel free to edit it and resubmit for review.`,
      `${author.username} Port Rejection - ${name}`
    );
  };

  //   const handleApproveClick = async () => {
  //     if (status === "pending") {
  //       const response = await approvePort(portId)
  //     } else {
  //       await editPort(portId)
  //       await dailyUpdatePortfolio(portId)
  //     }
  //   }
  //   const handleRejectClick = async () => {
  //     const response = await rejectPort(portId, reason)
  //   }

  return (
    <Mui.Box
      sx={{
        gap: "20px",
        alignItems: "center",
      }}
    >
      <Mui.Button
        sx={{
          border: "2px solid #080823",
          borderRadius: "10px",
          height: "42px",
          width: "200px",
          color: "#080823",
          fontSize: "17px",
          textTransform: "none",
        }}
        onClick={handleApproveClick}
      >
        Approve
      </Mui.Button>
      <Mui.Button
        sx={{
          border: "2px solid #080823",
          borderRadius: "10px",
          height: "42px",
          width: "200px",
          color: "#080823",
          fontSize: "17px",
          textTransform: "none",
        }}
        onClick={handleRejectClick}
      >
        Reject
      </Mui.Button>
      <Mui.TextField
        id="outlined-basic"
        placeholder="Reason for rejection"
        value={reason} // Bind searchQuery state to the Mui.TextField
        onChange={(event) => setReason(event.target.value)} // Update state on input change
        sx={{
          width: "100%", // Set the width of the Mui.TextField
          ".MuiOutlinedInput-root": {
            height: "70px", // Set the height of the input field
            borderRadius: "5px", // Rounded corners
            "& fieldset": {
              border: "0.5px solid #08082380", // Border styling
            },
          },
          ".MuiInputBase-input": {
            padding: "8px", // Adjust padding inside the input
            paddingLeft: "30px",
            fontSize: "20px", // Adjust font size if necessary
          },
        }}
      />
    </Mui.Box>
  );
}

function Detail({ name, value }) {
  return (
    <Mui.Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        padding: "12px 15px",
        borderRadius: "8px",
        backgroundColor: "rgba(255, 255, 255, 0.08)",  // Slightly brighter background
        transition: "all 0.3s ease",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.15)",
        }
      }}
    >
      <Mui.Typography
        sx={{
          color: "#e0d5f3",  // Brightened text color
          fontSize: "16px",
          fontWeight: "500",
        }}
      >
        {name}
      </Mui.Typography>

      <Mui.Typography
        sx={{
          fontSize: "16px",
          fontWeight: "600",
          color: "#ffffff",
          textShadow: "0 1px 2px rgba(0,0,0,0.1)",
        }}
      >
        {value}
      </Mui.Typography>
    </Mui.Box>
  );
}

export default PortInfo;