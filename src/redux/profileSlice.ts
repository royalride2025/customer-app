import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  _id: string;
  phone: string;
  provider: string | null;
  provider_id: string | null;
  role: string;
  status: string;
  is_verified: boolean;
  access_platforms: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  credits: number;
}

interface Profile {
  _id: string;
  user_id: string;
  car_owner_id: string | null;
  vehicle_assigned: string | null;
  is_car_owner: boolean;
  name: string;
  natioanl_id: string;
  address: string;
  license_no: string;
  license_expiry: string;
  dob: string;
  driver_img: string;
  driving_license_file: string;
  criminal_record_certificate: string;
  medical_fitness_report: string;
  terms_accepted: boolean;
  language_preference: string;
  profile_status: string;
  profile_status_message: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  vehicle: string;
}

interface ProfileData {
  user: User;
  profile: Profile;
}

interface ProfileState {
  data: ProfileData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfileLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null; // Clear error when starting new request
      }
    },
    setProfile: (state, action: PayloadAction<ProfileData>) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
      state.lastUpdated = new Date().toISOString();
    },
    setProfileError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateProfile: (state, action: PayloadAction<Partial<Profile>>) => {
      if (state.data) {
        state.data.profile = { ...state.data.profile, ...action.payload };
        state.lastUpdated = new Date().toISOString();
      }
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.data) {
        state.data.user = { ...state.data.user, ...action.payload };
        state.lastUpdated = new Date().toISOString();
      }
    },
    clearProfile: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
      state.lastUpdated = null;
    },
  },
});

export const {
  setProfileLoading,
  setProfile,
  setProfileError,
  updateProfile,
  updateUser,
  clearProfile,
} = profileSlice.actions;

export default profileSlice.reducer;