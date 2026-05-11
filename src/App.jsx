import { Navigate, Route, Routes } from 'react-router-dom'
import SiteLayout from './components/SiteLayout'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import HomePage from './pages/HomePage'
import ProductPage from './pages/ProductPage'
import RegisterPage from './pages/RegisterPage'
import ServicesPage from './pages/ServicesPage'
import ThreeBackground from './components/ThreeBackground'
import './App.css'

function App() {
  return (
<<<<<<< Updated upstream
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
=======
    <>
      <ThreeBackground />
      <div className="content-overlay">
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/product" element={<ProductPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </div>
    </>
>>>>>>> Stashed changes
  )
}

export default App
