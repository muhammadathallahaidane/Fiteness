import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { Provider } from 'react-redux';
import store from './store';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import WorkoutList from './pages/WorkoutList';
import WorkoutDetail from './pages/WorkoutDetail';
import CreateWorkout from './pages/CreateWorkout';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/workouts"
                element={
                  <ProtectedRoute>
                    <WorkoutList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workouts/:id"
                element={
                  <ProtectedRoute>
                    <WorkoutDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-workout"
                element={
                  <ProtectedRoute>
                    <CreateWorkout />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
