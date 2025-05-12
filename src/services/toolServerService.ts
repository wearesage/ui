/**
 * Tool Server Service
 * 
 * This service provides a client-side interface to the tool server.
 * It handles communication with the server-side tool endpoints.
 */

import axios from 'axios';

// Tool server configuration
// Use environment variables or fallback to default
const TOOL_SERVER_URL = 'http://localhost:3333';
const API_BASE_URL = `${TOOL_SERVER_URL}/api/tools`;

/**
 * Get the Neo4j graph schema
 * 
 * @returns The schema of the graph database
 */
export async function getGraphSchema() {
  try {
    const response = await axios.get(`${API_BASE_URL}/graph-schema`);
    return response.data;
  } catch (error) {
    console.error('Error getting Neo4j graph schema:', error);
    throw new Error(`Failed to get Neo4j graph schema: ${error}`);
  }
}

/**
 * Run a Cypher query against the Neo4j graph database
 * 
 * @param query The Cypher query to run
 * @returns The result of the query
 */
export async function runCypherQuery(query: string) {
  try {
    const response = await axios.post(`${API_BASE_URL}/cypher-query`, { query });
    return response.data;
  } catch (error) {
    console.error('Error running Cypher query:', error);
    throw new Error(`Failed to run Cypher query: ${error}`);
  }
}

/**
 * Get current weather information for a location
 * 
 * @param location The location to get weather for
 * @returns Weather information for the specified location
 */
export async function getWeather(location: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/weather`, {
      params: { location }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting weather:', error);
    throw new Error(`Failed to get weather information: ${error}`);
  }
}

/**
 * Search the web for information
 * 
 * @param query The search query
 * @returns Search results
 */
export async function searchWeb(query: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/search`, {
      params: { query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching web:', error);
    throw new Error(`Failed to search the web: ${error}`);
  }
}

/**
 * Perform a calculation
 * 
 * @param expression The mathematical expression to evaluate
 * @returns The result of the calculation
 */
export async function calculate(expression: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/calculate`, {
      params: { expression }
    });
    return response.data;
  } catch (error) {
    console.error('Error calculating:', error);
    throw new Error(`Failed to calculate expression: ${error}`);
  }
}

/**
 * Get current date and time information
 * 
 * @param timezone Optional timezone (defaults to local)
 * @returns Current date and time information
 */
export async function getDateTime(timezone?: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/date-time`, {
      params: timezone ? { timezone } : {}
    });
    return response.data;
  } catch (error) {
    console.error('Error getting date/time:', error);
    throw new Error(`Failed to get date and time information: ${error}`);
  }
}

/**
 * Get a list of valid timezones
 * 
 * @returns Array of valid timezone names
 */
export async function getTimezones() {
  try {
    const response = await axios.get(`${API_BASE_URL}/timezones`);
    return response.data;
  } catch (error) {
    console.error('Error getting timezones:', error);
    throw new Error(`Failed to get timezone list: ${error}`);
  }
}

/**
 * Execute a tool with the given parameters
 * 
 * @param tool The name of the tool to execute
 * @param params The parameters for the tool
 * @returns The result of the tool execution
 */
export async function executeTool(tool: string, params: any = {}) {
  try {
    const response = await axios.post(`${API_BASE_URL}/execute`, {
      tool,
      params
    });
    return response.data;
  } catch (error) {
    console.error(`Error executing tool ${tool}:`, error);
    throw new Error(`Failed to execute tool: ${error}`);
  }
}

/**
 * Get information about available tools
 * 
 * @returns Information about available tools
 */
export async function getAvailableTools() {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error getting available tools:', error);
    throw new Error(`Failed to get available tools: ${error}`);
  }
}
