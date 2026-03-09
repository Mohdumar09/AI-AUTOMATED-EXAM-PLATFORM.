import { apiSlice } from './apiSlice';

const EXAMS_URL = '/api/exam';

export const examApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /* ==========================
       GET EXAMS (CACHE SOURCE)
    ========================== */
    getExams: builder.query({
      query: () => ({
        url: EXAMS_URL,
        method: 'GET',
      }),

      // 👇 Mark this query as "Exam"
      providesTags: ['Exam'],
    }),

    /* ==========================
       CREATE EXAM
    ========================== */
    createExam: builder.mutation({
      query: (data) => ({
        url: EXAMS_URL,
        method: 'POST',
        body: data,
      }),

      // 👇 Refresh exam list
      invalidatesTags: ['Exam'],
    }),

    /* ==========================
       GET QUESTIONS
    ========================== */
    getQuestions: builder.query({
      query: (examId) => ({
        url: `${EXAMS_URL}/questions/${examId}`,
        method: 'GET',
      }),
    }),

    /* ==========================
       CREATE QUESTION
    ========================== */
    createQuestion: builder.mutation({
      query: (data) => ({
        url: `${EXAMS_URL}/questions`,
        method: 'POST',
        body: data,
      }),
    }),

    /* ==========================
       DELETE EXAM
    ========================== */
    deleteExam: builder.mutation({
      query: (examId) => ({
        url: `${EXAMS_URL}/${examId}`,
        method: 'DELETE',
      }),

      // 👇 Auto refresh exam list
      invalidatesTags: ['Exam'],
    }),

    /* ==========================
       VALIDATE EXAM KEY
    ========================== */
    validateExamKey: builder.mutation({
      query: (data) => ({
        url: `${EXAMS_URL}/validate-key`,
        method: 'POST',
        body: data,
      }),
    }),

  }),
});

export const {
  useGetExamsQuery,
  useCreateExamMutation,
  useGetQuestionsQuery,
  useCreateQuestionMutation,
  useDeleteExamMutation,
  useValidateExamKeyMutation,
} = examApiSlice;