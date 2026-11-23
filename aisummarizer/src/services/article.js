import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'

//const rapidApiKey = import.meta.env.VITE_RAPID_API_ARTICLE_KEY;

export const articleApi = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: "https://article-extractor-and-summarizer.p.rapidapi.com/",
        prepareHeaders: (headers)=>{
            headers.set('x-rapidapi-key','043208fb78msh5589659b9ef0d82p1b7438jsnb3d47892a36c');
            headers.set("x-rapidapi-host","article-extractor-and-summarizer.p.rapidapi.com")
        
        return headers;
        }
    }),
    endpoints: (builder) =>({
        getSummary: builder.query({
            query: (params) => `/summarize?url=${encodeURIComponent(params.articleUrl)}&length=2`
        })
    })
    
})

export const {useLazyGetSummaryQuery} = articleApi;