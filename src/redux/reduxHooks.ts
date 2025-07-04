// src/hooks/reduxHooks.ts

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { AppDispatch, RootState } from './store';


// Custom hook for dispatch with the correct type
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Custom hook for selector with the correct type
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
