import setThemeCookie from "@/utils/setThemeCookie.mjs";

const { createSlice } = require("@reduxjs/toolkit");

const themeSlice = createSlice({
  name: "theme",
  initialState: {
    mode: "light",
  },
  reducers: {
    toggleTheme: (state) => {
      const newTheme = state.mode === "light" ? "dark" : "light"
      state.mode = newTheme;
    setThemeCookie(newTheme)
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
    },
  },
});
export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
