import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "user",
  initialState: {
    userData: {},
    enrolledCourses: [],
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setEnrolledCourses: (state, action) => {
      state.enrolledCourses = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase("HYDRATE", (state, action) => {
      if (action.payload.user) {
        return {
          ...state,
          userData: action.payload.user,
          enrolledCourses: action.payload.enrolledCourses,
        };
      }
      return state;
    });
  },
});

export const { setUserData, setEnrolledCourses } = authSlice.actions;
export default authSlice.reducer;
