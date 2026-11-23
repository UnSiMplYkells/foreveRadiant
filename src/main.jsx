import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from "react-redux"
import store from './store.js'
import App from './App.jsx'

// Note: React.StrictMode intentionally double-mounts components in development mode
// to help catch uncleaned side-effects. This causes effects (and un-deduplicated toasts)
// to trigger twice in local dev, but runs cleanly once in production builds.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
