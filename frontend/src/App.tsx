import { AttendanceProvider } from './context/AttendanceContext'
import { AuthProvider } from './context/AuthContext'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <AuthProvider>
      <AttendanceProvider>
    <AppRoutes />
  </AttendanceProvider>
   </AuthProvider>
  )
}

export default App
