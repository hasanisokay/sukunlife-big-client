import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'user',
  initialState: {
    userData:{}
  },
  reducers: {
    setUserData:(state,action)=>{
      state.userData = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase('HYDRATE', (state, action) => {
      if (action.payload.user) {
        return {
          ...state,
          userData: action.payload.user,  
        };
      }
      return state;
    });
  },
});

export const { setUserData } = authSlice.actions;
export default authSlice.reducer;
