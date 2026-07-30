import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './hooks/useAuth.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import { FollowUpProvider } from './context/FollowUpContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <FollowUpProvider>
          <App />
        </FollowUpProvider>
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>,
)

