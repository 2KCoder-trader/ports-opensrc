package com.zephyr.ports.investment;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.zephyr.ports.Auth.EncryptionUtil;
import com.zephyr.ports.portfolios.Portfolio;
import com.zephyr.ports.portfolios.PortfolioController;
import com.zephyr.ports.portfolios.PortfolioService;
import com.zephyr.ports.stocks.StockController;
import com.zephyr.ports.stocks.StockService;
import com.zephyr.ports.users.UserService;
import com.zephyr.ports.users.users;

@RestController
@RequestMapping("ports/investments")
public class InvestmentController {
    private static final Logger logger = LoggerFactory.getLogger(InvestmentController.class);
    @Autowired
    private PortfolioService portfolioService;

    @Autowired
    InvestmentService investmentService;
    @Autowired
    StockService stockService;

    @Autowired
    UserService userService;

    @Autowired
    @Lazy
    PortfolioController portfolioController;

    @Autowired
    StockController stockController;

    public Optional<Investment> isInvestingPort(Long port_id, Long user_id) {
        return investmentService.findInvestmentByUserIdAndPortId(user_id, port_id);
    }
    @GetMapping("/getRatio")
    public double getRatio(@RequestParam Long port_id, @RequestParam Long user_id) {
        logger.debug("getRatio {} {}", port_id, user_id);
        try{
        Optional<Investment> investment = isInvestingPort(port_id, user_id);
        logger.debug("isInvestingPort {} {} {} ", investment.isPresent(), port_id, user_id);
        if (investment.isPresent()) {
            Investment inv = investment.get();
            logger.debug("inGetRatio {} ", inv.toString());
            logger.debug("inGetRatio {} {}", inv.getInvestmentAmount(), inv.getMarketPortValue());
            return inv.getInvestmentAmount() / inv.getMarketPortValue();
        }
        return 1;
    }catch(Exception e){
        logger.error("Error: " + e.getMessage());
        return 0;
    }
    }

    


    @GetMapping("/searchInvestments")
    public String getInvestments(
        @RequestParam(defaultValue = "title") String searchBy,
        @RequestParam(defaultValue = "") String searchQuery,
        @RequestParam String userId,    // Nullable
        @RequestParam(defaultValue = "annualReturn") String orderBy,
        @RequestParam(defaultValue = "asc") String orderDirection,
        @RequestParam(defaultValue = "0") int page
    ) throws Exception {
        logger.debug("getInvestments:");

         Page<Investment> investments = investmentService.getInvestments(
            searchBy, searchQuery, userId, orderBy, orderDirection, page
        );
        // Do an InvestmentDTO for a more efficient process
        investments.forEach(investment -> {
            double calculatedLastValue = investment.getRatio() * investment.getPortfolio().getLastValue();
            double calculatedDailyPnL = investment.getRatio() * investment.getPortfolio().getDailyPnl();
            investment.getPortfolio().setLastValue(portfolioController.roundToTwoDecimalPlaces(calculatedLastValue));
            investment.getPortfolio().setDailyPnl(portfolioController.roundToTwoDecimalPlaces(calculatedDailyPnL));
        });


        logger.debug("getInvestments: {}", investments);
                return EncryptionUtil.encryptFields(investments);
                // return investments;

    };



    @PostMapping("/Invest")
    public String invest(@RequestParam Long port_id, @RequestParam Long user_id, @RequestParam Double money_input) throws Exception {

        Portfolio port = portfolioService.getPortfolioByIdd(port_id);
        users user = userService.getUserById(user_id).get();
        
        Investment investment;
        Optional<Investment> optionalInvestment = isInvestingPort(port_id, user_id);
        if (optionalInvestment.isPresent()) {
            investment = optionalInvestment.get();
        }else{
            investment = new Investment();
            investment.setCreationDate(ZonedDateTime.now(ZoneId.of("America/New_York")));
            investment.setPortfolio(port);
            investment.setUser(user);
        }
        if ( user.getMoney() < money_input+investment.getReserve()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Not enough money");
            return EncryptionUtil.encryptFields(response);
        }


        double ratio = investment.getInvestmentAmount() / investment.getMarketPortValue();
        double lastValue = port.getLastValue() * ratio;



        // 200 + -150 + -100 = -50
        if (lastValue + investment.getReserve() + money_input <= 0) {
            money_input = -lastValue;
            investment.setIsClosing(true);
            // money_input = -200
            investment.setReserve(money_input);
        } else{
            investment.setIsClosing(false);
            // 200 + -150 - 10 = 40
            investment.setReserve(investment.getReserve() + money_input);
        }



        investmentService.saveInvestment(investment);
        return EncryptionUtil.encryptFields(investment);

    }

    private void commitInvestment(Investment investment) {


        Portfolio port = investment.getPortfolio();

        double prevRatio = investment.getInvestmentAmount() / investment.getMarketPortValue();

        double prevValue = port.getLastValue() * prevRatio;

        double newValue = prevValue + investment.getReserve();

        investment.setLastInvestmentDate(ZonedDateTime.now(ZoneId.of("America/New_York")));

        investment.setInvestmentAmount(newValue);

        investment.setMarketPortValue(port.getLastValue());

        investment.setRatio(newValue / port.getLastValue());

        userService.updateUserMoney(investment.getUser().getUsername(), investment.getUser().getMoney() - investment.getReserve());

        investment.setReserve(0.0);
        if(investment.getIsClosing()){
            investmentService.deleteInvestment(investment);
        } else{
            investmentService.saveInvestment(investment);
        }
    }

    public void commitInvestments(Portfolio port) {
        List<Investment> investments = investmentService.findReservedInvestments(port);
        logger.debug("commitInvestments: {}", investments);
        for (Investment investment : investments) {
            commitInvestment(investment);
        }
    }
    @GetMapping("/searchInvestPorts")
    public String searchInvestPorts(
            @RequestParam(defaultValue = "title") String searchBy,
            @RequestParam(defaultValue = "") String searchQuery,
            @RequestParam String userId, // Nullable
            @RequestParam(defaultValue = "annualReturn") String orderBy,
            @RequestParam(defaultValue = "asc") String orderDirection
    ) throws Exception {

        List<Portfolio> portfolios = investmentService.getPortfolios(searchBy, searchQuery, userId, orderBy, orderDirection, 0);
        Map<String, List<Portfolio>> response = new HashMap<>();
        response.put("content", portfolios);
        return EncryptionUtil.encryptFields(response);
        // return response;
    }

    public List<Investment> findInvestmentsByPortId(Long portId) {
        return investmentService.findInvestmentsByPortId(portId);
      }





    public String dell(Long portId) {
        investmentService.dellee(portId);
        return "Delete";
    }

    @GetMapping("/fron")
    public Investment front(@RequestParam Long user_id, @RequestParam Long portfolio_id) {
        return investmentService.getSiInvest(user_id, portfolio_id);
    }

    public List<Investment> getUsersInvestments(@RequestParam Long user_id) {
        return investmentService.findInvestmentsPortsByUserId(user_id);
    }

    public void delete(Investment investment) {
        investmentService.deleteInvestment(investment);
    }

    public List<Portfolio> getPortsByUserId(@RequestParam Long user_id) {
        return investmentService.findPortsByUserId(user_id);
    }

}