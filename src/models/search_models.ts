/**
 * Types and models for search endpoints
 */

/**
 * interface for search results
 * @param videoId - the video id
 * @param highlight - the highlight of the search result
 * @param topics - the topics of the search result
 * @param title - the title of the search result
 * @param description - the description of the search result
 */
export interface SearchResult {
  videoId: string
  highlight: string | undefined
  topics: string[]
  title: string | undefined
  description: string | undefined
}

/**
 * interface for ranked search results
 * Represents an array of search results.
 * 
 * We promise that it is ranked by relevance,
 * with the most relevant result first.
 */
export type RankedSearchResults = SearchResult[]
