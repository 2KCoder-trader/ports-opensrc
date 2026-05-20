package com.zephyr.ports.portfolios;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.*;


public class PythonScriptExecutor {

public String executePythonScript(String scriptPath, String... args) {
StringBuilder output = new StringBuilder();

try {
// Create a list to hold command arguments
List<String> command = List.of("python3");
command.add(scriptPath);

// Add arguments to the command list
for (String arg : args) {
command.add(arg);
}

// Create a ProcessBuilder to execute the python script
ProcessBuilder processBuilder = new ProcessBuilder(command);
processBuilder.redirectErrorStream(true);

// Start the process
Process process = processBuilder.start();

// Read the output from the script
BufferedReader reader = new BufferedReader(new
InputStreamReader(process.getInputStream()));
String line;
while ((line = reader.readLine()) != null) {
output.append(line).append("\n");
}

// Wait for the process to finish
int exitCode = process.waitFor();
System.out.println("Exit Code: " + exitCode);

} catch (Exception e) {
e.printStackTrace();
}

return output.toString();
}
}
