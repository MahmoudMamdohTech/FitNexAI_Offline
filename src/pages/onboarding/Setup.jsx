import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import api from '../../services/api';

const Setup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    gender: 'Male',
    age: '',
    height: '',
    weight: '',
    goal: 3,
    activity_level: 2,
    diet: 0,
    favorites: [],
    dislikes: [],
    medical: []
  });
  const [foodOptions, setFoodOptions] = useState([]);

  useEffect(() => {
    const fetchExistingPrefs = async () => {
      try {
        const user = await userService.getProfile();
        if (user && user.hasPreferences && user.preferences) {
          setFormData(prev => ({
            ...prev,
            ...user.preferences
          }));
        }
      } catch (err) {
        console.warn("Could not fetch existing profile config. Using defaults.");
      }
    };
    fetchExistingPrefs();
  }, []);

  useEffect(() => {
    const loadFoods = async () => {
      try {
        const res = await api.get('/api/v1/foods/options');
        setFoodOptions(res.foods ?? []);
      } catch (err) {
        console.warn('Could not load food options from AI service.', err);
      }
    };
    loadFoods();
  }, []);

  const favoritesList = foodOptions;
  const medicalList = ["Diabetes", "Hypertension", "Heart Disease", "Kidney Disease", "Acne"];

  const toggleArrayItem = (field, item) => {
    const oppField = field === 'favorites' ? 'dislikes' : (field === 'dislikes' ? 'favorites' : null);

    setFormData(prev => {
      const arr = prev[field];
      const isRemoving = arr.includes(item);

      let nextState = { ...prev };

      if (isRemoving) {
        nextState[field] = arr.filter(i => i !== item);
      } else {
        nextState[field] = [...arr, item];
      }

      if (!isRemoving && oppField) {
        // Automatically remove it from the opposing category
        nextState[oppField] = prev[oppField].filter(i => i !== item);
      }

      return nextState;
    });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.age || !formData.height || !formData.weight) {
      setError("Please fill in all physical statistics (Age, Height, Weight)");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      localStorage.removeItem('fitnex_generation_error');
      
      const rawUser = localStorage.getItem('fitnex_user');
      const user = rawUser ? JSON.parse(rawUser) : {};
      user.preferences = formData;
      user.hasPreferences = true;
      localStorage.setItem('fitnex_user', JSON.stringify(user));
      
      navigate('/review');
    } catch (err) {
      console.error(err);
      localStorage.setItem('fitnex_generation_error', err.message || 'Failed to generate plan.');
      setError(err.message || 'Failed to generate plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '120px' }}>
      <div className="setup-header">
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Let's build <span className="neon">your machine.</span></h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
          Enter your details below to calibrate your personalized enhancement plan.
        </p>
      </div>

      {error && <div style={{ background: 'rgba(255,0,0,0.1)', color: 'var(--neon-pink)', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

      <form id="setupForm" className="setup-grid" onSubmit={handleGenerate}>

        {/* Stats Column */}
        <div className="preferences-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', marginRight: '8px' }}>
              <path d="M18 20V10M12 20V4M6 20v-6" />
            </svg>
            The Stats
          </div>

          <div>
            <label className="form-label">Gender</label>
            <div className="toggle-group">
              <div className={`toggle-btn ${formData.gender === 'Male' ? 'active' : ''}`} onClick={() => setFormData({ ...formData, gender: 'Male' })}>Male</div>
              <div className={`toggle-btn ${formData.gender === 'Female' ? 'active' : ''}`} onClick={() => setFormData({ ...formData, gender: 'Female' })}>Female</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label className="form-label">Age</label>
              <input type="number" className="form-input" placeholder="e.g. 25" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value === '' ? '' : Number(e.target.value) })} />
            </div>
            <div>
              <label className="form-label">Height (cm)</label>
              <input type="number" className="form-input" placeholder="e.g. 180" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value === '' ? '' : Number(e.target.value) })} />
            </div>
          </div>

          <div>
            <label className="form-label">Weight (kg)</label>
            <input type="number" className="form-input" placeholder="e.g. 75" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value === '' ? '' : Number(e.target.value) })} />
          </div>

          <div>
            <label className="form-label">Goal</label>
            <div className="toggle-group" style={{ flexDirection: 'row' }}>
              <div className={`toggle-btn ${formData.goal === 1 ? 'active' : ''}`} onClick={() => setFormData({ ...formData, goal: 1 })}>Gain</div>
              <div className={`toggle-btn ${formData.goal === 3 ? 'active' : ''}`} onClick={() => setFormData({ ...formData, goal: 3 })}>Maintain</div>
              <div className={`toggle-btn ${formData.goal === 2 ? 'active' : ''}`} onClick={() => setFormData({ ...formData, goal: 2 })}>Loss</div>
            </div>
          </div>

          <div>
            <label className="form-label">Activity Level</label>
            <select className="form-input" value={formData.activity_level} onChange={e => setFormData({ ...formData, activity_level: Number(e.target.value) })}>
              <option value={0}>Sedentary</option>
              <option value={1}>Lightly Active</option>
              <option value={2}>Moderately Active</option>
              <option value={3}>Very Active</option>
              <option value={4}>Extremely Active</option>
            </select>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          <div className="preferences-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card-title">Nutrition</div>

            <div>
              <label className="form-label">Dietary Preference</label>
              <select className="form-input" value={formData.diet} onChange={e => setFormData({ ...formData, diet: Number(e.target.value) })}>
                <option value={0}>Omnivore</option>
                <option value={1}>Vegetarian</option>
                <option value={2}>Vegan</option>
                <option value={3}>Pescatarian</option>
              </select>
            </div>

            <div>
              <label className="form-label">Favorites</label>
              <div className="chip-container">
                {favoritesList.map(fav => (
                  <div key={fav} className={`chip ${formData.favorites.includes(fav) ? 'active' : ''}`} onClick={() => toggleArrayItem('favorites', fav)}>
                    {fav}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label">Dislikes / Exclusions</label>
              <div className="chip-container">
                {favoritesList.map(fav => {
                  const isDisliked = formData.dislikes.includes(fav);
                  return (
                    <div
                      key={fav}
                      className="chip"
                      onClick={() => toggleArrayItem('dislikes', fav)}
                      style={{
                        background: isDisliked ? 'rgba(255, 0, 0, 0.15)' : '',
                        borderColor: isDisliked ? '#ff3333' : '',
                        color: isDisliked ? '#ff3333' : ''
                      }}
                    >
                      {fav}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="preferences-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card-title">Medical Conditions</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {medicalList.map(med => (
                <div key={med} className={`selectable-card ${formData.medical.includes(med) ? 'active' : ''}`} onClick={() => toggleArrayItem('medical', med)}>
                  <div className="check-icon" style={{ width: '16px', height: '16px', background: formData.medical.includes(med) ? 'var(--neon-green)' : 'transparent', borderRadius: '4px' }}></div>
                  {med}
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>

      <div className="setup-footer" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button type="submit" form="setupForm" className="btn-primary" disabled={loading} style={{ padding: '16px 40px', fontSize: '16px' }}>
          {loading ? 'PROCESSING...' : 'GENERATE PLAN'}
        </button>
      </div>
    </div>
  );
};

export default Setup;
