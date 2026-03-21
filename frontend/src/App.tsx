import { AttendanceProvider } from "./context/AttendanceContext";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext"; // ← NEW
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <AuthProvider>
      <AttendanceProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </AttendanceProvider>
    </AuthProvider>
  );
}

export default App;
