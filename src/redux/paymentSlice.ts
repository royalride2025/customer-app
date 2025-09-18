import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PaymentState {
  currentCharge: {
    id: string | null;
    amount: number | null;
    currency: string | null;
    status: string | null;
    transactionUrl: string | null;
    createdAt: string | null;
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  currentCharge: null,
  loading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setPaymentLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setCurrentCharge: (state, action: PayloadAction<{
      id: string;
      amount: number;
      currency: string;
      status: string;
      transactionUrl: string;
      createdAt: string;
    }>) => {
      state.currentCharge = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateChargeStatus: (state, action: PayloadAction<string>) => {
      if (state.currentCharge) {
        state.currentCharge.status = action.payload;
      }
    },
    setPaymentError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearCurrentCharge: (state) => {
      state.currentCharge = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setPaymentLoading,
  setCurrentCharge,
  updateChargeStatus,
  setPaymentError,
  clearCurrentCharge,
} = paymentSlice.actions;

export default paymentSlice.reducer;
