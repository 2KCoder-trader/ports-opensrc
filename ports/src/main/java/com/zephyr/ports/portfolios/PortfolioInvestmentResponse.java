package com.zephyr.ports.portfolios;

import com.zephyr.ports.investment.Investment;

public class PortfolioInvestmentResponse {
    private Portfolio portfolio;
    private Investment investment;

    public PortfolioInvestmentResponse(Portfolio portfolio, Investment investment) {
        this.portfolio = portfolio;
        this.investment = investment;
    }

    // Getters and setters
    public Portfolio getPortfolio() {
        return portfolio;
    }

    public void setPortfolio(Portfolio portfolio) {
        this.portfolio = portfolio;
    }

    public Investment getInvestment() {
        return investment;
    }

    public void setInvestment(Investment investment) {
        this.investment = investment;
    }
}
