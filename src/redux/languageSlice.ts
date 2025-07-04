// src/redux/languageSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LanguageState {
  language: 'en' | 'ar'; // Supported languages
  isRTL: boolean; // Flag for RTL layout
}

const initialState: LanguageState = {
  language: 'en', // Default language is English
  isRTL: false, // Default layout is LTR
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<'en' | 'ar'>) => {
      state.language = action.payload;
      // Update RTL flag based on the language
      if (action.payload === 'ar') {
        state.isRTL = true; // Arabic language requires RTL layout
      } else {
        state.isRTL = false; // English is LTR
      }
    },
  },
});

export const { setLanguage } = languageSlice.actions;

export default languageSlice.reducer;
