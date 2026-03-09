import { apiSlice } from './apiSlice';

// Define the base URL for the exams API
const CHEATING_LOGS_URL = '/api/exam';

// Inject endpoints for the exam slice
export const cheatingLogApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get cheating logs for a specific exam
    getCheatingLogs: builder.query({
      query: (examId) => {
        console.log('Fetching logs for exam:', examId);
        return {
          url: `${CHEATING_LOGS_URL}/cheatingLogs/${examId}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      transformResponse: (response, meta, arg) => {
        console.log('API Response for exam', arg, ':', response);
        try {
          // Handle null or undefined response
          if (!response) {
            console.warn('Empty response received');
            return [];
          }

          // Handle array response
          if (Array.isArray(response)) {
            return response.filter(log => log && typeof log === 'object');
          }

          // Handle object response
          if (typeof response === 'object') {
            const logs = response.logs || response.data || [];
            return Array.isArray(logs) ? logs.filter(log => log && typeof log === 'object') : [];
          }

          console.warn('Unexpected response format:', response);
          return [];
        } catch (error) {
          console.error('Error transforming response:', error);
          return [];
        }
      },
      transformErrorResponse: (response) => {
        console.error('API Error Response:', {
          status: response.status,
          data: response.data,
          error: response.error
        });
        return { 
          status: response.status || 500,
          message: (response.data && response.data.message) || 
                  (response.error && response.error.toString()) || 
                  'Failed to fetch cheating logs'
        };
      },
      // Add retries for network issues
      extraOptions: { maxRetries: 3 }
    }),
    // Save a new cheating log entry for an exam
    saveCheatingLog: builder.mutation({
      query: (data) => ({
        url: `${CHEATING_LOGS_URL}/cheatingLogs`,
        method: 'POST',
        body: data,
        credentials: 'include', // Include credentials for authentication
      }),
    }),
  }),
});

// Export the generated hooks for each endpoint
export const { useGetCheatingLogsQuery, useSaveCheatingLogMutation } = cheatingLogApiSlice;
