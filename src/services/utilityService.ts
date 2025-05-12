/**
 * Utility Service
 * 
 * This service provides various utility tools for SAGE.
 * It includes tools for weather information, web search, and calculations.
 */

/**
 * Get current weather information for a location
 * 
 * @param location The location to get weather for
 * @returns Weather information for the specified location
 */
export async function getWeather(location: string) {
  try {
    console.log('Getting weather for:', location)
    
    // In a real implementation, this would call a weather API
    // For now, return mock data
    return {
      location,
      temperature: {
        current: 72,
        min: 65,
        max: 78,
        unit: 'F'
      },
      conditions: 'Partly Cloudy',
      humidity: 45,
      windSpeed: 8,
      windDirection: 'NE',
      forecast: [
        { day: 'Today', high: 78, low: 65, conditions: 'Partly Cloudy' },
        { day: 'Tomorrow', high: 80, low: 67, conditions: 'Sunny' },
        { day: 'Day After', high: 75, low: 63, conditions: 'Chance of Rain' }
      ]
    }
  } catch (error) {
    console.error('Error getting weather:', error)
    throw new Error(`Failed to get weather information: ${error}`)
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
    console.log('Searching web for:', query)
    
    // In a real implementation, this would call a search API
    // For now, return mock data
    return {
      query,
      results: [
        {
          title: 'Example Search Result 1',
          url: 'https://example.com/result1',
          snippet: 'This is an example search result that matches your query for ' + query
        },
        {
          title: 'Example Search Result 2',
          url: 'https://example.com/result2',
          snippet: 'Another example search result related to ' + query
        },
        {
          title: 'Example Search Result 3',
          url: 'https://example.com/result3',
          snippet: 'A third example search result about ' + query
        }
      ]
    }
  } catch (error) {
    console.error('Error searching web:', error)
    throw new Error(`Failed to search the web: ${error}`)
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
    console.log('Calculating:', expression)
    
    // Simple and safe evaluation of mathematical expressions
    // This is a basic implementation and should be enhanced with a proper math library
    // like math.js for production use
    const sanitizedExpression = expression.replace(/[^0-9+\-*/().]/g, '')
    
    // Using Function constructor is generally not recommended for user input
    // This is just for demonstration - in production, use a proper math library
    const result = new Function(`return ${sanitizedExpression}`)()
    
    return {
      expression,
      result
    }
  } catch (error) {
    console.error('Error calculating:', error)
    throw new Error(`Failed to calculate expression: ${error}`)
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
    console.log('Getting date/time for timezone:', timezone || 'local')
    
    const now = new Date()
    
    // Format the date in different ways
    return {
      iso: now.toISOString(),
      local: now.toString(),
      date: now.toDateString(),
      time: now.toTimeString(),
      timestamp: now.getTime(),
      timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  } catch (error) {
    console.error('Error getting date/time:', error)
    throw new Error(`Failed to get date and time information: ${error}`)
  }
}