import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import TrackRequestPage from './pages/TrackRequestPage';
import PickupHistoryPage from './pages/PickupHistoryPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import RequestPickupModal from './components/RequestPickupModal';
import { fetchWasteCategories } from './api/client';
import { ToastProvider } from './context/ToastContext';

export default function App() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchWasteCategories()
      .then((data) => setCategories(data))
      .catch((err) => console.error('Failed to pre-fetch categories:', err));
  }, []);

  const handleOpenPickupModal = (category = null) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleClosePickupModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-eco-bg flex flex-col font-sans selection:bg-eco-light selection:text-eco-dark">
        <Navbar onRequestClick={() => handleOpenPickupModal()} />
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={<LandingPage onRequestPickup={handleOpenPickupModal} />}
            />
            <Route
              path="/track"
              element={<TrackRequestPage onOpenRequestModal={handleOpenPickupModal} />}
            />
            <Route
              path="/history"
              element={<PickupHistoryPage onOpenRequestModal={handleOpenPickupModal} />}
            />
            <Route
              path="/admin"
              element={<AdminDashboardPage />}
            />
          </Routes>
        </main>

        {/* Reusable Booking Wizard Modal */}
        <RequestPickupModal
          isOpen={isModalOpen}
          onClose={handleClosePickupModal}
          categories={categories}
          preselectedCategory={selectedCategory}
        />
      </div>
    </ToastProvider>
  );
}
