import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Notification } from "@/types";
import { dummyNotifications } from "@/lib/dummyData";

interface NotificationsState { // No change to BASE_URL here as it uses dummy data
  list: Notification[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  pagination: { page: number; limit: number; total: number };
}

const initialState: NotificationsState = {
  list: [],
  loading: false,
  sending: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0 },
};

export const fetchNotifications = createAsyncThunk("notifications/fetchAll", async () => {
  await new Promise((r) => setTimeout(r, 400));
  return dummyNotifications;
});

export const sendBroadcast = createAsyncThunk(
  "notifications/send",
  async (payload: {
    title: string;
    message: string;
    audience: Notification["audience"]; // Updated to use Notification["audience"] type
    channels: string[];
    schedule: "now" | "later";
  }) => {
    await new Promise((r) => setTimeout(r, 800));
    const newNotif: Notification = {
      id: `n${Date.now()}`,
      title: payload.title,
      audience: payload.audience as Notification["audience"],
      channel: payload.channels as Notification["channel"],
      status: payload.schedule === "now" ? "delivered" : "queued",
      sentAt: "Just now",
      reachCount: Math.floor(Math.random() * 5000) + 100,
    };
    return newNotif;
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
        state.pagination.total = action.payload.length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed";
      })
      .addCase(sendBroadcast.pending, (state) => { state.sending = true; })
      .addCase(sendBroadcast.fulfilled, (state, action) => {
        state.sending = false;
        state.list.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(sendBroadcast.rejected, (state, action) => {
        state.sending = false;
        state.error = action.error.message || "Failed to send";
      });
  },
});

export const { setPage: setNotificationsPage } = notificationsSlice.actions;
export default notificationsSlice.reducer;
