package com.zephyr.ports;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PortsApplication {

	public static void main(String[] args) {
		SpringApplication.run(PortsApplication.class, args);
	}

}
